"""Recipient admission uses current records, including under PostgreSQL contention."""

import asyncio
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlalchemy import func, select, text

from tableus import api
from tableus.auth import Identity, load_approved_profile
from tableus.db import SessionFactory, engine, init_database
from tableus.models import Invite, InviteRedemption, PendingAuthValidation, Profile
from tableus.schemas import InviteRedeemIn, InviteValidateIn
from tableus.security import decode_redemption_token, hash_value, issue_redemption_token


@pytest.fixture(scope="module", autouse=True)
async def database():
    await init_database()


@pytest.fixture(autouse=True)
def hosted(monkeypatch):
    monkeypatch.setattr(api.get_settings(), "tableus_auth_mode", "supabase")


async def seed(*, bound=True, max_uses=1):
    code = uuid4().hex
    email = f"{uuid4().hex}@example.test"
    async with SessionFactory() as session:
        invite = Invite(
            code_hash=hash_value(code), max_uses=max_uses,
            recipient_email_hash=hash_value(email) if bound else None,
            expires_at=datetime.now(UTC) + timedelta(days=7),
        )
        session.add(invite)
        await session.commit()
        return invite.id, code, email


async def validate(code, email):
    async with SessionFactory() as session:
        response = await api.validate_access(InviteValidateIn(code=code, email=email), session)
        return response["data"].redemption_token


async def redeem(token, subject, email):
    async with SessionFactory() as session:
        return await api.redeem_access(
            InviteRedeemIn(redemption_token=token, display_name="Synthetic recipient"),
            Identity(subject=subject, email=email), session,
        )


@pytest.mark.asyncio
async def test_wrong_recipient_does_not_reserve_and_normalized_retry_reuses_reservation():
    invite_id, code, email = await seed()
    with pytest.raises(HTTPException) as error:
        await validate(code, "wrong@example.test")
    assert error.value.status_code == 404
    async with SessionFactory() as session:
        assert await session.scalar(select(func.count()).select_from(PendingAuthValidation).where(
            PendingAuthValidation.invite_id == invite_id
        )) == 0
    first = decode_redemption_token(await validate(code, f"  {email.upper()}  "))
    second = decode_redemption_token(await validate(code, email))
    assert first.pending_validation_id == second.pending_validation_id
    assert first.email_hash == hash_value(email)


@pytest.mark.asyncio
@pytest.mark.parametrize("max_uses", [1, 8])
async def test_legacy_hosted_intake_and_old_grants_fail_closed(max_uses):
    invite_id, code, email = await seed(bound=False, max_uses=max_uses)
    with pytest.raises(HTTPException) as error:
        await validate(code, email)
    assert error.value.status_code == 404
    async with SessionFactory() as session:
        reservation = PendingAuthValidation(
            invite_id=invite_id, email_hash=hash_value(email),
            expires_at=datetime.now(UTC) + timedelta(minutes=20),
        )
        session.add(reservation)
        await session.commit()
        token = issue_redemption_token(invite_id, email, reservation.id)
    with pytest.raises(HTTPException) as error:
        await redeem(token, uuid4().hex, email)
    assert error.value.status_code == 409


@pytest.mark.asyncio
@pytest.mark.parametrize("change", ["revoked", "expired", "recipient", "reservation_expired"])
async def test_existing_grant_rechecks_current_invite_and_reservation(change):
    invite_id, code, email = await seed()
    token = await validate(code, email)
    grant = decode_redemption_token(token)
    subject = uuid4().hex
    async with SessionFactory() as session:
        invite = await session.get(Invite, invite_id)
        if change == "revoked":
            invite.revoked_at = datetime.now(UTC)
        elif change == "expired":
            invite.expires_at = datetime.now(UTC) - timedelta(seconds=1)
        elif change == "recipient":
            # Synthetic database mutation: no rebinding operation is exposed.
            invite.recipient_email_hash = hash_value("replacement@example.test")
        else:
            reservation = await session.get(PendingAuthValidation, grant.pending_validation_id)
            reservation.expires_at = datetime.now(UTC) - timedelta(seconds=1)
        await session.commit()
    with pytest.raises(HTTPException) as error:
        await redeem(token, subject, email)
    assert error.value.status_code == 409
    async with SessionFactory() as session:
        assert await session.get(Profile, subject) is None
        assert (await session.get(Invite, invite_id)).use_count == 0


@pytest.mark.asyncio
async def test_session_email_and_reservation_required_even_for_bound_demo_invites(monkeypatch):
    invite_id, code, email = await seed()
    token = await validate(code, email)
    with pytest.raises(HTTPException) as error:
        await redeem(token, uuid4().hex, "other@example.test")
    assert error.value.status_code == 403
    monkeypatch.setattr(api.get_settings(), "tableus_auth_mode", "demo")
    with pytest.raises(HTTPException) as error:
        await redeem(issue_redemption_token(invite_id, email), uuid4().hex, email)
    assert error.value.status_code == 409


@pytest.mark.asyncio
async def test_success_retry_and_returning_access_survive_revocation_without_new_consumption():
    invite_id, code, email = await seed()
    token = await validate(code, email)
    subject = uuid4().hex
    assert (await redeem(token, subject, email.upper()))["data"].id == subject
    async with SessionFactory() as session:
        invite = await session.get(Invite, invite_id)
        invite.revoked_at = datetime.now(UTC)
        await session.commit()
    assert (await redeem(token, subject, email))["data"].id == subject
    async with SessionFactory() as session:
        assert (await load_approved_profile(Identity(subject, email), session)).id == subject
        assert (await session.get(Invite, invite_id)).use_count == 1
        assert await session.scalar(select(func.count()).select_from(InviteRedemption).where(
            InviteRedemption.invite_id == invite_id
        )) == 1


@pytest.mark.asyncio
async def test_legacy_approved_account_keeps_access_and_successful_retry():
    invite_id, _, email = await seed(bound=False, max_uses=8)
    subject = uuid4().hex
    async with SessionFactory() as session:
        invite = await session.get(Invite, invite_id)
        invite.use_count = 1
        profile = Profile(id=subject, display_name="Existing member", email_hash=hash_value(email))
        reservation = PendingAuthValidation(
            invite_id=invite_id, email_hash=hash_value(email),
            expires_at=datetime.now(UTC) + timedelta(minutes=20), redeemed_at=datetime.now(UTC),
        )
        session.add_all([profile, reservation])
        await session.flush()
        session.add(InviteRedemption(invite_id=invite_id, profile_id=subject))
        await session.commit()
        token = issue_redemption_token(invite_id, email, reservation.id)
    assert (await redeem(token, subject, email))["data"].id == subject
    async with SessionFactory() as session:
        assert (await load_approved_profile(Identity(subject, email), session)).id == subject
        assert (await session.get(Invite, invite_id)).use_count == 1


async def wait_for_row_waiter():
    async def observe():
        while True:
            async with SessionFactory() as session:
                waiting = await session.scalar(text(
                    "SELECT count(*) FROM pg_locks WHERE NOT granted "
                    "AND locktype IN ('transactionid', 'tuple') AND pid IN "
                    "(SELECT pid FROM pg_stat_activity WHERE datname=current_database())"
                ))
            if waiting:
                return
            await asyncio.sleep(0.02)
    await asyncio.wait_for(observe(), 5)


@pytest.mark.asyncio
@pytest.mark.skipif(engine.url.get_backend_name() != "postgresql", reason="Actual row contention")
@pytest.mark.parametrize("revoke_first", [False, True])
async def test_contending_redemptions_have_one_winner_or_observe_committed_revocation(revoke_first):
    invite_id, code, email = await seed()
    token = await validate(code, email)
    subjects = [uuid4().hex, uuid4().hex]
    async with SessionFactory() as holder:
        invite = await holder.get(Invite, invite_id, with_for_update=True)
        tasks = [asyncio.create_task(redeem(token, subject, email)) for subject in subjects]
        try:
            await wait_for_row_waiter()
            if revoke_first:
                invite.revoked_at = datetime.now(UTC)
            await holder.commit()
        finally:
            await holder.rollback()
            results = await asyncio.wait_for(asyncio.gather(*tasks, return_exceptions=True), 10)
    successes = [result for result in results if isinstance(result, dict)]
    failures = [result for result in results if isinstance(result, HTTPException)]
    assert len(successes) == (0 if revoke_first else 1)
    assert len(failures) == (2 if revoke_first else 1)
    assert all(result.status_code == 409 for result in failures)
    if successes:
        winner = successes[0]["data"].id
        assert (await redeem(token, winner, email))["data"].id == winner
    async with SessionFactory() as session:
        assert (await session.get(Invite, invite_id)).use_count == len(successes)
        assert await session.scalar(select(func.count()).select_from(InviteRedemption).where(
            InviteRedemption.invite_id == invite_id
        )) == len(successes)
