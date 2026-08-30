import asyncio
from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, Request
from jwt import PyJWKClient
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
    return PyJWKClient(jwks_url)


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
        jwks = _jwks_client(
            f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
        )
        signing_key = await asyncio.to_thread(jwks.get_signing_key_from_jwt, token)
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
