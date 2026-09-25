"""Deletion fences private replay bytes without repeating committed writes."""
import asyncio
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
from tableus import auth, request_controls
from tableus.db import SessionFactory, init_database
from tableus.models import Profile
from tableus.request_controls import (
    CachedResponse,
    IdempotencyReplayCache,
    invalidate_private_responses,
    private_response_generation,
)


def test_invalidation_removes_bodies_but_retains_consumed_identity():
    cache = IdempotencyReplayCache()
    key = ("actor", "POST", "/api/v1/plans", "key")
    cache.store(key, CachedResponse(100, 200, b"private text", "application/json", "fp"), 0)
    invalidate_private_responses()
    entry = cache.get(key, 1)
    assert entry and entry.invalidated and entry.body == b""
    assert entry.request_fingerprint == "fp" and entry.expires_at == 100
    assert cache.total_bytes == 0
    assert cache.get(key, 101) is None

def test_late_cache_insertion_keeps_only_consumed_key():
    cache = IdempotencyReplayCache()
    generation = private_response_generation()
    invalidate_private_responses()
    key = ("actor", "POST", "/api/v1/plans", "key")
    assert cache.store(key, CachedResponse(
        100, 200, b"old results", "application/json", "fp", generation
    ), 0)
    entry = cache.get(key, 1)
    assert entry and entry.invalidated and entry.body == b""
    assert cache.total_bytes == 0

@pytest.mark.asyncio
@pytest.mark.parametrize("during_replay", [False, True])
async def test_successful_write_never_replays_private_body_after_invalidation(
    monkeypatch, during_replay
):
    await init_database()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    subject = "privacy-" + uuid4().hex
    async with SessionFactory() as session:
        session.add(Profile(id=subject, display_name="Tester", email_hash=uuid4().hex * 2))
        await session.commit()
    path = "/api/v1/__test/privacy-" + uuid4().hex
    monkeypatch.setattr(request_controls, "_IDEMPOTENT_EXACT_ROUTES",
                        request_controls._IDEMPOTENT_EXACT_ROUTES | {("POST", path)})
    writes = 0
    async def write():
        nonlocal writes
        writes += 1
        return {"data": {"private": "departing member content"}}
    app.add_api_route(path, write, methods=["POST"])
    headers = {"X-Demo-User-ID": subject, "Idempotency-Key": "privacy-accepted-write"}
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            first = await client.post(path, headers=headers, json={"input": 1})
            assert first.status_code == 200
            if during_replay:
                original = auth.load_approved_profile
                async def invalidating_auth(identity, session):
                    profile = await original(identity, session)
                    invalidate_private_responses()
                    return profile
                monkeypatch.setattr(auth, "load_approved_profile", invalidating_auth)
            else:
                invalidate_private_responses()
            replay = await client.post(path, headers=headers, json={"input": 1})
            assert replay.status_code == 409
            assert replay.json()["error"]["code"] == "idempotency_content_changed"
            assert "departing member content" not in replay.text
            assert writes == 1
            conflict = await client.post(path, headers=headers, json={"input": 2})
            assert conflict.status_code == 409
            assert conflict.json()["error"]["code"] == "idempotency_conflict"
            assert writes == 1
    finally:
        app.router.routes[:] = [route for route in app.router.routes
                                if getattr(route, "path", None) != path]

@pytest.mark.asyncio
async def test_deletion_during_success_response_cannot_insert_or_return_old_body(monkeypatch):
    await init_database()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    subject = "late-" + uuid4().hex
    async with SessionFactory() as session:
        session.add(Profile(id=subject, display_name="Tester", email_hash=uuid4().hex * 2))
        await session.commit()
    path = "/api/v1/__test/late-" + uuid4().hex
    monkeypatch.setattr(request_controls, "_IDEMPOTENT_EXACT_ROUTES",
                        request_controls._IDEMPOTENT_EXACT_ROUTES | {("POST", path)})
    committed, release = asyncio.Event(), asyncio.Event()
    writes = 0
    async def write():
        nonlocal writes
        writes += 1
        committed.set()
        await release.wait()
        return {"data": {"private": "stale committed response"}}
    app.add_api_route(path, write, methods=["POST"])
    headers = {"X-Demo-User-ID": subject, "Idempotency-Key": "privacy-late-response"}
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            pending = asyncio.create_task(client.post(path, headers=headers, json={}))
            await asyncio.wait_for(committed.wait(), 5)
            invalidate_private_responses()
            release.set()
            result = await asyncio.wait_for(pending, 5)
            assert result.status_code == 409
            assert "stale committed response" not in result.text
            replay = await client.post(path, headers=headers, json={})
            assert replay.status_code == 409
            assert writes == 1
    finally:
        release.set()
        app.router.routes[:] = [route for route in app.router.routes
                                if getattr(route, "path", None) != path]

@pytest.mark.asyncio
@pytest.mark.parametrize("full", [False, True])
async def test_actual_deletion_blocks_surviving_members_cached_plan_response(monkeypatch, full):
    from tableus import api
    from tableus.models import Plan, PlanParticipant
    from tableus.security import hash_value

    await init_database()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    departing, survivor = "depart-" + uuid4().hex, "remain-" + uuid4().hex
    token = uuid4().hex * 2
    async with SessionFactory() as session:
        session.add_all([
            Profile(id=subject, display_name=subject, email_hash=uuid4().hex * 2)
            for subject in [departing, survivor]
        ])
        await session.flush()
        plan = Plan(
            organizer_id=survivor, title="Remaining plan", location_label="Chicago",
            latitude=41.8, longitude=-87.6, share_token_hash=hash_value(token),
            metadata_author_id=survivor, metadata_provenance="known",
        )
        session.add(plan)
        await session.flush()
        session.add_all([
            PlanParticipant(plan_id=plan.id, profile_id=departing,
                            constraints={"notes": "private departing note"}),
            PlanParticipant(plan_id=plan.id, profile_id=survivor,
                            constraints={"notes": "remaining own note"}),
        ])
        await session.commit()
        plan_id = plan.id
    async def no_auth(_digest):
        return False
    monkeypatch.setattr(api, "full_deletion_available", lambda: True)
    monkeypatch.setattr(api, "process_deletion", no_auth)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        path = f"/api/v1/plans/{plan_id}/join"
        headers = {"X-Demo-User-ID": survivor, "Idempotency-Key": "survivor-plan-response"}
        before = await client.post(path, headers=headers, json={"share_token": token})
        assert before.status_code == 200
        assert "private departing note" in before.text
        method, delete_path = ("POST", "/api/v1/me/deletion") if full else ("DELETE", "/api/v1/me")
        deleted = await client.request(method, delete_path,
            headers={"X-Demo-User-ID": departing}, json={"confirmation": "DELETE"})
        assert deleted.status_code == 200
        replay = await client.post(path, headers=headers, json={"share_token": token})
        assert replay.status_code == 409
        assert replay.json()["error"]["code"] == "idempotency_content_changed"
        assert "private departing note" not in replay.text
        fresh = await client.get(f"/api/v1/plans/{plan_id}",
                                headers={"X-Demo-User-ID": survivor})
        assert fresh.status_code == 200
        assert "private departing note" not in fresh.text
        assert "remaining own note" in fresh.text
        assert fresh.json()["data"]["updated_at"] != before.json()["data"]["updated_at"]

@pytest.mark.asyncio
@pytest.mark.parametrize("replay", [False, True])
async def test_deletion_during_final_lock_release_suppresses_response(monkeypatch, replay):
    await init_database()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    subject = "release-" + uuid4().hex
    async with SessionFactory() as session:
        session.add(Profile(id=subject, display_name="Tester", email_hash=uuid4().hex * 2))
        await session.commit()
    path = "/api/v1/__test/release-" + uuid4().hex
    monkeypatch.setattr(request_controls, "_IDEMPOTENT_EXACT_ROUTES",
                        request_controls._IDEMPOTENT_EXACT_ROUTES | {("POST", path)})
    writes = 0
    async def write():
        nonlocal writes
        writes += 1
        return {"data": {"private": "must not escape final release"}}
    app.add_api_route(path, write, methods=["POST"])
    headers = {"X-Demo-User-ID": subject, "Idempotency-Key": "final-release-fence"}
    original = app.state.idempotency_inflight.release
    async def invalidate_at_release(key, lock):
        await asyncio.sleep(0)
        invalidate_private_responses()
        await original(key, lock)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            if replay:
                first = await client.post(path, headers=headers, json={})
                assert first.status_code == 200
            monkeypatch.setattr(app.state.idempotency_inflight, "release", invalidate_at_release)
            result = await client.post(path, headers=headers, json={})
            assert result.status_code == 409
            assert result.json()["error"]["code"] == "idempotency_content_changed"
            assert "must not escape final release" not in result.text
            again = await client.post(path, headers=headers, json={})
            assert again.status_code == 409
            assert writes == 1
    finally:
        app.router.routes[:] = [route for route in app.router.routes
                                if getattr(route, "path", None) != path]
