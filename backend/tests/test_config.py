import pytest
from pydantic import ValidationError

from tableus.config import Settings


def production_settings(**overrides) -> Settings:
    values = {
        "environment": "production",
        "database_url": "postgresql://runtime:secret@db.example/tableus",
        "migration_database_url": "postgresql://migrator:secret@db.example/tableus",
        "tableus_runtime_db_role": "tableus_runtime",
        "tableus_auth_mode": "supabase",
        "tableus_provider_mode": "live",
        "tableus_demo_mode": False,
        "tableus_app_secret": "a-production-secret-that-is-at-least-32-bytes",
        "supabase_url": "https://example.supabase.co",
        "gemini_api_key": "gemini-test-key",
        "google_maps_api_key": "maps-test-key",
        "allowed_origins": "https://tableus.app",
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


def test_production_uses_separate_async_database_credentials() -> None:
    settings = production_settings()

    assert settings.sqlalchemy_url.startswith("postgresql+asyncpg://runtime:")
    assert settings.migration_sqlalchemy_url.startswith("postgresql+asyncpg://migrator:")
    assert settings.database_schema == "app"


def test_production_rejects_shared_migration_and_runtime_credentials() -> None:
    runtime_url = "postgresql://runtime:secret@db.example/tableus"

    with pytest.raises(ValidationError, match="must differ"):
        production_settings(
            database_url=runtime_url,
            migration_database_url=runtime_url,
        )


def test_runtime_role_rejects_sql_identifier_injection() -> None:
    with pytest.raises(ValidationError, match="simple Postgres identifier"):
        production_settings(tableus_runtime_db_role='runtime"; DROP SCHEMA app; --')


def test_split_provider_modes_override_deprecated_fallback() -> None:
    settings = Settings(
        _env_file=None,
        tableus_provider_mode="live",
        tableus_places_provider_mode="live",
        tableus_ai_provider_mode="deterministic",
    )

    assert settings.places_provider_mode == "live"
    assert settings.ai_provider_mode == "deterministic"
    assert settings.ai_backend == "deterministic"
    assert settings.provider_mode == "mixed"


def test_deprecated_provider_mode_remains_a_fallback() -> None:
    settings = Settings(_env_file=None, tableus_provider_mode="live")

    assert settings.places_provider_mode == "live"
    assert settings.ai_provider_mode == "live"
    assert settings.ai_backend == "agent-platform"
    assert settings.provider_mode == "live"


def test_production_rejects_mixed_provider_modes() -> None:
    with pytest.raises(ValidationError, match="live Places and AI"):
        production_settings(tableus_ai_provider_mode="deterministic")


def test_gemini_model_and_spend_ceilings_are_pinned() -> None:
    settings = Settings(_env_file=None)
    assert settings.gemini_backend == "agent-platform"
    assert settings.gemini_model == "gemini-3.1-flash-lite"
    assert settings.live_ai_max_usd == 0.25
    assert settings.ai_runtime_max_usd_30d == 4.0

    with pytest.raises(ValidationError, match="gemini-3.1-flash-lite"):
        Settings(_env_file=None, gemini_model="gemini-latest")
    with pytest.raises(ValidationError, match="agent-platform"):
        Settings(_env_file=None, gemini_backend="developer-api")
    with pytest.raises(ValidationError):
        Settings(_env_file=None, live_ai_max_usd=0.26)
    with pytest.raises(ValidationError):
        Settings(_env_file=None, ai_runtime_max_usd_30d=4.01)
