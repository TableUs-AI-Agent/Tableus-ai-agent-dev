import pytest
from pydantic import ValidationError

from tableus.config import Settings


def hosted(**overrides) -> Settings:
    values = {
        "environment": "staging",
        "database_url": "postgresql://tableus_runtime:secret@db.example/tableus",
        "tableus_auth_mode": "supabase",
        "supabase_url": "https://example.supabase.co",
        "allowed_origins": "https://tableus.app",
    }
    return Settings(_env_file=None, **{**values, **overrides})


def test_hosted_settings_use_async_postgres_in_the_app_schema() -> None:
    settings = hosted()
    assert settings.sqlalchemy_url.startswith("postgresql+asyncpg://")
    assert settings.database_schema == "app"
    assert not settings.demo_auth


@pytest.mark.parametrize(
    "overrides",
    [
        {"tableus_auth_mode": "demo"},
        {"supabase_url": ""},
        {"database_url": "sqlite+aiosqlite:///x.db"},
        {"allowed_origins": "http://tableus.app"},
    ],
)
def test_hosted_settings_refuse_unsafe_configuration(overrides) -> None:
    with pytest.raises(ValidationError):
        hosted(**overrides)


def test_plan_creator_allowlist_is_normalized() -> None:
    settings = hosted(tableus_plan_creator_emails=" Brian@Example.com, ,friend@example.com")
    assert settings.plan_creator_emails == {"brian@example.com", "friend@example.com"}


def test_split_provider_modes_override_the_shared_mode() -> None:
    settings = Settings(_env_file=None, tableus_provider_mode="live",
                        tableus_ai_provider_mode="deterministic")
    assert settings.places_provider_mode == "live"
    assert settings.ai_provider_mode == "deterministic"
