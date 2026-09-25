"""Real PostgreSQL interleavings; SQLite deliberately skips these checks."""

import asyncio
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select, text

from main import app
from tableus import api
from tableus.db import SessionFactory, engine, init_database
from tableus.models import Plan, PlanParticipant, Profile, RecommendationRun, RunContributor
from tableus.security import hash_value

pytestmark = pytest.mark.skipif(
    engine.url.get_backend_name() != "postgresql", reason="requires PostgreSQL row locks"
)


@pytest.fixture(scope="module", autouse=True)
async def database() -> None:
    if engine.url.get_backend_name() == "postgresql":
        await init_database()


@pytest.fixture
async def client() -> AsyncClient:
    app.state.request_rate_limiter.clear()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value


def headers(subject: str) -> dict[str, str]:
    return {"X-Demo-User-ID": subject}


async def seed_plan() -> tuple[str, str, str, str]:
    owner, departing, third = (f"pg-content-{uuid4()}" for _ in range(3))
    async with SessionFactory() as session:
        for person in (owner, departing, third):
            session.add(Profile(id=person, display_name="member", email_hash=hash_value(person)))
        await session.flush()
        plan = Plan(
            organizer_id=owner, metadata_author_id=owner, metadata_provenance="known",
            title="Concurrent plan", share_token_hash=hash_value(str(uuid4())),
            location_label="Boston", latitude=42.3601, longitude=-71.0589,
        )
        session.add(plan)
        await session.flush()
        for person in (owner, departing, third):
            session.add(PlanParticipant(plan_id=plan.id, profile_id=person, constraints={}))
        await session.commit()
        return plan.id, owner, departing, third


async def expect_waiting(task: asyncio.Task) -> None:
    with pytest.raises(TimeoutError):
        await asyncio.wait_for(asyncio.shield(task), timeout=0.08)


@pytest.mark.asyncio
async def test_generation_commits_before_contributor_deletion(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    plan_id, owner, departing, _ = await seed_plan()
    entered = asyncio.Event()
    release = asyncio.Event()
    original_event = api._event

    async def pause_after_run_insert(session, plan, actor, event_type, payload=None):
        if event_type == "recommendations.generated":
            entered.set()
            await release.wait()
        await original_event(session, plan, actor, event_type, payload)

    monkeypatch.setattr(api, "_event", pause_after_run_insert)
    generation = asyncio.create_task(client.post(
        f"/api/v1/plans/{plan_id}/recommendations", headers=headers(owner),
        json={"query": "group dinner"},
    ))
    try:
        await asyncio.wait_for(entered.wait(), timeout=5)
        deletion = asyncio.create_task(client.request(
            "DELETE", "/api/v1/me", headers=headers(departing),
            json={"confirmation": "DELETE"},
        ))
        await expect_waiting(deletion)
    finally:
        release.set()
    generated, deleted = await asyncio.wait_for(asyncio.gather(generation, deletion), timeout=10)
    assert generated.status_code == 200, generated.text
    assert deleted.status_code == 200, deleted.text
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        assert plan is not None and plan.active_run_id is None and plan.status == "collecting"
        assert not (await session.scalars(select(RecommendationRun).where(RecommendationRun.plan_id == plan_id))).all()


@pytest.mark.asyncio
async def test_deletion_commits_before_generation_snapshot(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    plan_id, owner, departing, third = await seed_plan()
    entered = asyncio.Event()
    release = asyncio.Event()
    original_cleanup = api.clean_departing_content

    async def pause_after_plan_lock(session, profile_id, plans):
        entered.set()
        await release.wait()
        await original_cleanup(session, profile_id, plans)

    monkeypatch.setattr(api, "clean_departing_content", pause_after_plan_lock)
    deletion = asyncio.create_task(client.request(
        "DELETE", "/api/v1/me", headers=headers(departing),
        json={"confirmation": "DELETE"},
    ))
    try:
        await asyncio.wait_for(entered.wait(), timeout=5)
        generation = asyncio.create_task(client.post(
            f"/api/v1/plans/{plan_id}/recommendations", headers=headers(owner),
            json={"query": "group dinner"},
        ))
        await expect_waiting(generation)
    finally:
        release.set()
    deleted, generated = await asyncio.wait_for(asyncio.gather(deletion, generation), timeout=10)
    assert deleted.status_code == 200, deleted.text
    assert generated.status_code == 200, generated.text
    async with SessionFactory() as session:
        run = await session.scalar(select(RecommendationRun).where(RecommendationRun.plan_id == plan_id))
        assert run is not None and run.provenance == "known"
        contributors = set((await session.scalars(
            select(RunContributor.profile_id).where(RunContributor.run_id == run.id)
        )).all())
        assert contributors == {owner, third}


@pytest.mark.asyncio
async def test_overlapping_member_deletions_serialize_on_shared_plan(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    plan_id, owner, first, second = await seed_plan()
    generated = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations", headers=headers(owner),
        json={"query": "group dinner"},
    )
    assert generated.status_code == 200, generated.text
    entered = asyncio.Event()
    release = asyncio.Event()
    original_cleanup = api.clean_departing_content

    async def pause_first(session, profile_id, plans):
        if profile_id == first:
            entered.set()
            await release.wait()
        await original_cleanup(session, profile_id, plans)

    monkeypatch.setattr(api, "clean_departing_content", pause_first)
    first_task = asyncio.create_task(client.request(
        "DELETE", "/api/v1/me", headers=headers(first), json={"confirmation": "DELETE"},
    ))
    try:
        await asyncio.wait_for(entered.wait(), timeout=5)
        second_task = asyncio.create_task(client.request(
            "DELETE", "/api/v1/me", headers=headers(second), json={"confirmation": "DELETE"},
        ))
        await expect_waiting(second_task)
    finally:
        release.set()
    first_result, second_result = await asyncio.wait_for(
        asyncio.gather(first_task, second_task), timeout=10
    )
    assert first_result.status_code == 200, first_result.text
    assert second_result.status_code == 200, second_result.text
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        assert plan is not None and plan.status == "collecting"
        assert plan.active_run_id is None
        members = set((await session.scalars(
            select(PlanParticipant.profile_id).where(PlanParticipant.plan_id == plan_id)
        )).all())
        assert members == {owner}
        assert not (await session.scalars(
            select(RecommendationRun).where(RecommendationRun.plan_id == plan_id)
        )).all()


@pytest.mark.asyncio
async def test_provenance_table_private_to_runtime() -> None:
    async with SessionFactory() as session:
        rows = (await session.execute(text("""
            SELECT rolname,
                   has_table_privilege(rolname, 'app.run_contributors', 'SELECT') AS can_read,
                   has_table_privilege(rolname, 'app.run_contributors', 'INSERT') AS can_write
            FROM pg_roles WHERE rolname IN ('anon', 'authenticated', 'tableus_runtime')
        """))).all()
        permissions = {name: (read, write) for name, read, write in rows}
        assert permissions["anon"] == (False, False)
        assert permissions["authenticated"] == (False, False)
        assert permissions["tableus_runtime"] == (True, True)
