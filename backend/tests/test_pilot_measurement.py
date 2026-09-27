from argparse import Namespace
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from main import app
from tableus.api import _anonymize_authored_events
from tableus.config import get_settings
from tableus.db import SessionFactory, init_database
from tableus.models import Candidate, Plan, PlanEvent, Profile, RecommendationRun
from tableus.pilot_measurement import measure_pilot
from tableus.security import hash_value


@pytest.fixture(scope="module", autouse=True)
async def database():
    await init_database()


@pytest.fixture
async def client():
    app.state.request_rate_limiter.clear()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value


def headers(subject):
    return {"X-Demo-User-ID": subject}


async def post(client, subject, path, body=None):
    response = await client.request("PUT" if path.endswith("/vote") else "POST", f"/api/v1{path}", headers=headers(subject), json=body or {})
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def setup_plan(client, size=3):
    subjects = [str(uuid4()) for _ in range(size)]
    async with SessionFactory() as session:
        session.add_all([Profile(id=value, display_name="Pilot fixture", email_hash=hash_value(value)) for value in subjects])
        await session.commit()
    created = await post(client, subjects[0], "/plans", {
        "title": "Pilot measurement", "location_label": "Boston",
        "latitude": 42.3601, "longitude": -71.0589,
    })
    plan_id = created["plan"]["id"]
    for subject in subjects[1:]:
        await post(client, subject, f"/plans/{plan_id}/join", {"share_token": created["share_token"]})
    generated = await post(client, subjects[0], f"/plans/{plan_id}/recommendations", {"query": "dinner"})
    ranking = [candidate["id"] for candidate in generated["candidates"][:3]]
    return subjects, plan_id, ranking


async def counts(plan_id):
    async with SessionFactory() as session:
        events = (await session.scalars(select(PlanEvent).where(
            PlanEvent.plan_id == plan_id, PlanEvent.event_type == "plan.finalized",
        ).order_by(PlanEvent.created_at))).all()
        return [event.payload["distinct_voter_count"] for event in events]


@pytest.mark.asyncio
@pytest.mark.parametrize("voters", [0, 1, 2, 8])
async def test_finalization_counts_distinct_active_run_voters_and_updates(client, voters):
    subjects, plan_id, ranking = await setup_plan(client, max(2, voters))
    for subject in subjects[:voters]:
        await post(client, subject, f"/plans/{plan_id}/vote", {"ranking": ranking})
        await post(client, subject, f"/plans/{plan_id}/vote", {"ranking": list(reversed(ranking))})
    await post(client, subjects[0], f"/plans/{plan_id}/finalize")
    assert await counts(plan_id) == [voters]
    await post(client, subjects[0], f"/plans/{plan_id}/reopen")
    await post(client, subjects[0], f"/plans/{plan_id}/finalize")
    assert await counts(plan_id) == [voters, voters]
    await post(client, subjects[0], f"/plans/{plan_id}/reopen")
    await post(client, subjects[0], f"/plans/{plan_id}/recommendations", {"query": "new dinner"})
    await post(client, subjects[0], f"/plans/{plan_id}/finalize")
    assert await counts(plan_id) == [voters, voters, 0]
    now = datetime.now(UTC)
    async with SessionFactory() as session:
        report = await measure_pilot(session, [plan_id, plan_id], now - timedelta(days=1), now + timedelta(days=1))
    assert report["eligible_retained_plans"] == 1
    assert report["successful_plans"] == int(voters >= 2)
    assert report["finalized_below_two_voters"] == int(voters < 2)


@pytest.mark.asyncio
@pytest.mark.parametrize("departing_index", [0, 1])
@pytest.mark.parametrize("full_deletion", [False, True])
async def test_deletion_keeps_earlier_success_without_candidate_run_or_voters(client, monkeypatch, departing_index, full_deletion):
    monkeypatch.setattr(get_settings(), "tableus_account_deletion_enabled", full_deletion)
    subjects, plan_id, ranking = await setup_plan(client)
    for subject in subjects[:2]:
        await post(client, subject, f"/plans/{plan_id}/vote", {"ranking": ranking})
    await post(client, subjects[0], f"/plans/{plan_id}/finalize")
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        run_id = plan.active_run_id
        event = await session.scalar(select(PlanEvent).where(PlanEvent.plan_id == plan_id, PlanEvent.event_type == "plan.finalized"))
        if departing_index == 0:
            event.payload = {**event.payload, "voter_ids": subjects, "free_text": "private", "arbitrary_count": 44}
        await session.commit()
    owner = subjects[0]
    if departing_index == 0:
        await post(client, owner, f"/plans/{plan_id}/transfer-ownership", {"recipient_profile_id": subjects[2]})
        owner = subjects[2]
    if full_deletion:
        await post(client, subjects[departing_index], "/me/deletion", {"confirmation": "DELETE"})
    else:
        response = await client.request("DELETE", "/api/v1/me", headers=headers(subjects[departing_index]), json={"confirmation": "DELETE"})
        assert response.status_code == 200, response.text
    now = datetime.now(UTC)
    async with SessionFactory() as session:
        assert await session.get(Candidate, ranking[0]) is None
        assert await session.get(RecommendationRun, run_id) is None
        event = await session.scalar(select(PlanEvent).where(PlanEvent.plan_id == plan_id, PlanEvent.event_type == "plan.finalized"))
        assert event.payload.get("distinct_voter_count") == 2
        if departing_index == 0:
            assert event.actor_id is None
            assert event.payload == {"distinct_voter_count": 2}
        report = await measure_pilot(session, [plan_id], now - timedelta(days=1), now + timedelta(days=1))
        assert report["successful_plans"] == 1
        assert report["eligible_retained_plans"] == 1
    # Later zero-vote finalization must not overwrite the earlier successful one.
    if departing_index == 0:
        response = await client.patch(f"/api/v1/plans/{plan_id}/metadata", headers=headers(owner), json={
            "title": "Repaired dinner", "location_label": "Boston", "latitude": 42.3601, "longitude": -71.0589,
        })
        assert response.status_code == 200, response.text
    await post(client, owner, f"/plans/{plan_id}/recommendations", {"query": "replacement dinner"})
    await post(client, owner, f"/plans/{plan_id}/finalize")
    async with SessionFactory() as session:
        report = await measure_pilot(session, [plan_id], now - timedelta(days=1), now + timedelta(days=1))
        assert report["successful_plans"] == 1
        assert report["eligible_retained_plans"] == 1


@pytest.mark.asyncio
@pytest.mark.parametrize("value", ["missing", None, -1, 9, True, False, "2", 2.0, [], {}, 0, 1, 2, 8])
async def test_cleanup_strict_integer_allowlist_with_surviving_candidate(client, value):
    subjects, plan_id, ranking = await setup_plan(client, 2)
    async with SessionFactory() as session:
        event = PlanEvent(plan_id=plan_id, actor_id=subjects[0], event_type="plan.finalized", payload={
            "candidate_id": ranking[0], "distinct_voter_count": value,
            "voter_ids": subjects, "arbitrary_field": "private",
        })
        if value == "missing":
            event.payload.pop("distinct_voter_count")
        session.add(event)
        await session.flush()
        await _anonymize_authored_events(session, await session.get(Profile, subjects[0]))
        expected = {"candidate_id": ranking[0]}
        if type(value) is int and 0 <= value <= 8:
            expected["distinct_voter_count"] = value
        assert event.actor_id is None and event.payload == expected
        await session.rollback()


@pytest.mark.asyncio
async def test_measurement_window_unknown_history_missing_plans_and_bounds(client):
    subjects, plan_id, _ = await setup_plan(client, 2)
    start = datetime(2026, 1, 1, tzinfo=UTC)
    end = start + timedelta(days=21)
    async with SessionFactory() as session:
        joins = (await session.scalars(select(PlanEvent).where(PlanEvent.plan_id == plan_id, PlanEvent.event_type == "participant.joined"))).all()
        for event in joins:
            event.created_at = end - timedelta(hours=1)
        session.add_all([
            PlanEvent(plan_id=plan_id, actor_id=subjects[0], event_type="plan.finalized", payload={}, created_at=end - timedelta(minutes=30)),
            PlanEvent(plan_id=plan_id, actor_id=subjects[0], event_type="plan.finalized", payload={"distinct_voter_count": "2"}, created_at=end - timedelta(minutes=20)),
            PlanEvent(plan_id=plan_id, actor_id=subjects[0], event_type="plan.finalized", payload={"distinct_voter_count": 8}, created_at=end),
        ])
        await session.commit()
        report = await measure_pilot(session, [plan_id, str(uuid4())], start, end)
        assert report["successful_plans"] == 0
        assert report["unknown_finalization_outcomes"] == 1
        assert report["plans_with_missing_or_invalid_counts"] == 1
        assert report["missing_or_deleted_roster_plans"] == 1
        assert report["eligible_with_less_than_24_hours"] == 1
        assert report["observed_retained_success_rate"] == 0
        # A first join before the window is ineligible even if another join is in it.
        joins[0].created_at = start - timedelta(seconds=1)
        session.add(PlanEvent(plan_id=plan_id, event_type="participant.joined", payload={}, created_at=start))
        await session.flush()
        report = await measure_pilot(session, [plan_id], start, end)
        assert report["eligible_retained_plans"] == 0
        assert report["retained_first_join_before_window"] == 1
        assert report["observed_retained_success_rate"] is None
        for ids, begin, finish in [([], start, end), ([plan_id], start, start), ([plan_id], start, end + timedelta(seconds=1)), ([plan_id], start.replace(tzinfo=None), end), (["invalid"], start, end)]:
            with pytest.raises(ValueError):
                await measure_pilot(session, ids, begin, finish)


@pytest.mark.asyncio
async def test_solo_unknown_history_event_cap_and_whole_plan_deletion(client, monkeypatch):
    from tableus import pilot_measurement

    subjects, plan_id, _ = await setup_plan(client, 2)
    now = datetime.now(UTC)
    start, end = now - timedelta(days=1), now + timedelta(days=1)
    async with SessionFactory() as session:
        report = await measure_pilot(session, [plan_id], start, end)
        assert report["no_observed_finalization"] == 1
        monkeypatch.setattr(pilot_measurement, "MAX_EVENTS", 0)
        with pytest.raises(ValueError, match="Event cap exceeded"):
            await measure_pilot(session, [plan_id], start, end)
        monkeypatch.setattr(pilot_measurement, "MAX_EVENTS", 10_000)
    solo = await post(client, subjects[0], "/plans", {
        "title": "Solo fixture", "location_label": "Boston", "latitude": 42.3601, "longitude": -71.0589,
    })
    solo_id = solo["plan"]["id"]
    async with SessionFactory() as session:
        report = await measure_pilot(session, [solo_id], start, end)
        assert report["retained_without_join_history"] == 1
        assert report["eligible_retained_plans"] == 0
    departed = await client.request("DELETE", "/api/v1/me", headers=headers(subjects[1]), json={"confirmation": "DELETE"})
    assert departed.status_code == 200, departed.text
    removed = await client.request("DELETE", f"/api/v1/plans/{plan_id}", headers=headers(subjects[0]), json={"confirmation": "DELETE"})
    assert removed.status_code == 200, removed.text
    async with SessionFactory() as session:
        assert not (await session.scalars(select(PlanEvent).where(PlanEvent.plan_id == plan_id))).all()
        report = await measure_pilot(session, [plan_id], start, end)
        assert report["missing_or_deleted_roster_plans"] == 1
        assert report["eligible_retained_plans"] == 0
        assert report["observed_retained_success_rate"] is None

    # Exercise the operator wrapper too, including its read-only transaction on CI PostgreSQL.
    from scripts.pilot_measurement import run

    operator_report = await run(Namespace(start=start.isoformat(), end=end.isoformat()), [plan_id])
    assert operator_report["missing_or_deleted_roster_plans"] == 1
    assert operator_report["observed_retained_success_rate"] is None
