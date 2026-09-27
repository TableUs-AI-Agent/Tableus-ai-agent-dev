"""Existing membership recovery stays provider-free; private HTTP responses never cache."""

import asyncio
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select

from main import app
from tableus import api
from tableus.db import SessionFactory, engine, init_database
from tableus.models import Plan, PlanParticipant, Profile
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


def headers(subject, key=None):
    return {"X-Demo-User-ID": subject, **({"Idempotency-Key": key} if key else {})}


async def seed(count=1):
    subjects = [uuid4().hex for _ in range(count + 2)]
    token = uuid4().hex
    async with SessionFactory() as session:
        session.add_all(Profile(id=s, display_name="Synthetic diner", email_hash=hash_value(s)) for s in subjects)
        await session.flush()
        plan = Plan(organizer_id=subjects[0], title="Private dinner", location_label="Boston", share_token_hash=hash_value(token))
        session.add(plan)
        await session.flush()
        session.add_all(PlanParticipant(plan_id=plan.id, profile_id=s, constraints={}) for s in subjects[:count])
        await session.commit()
        return plan.id, token, subjects


@pytest.mark.asyncio
async def test_created_and_replayed_capabilities_and_errors_have_no_store(client):
    _, _, subjects = await seed()
    owner = subjects[0]
    payload = {"title": "Private cache test", "location_label": "Boston", "latitude": 42.36, "longitude": -71.06}
    key = uuid4().hex
    first = await client.post("/api/v1/plans", headers=headers(owner, key), json=payload)
    retry = await client.post("/api/v1/plans", headers=headers(owner, key), json=payload)
    assert first.status_code == retry.status_code == 200
    assert first.json() == retry.json()
    plan_id = first.json()["data"]["plan"]["id"]
    rotate = await client.post(f"/api/v1/plans/{plan_id}/share-token/rotate", headers=headers(owner), json={})
    denied = await client.post(f"/api/v1/plans/{plan_id}/join", headers=headers(owner), json={"share_token": "short"})
    oversized = await client.post(f"/api/v1/plans/{plan_id}/join",
        headers={**headers(owner), "Content-Length": str(2 * 1024 * 1024)}, content=b"{}")
    assert oversized.status_code == 413
    for response in (first, retry, rotate, denied, oversized):
        assert response.headers["cache-control"] == "no-store"
        assert response.headers["pragma"] == "no-cache"
    assert denied.status_code == 422


@pytest.mark.asyncio
async def test_membership_recovery_after_rotation_uses_no_provider(client, monkeypatch):
    plan_id, token, subjects = await seed()
    joined = await client.post(f"/api/v1/plans/{plan_id}/join", headers=headers(subjects[1]), json={"share_token": token})
    assert joined.status_code == 200
    await client.post(f"/api/v1/plans/{plan_id}/share-token/rotate", headers=headers(subjects[0]), json={})

    async def unavailable(*_args, **_kwargs):
        pytest.fail("Membership recovery must not call a provider")

    monkeypatch.setattr(api, "_call_places", unavailable)
    existing = await client.get(f"/api/v1/plans/{plan_id}/revision", headers=headers(subjects[1]))
    outsider = await client.get(f"/api/v1/plans/{plan_id}/revision", headers=headers(subjects[2]))
    assert existing.status_code == 200 and existing.headers["cache-control"] == "no-store"
    assert outsider.status_code == 403
    rejected = await client.post(f"/api/v1/plans/{plan_id}/join", headers=headers(subjects[2]), json={"share_token": token})
    assert rejected.status_code == 404


@pytest.mark.asyncio
@pytest.mark.skipif(engine.url.get_backend_name() != "postgresql", reason="PostgreSQL row locks")
async def test_forwarded_link_keeps_eight_person_cap_under_competing_joins(client):
    plan_id, token, subjects = await seed(count=7)
    responses = await asyncio.gather(*[
        client.post(f"/api/v1/plans/{plan_id}/join", headers=headers(subject), json={"share_token": token})
        for subject in subjects[7:]
    ])
    assert sorted(response.status_code for response in responses) == [200, 409]
    async with SessionFactory() as session:
        assert await session.scalar(select(func.count()).select_from(PlanParticipant).where(
            PlanParticipant.plan_id == plan_id
        )) == 8
