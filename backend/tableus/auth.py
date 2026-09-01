import asyncio
import re
import time
from collections import OrderedDict
from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, Request
from jwt import PyJWKClient, PyJWKClientError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .db import get_session
from .models import InviteRedemption, Profile


@dataclass(frozen=True)
class Identity:
    subject: str
    email: str | None = None


@lru_cache(maxsize=4)
def _jwks_client(jwks_url: str) -> PyJWKClient:
    return PyJWKClient(
        jwks_url,
        cache_keys=False,
        lifespan=300,
        timeout=3,
    )


_UNKNOWN_KID_TTL_SECONDS = 30.0
_UNKNOWN_KID_MAX_ENTRIES = 256
_unknown_kids: OrderedDict[tuple[str, str], float] = OrderedDict()
_last_unknown_refresh: dict[str, float] = {}
_jwks_refresh_locks: dict[str, asyncio.Lock] = {}


def _validated_key_id(token: str) -> str:
    if len(token) > 8192 or len(token.partition(".")[0]) > 2048:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    try:
        header = jwt.get_unverified_header(token)
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired session") from exc
    key_id = header.get("kid")
    if not isinstance(key_id, str) or not re.fullmatch(r"[A-Za-z0-9._:-]{1,128}", key_id):
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return key_id


def _prune_unknown_kids(now: float) -> None:
    for key, expires_at in list(_unknown_kids.items()):
        if expires_at > now:
            continue
        _unknown_kids.pop(key, None)


def _remember_unknown_kid(jwks_url: str, key_id: str, now: float) -> None:
    cache_key = (jwks_url, key_id)
    _unknown_kids.pop(cache_key, None)
    _unknown_kids[cache_key] = now + _UNKNOWN_KID_TTL_SECONDS
    while len(_unknown_kids) > _UNKNOWN_KID_MAX_ENTRIES:
        _unknown_kids.popitem(last=False)


def _cached_signing_key(client: PyJWKClient, key_id: str):
    cache = getattr(client, "jwk_set_cache", None)
    if cache is None:
        return None
    cached_data = cache.get()
    if cached_data is None:
        return None
    if isinstance(cached_data, jwt.PyJWKSet):
        jwk_set = cached_data
    else:
        try:
            jwk_set = jwt.PyJWKSet.from_dict(cached_data)
        except (AttributeError, TypeError, ValueError, jwt.PyJWTError):
            return None
    signing_keys = [
        key
        for key in jwk_set.keys
        if key.public_key_use in {"sig", None} and key.key_id
    ]
    return client.match_kid(signing_keys, key_id)


async def _get_signing_key(jwks_url: str, token: str):
    key_id = _validated_key_id(token)
    now = time.monotonic()
    _prune_unknown_kids(now)
    if _unknown_kids.get((jwks_url, key_id), 0) > now:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    lock = _jwks_refresh_locks.setdefault(jwks_url, asyncio.Lock())
    async with lock:
        now = time.monotonic()
        _prune_unknown_kids(now)
        if _unknown_kids.get((jwks_url, key_id), 0) > now:
            raise HTTPException(status_code=401, detail="Invalid or expired session")
        client = _jwks_client(jwks_url)
        last_unknown = _last_unknown_refresh.get(jwks_url, 0)
        if now - last_unknown < _UNKNOWN_KID_TTL_SECONDS:
            cached_key = _cached_signing_key(client, key_id)
            if cached_key is not None:
                return cached_key
            _remember_unknown_kid(jwks_url, key_id, now)
            raise HTTPException(status_code=401, detail="Invalid or expired session")
        try:
            return await asyncio.wait_for(
                asyncio.to_thread(client.get_signing_key_from_jwt, token),
                timeout=4,
            )
        except (PyJWKClientError, TimeoutError) as exc:
            _last_unknown_refresh[jwks_url] = now
            _remember_unknown_kid(jwks_url, key_id, now)
            raise HTTPException(status_code=401, detail="Invalid or expired session") from exc


async def resolve_identity(
    authorization: str | None = None, x_demo_user_id: str | None = None
) -> Identity:
    settings = get_settings()
    if settings.tableus_auth_mode == "demo" and settings.environment in {"development", "test"}:
        return Identity(subject=x_demo_user_id or "demo-organizer")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.removeprefix("Bearer ").strip()
    if not settings.supabase_url:
        raise HTTPException(status_code=503, detail="Supabase authentication is not configured")

    try:
        jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
        signing_key = await _get_signing_key(jwks_url, token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            audience=settings.supabase_jwt_audience,
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired session") from exc
    return Identity(subject=str(claims["sub"]), email=claims.get("email"))


async def get_identity(
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
    x_demo_user_id: Annotated[str | None, Header()] = None,
) -> Identity:
    cached = getattr(request.state, "identity", None)
    if isinstance(cached, Identity):
        return cached
    identity = await resolve_identity(authorization, x_demo_user_id)
    request.state.identity = identity
    return identity


async def load_approved_profile(identity: Identity, session: AsyncSession) -> Profile:
    profile = await session.get(Profile, identity.subject)
    if not profile:
        raise HTTPException(status_code=403, detail="An approved invite must be redeemed first")
    settings = get_settings()
    if settings.tableus_auth_mode == "supabase":
        redemption = await session.scalar(
            select(InviteRedemption.id).where(InviteRedemption.profile_id == profile.id)
        )
        if not redemption:
            raise HTTPException(status_code=403, detail="An approved invite must be redeemed first")
    return profile


async def get_profile(
    identity: Annotated[Identity, Depends(get_identity)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Profile:
    return await load_approved_profile(identity, session)


CurrentIdentity = Annotated[Identity, Depends(get_identity)]
CurrentProfile = Annotated[Profile, Depends(get_profile)]
DbSession = Annotated[AsyncSession, Depends(get_session)]
