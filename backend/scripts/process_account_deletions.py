"""Inspect or run one bounded batch of durable account deletion jobs."""

import argparse
import asyncio
import json
import re
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, or_, select
from sqlalchemy.sql.elements import ColumnElement

from tableus.account_lifecycle import (
    DEFAULT_BATCH,
    MAX_ATTEMPTS,
    MAX_BATCH,
    process_due_deletions,
    retry_attention_deletion,
)
from tableus.auth_removal import full_deletion_available
from tableus.db import SessionFactory
from tableus.models import AccountDeletion

_SUBJECT_HASH = re.compile(r"[0-9a-f]{64}\Z")


async def queue_status(*, now: datetime | None = None) -> dict[str, object]:
    """Return counts and ages only; never return subjects, hashes or provider details."""
    observed_at = now or datetime.now(UTC)
    day_ago = observed_at - timedelta(hours=24)
    pending = (AccountDeletion.status == "pending",)
    async with SessionFactory() as session:
        async def count(*conditions: ColumnElement[bool]) -> int:
            value = await session.scalar(
                select(func.count()).select_from(AccountDeletion).where(*conditions)
            )
            return int(value or 0)

        oldest = await session.scalar(
            select(func.min(AccountDeletion.requested_at)).where(*pending)
        )
        report: dict[str, object] = {
            "observed_at": observed_at.isoformat(),
            "worker_available": full_deletion_available(),
            "pending": await count(*pending),
            "attention": await count(*pending, AccountDeletion.needs_attention.is_(True)),
            "ready_due": await count(
                *pending,
                AccountDeletion.needs_attention.is_(False),
                AccountDeletion.attempts < MAX_ATTEMPTS,
                AccountDeletion.auth_subject.is_not(None),
                or_(AccountDeletion.next_retry_at.is_(None), AccountDeletion.next_retry_at <= observed_at),
                or_(AccountDeletion.lease_until.is_(None), AccountDeletion.lease_until <= observed_at),
            ),
            "active_leases": await count(*pending, AccountDeletion.lease_until > observed_at),
            "expired_final_claims": await count(
                *pending,
                AccountDeletion.attempts >= MAX_ATTEMPTS,
                AccountDeletion.needs_attention.is_(False),
                AccountDeletion.lease_until <= observed_at,
            ),
            "missing_subject": await count(*pending, AccountDeletion.auth_subject.is_(None)),
            "pending_older_than_24h": await count(*pending, AccountDeletion.requested_at <= day_ago),
            "completed_last_24h": await count(
                AccountDeletion.status == "completed",
                AccountDeletion.completed_at >= day_ago,
            ),
        }
    if oldest is not None and oldest.tzinfo is None:
        oldest = oldest.replace(tzinfo=UTC)
    report["oldest_pending_age_seconds"] = (
        max(0, int((observed_at - oldest).total_seconds())) if oldest else None
    )
    return report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--status", action="store_true", help="Print privacy-safe queue aggregates")
    mode.add_argument(
        "--retry-subject-hash",
        help="Reset one diagnosed pending row requiring operator attention",
    )
    parser.add_argument("--limit", type=int, default=DEFAULT_BATCH)
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    if args.status:
        if args.limit != DEFAULT_BATCH:
            parser.error("--limit applies only to a processing batch")
        print(json.dumps(asyncio.run(queue_status()), sort_keys=True))
        return
    if args.retry_subject_hash is not None:
        if args.limit != DEFAULT_BATCH:
            parser.error("--limit cannot be combined with --retry-subject-hash")
        if not _SUBJECT_HASH.fullmatch(args.retry_subject_hash):
            parser.error("--retry-subject-hash must be a lowercase 64-character digest")
    elif not 1 <= args.limit <= MAX_BATCH:
        parser.error(f"--limit must be between 1 and {MAX_BATCH}")
    if not full_deletion_available():
        parser.exit(
            2,
            "worker unavailable: deletion capability is disabled or Auth removal is not configured; no jobs claimed\n",
        )
    if args.retry_subject_hash is not None:
        reset = asyncio.run(retry_attention_deletion(args.retry_subject_hash))
        print(f"attention_reset={reset}")
        return
    processed = asyncio.run(process_due_deletions(limit=args.limit))
    print(f"processed={processed}")


if __name__ == "__main__":
    main()
