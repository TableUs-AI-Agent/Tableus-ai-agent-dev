"""Durable, finite Auth identity removal after application data deletion."""

import asyncio
import time
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .db import SessionFactory
from .models import AccountDeletion

LEASE_SECONDS = 45
MAX_BATCH = 25
DEFAULT_BATCH = 3
MAX_ATTEMPTS = 10
BATCH_SECONDS = 55
_ERROR_CODES = {"unavailable", "retryable", "rejected"}


def status_payload(row: AccountDeletion) -> dict:
    return {
        "status": row.status,
        "requested_at": row.requested_at,
        "completed_at": row.completed_at,
        "next_retry_at": row.next_retry_at if row.status == "pending" else None,
        "last_error_code": row.last_error_code if row.status == "pending" else None,
        "needs_attention": row.needs_attention if row.status == "pending" else False,
    }


async def _claim(session: AsyncSession, digest: str) -> tuple[str, str, int] | None:
    now = datetime.now(UTC)
    token = str(uuid.uuid4())
    result = await session.execute(
        update(AccountDeletion)
        .where(
            AccountDeletion.subject_hash == digest,
            AccountDeletion.status == "pending",
            AccountDeletion.needs_attention.is_(False),
            AccountDeletion.attempts < MAX_ATTEMPTS,
            or_(AccountDeletion.next_retry_at.is_(None), AccountDeletion.next_retry_at <= now),
            or_(AccountDeletion.lease_until.is_(None), AccountDeletion.lease_until <= now),
            AccountDeletion.auth_subject.is_not(None),
        )
        .values(lease_token=token, lease_until=now + timedelta(seconds=LEASE_SECONDS), attempts=AccountDeletion.attempts + 1)
        .returning(AccountDeletion.auth_subject, AccountDeletion.attempts)
    )
    claimed = result.one_or_none()
    await session.commit()
    return (token, claimed[0], claimed[1]) if claimed else None


async def process_deletion(digest: str) -> bool:
    """Attempt one due row. Never hold a database transaction across the provider call."""
    from .auth_removal import AuthRemovalError, remove_auth_identity

    async with SessionFactory() as session:
        claimed = await _claim(session, digest)
    if not claimed:
        return False
    token, subject, attempts = claimed
    error_code = None
    try:
        async with asyncio.timeout(15):
            await remove_auth_identity(subject)
    except AuthRemovalError as exc:
        error_code = exc.code if exc.code in _ERROR_CODES else "retryable"
    except Exception:
        error_code = "retryable"
    now = datetime.now(UTC)
    async with SessionFactory() as session:
        values: dict[str, Any] = {"lease_token": None, "lease_until": None}
        if error_code is None:
            values.update(
                status="completed", completed_at=now, auth_subject=None,
                next_retry_at=None, last_error_code=None, needs_attention=False,
            )
        else:
            needs_attention = error_code == "rejected" or attempts >= MAX_ATTEMPTS
            values.update(
                last_error_code=error_code,
                needs_attention=needs_attention,
                next_retry_at=(
                    None if needs_attention
                    else now + timedelta(seconds=min(3600, 2 ** min(attempts, 11)))
                ),
            )
        result = await session.execute(
            update(AccountDeletion)
            .where(
                AccountDeletion.subject_hash == digest,
                AccountDeletion.status == "pending",
                AccountDeletion.lease_token == token,
            )
            .values(**values)
            .returning(AccountDeletion.subject_hash)
        )
        completed = result.scalar_one_or_none() is not None
        await session.commit()
    return completed


async def retry_attention_deletion(digest: str) -> bool:
    """Explicit operator recovery after the underlying cause has been corrected."""
    async with SessionFactory() as session:
        now = datetime.now(UTC)
        result = await session.execute(
            update(AccountDeletion)
            .where(
                AccountDeletion.subject_hash == digest,
                AccountDeletion.status == "pending",
                or_(AccountDeletion.needs_attention.is_(True), AccountDeletion.attempts >= MAX_ATTEMPTS),
                or_(AccountDeletion.lease_until.is_(None), AccountDeletion.lease_until <= now),
            )
            .values(
                attempts=0, needs_attention=False, last_error_code=None, next_retry_at=None,
                lease_token=None, lease_until=None,
            )
            .returning(AccountDeletion.subject_hash)
        )
        reset = result.scalar_one_or_none() is not None
        await session.commit()
        return reset


async def process_due_deletions(*, limit: int = DEFAULT_BATCH) -> int:
    """Process at most one finite batch; a later invocation handles retries."""
    if not 1 <= limit <= MAX_BATCH:
        raise ValueError(f"limit must be between 1 and {MAX_BATCH}")
    processed = 0
    try:
        async with asyncio.timeout(BATCH_SECONDS):
            now = datetime.now(UTC)
            deadline = time.monotonic() + BATCH_SECONDS
            async with SessionFactory() as session:
                # A process may die after claiming its final allowed attempt.
                # Classify its expired lease for explicit operator recovery.
                await session.execute(
                    update(AccountDeletion)
                    .where(
                        AccountDeletion.status == "pending",
                        AccountDeletion.attempts >= MAX_ATTEMPTS,
                        AccountDeletion.needs_attention.is_(False),
                        AccountDeletion.lease_until <= now,
                    )
                    .values(
                        needs_attention=True, last_error_code="retryable",
                        lease_token=None, lease_until=None, next_retry_at=None,
                    )
                )
                await session.commit()
                digests = list((await session.scalars(
                    select(AccountDeletion.subject_hash)
                    .where(
                        AccountDeletion.status == "pending",
                        AccountDeletion.needs_attention.is_(False),
                        AccountDeletion.attempts < MAX_ATTEMPTS,
                        or_(AccountDeletion.next_retry_at.is_(None), AccountDeletion.next_retry_at <= now),
                        or_(AccountDeletion.lease_until.is_(None), AccountDeletion.lease_until <= now),
                    )
                    .order_by(AccountDeletion.requested_at)
                    .limit(limit)
                )).all())
            for digest in digests:
                if time.monotonic() + 15 >= deadline:
                    break
                processed += int(await process_deletion(digest))
    except TimeoutError:
        # A canceled in-flight claim becomes due after its lease expires.
        pass
    return processed
