import asyncio
import importlib.util
from datetime import date
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine, delete, text
from sqlalchemy.exc import DBAPIError

from tableus import cohort_limits
from tableus.auth import subject_digest
from tableus.config import Settings
from tableus.db import SessionFactory, engine, init_database
from tableus.models import CohortCounter, Profile
from tableus.security import hash_value


@pytest.fixture(scope="module", autouse=True)
async def database() -> None:
    await init_database()


def subject() -> str:
    return f"quota-{uuid4().hex}"


@pytest.mark.asyncio
async def test_provider_reservation_is_durable_and_utc_day_scoped(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    actor = subject()
    day = date(2026, 9, 24)
    monkeypatch.setattr(cohort_limits, "_utc_day", lambda: day)
    original_limit = cohort_limits._limit
    monkeypatch.setattr(
        cohort_limits, "_limit", lambda kind: 2 if kind in {"ai", "places"} else original_limit(kind)
    )
    assert await cohort_limits.reserve_provider_operation(actor, "ai")
    assert await cohort_limits.reserve_provider_operation(actor, "ai")
    assert not await cohort_limits.reserve_provider_operation(actor, "ai")
    assert await cohort_limits.reserve_provider_operation(actor, "places")
    async with SessionFactory() as fresh:
        snapshot = await cohort_limits.quota_snapshot(fresh, actor)
        assert (snapshot.ai.used, snapshot.ai.limit) == (2, 2)
        assert (snapshot.places.used, snapshot.places.limit) == (1, 2)
        assert snapshot.reset_at.isoformat() == "2026-09-25T00:00:00+00:00"
        row = await fresh.get(CohortCounter, (subject_digest(actor), "ai", day.isoformat()))
        assert row is not None and row.used == 2
    monkeypatch.setattr(cohort_limits, "_utc_day", lambda: date(2026, 9, 25))
    assert await cohort_limits.reserve_provider_operation(actor, "ai")
    async with SessionFactory() as fresh:
        assert (await cohort_limits.quota_snapshot(fresh, actor)).ai.used == 1


@pytest.mark.asyncio
async def test_plan_creation_rolls_back_with_caller_and_survives_profile_lifecycle(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    actor = subject()
    monkeypatch.setattr(cohort_limits, "_limit", lambda _kind: 1)
    async with SessionFactory() as session:
        session.add(Profile(id=actor, display_name=actor, email_hash=hash_value(actor)))
        await session.commit()
    async with SessionFactory() as session:
        assert await cohort_limits.consume_plan_creation(session, actor)
        await session.rollback()
    async with SessionFactory() as session:
        assert await cohort_limits.consume_plan_creation(session, actor)
        await session.commit()
    async with SessionFactory() as fresh:
        assert (await cohort_limits.quota_snapshot(fresh, actor)).plans.used == 1
        profile = await fresh.get(Profile, actor)
        assert profile is not None
        await fresh.delete(profile)
        await fresh.commit()
    async with SessionFactory() as fresh:
        fresh.add(Profile(id=actor, display_name=actor, email_hash=hash_value(actor)))
        await fresh.commit()
        assert not await cohort_limits.consume_plan_creation(fresh, actor)
        await fresh.commit()
        assert (await cohort_limits.quota_snapshot(fresh, actor)).plans.used == 1


@pytest.mark.asyncio
@pytest.mark.skipif(
    engine.url.get_backend_name() != "postgresql",
    reason="Concurrent atomic admissions require separate PostgreSQL transactions",
)
async def test_competing_provider_admissions_never_exceed_limit(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    actor = subject()
    monkeypatch.setattr(cohort_limits, "_limit", lambda _kind: 3)
    results = await asyncio.gather(*(
        cohort_limits.reserve_provider_operation(actor, "places") for _ in range(8)
    ))
    assert sum(results) == 3
    async with SessionFactory() as fresh:
        assert (await cohort_limits.quota_snapshot(fresh, actor)).places.used == 3


@pytest.mark.asyncio
@pytest.mark.skipif(
    engine.url.get_backend_name() != "postgresql",
    reason="Concurrent caller transactions require PostgreSQL row locking",
)
async def test_competing_plan_transactions_never_exceed_lifetime_limit(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    actor = subject()
    monkeypatch.setattr(cohort_limits, "_limit", lambda _kind: 3)

    async def create_slot() -> bool:
        async with SessionFactory() as session:
            admitted = await cohort_limits.consume_plan_creation(session, actor)
            await session.commit()
            return admitted

    results = await asyncio.gather(*(create_slot() for _ in range(8)))
    assert sum(results) == 3
    async with SessionFactory() as fresh:
        assert (await cohort_limits.quota_snapshot(fresh, actor)).plans.used == 3


@pytest.mark.asyncio
@pytest.mark.skipif(
    engine.url.get_backend_name() != "postgresql",
    reason="Runtime role privileges require the migrated PostgreSQL schema",
)
async def test_runtime_role_cannot_delete_quota_history() -> None:
    async with SessionFactory() as session:
        can_delete = await session.scalar(text(
            "SELECT has_table_privilege(current_user, 'app.cohort_counters', 'DELETE')"
        ))
        assert can_delete is False
        with pytest.raises(DBAPIError):
            await session.execute(delete(CohortCounter))
        await session.rollback()


def test_configured_limits_are_positive_and_bounded() -> None:
    settings = Settings(
        cohort_ai_operations_per_day=5,
        cohort_places_operations_per_day=20,
        cohort_plans_lifetime=20,
    )
    assert settings.cohort_ai_operations_per_day == 5
    assert settings.cohort_places_operations_per_day == 20
    assert settings.cohort_plans_lifetime == 20
    with pytest.raises(ValueError):
        Settings(cohort_ai_operations_per_day=0)
    with pytest.raises(ValueError):
        Settings(cohort_plans_lifetime=10001)


def test_migration_attributes_surviving_creation_events_then_organizer_fallback(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    migration_path = (
        Path(__file__).resolve().parents[1]
        / "alembic/versions/ab72e4f39d10_cohort_counters.py"
    )
    spec = importlib.util.spec_from_file_location("cohort_counter_migration_test", migration_path)
    assert spec is not None and spec.loader is not None
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    monkeypatch.setattr(
        migration, "get_settings",
        lambda: SimpleNamespace(database_schema=None, tableus_runtime_db_role=""),
    )
    local_engine = create_engine("sqlite:///:memory:")
    with local_engine.begin() as connection:
        connection.execute(text("CREATE TABLE plans (id TEXT PRIMARY KEY, organizer_id TEXT NOT NULL)"))
        connection.execute(text(
            "CREATE TABLE plan_events (id TEXT PRIMARY KEY, plan_id TEXT, actor_id TEXT, "
            "event_type TEXT, created_at TEXT)"
        ))
        connection.execute(text(
            "INSERT INTO plans (id, organizer_id) VALUES "
            "('transferred', 'recipient'), ('legacy', 'recipient'), ('owned', 'creator')"
        ))
        connection.execute(text(
            "INSERT INTO plan_events (id, plan_id, actor_id, event_type, created_at) VALUES "
            "('e1', 'transferred', 'creator', 'plan.created', '2026-01-01'), "
            "('e2', 'owned', 'creator', 'plan.created', '2026-01-02')"
        ))
        with Operations.context(MigrationContext.configure(connection)):
            migration.upgrade()
        rows = connection.execute(text(
            "SELECT subject_hash, kind, period_key, used FROM cohort_counters ORDER BY subject_hash"
        )).all()
    local_engine.dispose()
    assert sorted(rows) == sorted([
        (subject_digest("creator"), "plans", "lifetime", 2),
        (subject_digest("recipient"), "plans", "lifetime", 1),
    ])
