import logging

import httpx

from .config import get_settings
from .security import hash_value

ALLOWED_EVENTS = {
    "plan_created": {"platform"},
    "recommendations_generated": {"candidate_count", "provider"},
    "vote_submitted": set(),
    "plan_finalized": {"vote_count"},
}


async def capture_event(event: str, user_id: str, properties: dict | None = None) -> None:
    settings = get_settings()
    allowed = ALLOWED_EVENTS.get(event)
    if not settings.posthog_key or allowed is None:
        return
    safe_properties = {key: value for key, value in (properties or {}).items() if key in allowed}
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            await client.post(
                f"{settings.posthog_host.rstrip('/')}/capture/",
                json={
                    "api_key": settings.posthog_key,
                    "event": event,
                    "distinct_id": hash_value(user_id),
                    "properties": safe_properties,
                },
            )
    except httpx.HTTPError:
        logging.getLogger("tableus.telemetry").warning(
            "PostHog capture failed", extra={"event": event}
        )
