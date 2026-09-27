"""Bounded, read-only pilot observation over retained events; never reconstruct votes."""

from datetime import UTC, datetime, timedelta
from typing import TypeGuard
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Plan, PlanEvent

MAX_PLANS = 100
MAX_EVENTS = 10_000


def valid_voter_count(value: object) -> TypeGuard[int]:
    # bool is an int subclass; floats/strings are not historical integer counts.
    return type(value) is int and 0 <= value <= 8


def _utc(value: datetime) -> datetime:
    # SQLite's test adapter drops the timezone on UTC columns.
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


async def measure_pilot(
    session: AsyncSession, plan_ids: list[str], start: datetime, end: datetime,
) -> dict:
    """Use an owner-reviewed real-pilot plan roster and a half-open UTC window.

    The first participant.joined event marks the second participant: creation
    already inserts the organizer and repeat joins do not emit another event.
    Roster review, not this query, establishes real people and distinct groups.
    No actor, current vote, candidate or run is needed to count a finalization.
    """
    if not start.tzinfo or not end.tzinfo or not timedelta(0) < end - start <= timedelta(days=21):
        raise ValueError("Use an aware, positive observation window of at most 21 days")
    ids = set(plan_ids)
    if not ids or len(ids) > MAX_PLANS:
        raise ValueError(f"Supply 1–{MAX_PLANS} distinct roster plan IDs")
    for value in ids:
        if str(UUID(value)) != value:
            raise ValueError("Roster plan IDs must be canonical UUIDs")
    start, end = _utc(start), _utc(end)
    retained = set((await session.scalars(select(Plan.id).where(Plan.id.in_(ids)))).all())
    # Bound both scope and returned rows; refuse partial reports if the cap is hit.
    events = (await session.execute(
        select(PlanEvent.plan_id, PlanEvent.event_type, PlanEvent.created_at, PlanEvent.payload)
        .where(PlanEvent.plan_id.in_(retained), PlanEvent.created_at < end,
               PlanEvent.event_type.in_(("participant.joined", "plan.finalized")))
        .order_by(PlanEvent.created_at, PlanEvent.id).limit(MAX_EVENTS + 1)
    )).all()
    if len(events) > MAX_EVENTS:
        raise ValueError("Event cap exceeded; narrow the roster before reporting")
    first_join: dict[str, datetime] = {}
    finalizations: dict[str, list] = {}
    for plan_id, event_type, created_at, payload in events:
        when = _utc(created_at)
        if event_type == "participant.joined":
            first_join.setdefault(plan_id, when)
        elif start <= when < end:
            finalizations.setdefault(plan_id, []).append((when, payload))
    eligible = {plan_id for plan_id, when in first_join.items() if start <= when < end}
    success = below = unknown = unfinished = late = legacy = 0
    for plan_id in eligible:
        joined = first_join[plan_id]
        if end - joined < timedelta(days=1):
            late += 1
        counts = [
            payload.get("distinct_voter_count") if isinstance(payload, dict) else None
            for when, payload in finalizations.get(plan_id, []) if when >= joined
        ]
        has_unknown = any(not valid_voter_count(count) for count in counts)
        legacy += int(has_unknown)
        if any(valid_voter_count(count) and count >= 2 for count in counts):
            success += 1
        elif has_unknown:
            unknown += 1
        elif counts:
            below += 1
        else:
            unfinished += 1
    return {
        "window_start": start.isoformat(), "window_end_exclusive": end.isoformat(),
        "roster_plans": len(ids), "retained_plans": len(retained),
        "missing_or_deleted_roster_plans": len(ids - retained),
        "retained_without_join_history": len(retained - first_join.keys()),
        "retained_first_join_before_window": sum(when < start for when in first_join.values()),
        "eligible_retained_plans": len(eligible),
        "successful_plans": success,
        "finalized_below_two_voters": below,
        "unknown_finalization_outcomes": unknown,
        "no_observed_finalization": unfinished,
        "plans_with_missing_or_invalid_counts": legacy,
        "eligible_with_less_than_24_hours": late,
        "observed_retained_success_rate": success / len(eligible) if eligible else None,
        "coverage": "Retained events only; whole-plan deletion and missing history prevent complete cohort conversion. Roster review must establish real diners and distinct groups.",
    }
