"""Error reports to Sentry and plan-flow counts to PostHog.

Both are off unless their key is set, and neither ever carries names, emails,
wishes or any other text people typed.
"""

import asyncio
import hashlib
import logging
from typing import Any, Literal

import httpx
import sentry_sdk

from .config import Settings, get_settings

logger = logging.getLogger(__name__)

PlanEvent = Literal["plan_started", "friend_joined", "picks_shown", "vote_cast", "plan_locked"]

_sending: set[asyncio.Task] = set()


def init_sentry(settings: Settings) -> None:
    if not settings.sentry_dsn:
        return
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        release=settings.build_sha or None,
        send_default_pii=False,
        traces_sample_rate=0,
        max_breadcrumbs=0,
        include_local_variables=False,
        max_request_body_size="never",
        before_send=scrub_sentry_event,
    )


def scrub_sentry_event(event: Any, _hint: Any = None) -> Any:
    """Keep only what locates a bug: the error type, the stack and the route.

    Exception messages are dropped because database errors quote the values
    that failed, which can be someone's email or wishes.
    """
    exceptions = []
    for item in (event.get("exception") or {}).get("values") or []:
        frames = (item.get("stacktrace") or {}).get("frames") or []
        exceptions.append({
            "type": item.get("type"),
            "module": item.get("module"),
            "value": "[redacted]",
            "mechanism": item.get("mechanism"),
            "stacktrace": {"frames": [
                {
                    key: frame[key]
                    for key in ("filename", "abs_path", "module", "function", "lineno", "in_app")
                    if key in frame
                }
                for frame in frames
            ]},
        })
    kept = {
        key: event[key]
        for key in (
            "event_id", "timestamp", "platform", "level", "logger", "release",
            "environment", "transaction", "sdk",
        )
        if key in event
    }
    if exceptions:
        kept["exception"] = {"values": exceptions}
    if "request" in event:
        kept["request"] = {"method": event["request"].get("method")}
    return kept


def track(event: PlanEvent, plan_id: str, **counts: int) -> None:
    """Count one step of a plan. Each plan is one anonymous PostHog person, so a
    funnel across these events shows where plans stall."""
    settings = get_settings()
    if not settings.posthog_project_key:
        return
    _dispatch(settings.posthog_host, {
        "api_key": settings.posthog_project_key,
        "event": event,
        "distinct_id": "plan_" + hashlib.sha256(plan_id.encode()).hexdigest()[:20],
        "properties": {
            **counts,
            "environment": settings.environment,
            "$process_person_profile": False,
            "$geoip_disable": True,
        },
    })


def _dispatch(host: str, payload: dict[str, Any]) -> None:
    task = asyncio.get_running_loop().create_task(_send(host, payload))
    _sending.add(task)
    task.add_done_callback(_sending.discard)


async def _send(host: str, payload: dict[str, Any]) -> None:
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.post(f"{host.rstrip('/')}/i/v0/e/", json=payload)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        logger.warning("PostHog rejected %s: %s", payload["event"], type(exc).__name__)
