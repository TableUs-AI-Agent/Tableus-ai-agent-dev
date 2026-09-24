"""Real migration/grant assertions; use a disposable migrated PostgreSQL database."""

from datetime import UTC, datetime
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import create_async_engine

from tableus.config import get_settings
from tableus.db import SessionFactory, engine
from tableus.models import AccountDeletion

pytestmark = pytest.mark.skipif(
    engine.url.get_backend_name() != "postgresql",
    reason="Requires PostgreSQL migration and distinct runtime/browser roles",
)


@pytest.mark.asyncio
async def test_runtime_is_restricted_and_can_process_deletion_records() -> None:
    settings = get_settings()
    assert settings.tableus_runtime_db_role, "Configure the disposable runtime role before migrating"
    async with engine.connect() as connection:
        role = (await connection.execute(text(
            "SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolbypassrls "
            "FROM pg_roles WHERE rolname = current_user"
        ))).one()
        assert role == (settings.tableus_runtime_db_role, False, False, False, False)
        assert await connection.scalar(text(
            "SELECT has_schema_privilege(current_user, 'app', 'USAGE')"
        )) is True
        assert await connection.scalar(text(
            "SELECT has_schema_privilege(current_user, 'app', 'CREATE')"
        )) is False
        assert await connection.scalar(text(
            "SELECT pg_has_role(current_user, tableowner, 'MEMBER') "
            "FROM pg_tables WHERE schemaname='app' AND tablename='account_deletions'"
        )) is False

    # Exercise all required DML as the runtime connection, then roll back the fixture.
    digest = uuid4().hex * 2
    async with SessionFactory() as session:
        row = AccountDeletion(subject_hash=digest, auth_subject="local-test-only")
        session.add(row)
        await session.flush()
        await session.refresh(row)
        assert row.status == "pending"
        row.status, row.auth_subject = "completed", None
        row.completed_at = datetime.now(UTC)
        await session.flush()
        await session.refresh(row)
        assert row.status == "completed" and row.auth_subject is None
        await session.delete(row)
        await session.flush()
        await session.rollback()


@pytest.mark.asyncio
async def test_deletion_table_is_private_and_browser_roles_cannot_read_or_write() -> None:
    admin_engine = create_async_engine(get_settings().migration_sqlalchemy_url)
    try:
        async with admin_engine.connect() as connection:
            assert await connection.scalar(text(
                "SELECT version_num FROM public.alembic_version"
            )) == "6d7e3b91a2c4"
            assert await connection.scalar(text(
                "SELECT count(*) FROM pg_class c "
                "CROSS JOIN LATERAL aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a "
                "WHERE c.oid='app.account_deletions'::regclass AND a.grantee=0"
            )) == 0
            for role in ("anon", "authenticated"):
                assert await connection.scalar(text(
                    "SELECT has_schema_privilege(:role, 'app', 'USAGE')"
                ), {"role": role}) is False
                for privilege in ("SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"):
                    assert await connection.scalar(text(
                        "SELECT has_table_privilege(:role, 'app.account_deletions', :privilege)"
                    ), {"role": role, "privilege": privilege}) is False
        # Actual denied statements, not only catalog flags. Each failed transaction
        # is rolled back before testing the next role/operation.
        for role in ("anon", "authenticated"):
            for statement in (
                "SELECT subject_hash FROM app.account_deletions LIMIT 1",
                "DELETE FROM app.account_deletions WHERE false",
            ):
                async with admin_engine.connect() as connection:
                    async with connection.begin():
                        await connection.execute(text(f'SET LOCAL ROLE "{role}"'))
                        with pytest.raises(DBAPIError) as error:
                            await connection.execute(text(statement))
                        assert getattr(error.value.orig, "sqlstate", None) == "42501"
    finally:
        await admin_engine.dispose()
