"""Phone notifications for the moments a plan needs the group: picks are ready, and
the plan is locked in. Sent through Expo's push service, which needs no key of ours."""

import logging

import httpx
from sqlalchemy import delete, select

from .config import get_settings
from .db import SessionFactory
from .models import PlanParticipant, PushToken

log = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def notify_plan(plan_id: str, actor_id: str, title: str, body: str) -> None:
    """Tell everyone in the plan except the person who caused the change.

    Runs after the response is sent, so it opens its own session and never raises.
    """
    try:
        async with SessionFactory() as session:
            tokens = (
                await session.scalars(
                    select(PushToken.token)
                    .join(PlanParticipant, PlanParticipant.profile_id == PushToken.profile_id)
                    .where(PlanParticipant.plan_id == plan_id, PushToken.profile_id != actor_id)
                )
            ).all()
            if not tokens:
                return
            messages = [
                {"to": token, "title": title, "body": body, "sound": "default",
                 "data": {"planId": plan_id}}
                for token in tokens
            ]
            gone = await deliver(messages)
            if gone:
                await session.execute(delete(PushToken).where(PushToken.token.in_(gone)))
                await session.commit()
    except Exception:
        log.exception("Couldn't send plan notifications")


async def deliver(messages: list[dict]) -> list[str]:
    """Send to Expo and return the tokens it says no longer reach a device."""
    if get_settings().environment not in {"staging", "production"}:
        return []
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(EXPO_PUSH_URL, json=messages)
    response.raise_for_status()
    tickets = response.json().get("data", [])
    return [
        message["to"]
        for message, ticket in zip(messages, tickets, strict=False)
        if ticket.get("details", {}).get("error") == "DeviceNotRegistered"
    ]
