"""Quota admission through the application API and live-provider call paths."""

import asyncio
from collections import deque
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select

from main import app
from tableus import api, cohort_limits
from tableus.auth import subject_digest
from tableus.db import SessionFactory, engine, init_database
from tableus.models import (
    Candidate,
    CohortCounter,
    Plan,
    PlanEvent,
    PlanParticipant,
    Profile,
    RecommendationRun,
    Vote,
)
from tableus.providers.deterministic import FIXTURE_PLACES, DeterministicPlacesProvider
from tableus.security import hash_value


@pytest.fixture(scope="module", autouse=True)
async def database() -> None:
    await init_database()


@pytest.fixture
async def client():
    app.state.request_rate_limiter.clear()
    app.state.readiness_rate_limiter.clear()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value


@pytest.fixture
async def actors() -> tuple[str, str]:
    first, second = f"cohort-{uuid4().hex}", f"cohort-{uuid4().hex}"
    async with SessionFactory() as session:
        session.add_all(
            Profile(id=value, display_name=value, email_hash=hash_value(value))
            for value in (first, second)
        )
        await session.commit()
    return first, second


def headers(subject: str, key: str | None = None) -> dict[str, str]:
    result = {"X-Demo-User-ID": subject}
    if key:
        result["Idempotency-Key"] = key
    return result


def plan_body(title: str, *, place: bool = False) -> dict[str, object]:
    body: dict[str, object] = {"title": title, "location_label": "Boston"}
    if place:
        body["location_place_id"] = "fixture-location-boston"
    else:
        body.update(latitude=42.36, longitude=-71.06)
    return body


def caps(monkeypatch: pytest.MonkeyPatch, *, plans: int = 1, ai: int = 1, places: int = 1) -> None:
    # Existing minute-limit tests intentionally saturate process-wide windows.
    # This module exercises durable quota admission from a fresh minute window.
    monkeypatch.setattr(api, "_ai_global_window", deque())
    monkeypatch.setattr(api, "_places_global_window", deque())
    monkeypatch.setattr(
        cohort_limits, "get_settings",
        lambda: SimpleNamespace(
            cohort_plans_lifetime=plans,
            cohort_ai_operations_per_day=ai,
            cohort_places_operations_per_day=places,
        ),
    )


async def used(subject: str, kind: str) -> int:
    async with SessionFactory() as session:
        rows = list((await session.scalars(
            select(CohortCounter).where(
                CohortCounter.subject_hash == subject_digest(subject),
                CohortCounter.kind == kind,
            )
        )).all())
    return sum(row.used for row in rows)


@pytest.mark.asyncio
async def test_plan_cap_prevents_second_provider_lookup_and_replay_does_not_debit(
    client: AsyncClient, actors: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    owner, _ = actors
    caps(monkeypatch)
    calls = 0

    async def location(_subject: str, _method: str, *_args):
        nonlocal calls
        calls += 1
        return SimpleNamespace(region_code="US")

    monkeypatch.setattr(api, "_call_places", location)
    body = plan_body(f"one-{uuid4().hex}", place=True)
    request_headers = headers(owner, f"plan-{uuid4().hex}")
    first = await client.post("/api/v1/plans", headers=request_headers, json=body)
    replay = await client.post("/api/v1/plans", headers=request_headers, json=body)
    denied = await client.post(
        "/api/v1/plans", headers=headers(owner), json=plan_body("two", place=True)
    )
    assert first.status_code == replay.status_code == 200
    assert replay.headers["X-Idempotent-Replay"] == "true"
    assert replay.json()["data"]["plan"]["id"] == first.json()["data"]["plan"]["id"]
    assert denied.status_code == 429
    assert calls == 1
    assert await used(owner, "plans") == 1


@pytest.mark.asyncio
async def test_delete_and_transfer_do_not_refund_creator_lifetime_slot(
    client: AsyncClient, actors: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    owner, recipient = actors
    caps(monkeypatch)
    sole = await client.post("/api/v1/plans", headers=headers(owner), json=plan_body("sole"))
    assert sole.status_code == 200
    sole_id = sole.json()["data"]["plan"]["id"]
    deleted = await client.request(
        "DELETE", f"/api/v1/plans/{sole_id}", headers=headers(owner),
        json={"confirmation": "DELETE"},
    )
    assert deleted.status_code == 200
    assert (await client.post(
        "/api/v1/plans", headers=headers(owner), json=plan_body("after delete")
    )).status_code == 429

    shared = await client.post("/api/v1/plans", headers=headers(recipient), json=plan_body("shared"))
    assert shared.status_code == 200
    shared_id = shared.json()["data"]["plan"]["id"]
    async with SessionFactory() as session:
        session.add(PlanParticipant(plan_id=shared_id, profile_id=owner, constraints={}))
        await session.commit()
    transferred = await client.post(
        f"/api/v1/plans/{shared_id}/transfer-ownership", headers=headers(recipient),
        json={"recipient_profile_id": owner},
    )
    assert transferred.status_code == 200
    assert (await client.post(
        "/api/v1/plans", headers=headers(recipient), json=plan_body("after transfer")
    )).status_code == 429
    assert await used(owner, "plans") == await used(recipient, "plans") == 1


@pytest.mark.asyncio
async def test_failed_create_rolls_back_lifetime_debit(
    client: AsyncClient, actors: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    owner, _ = actors
    caps(monkeypatch)
    original = api._event

    async def fail_event(*_args, **_kwargs):
        raise HTTPException(status_code=503, detail="Synthetic precommit failure")

    monkeypatch.setattr(api, "_event", fail_event)
    failed = await client.post("/api/v1/plans", headers=headers(owner), json=plan_body("failed"))
    assert failed.status_code == 503
    assert await used(owner, "plans") == 0
    monkeypatch.setattr(api, "_event", original)
    success = await client.post("/api/v1/plans", headers=headers(owner), json=plan_body("valid"))
    assert success.status_code == 200
    assert await used(owner, "plans") == 1


@pytest.mark.asyncio
async def test_ambiguous_live_provider_attempts_stay_charged_and_stop_dispatch(
    actors: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    ai_subject, places_subject = actors
    caps(monkeypatch)
    monkeypatch.setattr(api, "get_settings", lambda: SimpleNamespace(
        ai_provider_mode="live", places_provider_mode="live",
    ))

    async def available(*_args):
        return True

    async def release(*_args):
        return None

    monkeypatch.setattr(api, "_reserve_ai_budget", available)
    monkeypatch.setattr(api, "_release_ai_budget", release)
    monkeypatch.setattr(api, "_reserve_places_budget", available)
    monkeypatch.setattr(api, "_release_places_budget", release)
    ai_calls = places_calls = 0

    class FakeAi:
        name = "synthetic"
        model = "none"

        async def recommend(self, *_args, **_kwargs):
            nonlocal ai_calls
            ai_calls += 1
            raise RuntimeError("ambiguous synthetic failure")

    class FakePlaces:
        async def resolve_location(self, *_args, **_kwargs):
            nonlocal places_calls
            places_calls += 1
            raise ValueError("ambiguous synthetic failure")

    monkeypatch.setattr(api, "get_ai_provider", FakeAi)
    monkeypatch.setattr(api, "get_places_provider", FakePlaces)
    with pytest.raises(HTTPException) as ai_first:
        await api._call_ai(ai_subject, "recommend", "query", [], [])
    with pytest.raises(HTTPException) as ai_second:
        await api._call_ai(ai_subject, "recommend", "query", [], [])
    with pytest.raises(HTTPException) as places_first:
        await api._call_places(places_subject, "resolve_location", "Boston")
    with pytest.raises(HTTPException) as places_second:
        await api._call_places(places_subject, "resolve_location", "Boston")
    assert (ai_first.value.status_code, ai_second.value.status_code) == (503, 429)
    assert (places_first.value.status_code, places_second.value.status_code) == (404, 429)
    assert ai_calls == places_calls == 1
    assert await used(ai_subject, "ai") == await used(places_subject, "places") == 1


@pytest.mark.asyncio
async def test_global_budget_refusal_does_not_consume_actor_quota(
    actors: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    ai_subject, places_subject = actors
    caps(monkeypatch)
    monkeypatch.setattr(api, "get_settings", lambda: SimpleNamespace(
        ai_provider_mode="live", places_provider_mode="live",
    ))

    async def global_refusal(*_args):
        raise HTTPException(status_code=429, detail="Synthetic global refusal")

    monkeypatch.setattr(api, "_reserve_ai_budget", global_refusal)
    monkeypatch.setattr(api, "_reserve_places_budget", global_refusal)
    with pytest.raises(HTTPException) as ai_error:
        await api._call_ai(ai_subject, "recommend", "query", [], [])
    with pytest.raises(HTTPException) as places_error:
        await api._call_places(places_subject, "resolve_location", "Boston")
    assert ai_error.value.status_code == places_error.value.status_code == 429
    assert await used(ai_subject, "ai") == await used(places_subject, "places") == 0


@pytest.mark.asyncio
@pytest.mark.parametrize("action", ["vote", "finalize", "reopen"])
async def test_candidate_hydration_refusal_leaves_mutation_uncommitted(
    client: AsyncClient, actors: tuple[str, str], monkeypatch: pytest.MonkeyPatch,
    action: str,
) -> None:
    owner, _ = actors
    initial_status = "finalized" if action == "reopen" else "voting"
    async with SessionFactory() as session:
        plan = Plan(
            organizer_id=owner, title=f"hydrate-{action}-{uuid4().hex}",
            status=initial_status, share_token_hash=hash_value(uuid4().hex),
            location_label="Boston", latitude=42.36, longitude=-71.06,
        )
        session.add(plan)
        await session.flush()
        session.add(PlanParticipant(plan_id=plan.id, profile_id=owner, constraints={}))
        run = RecommendationRun(plan_id=plan.id, query="dinner", provider="synthetic")
        session.add(run)
        await session.flush()
        candidates = [Candidate(
            run_id=run.id, place_id=place.place_id, match_score=0.9,
            reasoning="synthetic", rank=index + 1,
        ) for index, place in enumerate(FIXTURE_PLACES[:3])]
        session.add_all(candidates)
        await session.flush()
        ids = [candidate.id for candidate in candidates]
        plan.active_run_id = run.id
        if action == "reopen":
            plan.finalized_candidate_id = ids[0]
        plan_id = plan.id
        await session.commit()

    async def request() -> object:
        if action == "vote":
            return await client.put(
                f"/api/v1/plans/{plan_id}/vote", headers=headers(owner),
                json={"ranking": ids},
            )
        if action == "finalize":
            return await client.post(
                f"/api/v1/plans/{plan_id}/finalize", headers=headers(owner),
                json={"candidate_id": ids[0]},
            )
        return await client.post(f"/api/v1/plans/{plan_id}/reopen", headers=headers(owner))

    failed_calls = 0

    async def denied(_subject: str, method: str, place_ids: list[str]):
        nonlocal failed_calls
        failed_calls += 1
        assert method == "get_places"
        assert set(place_ids) == {place.place_id for place in FIXTURE_PLACES[:3]}
        raise HTTPException(status_code=429, detail="Synthetic daily cap")

    monkeypatch.setattr(api, "_call_places", denied)
    refused = await request()
    assert refused.status_code == 429
    assert failed_calls == 1
    async with SessionFactory() as session:
        unchanged = await session.get(Plan, plan_id)
        assert unchanged is not None
        assert (unchanged.status, unchanged.finalized_candidate_id) == (
            initial_status, ids[0] if action == "reopen" else None,
        )
        assert await session.scalar(select(func.count()).select_from(Vote).where(Vote.plan_id == plan_id)) == 0
        assert await session.scalar(select(func.count()).select_from(PlanEvent).where(PlanEvent.plan_id == plan_id)) == 0

    success_calls = 0
    provider = DeterministicPlacesProvider()

    async def available(_subject: str, method: str, place_ids: list[str]):
        nonlocal success_calls
        success_calls += 1
        assert method == "get_places"
        return await provider.get_places(place_ids)

    monkeypatch.setattr(api, "_call_places", available)
    accepted = await request()
    assert accepted.status_code == 200
    assert success_calls == 1
    async with SessionFactory() as session:
        changed = await session.get(Plan, plan_id)
        assert changed is not None
        assert changed.status == ("finalized" if action == "finalize" else "voting")
        assert changed.finalized_candidate_id == (ids[0] if action == "finalize" else None)
        assert await session.scalar(select(func.count()).select_from(Vote).where(Vote.plan_id == plan_id)) == (1 if action == "vote" else 0)
        assert await session.scalar(select(func.count()).select_from(PlanEvent).where(PlanEvent.plan_id == plan_id)) == 1


@pytest.mark.asyncio
async def test_postgres_concurrent_creates_stop_at_exact_cap(
    client: AsyncClient, actors: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    if engine.url.get_backend_name() != "postgresql":
        pytest.skip("Requires independent PostgreSQL transactions")
    owner, _ = actors
    caps(monkeypatch)
    original = api.quota_snapshot
    both_checked = asyncio.Event()
    release = asyncio.Event()
    checks = 0

    async def pause_after_precheck(session, subject):
        nonlocal checks
        snapshot = await original(session, subject)
        checks += 1
        if checks == 2:
            both_checked.set()
        await release.wait()
        return snapshot

    monkeypatch.setattr(api, "quota_snapshot", pause_after_precheck)
    first = asyncio.create_task(client.post(
        "/api/v1/plans", headers=headers(owner), json=plan_body("race first")
    ))
    second = asyncio.create_task(client.post(
        "/api/v1/plans", headers=headers(owner), json=plan_body("race second")
    ))
    try:
        await asyncio.wait_for(both_checked.wait(), 5)
    finally:
        release.set()
    responses = await asyncio.wait_for(asyncio.gather(first, second), 10)
    assert sorted(response.status_code for response in responses) == [200, 429]
    assert await used(owner, "plans") == 1
    async with SessionFactory() as session:
        count = await session.scalar(select(func.count()).select_from(Plan).where(
            Plan.title.in_(["race first", "race second"]), Plan.organizer_id == owner,
        ))
    assert count == 1
