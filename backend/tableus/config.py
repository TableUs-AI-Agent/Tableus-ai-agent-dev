from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import urlparse

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    environment: Literal["development", "test", "staging", "production"] = "development"
    database_url: str = f"sqlite+aiosqlite:///{BACKEND_ROOT / 'tableus-local.db'}"
    # Migrations may use a more privileged role than the running API.
    migration_database_url: str = ""
    tableus_runtime_db_role: str = ""
    allowed_origins: str = "http://localhost:3000,http://localhost:8081"

    # "demo" trusts an X-Demo-User-ID header and only works locally.
    tableus_auth_mode: Literal["demo", "supabase"] = "demo"
    supabase_url: str = ""
    supabase_jwt_audience: str = "authenticated"
    supabase_service_role_key: SecretStr = Field(default=SecretStr(""), repr=False)
    # Comma-separated emails allowed to start plans. Empty means anyone signed in.
    tableus_plan_creator_emails: str = Field(default="", repr=False)

    tableus_provider_mode: Literal["deterministic", "live"] = "deterministic"
    tableus_places_provider_mode: Literal["deterministic", "live"] | None = None
    tableus_ai_provider_mode: Literal["deterministic", "live"] | None = None
    google_maps_api_key: str = Field(default="", repr=False)
    gemini_api_key: str = Field(default="", repr=False)
    gemini_model: Literal["gemini-3.1-flash-lite"] = "gemini-3.1-flash-lite"
    # Per-person ceilings on paid provider work, per rolling hour.
    recommendations_per_hour: int = Field(default=10, gt=0)
    location_lookups_per_hour: int = Field(default=30, gt=0)
    # Plan views and votes that refresh Google place details.
    plan_reads_per_hour: int = Field(default=150, gt=0)

    sentry_dsn: str = ""
    tableus_build_sha: str = ""
    railway_git_commit_sha: str = ""

    @model_validator(mode="after")
    def hosted_environments_require_real_auth(self):
        if self.environment not in {"staging", "production"}:
            return self
        if self.tableus_auth_mode != "supabase" or not self.supabase_url:
            raise ValueError("Hosted environments require Supabase auth")
        if not self.sqlalchemy_url.startswith("postgresql+"):
            raise ValueError("Hosted environments require PostgreSQL")
        for origin in [self.supabase_url, *self.cors_origins]:
            parsed = urlparse(origin)
            if parsed.scheme != "https" or parsed.path not in {"", "/"}:
                raise ValueError(f"Hosted origins must be HTTPS origins: {origin}")
        return self

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

    @property
    def plan_creator_emails(self) -> set[str]:
        return {
            item.strip().lower()
            for item in self.tableus_plan_creator_emails.split(",")
            if item.strip()
        }

    @property
    def places_provider_mode(self) -> Literal["deterministic", "live"]:
        return self.tableus_places_provider_mode or self.tableus_provider_mode

    @property
    def ai_provider_mode(self) -> Literal["deterministic", "live"]:
        return self.tableus_ai_provider_mode or self.tableus_provider_mode

    @property
    def demo_auth(self) -> bool:
        return self.tableus_auth_mode == "demo" and self.environment in {"development", "test"}

    @property
    def build_sha(self) -> str:
        return self.tableus_build_sha or self.railway_git_commit_sha

    @property
    def sqlalchemy_url(self) -> str:
        return _async_url(self.database_url)

    @property
    def migration_sqlalchemy_url(self) -> str:
        return _async_url(self.migration_database_url or self.database_url)

    @property
    def database_schema(self) -> str | None:
        return "app" if self.sqlalchemy_url.startswith("postgresql+") else None


def _async_url(value: str) -> str:
    if value.startswith("postgresql://"):
        return value.replace("postgresql://", "postgresql+asyncpg://", 1)
    return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
