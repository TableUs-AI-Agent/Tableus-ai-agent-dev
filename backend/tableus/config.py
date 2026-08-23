import re
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: Literal["development", "test", "staging", "production"] = "development"
    database_url: str = f"sqlite+aiosqlite:///{BACKEND_ROOT / 'tableus-dev.db'}"
    migration_database_url: str = ""
    tableus_runtime_db_role: str = ""
    tableus_auth_mode: Literal["demo", "supabase"] = "demo"
    tableus_provider_mode: Literal["deterministic", "live"] = "deterministic"
    tableus_demo_invite: str = "tableus-beta"
    tableus_app_secret: str = "development-only-change-me-at-least-32-bytes"
    tableus_demo_mode: bool = True
    tableus_shared_plans_enabled: bool = True
    allowed_origins: str = "http://localhost:3000,http://localhost:8081"

    supabase_url: str = ""
    supabase_jwt_audience: str = "authenticated"
    gemini_api_key: str = ""
    google_maps_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash-lite"
    sentry_dsn: str = ""
    posthog_key: str = ""
    posthog_host: str = "https://us.i.posthog.com"

    live_ai_max_usd: float = Field(default=1.0, gt=0, le=25)

    @field_validator("tableus_runtime_db_role")
    @classmethod
    def runtime_role_is_a_postgres_identifier(cls, value: str) -> str:
        if value and not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", value):
            raise ValueError("TABLEUS_RUNTIME_DB_ROLE must be a simple Postgres identifier")
        return value

    @model_validator(mode="after")
    def production_is_fail_closed(self):
        if self.environment != "production":
            return self
        if self.tableus_demo_mode or self.tableus_auth_mode != "supabase":
            raise ValueError("Production requires Supabase auth with demo mode disabled")
        if self.tableus_provider_mode != "live":
            raise ValueError("Production requires explicitly configured live providers")
        if not all(
            [
                self.supabase_url,
                self.gemini_api_key,
                self.google_maps_api_key,
                self.tableus_app_secret != "development-only-change-me-at-least-32-bytes",
                self.migration_database_url,
                self.tableus_runtime_db_role,
            ]
        ):
            raise ValueError("Production credentials are incomplete")
        if self.migration_database_url == self.database_url:
            raise ValueError("Production migration and runtime database credentials must differ")
        if any("localhost" in origin for origin in self.cors_origins):
            raise ValueError("Production CORS origins cannot include localhost")
        return self

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

    @property
    def sqlalchemy_url(self) -> str:
        return self._async_sqlalchemy_url(self.database_url)

    @property
    def migration_sqlalchemy_url(self) -> str:
        return self._async_sqlalchemy_url(self.migration_database_url or self.database_url)

    @staticmethod
    def _async_sqlalchemy_url(value: str) -> str:
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @property
    def database_schema(self) -> str | None:
        return "app" if self.sqlalchemy_url.startswith("postgresql+") else None


@lru_cache
def get_settings() -> Settings:
    return Settings()
