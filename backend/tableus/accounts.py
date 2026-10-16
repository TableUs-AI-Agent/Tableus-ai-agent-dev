"""Account deletion: the profile, its content and the Supabase sign-in."""

from datetime import UTC, datetime
from uuid import UUID

import httpx
from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .models import Plan, PlanParticipant, Profile


async def mark_member_plans_changed(session: AsyncSession, profile: Profile) -> None:
    """Bump every plan this person is in, so other members' polling notices they left."""
    member_plans = select(PlanParticipant.plan_id).where(PlanParticipant.profile_id == profile.id)
    await session.execute(
        update(Plan).where(Plan.id.in_(member_plans)).values(updated_at=datetime.now(UTC))
    )


async def confirm_sign_in_exists(token: str | None) -> None:
    """A deleted account's access token stays valid until it expires; don't let it
    recreate a profile. Supabase answers /user only for users that still exist."""
    settings = get_settings()
    if settings.demo_auth:
        return
    key = settings.supabase_service_role_key.get_secret_value()
    if not token or not key:
        raise HTTPException(status_code=503, detail="Sign-up is not available yet")
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=False) as client:
            response = await client.get(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
                headers={"apikey": key, "Authorization": f"Bearer {token}"},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Couldn't confirm your sign-in. Try again.") from exc
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Sign in again to continue")


async def hand_off_organized_plans(session: AsyncSession, profile: Profile) -> None:
    """Give each shared plan this person organizes to the next person who joined it.

    Plans with no one else in them are deleted with the profile.
    """
    plans = (
        await session.scalars(
            select(Plan).where(Plan.organizer_id == profile.id).with_for_update()
        )
    ).all()
    for plan in plans:
        successor = await session.scalar(
            select(PlanParticipant.profile_id)
            .where(PlanParticipant.plan_id == plan.id, PlanParticipant.profile_id != profile.id)
            .order_by(PlanParticipant.joined_at)
            .limit(1)
        )
        if successor:
            plan.organizer_id = successor


async def remove_sign_in(subject: str) -> None:
    """Delete the Supabase Auth user. A user that is already gone counts as success."""
    settings = get_settings()
    if settings.demo_auth:
        return
    key = settings.supabase_service_role_key.get_secret_value()
    if not key:
        raise HTTPException(status_code=503, detail="Account deletion is not available yet")
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users/{UUID(subject)}"
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=False) as client:
            response = await client.delete(
                url, headers={"apikey": key, "Authorization": f"Bearer {key}"}
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Couldn't delete your account. Try again.") from exc
    if response.status_code not in {200, 204, 404}:
        raise HTTPException(status_code=503, detail="Couldn't delete your account. Try again.")
