"""Server-only Auth removal. No automatic HTTP retries or provider error logging."""

import asyncio
import json
from typing import Literal
from uuid import UUID

import httpx

from .config import get_settings


class AuthRemovalError(Exception):
    def __init__(self, code: Literal["unavailable", "retryable", "rejected"]) -> None:
        self.code = code
        super().__init__(code)


def full_deletion_available() -> bool:
    settings = get_settings()
    if not settings.tableus_account_deletion_enabled:
        return False
    if settings.tableus_auth_mode == "demo":
        return settings.environment in {"development", "test"}
    if not settings.supabase_service_role_key.get_secret_value():
        return False
    try:
        settings._validate_hosted_url(settings.supabase_url, "SUPABASE_URL", origin_only=True)
    except ValueError:
        return False
    return True


async def remove_auth_identity(subject: str) -> None:
    """One bounded hard-delete attempt; a confirmed missing user is success.

    Durable request ownership, retries and stale-token blocking belong to the
    account lifecycle service. The deterministic demo path never uses HTTP.
    """
    if not full_deletion_available():
        raise AuthRemovalError("unavailable")
    settings = get_settings()
    if settings.tableus_auth_mode == "demo":
        return
    try:
        user_id = str(UUID(subject))
    except ValueError:
        raise AuthRemovalError("rejected") from None
    key = settings.supabase_service_role_key.get_secret_value()
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users/{user_id}"
    try:
        async with asyncio.timeout(12), httpx.AsyncClient(
            timeout=httpx.Timeout(5), follow_redirects=False, trust_env=False
        ) as client:
            async with client.stream(
                "DELETE",
                url,
                headers={"apikey": key, "Authorization": f"Bearer {key}"},
                json={"should_soft_delete": False},
            ) as response:
                status = response.status_code
                if status == 429 or status >= 500:
                    raise AuthRemovalError("retryable")
                if status not in {200, 404}:
                    raise AuthRemovalError("rejected")
                body = bytearray()
                async for chunk in response.aiter_bytes():
                    body.extend(chunk)
                    if len(body) > 64 * 1024:
                        raise AuthRemovalError("retryable")
                try:
                    result = json.loads(body)
                except (ValueError, UnicodeError):
                    raise AuthRemovalError("retryable") from None
                if not isinstance(result, dict):
                    raise AuthRemovalError("retryable")
                if status == 404:
                    if result.get("code", result.get("error_code")) == "user_not_found":
                        return
                    raise AuthRemovalError("rejected")
                # GoTrue returns {} after its deletion transaction. Older
                # versions may return the deleted user; bind that to our target.
                if result != {} and result.get("id") != user_id:
                    raise AuthRemovalError("retryable")
    except (httpx.HTTPError, TimeoutError):
        raise AuthRemovalError("retryable") from None
