import asyncio
from datetime import UTC, datetime, timedelta

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select

from main import app
from tableus import account_lifecycle, api, auth_removal
from tableus.auth import lock_subject, subject_digest
from tableus.db import SessionFactory, engine, init_database
from tableus.models import (
    AccountDeletion,
    Candidate,
    Invite,
    PendingAuthValidation,
    Plan,
    PlanEvent,
    PlanParticipant,
    Profile,
    RecommendationRun,
)
from tableus.security import hash_value, issue_redemption_token


@pytest.fixture(scope="module", autouse=True)
async def database() -> None:
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


async def seed_profile(subject: str) -> None:
    async with SessionFactory() as session:
        session.add(Profile(
            id=subject, display_name=subject,
            email_hash=hash_value(subject + "@example.test"),
        ))
        await session.commit()


@pytest.mark.asyncio
async def test_transfer_preserves_shared_plan_and_allows_full_deletion(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    owner, recipient, outsider = "lifecycle-owner", "lifecycle-recipient", "lifecycle-outsider"
    await seed_profile(owner)
    await seed_profile(recipient)
    await seed_profile(outsider)
    async with SessionFactory() as session:
        plan = Plan(
            organizer_id=owner, title="Shared dinner", share_token_hash=hash_value("lifecycle-shared"),
            location_label="Chicago", latitude=41.8, longitude=-87.6,
        )
        session.add(plan)
        await session.flush()
        run = RecommendationRun(plan_id=plan.id, query="dinner", provider="fixture")
        session.add(run)
        await session.flush()
        candidate = Candidate(
            run_id=run.id, place_id="lifecycle-candidate", match_score=0.9,
            reasoning="fixture", rank=1,
        )
        session.add(candidate)
        await session.flush()
        plan.status = "voting"
        plan.active_run_id = run.id
        session.add_all([
            PlanParticipant(plan_id=plan.id, profile_id=owner, constraints={}),
            PlanParticipant(plan_id=plan.id, profile_id=recipient, constraints={}),
            PlanEvent(
                plan_id=plan.id, actor_id=owner, event_type="plan.created",
                payload={"actor": owner, "nested": [owner, "safe"], "email": "private@example.test"},
            ),
        ])
        await session.commit()
        plan_id = plan.id
        candidate_id = candidate.id

    finalize_headers = {**headers(owner), "Idempotency-Key": "lifecycle-finalize-replay"}
    finalized = await client.post(
        f"/api/v1/plans/{plan_id}/finalize", headers=finalize_headers,
        json={"candidate_id": candidate_id},
    )
    assert finalized.status_code == 200

    monkeypatch.setattr(api, "full_deletion_available", lambda: True)
    monkeypatch.setattr(auth_removal, "full_deletion_available", lambda: True)
    invalid = await client.post("/api/v1/me/deletion", headers=headers(owner), json={"confirmation": "delete"})
    assert invalid.status_code == 422
    blocked = await client.post("/api/v1/me/deletion", headers=headers(owner), json={"confirmation": "DELETE"})
    assert blocked.status_code == 409
    self_transfer = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership", headers=headers(owner),
        json={"recipient_profile_id": owner},
    )
    assert self_transfer.status_code == 422
    outsider_transfer = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership", headers=headers(owner),
        json={"recipient_profile_id": outsider},
    )
    assert outsider_transfer.status_code == 409
    missing_transfer = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership", headers=headers(owner),
        json={"recipient_profile_id": "deleted-profile"},
    )
    assert missing_transfer.status_code == 409
    unauthorized_transfer = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership", headers=headers(recipient),
        json={"recipient_profile_id": "not-a-profile"},
    )
    assert unauthorized_transfer.status_code == 403
    shared_delete = await client.request(
        "DELETE", f"/api/v1/plans/{plan_id}", headers=headers(owner), json={"confirmation": "DELETE"}
    )
    assert shared_delete.status_code == 409
    transfer_headers = {**headers(owner), "Idempotency-Key": "lifecycle-transfer-replay"}
    transfer = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership",
        headers=transfer_headers, json={"recipient_profile_id": recipient},
    )
    assert transfer.status_code == 200
    replay = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership",
        headers=transfer_headers, json={"recipient_profile_id": recipient},
    )
    assert replay.status_code == 200
    assert replay.headers.get("X-Idempotent-Replay") == "true"
    changed_body = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership",
        headers=transfer_headers, json={"recipient_profile_id": outsider},
    )
    assert changed_body.status_code == 409
    async with SessionFactory() as session:
        transfers = await session.scalar(select(func.count()).select_from(PlanEvent).where(
            PlanEvent.plan_id == plan_id,
            PlanEvent.event_type == "plan.ownership_transferred",
        ))
        assert transfers == 1
    old_finalize = await client.post(
        f"/api/v1/plans/{plan_id}/finalize", headers=finalize_headers,
        json={"candidate_id": candidate_id},
    )
    assert old_finalize.status_code == 403
    back_to_owner = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership", headers=headers(recipient),
        json={"recipient_profile_id": owner},
    )
    assert back_to_owner.status_code == 200
    to_recipient_again = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership", headers=headers(owner),
        json={"recipient_profile_id": recipient},
    )
    assert to_recipient_again.status_code == 200
    stale_transfer = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership",
        headers=transfer_headers, json={"recipient_profile_id": recipient},
    )
    assert stale_transfer.status_code == 403
    requested = await client.post(
        "/api/v1/me/deletion", headers=headers(owner), json={"confirmation": "DELETE"}
    )
    assert requested.status_code == 200
    assert requested.json()["data"]["status"] == "completed"
    assert requested.json()["data"]["needs_attention"] is False
    status = await client.get("/api/v1/me/deletion", headers=headers(owner))
    assert status.status_code == 200
    assert status.json()["data"]["status"] == "completed"
    repeat = await client.post(
        "/api/v1/me/deletion", headers=headers(owner), json={"confirmation": "DELETE"}
    )
    assert repeat.status_code == 200
    async with SessionFactory() as session:
        assert await session.get(Profile, owner) is None
        assert (await session.get(Plan, plan_id)).organizer_id == recipient
        retained_event = await session.scalar(select(PlanEvent).where(PlanEvent.plan_id == plan_id, PlanEvent.event_type == "plan.created"))
        assert retained_event.actor_id is None
        assert retained_event.payload == {}
        row = await session.get(AccountDeletion, subject_digest(owner))
        assert row.auth_subject is None
    recipient_view = await client.get(f"/api/v1/plans/{plan_id}", headers=headers(recipient))
    assert recipient_view.status_code == 200


@pytest.mark.asyncio
async def test_sole_plan_delete_then_full_deletion_pending_and_retry(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    subject = "lifecycle-sole"
    await seed_profile(subject)
    async with SessionFactory() as session:
        invite = Invite(code_hash=hash_value("lifecycle-sole-invite"), max_uses=1)
        session.add(invite)
        await session.flush()
        reservation = PendingAuthValidation(
            invite_id=invite.id,
            email_hash=hash_value(subject + "@example.test"),
            expires_at=datetime.now(UTC) + timedelta(hours=1),
        )
        session.add(reservation)
        plan = Plan(
            organizer_id=subject, title="Solo dinner", share_token_hash=hash_value("lifecycle-solo"),
            location_label="Chicago", latitude=41.8, longitude=-87.6,
        )
        session.add(plan)
        await session.flush()
        session.add(PlanParticipant(plan_id=plan.id, profile_id=subject, constraints={}))
        await session.commit()
        plan_id = plan.id
        reservation_id = reservation.id
    deleted = await client.request(
        "DELETE", f"/api/v1/plans/{plan_id}", headers=headers(subject), json={"confirmation": "DELETE"}
    )
    assert deleted.status_code == 200
    monkeypatch.setattr(api, "full_deletion_available", lambda: True)
    monkeypatch.setattr(auth_removal, "full_deletion_available", lambda: True)

    calls = 0

    async def temporary_failure(_subject: str) -> None:
        nonlocal calls
        calls += 1
        if calls == 1:
            raise auth_removal.AuthRemovalError("retryable")

    monkeypatch.setattr(auth_removal, "remove_auth_identity", temporary_failure)
    first = await client.post(
        "/api/v1/me/deletion", headers=headers(subject), json={"confirmation": "DELETE"}
    )
    assert first.status_code == 200
    assert first.json()["data"]["status"] == "pending"
    assert first.json()["data"]["last_error_code"] == "retryable"
    assert (await client.get("/api/v1/me", headers=headers(subject))).status_code == 403
    async with SessionFactory() as session:
        assert await session.get(PendingAuthValidation, reservation_id) is None
        row = await session.get(AccountDeletion, subject_digest(subject))
        assert row.auth_subject == subject
        row.next_retry_at = datetime.now(UTC) - timedelta(seconds=1)
        await session.commit()
    assert await account_lifecycle.process_due_deletions(limit=1) == 1
    status = await client.get("/api/v1/me/deletion", headers=headers(subject))
    assert status.json()["data"]["status"] == "completed"
    assert calls == 2


@pytest.mark.asyncio
async def test_stale_lease_cannot_complete_or_erase_pending_identity(
    monkeypatch: pytest.MonkeyPatch
) -> None:
    subject = "lifecycle-stale-lease"
    digest = subject_digest(subject)
    async with SessionFactory() as session:
        session.add(AccountDeletion(subject_hash=digest, auth_subject=subject))
        await session.commit()

    async def stolen_lease(_subject: str) -> None:
        async with SessionFactory() as session:
            row = await session.get(AccountDeletion, digest)
            row.lease_token = "newer-worker"
            await session.commit()

    monkeypatch.setattr(auth_removal, "remove_auth_identity", stolen_lease)
    assert await account_lifecycle.process_deletion(digest) is False
    async with SessionFactory() as session:
        row = await session.get(AccountDeletion, digest)
        assert row.status == "pending"
        assert row.auth_subject == subject
        assert row.lease_token == "newer-worker"


@pytest.mark.asyncio
async def test_one_worker_claims_a_due_identity(monkeypatch: pytest.MonkeyPatch) -> None:
    subject = "lifecycle-single-claim"
    digest = subject_digest(subject)
    async with SessionFactory() as session:
        session.add(AccountDeletion(subject_hash=digest, auth_subject=subject))
        await session.commit()
    started = asyncio.Event()
    release = asyncio.Event()
    calls = 0

    async def slow_removal(_subject: str) -> None:
        nonlocal calls
        calls += 1
        started.set()
        await release.wait()

    monkeypatch.setattr(auth_removal, "remove_auth_identity", slow_removal)
    first = asyncio.create_task(account_lifecycle.process_deletion(digest))
    await asyncio.wait_for(started.wait(), 5)
    assert await account_lifecycle.process_deletion(digest) is False
    release.set()
    assert await first is True
    assert calls == 1


@pytest.mark.asyncio
async def test_expired_final_claim_requires_explicit_recovery() -> None:
    subject = "lifecycle-exhausted-crash"
    digest = subject_digest(subject)
    async with SessionFactory() as session:
        session.add(AccountDeletion(
            subject_hash=digest, auth_subject=subject,
            attempts=account_lifecycle.MAX_ATTEMPTS,
            lease_token="crashed-worker",
            lease_until=datetime.now(UTC) - timedelta(seconds=1),
        ))
        await session.commit()
    assert await account_lifecycle.process_due_deletions(limit=1) == 0
    async with SessionFactory() as session:
        row = await session.get(AccountDeletion, digest)
        assert row.needs_attention is True
        assert row.lease_token is None
        assert row.auth_subject == subject
    assert await account_lifecycle.retry_attention_deletion(digest) is True
    async with SessionFactory() as session:
        row = await session.get(AccountDeletion, digest)
        assert row.attempts == 0
        assert row.needs_attention is False
        assert row.auth_subject == subject


@pytest.mark.asyncio
async def test_deleted_subject_cannot_redeem_or_replay_cached_write(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    subject = "lifecycle-no-redeem"
    await seed_profile(subject)
    async with SessionFactory() as session:
        invite = Invite(code_hash=hash_value("lifecycle-redeem-invite"), max_uses=1)
        session.add(invite)
        await session.commit()
        invite_id = invite.id
    body = {
        "title": "Cached dinner", "location_label": "Chicago",
        "latitude": 41.8, "longitude": -87.6,
    }
    cached_headers = {**headers(subject), "Idempotency-Key": "lifecycle-cached-create"}
    created = await client.post("/api/v1/plans", headers=cached_headers, json=body)
    assert created.status_code == 200
    plan_id = created.json()["data"]["plan"]["id"]
    removed = await client.request(
        "DELETE", f"/api/v1/plans/{plan_id}", headers=headers(subject), json={"confirmation": "DELETE"}
    )
    assert removed.status_code == 200
    monkeypatch.setattr(api, "full_deletion_available", lambda: True)
    monkeypatch.setattr(auth_removal, "full_deletion_available", lambda: True)
    deleted = await client.post(
        "/api/v1/me/deletion", headers=headers(subject), json={"confirmation": "DELETE"}
    )
    assert deleted.status_code == 200
    replay = await client.post("/api/v1/plans", headers=cached_headers, json=body)
    assert replay.status_code == 403
    assert replay.headers.get("X-Idempotent-Replay") is None
    redeem = await client.post(
        "/api/v1/access/redeem", headers=headers(subject),
        json={"redemption_token": issue_redemption_token(invite_id), "display_name": "Return"},
    )
    assert redeem.status_code == 409


@pytest.mark.asyncio
async def test_account_plan_management_is_private_and_provider_free(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    owner, recipient = "management-owner", "management-recipient"
    await seed_profile(owner)
    await seed_profile(recipient)
    async with SessionFactory() as session:
        shared = Plan(
            organizer_id=owner, title="Managed dinner", share_token_hash=hash_value("private-link"),
            location_label="Chicago",
        )
        other = Plan(
            organizer_id=recipient, title="Someone else's dinner",
            share_token_hash=hash_value("other-private-link"), location_label="Chicago",
        )
        session.add_all([shared, other])
        await session.flush()
        run = RecommendationRun(plan_id=shared.id, query="private query", provider="fixture")
        session.add(run)
        await session.flush()
        shared.active_run_id = run.id
        session.add(Candidate(
            run_id=run.id, place_id="never-hydrate", match_score=0.9, reasoning="private", rank=1,
        ))
        session.add_all([
            PlanParticipant(plan_id=shared.id, profile_id=owner, constraints={"notes": "private"}),
            PlanParticipant(plan_id=shared.id, profile_id=recipient, constraints={}),
            PlanParticipant(plan_id=other.id, profile_id=recipient, constraints={}),
            PlanParticipant(plan_id=other.id, profile_id=owner, constraints={}),
        ])
        await session.commit()
        plan_id = shared.id

    async def forbidden_provider(*_args, **_kwargs):
        pytest.fail("Account plan management must not invoke Places")

    monkeypatch.setattr(api, "_call_places", forbidden_provider)
    listed = await client.get("/api/v1/me/organized-plans", headers=headers(owner))
    assert listed.status_code == 200
    plans = listed.json()["data"]
    assert len(plans) == 1
    assert plans[0]["id"] == plan_id
    assert set(plans[0]) == {
        "id", "title", "organizer_id", "viewer_is_organizer", "updated_at", "participants",
    }
    assert plans[0]["viewer_is_organizer"] is True
    assert len(plans[0]["participants"]) == 2
    for participant in plans[0]["participants"]:
        assert set(participant) == {"profile_id", "display_name", "is_organizer"}
    transferred = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership", headers=headers(owner),
        json={"recipient_profile_id": recipient},
    )
    assert transferred.status_code == 200
    assert transferred.json()["data"]["organizer_id"] == recipient
    assert transferred.json()["data"]["viewer_is_organizer"] is False
    assert set(transferred.json()["data"]) == set(plans[0])
    assert (await client.get("/api/v1/me/organized-plans", headers=headers(owner))).json()["data"] == []
    denied = await client.get("/api/v1/me/organized-plans", headers=headers("unapproved-manager"))
    assert denied.status_code == 403


@pytest.mark.asyncio
async def test_retry_during_admission_pause_returns_status_without_claim(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    subject = "lifecycle-paused-retry"
    digest = subject_digest(subject)
    async with SessionFactory() as session:
        session.add(AccountDeletion(subject_hash=digest, auth_subject=subject, attempts=2))
        await session.commit()
    monkeypatch.setattr(api, "full_deletion_available", lambda: False)

    async def unexpected_claim(_digest: str) -> bool:
        pytest.fail("Disabled API must not consume an Auth-removal attempt")

    monkeypatch.setattr(api, "process_deletion", unexpected_claim)
    response = await client.post(
        "/api/v1/me/deletion", headers=headers(subject), json={"confirmation": "DELETE"}
    )
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "pending"
    async with SessionFactory() as session:
        row = await session.get(AccountDeletion, digest)
        assert row is not None and row.attempts == 2
        assert row.lease_token is None and row.last_error_code is None


@pytest.mark.asyncio
async def test_postgres_subject_lock_waits_for_exclusive_transaction() -> None:
    if engine.url.get_backend_name() != "postgresql":
        pytest.skip("PostgreSQL advisory locks require a PostgreSQL test database")
    subject = "lifecycle-postgres-lock-proof"
    entered = asyncio.Event()
    async with SessionFactory() as first:
        await lock_subject(first, subject, exclusive=True)

        async def second_transaction() -> None:
            async with SessionFactory() as second:
                await lock_subject(second, subject)
                entered.set()
                await second.rollback()

        waiter = asyncio.create_task(second_transaction())
        with pytest.raises(TimeoutError):
            await asyncio.wait_for(asyncio.shield(entered.wait()), 0.1)
        await first.commit()
        await asyncio.wait_for(waiter, 5)
    assert entered.is_set()


@pytest.mark.asyncio
async def test_queue_only_admission_retry_and_paused_api_worker_drain(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    from tableus.config import get_settings

    subject = "lifecycle-queue-only"
    await seed_profile(subject)
    settings = get_settings().model_copy(update={"tableus_account_deletion_inline_attempt": False})
    monkeypatch.setattr(api, "get_settings", lambda: settings)
    monkeypatch.setattr(api, "full_deletion_available", lambda: True)
    auth_calls = []

    async def synthetic_auth_removal(auth_subject: str) -> None:
        auth_calls.append(auth_subject)

    monkeypatch.setattr(auth_removal, "remove_auth_identity", synthetic_auth_removal)
    for _ in range(2):
        response = await client.post(
            "/api/v1/me/deletion", headers=headers(subject), json={"confirmation": "DELETE"}
        )
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "pending"
    digest = subject_digest(subject)
    async with SessionFactory() as session:
        assert await session.get(Profile, subject) is None
        row = await session.get(AccountDeletion, digest)
        assert row is not None and row.attempts == 0 and row.auth_subject == subject
    assert auth_calls == []
    monkeypatch.setattr(api, "full_deletion_available", lambda: False)
    paused = await client.post(
        "/api/v1/me/deletion", headers=headers(subject), json={"confirmation": "DELETE"}
    )
    assert paused.json()["data"]["status"] == "pending"
    assert await account_lifecycle.process_deletion(digest)
    assert auth_calls == [subject]
    completed = await client.get("/api/v1/me/deletion", headers=headers(subject))
    assert completed.json()["data"]["status"] == "completed"
    assert (await client.get("/api/v1/me", headers=headers(subject))).status_code == 403
    async with SessionFactory() as session:
        row = await session.get(AccountDeletion, digest)
        assert row is not None and row.auth_subject is None and row.attempts == 1
