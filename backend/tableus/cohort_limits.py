"""Durable, subject-scoped admission for the closed beta cohort.

Provider reservations are committed before dispatch and are deliberately not
refunded after ambiguous provider failures. Plan creation shares its caller's
transaction, so a failed plan insert cannot consume a lifetime slot.
"""

from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from typing import Literal

from sqlalchemy import select, tuple_, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession

from .auth import subject_digest
from .config import get_settings
from .db import SessionFactory
from .models import CohortCounter

ProviderKind = Literal["ai", "places"]
_LIFETIME = "lifetime"


@dataclass(frozen=True)
class QuotaBucket:
    used: int
    limit: int


@dataclass(frozen=True)
class QuotaSnapshot:
    utc_day: date
    reset_at: datetime
    ai: QuotaBucket
    places: QuotaBucket
    plans: QuotaBucket


def _utc_day(now: datetime | None = None) -> date:
    value = now or datetime.now(UTC)
    if value.tzinfo is None:
        raise ValueError("Quota time must be timezone-aware")
    return value.astimezone(UTC).date()


def _limit(kind: Literal["ai", "places", "plans"]) -> int:
    settings = get_settings()
    return {
        "ai": settings.cohort_ai_operations_per_day,
        "places": settings.cohort_places_operations_per_day,
        "plans": settings.cohort_plans_lifetime,
    }[kind]


async def _consume(
    session: AsyncSession, subject: str, kind: Literal["ai", "places", "plans"],
    period_key: str,
) -> bool:
    digest = subject_digest(subject)
    values = {
        "subject_hash": digest,
        "kind": kind,
        "period_key": period_key,
        "used": 0,
        "updated_at": datetime.now(UTC),
    }
    dialect = session.get_bind().dialect.name
    if dialect == "postgresql":
        await session.execute(pg_insert(CohortCounter).values(**values).on_conflict_do_nothing())
    elif dialect == "sqlite":
        await session.execute(sqlite_insert(CohortCounter).values(**values).on_conflict_do_nothing())
    else:
        raise RuntimeError("Quota ledger requires PostgreSQL or SQLite")
    new_used = await session.scalar(
        update(CohortCounter)
        .where(
            CohortCounter.subject_hash == digest,
            CohortCounter.kind == kind,
            CohortCounter.period_key == period_key,
            CohortCounter.used < _limit(kind),
        )
        .values(used=CohortCounter.used + 1, updated_at=datetime.now(UTC))
        .returning(CohortCounter.used)
    )
    return new_used is not None


async def reserve_provider_operation(subject: str, kind: ProviderKind) -> bool:
    """Commit one logical operation before dispatch; internal retries share its debit."""
    if kind not in {"ai", "places"}:
        raise ValueError("Unsupported provider quota kind")
    async with SessionFactory() as session:
        admitted = await _consume(session, subject, kind, _utc_day().isoformat())
        await session.commit()
        return admitted


async def consume_plan_creation(session: AsyncSession, subject: str) -> bool:
    """Reserve one lifetime creation in the plan insertion transaction."""
    return await _consume(session, subject, "plans", _LIFETIME)


async def quota_snapshot(session: AsyncSession, subject: str) -> QuotaSnapshot:
    day = _utc_day()
    digest = subject_digest(subject)
    periods = {"ai": day.isoformat(), "places": day.isoformat(), "plans": _LIFETIME}
    rows = (await session.scalars(
        select(CohortCounter).where(
            CohortCounter.subject_hash == digest,
            tuple_(CohortCounter.kind, CohortCounter.period_key).in_(list(periods.items())),
        )
    )).all()
    used = {(row.kind, row.period_key): row.used for row in rows}
    reset_at = datetime.combine(day + timedelta(days=1), datetime.min.time(), tzinfo=UTC)
    return QuotaSnapshot(
        utc_day=day,
        reset_at=reset_at,
        ai=QuotaBucket(used.get(("ai", periods["ai"]), 0), _limit("ai")),
        places=QuotaBucket(used.get(("places", periods["places"]), 0), _limit("places")),
        plans=QuotaBucket(used.get(("plans", _LIFETIME), 0), _limit("plans")),
    )
