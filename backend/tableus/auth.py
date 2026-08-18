import asyncio
from dataclasses import dataclass
from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException
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


async def get_identity(
    authorization: Annotated[str | None, Header()] = None,
    x_demo_user_id: Annotated[str | None, Header()] = None,
) -> Identity:
    settings = get_settings()
    if settings.tableus_auth_mode == "demo" and settings.environment != "production":
        return Identity(subject=x_demo_user_id or "demo-organizer")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.removeprefix("Bearer ").strip()
    if not settings.supabase_url:
        raise HTTPException(status_code=503, detail="Supabase authentication is not configured")

    try:
        jwks = PyJWKClient(f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json")
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


async def get_profile(
    identity: Annotated[Identity, Depends(get_identity)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Profile:
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


CurrentIdentity = Annotated[Identity, Depends(get_identity)]
CurrentProfile = Annotated[Profile, Depends(get_profile)]
DbSession = Annotated[AsyncSession, Depends(get_session)]
