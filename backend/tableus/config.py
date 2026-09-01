import re
from functools import lru_cache
from ipaddress import ip_address
from pathlib import Path
from typing import Literal
from urllib.parse import unquote, urlparse

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
    tableus_places_provider_mode: Literal["deterministic", "live"] | None = None
    tableus_ai_provider_mode: Literal["deterministic", "live"] | None = None
    tableus_demo_invite: str = "tableus-beta"
    tableus_app_secret: str = "development-only-change-me-at-least-32-bytes"
    tableus_demo_mode: bool = True
    tableus_shared_plans_enabled: bool = True
    tableus_build_sha: str = ""
    railway_git_commit_sha: str = ""
    allowed_origins: str = "http://localhost:3000,http://localhost:8081"

    supabase_url: str = ""
    supabase_jwt_audience: str = "authenticated"
    gemini_api_key: str = ""
    google_maps_api_key: str = ""
    gemini_backend: Literal["agent-platform"] = "agent-platform"
    gemini_model: Literal["gemini-3.1-flash-lite"] = "gemini-3.1-flash-lite"
    sentry_dsn: str = ""
    posthog_key: str = ""
    posthog_host: str = "https://us.i.posthog.com"
    tableus_telemetry_mode: Literal["off", "staging", "production"] = "off"
    tableus_telemetry_e2e: bool = False

    live_ai_max_usd: float = Field(default=0.25, gt=0, le=0.25)
    ai_runtime_max_usd_30d: float = Field(default=4.0, gt=0, le=4.0)
    places_runtime_max_attempts_30d: int = Field(default=150, gt=0, le=150)

    @field_validator("tableus_runtime_db_role")
    @classmethod
    def runtime_role_is_a_postgres_identifier(cls, value: str) -> str:
        if value and not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", value):
            raise ValueError("TABLEUS_RUNTIME_DB_ROLE must be a simple Postgres identifier")
        return value

    @model_validator(mode="after")
    def hosted_environments_are_fail_closed(self):
        if self.environment not in {"staging", "production"}:
            return self
        if self.tableus_demo_mode or self.tableus_auth_mode != "supabase":
            raise ValueError("Hosted environments require Supabase auth with demo mode disabled")
        if not all(
            [
                self.supabase_url,
                len(self.tableus_app_secret) >= 32,
                self.tableus_app_secret != "development-only-change-me-at-least-32-bytes",
                self.tableus_runtime_db_role,
            ]
        ):
            raise ValueError("Hosted authentication and runtime credentials are incomplete")
        if not self.sqlalchemy_url.startswith("postgresql+"):
            raise ValueError("Hosted environments require PostgreSQL runtime credentials")
        runtime_url = urlparse(self.database_url)
        runtime_user = unquote(runtime_url.username or "")
        if not self._runtime_database_identity_is_allowed(runtime_url, runtime_user):
            raise ValueError("Hosted runtime database credentials must use TABLEUS_RUNTIME_DB_ROLE")
        if self.migration_database_url:
            migration_user = urlparse(self.migration_database_url).username
            if self.migration_database_url == self.database_url or migration_user == runtime_user:
                raise ValueError(
                    "Hosted migration and runtime database credentials must use different roles"
                )
        self._validate_hosted_url(self.supabase_url, "SUPABASE_URL", origin_only=True)
        if not self.cors_origins:
            raise ValueError("Hosted environments require at least one HTTPS CORS origin")
        for origin in self.cors_origins:
            self._validate_hosted_url(origin, "ALLOWED_ORIGINS", origin_only=True)
        if self.environment != "production":
            return self
        if self.places_provider_mode != "live" or self.ai_provider_mode != "live":
            raise ValueError("Production requires explicitly configured live Places and AI providers")
        if not all(
            [
                self.gemini_api_key,
                self.google_maps_api_key,
            ]
        ):
            raise ValueError("Production provider credentials are incomplete")
        if self.tableus_telemetry_mode != "production" or not self.sentry_dsn or not self.posthog_key:
            raise ValueError("Production requires production error reporting and anonymous analytics")
        return self

    def _runtime_database_identity_is_allowed(self, runtime_url, runtime_user: str) -> bool:
        if runtime_user == self.tableus_runtime_db_role:
            return True

        supabase_host = (urlparse(self.supabase_url).hostname or "").lower()
        project_ref = supabase_host.removesuffix(".supabase.co")
        pooler_host = (runtime_url.hostname or "").lower()
        return bool(
            re.fullmatch(r"[a-z0-9]{20}", project_ref)
            and re.fullmatch(r"[a-z0-9-]+\.pooler\.supabase\.com", pooler_host)
            and runtime_url.port == 5432
            and runtime_user == f"{self.tableus_runtime_db_role}.{project_ref}"
        )

    @staticmethod
    def _validate_hosted_url(value: str, label: str, *, origin_only: bool = False) -> None:
        parsed = urlparse(value)
        if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError(f"{label} must use a public HTTPS URL")
        if origin_only and (parsed.path not in {"", "/"} or parsed.query or parsed.fragment):
            raise ValueError(f"{label} entries must be origins without paths, queries, or fragments")
        hostname = parsed.hostname.lower()
        if "*" in hostname:
            raise ValueError(f"{label} cannot use a wildcard host")
        if hostname == "localhost" or hostname.endswith(".localhost"):
            raise ValueError(f"{label} cannot use a loopback host")
        try:
            parsed_ip = ip_address(hostname)
        except ValueError:
            parsed_ip = None
        if parsed_ip and not parsed_ip.is_global:
            raise ValueError(f"{label} must use a public host")

    @model_validator(mode="after")
    def telemetry_environment_matches(self):
        if self.tableus_telemetry_mode == "staging" and self.environment != "staging":
            raise ValueError("Staging telemetry is allowed only in the staging environment")
        if self.tableus_telemetry_mode == "production" and self.environment != "production":
            raise ValueError("Production telemetry is allowed only in the production environment")
        if self.tableus_telemetry_e2e and self.tableus_telemetry_mode != "staging":
            raise ValueError("Telemetry E2E controls require staging telemetry")
        return self

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

    @property
    def places_provider_mode(self) -> Literal["deterministic", "live"]:
        return self.tableus_places_provider_mode or self.tableus_provider_mode

    @property
    def ai_provider_mode(self) -> Literal["deterministic", "live"]:
        return self.tableus_ai_provider_mode or self.tableus_provider_mode

    @property
    def provider_mode(self) -> Literal["deterministic", "live", "mixed"]:
        if self.places_provider_mode == self.ai_provider_mode:
            return self.places_provider_mode
        return "mixed"

    @property
    def ai_backend(self) -> Literal["deterministic", "agent-platform"]:
        if self.ai_provider_mode == "deterministic":
            return "deterministic"
        return self.gemini_backend

    @property
    def build_sha(self) -> str:
        return self.tableus_build_sha or self.railway_git_commit_sha

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
