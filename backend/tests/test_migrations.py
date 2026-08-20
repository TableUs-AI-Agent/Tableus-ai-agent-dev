import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from tableus.config import get_settings


@pytest.mark.asyncio
async def test_auth_invite_hook_uses_builtin_sha256() -> None:
    settings = get_settings()
    if not settings.sqlalchemy_url.startswith("postgresql+"):
        pytest.skip("Postgres migration assertion")

    engine = create_async_engine(settings.sqlalchemy_url)
    try:
        async with engine.connect() as connection:
            definition = await connection.scalar(
                text(
                    "select pg_get_functiondef("
                    "'app.hook_restrict_signup_to_validated_invite(jsonb)'::regprocedure"
                    ")"
                )
            )
    finally:
        await engine.dispose()

    assert definition is not None
    assert "pg_catalog.sha256" in definition
    assert "extensions.digest" not in definition
