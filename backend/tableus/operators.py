"""Server-controlled authorization for private beta operator endpoints."""

from typing import Annotated

from fastapi import Depends, HTTPException

from .auth import CurrentIdentity, DbSession, load_approved_profile
from .config import get_settings
from .models import Profile


async def get_operator(identity: CurrentIdentity, session: DbSession) -> Profile:
    """Require an approved profile whose trusted subject is explicitly allowlisted."""
    profile = await load_approved_profile(identity, session)
    subjects = {
        value.strip()
        for value in get_settings().tableus_operator_subjects.split(",")
        if value.strip()
    }
    if identity.subject not in subjects:
        raise HTTPException(status_code=403, detail="Operator access required")
    return profile


CurrentOperator = Annotated[Profile, Depends(get_operator)]
