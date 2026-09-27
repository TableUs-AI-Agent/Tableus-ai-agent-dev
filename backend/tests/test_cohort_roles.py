"""Quota records are backend-only and cannot be deleted by the runtime role."""

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import create_async_engine

from tableus.config import get_settings
from tableus.db import engine

pytestmark = pytest.mark.skipif(
    engine.url.get_backend_name() != "postgresql", reason="Requires actual PostgreSQL role grants"
)


@pytest.mark.asyncio
async def test_quota_runtime_permissions_prevent_deleting_counters() -> None:
    async with engine.connect() as connection:
        for privilege in ("SELECT", "INSERT", "UPDATE"):
            assert await connection.scalar(text(
                "SELECT has_table_privilege(current_user, 'app.cohort_counters', :privilege)"
            ), {"privilege": privilege}) is True
        for privilege in ("DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"):
            assert await connection.scalar(text(
                "SELECT has_table_privilege(current_user, 'app.cohort_counters', :privilege)"
            ), {"privilege": privilege}) is False
    async with engine.connect() as connection:
        with pytest.raises(DBAPIError) as error:
            await connection.execute(text("DELETE FROM app.cohort_counters WHERE false"))
        assert getattr(error.value.orig, "sqlstate", None) == "42501"


@pytest.mark.asyncio
async def test_quota_table_denies_browser_roles_and_public() -> None:
    admin = create_async_engine(get_settings().migration_sqlalchemy_url)
    try:
        async with admin.connect() as connection:
            assert await connection.scalar(text(
                "SELECT count(*) FROM pg_class c "
                "CROSS JOIN LATERAL aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a "
                "WHERE c.oid='app.cohort_counters'::regclass AND a.grantee=0"
            )) == 0
            for role in ("anon", "authenticated"):
                for privilege in ("SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE"):
                    assert await connection.scalar(text(
                        "SELECT has_table_privilege(:role, 'app.cohort_counters', :privilege)"
                    ), {"role": role, "privilege": privilege}) is False
        for role in ("anon", "authenticated"):
            async with admin.connect() as connection:
                await connection.execute(text(f'SET LOCAL ROLE "{role}"'))
                with pytest.raises(DBAPIError) as error:
                    await connection.execute(text("SELECT * FROM app.cohort_counters LIMIT 1"))
                assert getattr(error.value.orig, "sqlstate", None) == "42501"
    finally:
        await admin.dispose()
