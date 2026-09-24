"""Cross-transaction account lifecycle tests; SQLite cannot prove these locks."""

import asyncio
from collections.abc import AsyncIterator
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select, text

from main import app
from tableus import account_lifecycle, api, auth_removal
from tableus.auth import Identity, subject_digest
from tableus.db import SessionFactory, engine
from tableus.models import AccountDeletion, Invite, Plan, PlanEvent, PlanParticipant, Profile
from tableus.security import hash_value, issue_redemption_token

pytestmark = pytest.mark.skipif(
    engine.url.get_backend_name() != "postgresql",
    reason="Requires two independent PostgreSQL transactions and advisory/row locks",
)


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    app.state.request_rate_limiter.clear()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value


def actor() -> str:
    return f"pg-lifecycle-{uuid4().hex}"


def headers(subject: str) -> dict[str, str]:
    return {"X-Demo-User-ID": subject}


async def seed_profiles(*subjects: str) -> None:
    async with SessionFactory() as session:
        session.add_all(
            Profile(id=subject, display_name=subject, email_hash=hash_value(subject + "@example.test"))
            for subject in subjects
        )
        await session.commit()


async def seed_plan(owner: str, *others: str) -> str:
    async with SessionFactory() as session:
        plan = Plan(
            organizer_id=owner, title="Concurrent dinner",
            share_token_hash=hash_value(uuid4().hex),
            location_label="Chicago", latitude=41.8, longitude=-87.6,
        )
        session.add(plan)
        await session.flush()
        session.add_all(
            PlanParticipant(plan_id=plan.id, profile_id=subject, constraints={})
            for subject in (owner, *others)
        )
        await session.commit()
        return plan.id


async def wait_for_advisory_waiter() -> None:
    """Observe a real PostgreSQL waiter; a timer alone proves no contention."""
    async def observe() -> None:
        while True:
            async with SessionFactory() as session:
                count = await session.scalar(text(
                    "SELECT count(*) FROM pg_locks "
                    "WHERE locktype = 'advisory' AND NOT granted AND pid <> pg_backend_pid() "
                    "AND pid IN (SELECT pid FROM pg_stat_activity WHERE datname = current_database())"
                ))
            if count and count > 0:
                return
            await asyncio.sleep(0.02)

    await asyncio.wait_for(observe(), 5)


@pytest.mark.asyncio
async def test_deletion_commits_before_waiting_redeem_cannot_rejoin(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    subject = actor()
    await seed_profiles(subject)
    async with SessionFactory() as session:
        invite = Invite(code_hash=hash_value(uuid4().hex), max_uses=1)
        session.add(invite)
        await session.commit()
        invite_id = invite.id
    monkeypatch.setattr(api, "full_deletion_available", lambda: True)
    async def removed(_subject: str) -> None:
        return None
    monkeypatch.setattr(auth_removal, "remove_auth_identity", removed)
    acquired = asyncio.Event()
    release = asyncio.Event()
    original = api.lock_subject
    calls = 0

    async def pause_first_exclusive(session, locked_subject: str, *, exclusive: bool = False):
        nonlocal calls
        await original(session, locked_subject, exclusive=exclusive)
        if locked_subject == subject and exclusive:
            calls += 1
            if calls == 1:
                acquired.set()
                await release.wait()

    monkeypatch.setattr(api, "lock_subject", pause_first_exclusive)
    deletion = asyncio.create_task(client.post(
        "/api/v1/me/deletion", headers=headers(subject), json={"confirmation": "DELETE"}
    ))
    await asyncio.wait_for(acquired.wait(), 5)
    redeem = asyncio.create_task(client.post(
        "/api/v1/access/redeem", headers=headers(subject),
        json={"redemption_token": issue_redemption_token(invite_id), "display_name": "Return"},
    ))
    try:
        await wait_for_advisory_waiter()
    finally:
        release.set()
        await asyncio.wait_for(asyncio.gather(deletion, redeem, return_exceptions=True), 10)
    assert (await asyncio.wait_for(deletion, 10)).status_code == 200
    assert (await asyncio.wait_for(redeem, 10)).status_code == 409
    async with SessionFactory() as session:
        assert await session.get(Profile, subject) is None
        row = await session.get(AccountDeletion, subject_digest(subject))
        assert row is not None and row.status == "completed" and row.auth_subject is None


@pytest.mark.asyncio
async def test_redeem_commits_before_waiting_deletion_then_profile_is_removed(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    subject = actor()
    await seed_profiles(subject)
    async with SessionFactory() as session:
        invite = Invite(code_hash=hash_value(uuid4().hex), max_uses=1)
        session.add(invite)
        await session.commit()
        invite_id = invite.id
    monkeypatch.setattr(api, "full_deletion_available", lambda: True)
    async def removed(_subject: str) -> None:
        return None
    monkeypatch.setattr(auth_removal, "remove_auth_identity", removed)
    acquired = asyncio.Event()
    release = asyncio.Event()
    original = api.lock_subject

    async def pause_first_exclusive(session, locked_subject: str, *, exclusive: bool = False):
        await original(session, locked_subject, exclusive=exclusive)
        if locked_subject == subject and exclusive and not acquired.is_set():
            acquired.set()
            await release.wait()

    monkeypatch.setattr(api, "lock_subject", pause_first_exclusive)
    redeem = asyncio.create_task(client.post(
        "/api/v1/access/redeem", headers=headers(subject),
        json={"redemption_token": issue_redemption_token(invite_id), "display_name": "Return"},
    ))
    await asyncio.wait_for(acquired.wait(), 5)
    deletion = asyncio.create_task(client.post(
        "/api/v1/me/deletion", headers=headers(subject), json={"confirmation": "DELETE"}
    ))
    try:
        await wait_for_advisory_waiter()
    finally:
        release.set()
        await asyncio.wait_for(asyncio.gather(redeem, deletion, return_exceptions=True), 10)
    assert (await redeem).status_code == 200
    assert (await deletion).status_code == 200
    async with SessionFactory() as session:
        assert await session.get(Profile, subject) is None
        row = await session.get(AccountDeletion, subject_digest(subject))
        assert row is not None and row.status == "completed" and row.auth_subject is None


@pytest.mark.asyncio
async def test_recipient_deletion_waits_for_transfer_then_organizer_blocker(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    owner, recipient = actor(), actor()
    await seed_profiles(owner, recipient)
    plan_id = await seed_plan(owner, recipient)
    monkeypatch.setattr(api, "full_deletion_available", lambda: True)
    recipient_locked = asyncio.Event()
    release = asyncio.Event()
    original = api.load_approved_profile

    async def pause_recipient(identity: Identity, session):
        profile = await original(identity, session)
        if identity.subject == recipient and not recipient_locked.is_set():
            recipient_locked.set()
            await release.wait()
        return profile

    monkeypatch.setattr(api, "load_approved_profile", pause_recipient)
    transfer = asyncio.create_task(
        client.post(
            f"/api/v1/plans/{plan_id}/transfer-ownership",
            headers=headers(owner), json={"recipient_profile_id": recipient},
        ),
    )
    await asyncio.wait_for(recipient_locked.wait(), 5)
    deletion = asyncio.create_task(client.post(
        "/api/v1/me/deletion", headers=headers(recipient), json={"confirmation": "DELETE"}
    ))
    try:
        await wait_for_advisory_waiter()
    finally:
        release.set()
        await asyncio.wait_for(asyncio.gather(transfer, deletion, return_exceptions=True), 10)
    assert (await asyncio.wait_for(transfer, 10)).status_code == 200
    assert (await asyncio.wait_for(deletion, 10)).status_code == 409
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        assert plan is not None and plan.organizer_id == recipient
        assert await session.get(Profile, recipient) is not None
        assert await session.get(AccountDeletion, subject_digest(recipient)) is None


@pytest.mark.asyncio
async def test_transfer_waits_for_recipient_deletion_then_rejects_removed_recipient(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    owner, recipient = actor(), actor()
    await seed_profiles(owner, recipient)
    plan_id = await seed_plan(owner, recipient)
    monkeypatch.setattr(api, "full_deletion_available", lambda: True)
    async def removed(_subject: str) -> None:
        return None
    monkeypatch.setattr(auth_removal, "remove_auth_identity", removed)
    acquired = asyncio.Event()
    release = asyncio.Event()
    original = api.lock_subject

    async def pause_recipient_deletion(session, locked_subject: str, *, exclusive: bool = False):
        await original(session, locked_subject, exclusive=exclusive)
        if locked_subject == recipient and exclusive and not acquired.is_set():
            acquired.set()
            await release.wait()

    monkeypatch.setattr(api, "lock_subject", pause_recipient_deletion)
    deletion = asyncio.create_task(client.post(
        "/api/v1/me/deletion", headers=headers(recipient), json={"confirmation": "DELETE"}
    ))
    await asyncio.wait_for(acquired.wait(), 5)
    transfer = asyncio.create_task(client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership",
        headers=headers(owner), json={"recipient_profile_id": recipient},
    ))
    try:
        await wait_for_advisory_waiter()
    finally:
        release.set()
        await asyncio.wait_for(asyncio.gather(deletion, transfer, return_exceptions=True), 10)
    assert (await deletion).status_code == 200
    assert (await transfer).status_code == 409
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        assert plan is not None and plan.organizer_id == owner
        assert await session.get(Profile, recipient) is None
        row = await session.get(AccountDeletion, subject_digest(recipient))
        assert row is not None and row.status == "completed"


@pytest.mark.asyncio
async def test_competing_transfers_serialize_on_plan_row(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    owner, first, second = actor(), actor(), actor()
    await seed_profiles(owner, first, second)
    plan_id = await seed_plan(owner, first, second)
    first_locked = asyncio.Event()
    release = asyncio.Event()
    original = api._plan

    async def pause_first(session, requested_id: str, for_update: bool = False):
        plan = await original(session, requested_id, for_update=for_update)
        if requested_id == plan_id and for_update and not first_locked.is_set():
            first_locked.set()
            await release.wait()
        return plan

    monkeypatch.setattr(api, "_plan", pause_first)
    first_task = asyncio.create_task(client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership",
        headers=headers(owner), json={"recipient_profile_id": first},
    ))
    await asyncio.wait_for(first_locked.wait(), 5)
    second_task = asyncio.create_task(client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership",
        headers=headers(owner), json={"recipient_profile_id": second},
    ))
    # A second transaction must wait for the same row lock. pg_blocking_pids
    # or a transactionid wait may represent that PostgreSQL row contention.
    async def observe_row_waiter() -> None:
        while True:
            async with SessionFactory() as session:
                count = await session.scalar(text(
                    "SELECT count(*) FROM pg_locks "
                    "WHERE NOT granted AND locktype IN ('transactionid', 'tuple') "
                    "AND pid <> pg_backend_pid() "
                    "AND pid IN (SELECT pid FROM pg_stat_activity WHERE datname = current_database())"
                ))
            if count and count > 0:
                return
            await asyncio.sleep(0.02)
    try:
        await asyncio.wait_for(observe_row_waiter(), 5)
    finally:
        release.set()
        await asyncio.wait_for(asyncio.gather(first_task, second_task, return_exceptions=True), 10)
    assert (await asyncio.wait_for(first_task, 10)).status_code == 200
    assert (await asyncio.wait_for(second_task, 10)).status_code == 403
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        assert plan is not None and plan.organizer_id == first
        count = await session.scalar(select(func.count()).select_from(PlanEvent).where(
            PlanEvent.plan_id == plan_id, PlanEvent.event_type == "plan.ownership_transferred"
        ))
        assert count == 1


@pytest.mark.asyncio
async def test_worker_claim_excludes_second_worker_and_attention_reset(
    monkeypatch: pytest.MonkeyPatch
) -> None:
    subject = actor()
    digest = subject_digest(subject)
    async with SessionFactory() as session:
        session.add(AccountDeletion(subject_hash=digest, auth_subject=subject))
        await session.commit()
    entered = asyncio.Event()
    release = asyncio.Event()
    calls = 0

    async def held_provider(_subject: str) -> None:
        nonlocal calls
        calls += 1
        entered.set()
        await release.wait()

    monkeypatch.setattr(auth_removal, "remove_auth_identity", held_provider)
    first = asyncio.create_task(account_lifecycle.process_deletion(digest))
    try:
        await asyncio.wait_for(entered.wait(), 5)
        async with SessionFactory() as session:
            row = await session.get(AccountDeletion, digest)
            assert row is not None and row.attempts == 1 and row.lease_token is not None
            assert row.status == "pending"
        assert await account_lifecycle.process_deletion(digest) is False
        assert await account_lifecycle.retry_attention_deletion(digest) is False
    finally:
        release.set()
        await asyncio.wait_for(asyncio.gather(first, return_exceptions=True), 10)
    assert await asyncio.wait_for(first, 10) is True
    assert calls == 1
    async with SessionFactory() as session:
        row = await session.get(AccountDeletion, digest)
        assert row is not None and row.status == "completed"
        assert row.auth_subject is None and row.lease_token is None
