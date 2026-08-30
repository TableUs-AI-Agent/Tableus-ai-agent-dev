import pytest
from pydantic import ValidationError

from tableus.config import Settings


def production_settings(**overrides) -> Settings:
    values = {
        "environment": "production",
        "database_url": "postgresql://tableus_runtime:secret@db.example/tableus",
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
        "tableus_telemetry_mode": "production",
        "sentry_dsn": "https://public@example.ingest.sentry.io/1",
        "posthog_key": "phc_test",
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


def test_production_uses_separate_async_database_credentials() -> None:
    settings = production_settings()

    assert settings.sqlalchemy_url.startswith("postgresql+asyncpg://tableus_runtime:")
    assert settings.migration_sqlalchemy_url.startswith("postgresql+asyncpg://migrator:")
    assert settings.database_schema == "app"


def test_production_rejects_shared_migration_and_runtime_credentials() -> None:
    runtime_url = "postgresql://tableus_runtime:secret@db.example/tableus"

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


def test_telemetry_modes_are_fail_closed_by_environment() -> None:
    assert Settings(_env_file=None).tableus_telemetry_mode == "off"
    assert production_settings(
        environment="staging",
        migration_database_url="",
        tableus_provider_mode="deterministic",
        tableus_telemetry_mode="staging",
    ).tableus_telemetry_mode == "staging"
    with pytest.raises(ValidationError, match="Staging telemetry"):
        Settings(_env_file=None, tableus_telemetry_mode="staging")
    with pytest.raises(ValidationError, match="Production telemetry"):
        Settings(_env_file=None, tableus_telemetry_mode="production")


def test_production_requires_telemetry_credentials() -> None:
    with pytest.raises(ValidationError, match="production error reporting"):
        production_settings(posthog_key="")


def test_staging_requires_secure_auth_database_secret_and_origins() -> None:
    baseline = {
        "environment": "staging",
        "database_url": "postgresql://tableus_runtime:secret@db.example/tableus",
        "tableus_runtime_db_role": "tableus_runtime",
        "tableus_auth_mode": "supabase",
        "tableus_demo_mode": False,
        "tableus_app_secret": "a-staging-secret-that-is-at-least-32-bytes",
        "supabase_url": "https://example.supabase.co",
        "allowed_origins": "https://tableus-staging.vercel.app,https://links.table-us.com",
    }
    assert Settings(_env_file=None, **baseline).environment == "staging"

    for override in [
        {"tableus_auth_mode": "demo"},
        {"tableus_demo_mode": True},
        {"tableus_app_secret": "development-only-change-me-at-least-32-bytes"},
        {"database_url": "sqlite+aiosqlite:///staging.db"},
        {"tableus_runtime_db_role": "different_role"},
        {"supabase_url": "http://127.0.0.1:54321"},
        {"supabase_url": "https://10.0.0.4"},
        {"allowed_origins": "http://localhost:3000"},
        {"allowed_origins": "https://192.168.1.20"},
        {"allowed_origins": "https://tableus.example/private"},
    ]:
        with pytest.raises(ValidationError):
            Settings(_env_file=None, **{**baseline, **override})


def test_demo_auth_is_limited_to_development_and_test() -> None:
    with pytest.raises(ValidationError, match="Hosted environments require Supabase auth"):
        Settings(_env_file=None, environment="staging")
