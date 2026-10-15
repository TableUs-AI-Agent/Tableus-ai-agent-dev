"""Who is calling: Supabase access tokens in hosted environments, a header locally."""

import asyncio
from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException
from jwt import PyJWKClient, PyJWKClientError
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .db import get_session
from .models import Profile


@dataclass(frozen=True)
class Identity:
    subject: str
    email: str | None = None


@lru_cache(maxsize=4)
def _jwks_client(jwks_url: str) -> PyJWKClient:
    # Keys are cached for five minutes so rotated keys are picked up quickly.
    return PyJWKClient(jwks_url, cache_keys=False, lifespan=300, timeout=3)


async def resolve_identity(authorization: str | None, demo_user_id: str | None) -> Identity:
    settings = get_settings()
    if settings.demo_auth:
        subject = demo_user_id or "demo-organizer"
        return Identity(subject=subject, email=f"{subject}@tableus.local")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Sign in to continue")
    token = authorization.removeprefix("Bearer ").strip()
    if len(token) > 8192:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    try:
        signing_key = await asyncio.wait_for(
            asyncio.to_thread(_jwks_client(jwks_url).get_signing_key_from_jwt, token), timeout=4
        )
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            audience=settings.supabase_jwt_audience,
        )
    except (jwt.PyJWTError, PyJWKClientError, TimeoutError) as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired session") from exc
    email = claims.get("email")
    return Identity(subject=str(claims["sub"]), email=str(email).lower() if email else None)


async def get_identity(
    authorization: Annotated[str | None, Header()] = None,
    x_demo_user_id: Annotated[str | None, Header()] = None,
) -> Identity:
    return await resolve_identity(authorization, x_demo_user_id)


async def get_profile(
    identity: Annotated[Identity, Depends(get_identity)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Profile:
    profile = await session.get(Profile, identity.subject)
    if not profile:
        raise HTTPException(status_code=404, detail="Finish setting up your profile")
    return profile


def can_create_plans(identity: Identity) -> bool:
    allowed = get_settings().plan_creator_emails
    return not allowed or (identity.email or "") in allowed


CurrentIdentity = Annotated[Identity, Depends(get_identity)]
CurrentProfile = Annotated[Profile, Depends(get_profile)]
DbSession = Annotated[AsyncSession, Depends(get_session)]
