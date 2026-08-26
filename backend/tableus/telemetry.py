"""Privacy-safe, anonymous telemetry primitives."""

from __future__ import annotations

import logging
import re
import uuid
from contextvars import ContextVar, Token
from dataclasses import dataclass
from typing import Any, Literal, cast
from urllib.parse import urlsplit, urlunsplit

import httpx
import sentry_sdk
from sentry_sdk.types import Event, Hint

from .config import get_settings

TelemetryPlatform = Literal["web", "ios", "android", "api"]


@dataclass(frozen=True)
class TelemetryContext:
    session_id: str
    platform: TelemetryPlatform


_context: ContextVar[TelemetryContext | None] = ContextVar("tableus_telemetry", default=None)
_platforms = {"web", "ios", "android", "api"}
_operations = {
    "create_plan", "join_plan", "save_constraints", "generate_recommendations",
    "submit_vote", "finalize_plan", "reopen_plan", "rotate_share_token",
    "create_connection", "create_review", "regenerate_taste",
    "change_taste_sharing", "account_export", "account_delete",
}
_events: dict[str, dict[str, Any]] = {
    "app_opened": {},
    "auth_approved": {"mode": {"signup", "sign_in"}},
    "plan_created": {},
    "plan_joined": {},
    "constraints_saved": {},
    "recommendations_generated": {"candidate_count": (0, 4), "provider": {"deterministic", "gemini"}},
    "vote_submitted": {"ranking_count": (0, 3)},
    "plan_finalized": {"vote_count": (0, 8)},
    "plan_reopened": {},
    "mutation_retry_presented": {"operation": _operations, "failure_class": {"offline", "network", "timeout", "rate_limited", "server"}},
    "mutation_retry_succeeded": {"operation": _operations},
    "telemetry_e2e": {"component": {"web", "mobile", "api"}},
}


def parse_telemetry_context(session_id: str | None, platform: str | None) -> TelemetryContext:
    try:
        parsed = uuid.UUID(session_id or "")
        valid_session = parsed.version == 4
    except (ValueError, AttributeError):
        parsed = None
        valid_session = False
    safe_platform: TelemetryPlatform = platform if platform in _platforms else "api"  # type: ignore[assignment]
    return TelemetryContext(
        session_id=str(parsed) if valid_session and parsed is not None else str(uuid.uuid4()),
        platform=safe_platform,
    )


def set_telemetry_context(context: TelemetryContext) -> Token:
    return _context.set(context)


def reset_telemetry_context(token: Token) -> None:
    _context.reset(token)


def sanitize_event(event: str, properties: dict[str, Any] | None = None) -> dict[str, Any] | None:
    schema = _events.get(event)
    context = _context.get() or parse_telemetry_context(None, None)
    supplied = dict(properties or {})
    supplied.setdefault("platform", context.platform)
    if schema is None or set(supplied) != ({"platform"} | set(schema)):
        return None
    if supplied["platform"] not in _platforms:
        return None
    safe: dict[str, Any] = {"platform": supplied["platform"]}
    for key, rule in schema.items():
        value = supplied[key]
        if isinstance(rule, tuple):
            if isinstance(value, bool) or not isinstance(value, int) or not rule[0] <= value <= rule[1]:
                return None
        elif value not in rule:
            return None
        safe[key] = value
    return safe


async def capture_event(event: str, properties: dict[str, Any] | None = None) -> None:
    settings = get_settings()
    safe_properties = sanitize_event(event, properties)
    context = _context.get() or parse_telemetry_context(None, None)
    if settings.tableus_telemetry_mode == "off" or not settings.posthog_key or safe_properties is None:
        return
    payload = {
        "api_key": settings.posthog_key,
        "event": event,
        "distinct_id": context.session_id,
        "properties": {
            **safe_properties,
            "$process_person_profile": False,
            "$geoip_disable": True,
            "release": settings.build_sha or "unknown",
        },
    }
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            response = await client.post(f"{settings.posthog_host.rstrip('/')}/i/v0/e/", json=payload)
            response.raise_for_status()
    except httpx.HTTPError:
        logging.getLogger("tableus.telemetry").warning(
            "telemetry_capture_failed", extra={"telemetry_event": event}
        )


def _safe_url(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = urlsplit(value)
    except ValueError:
        return None
    path = "/".join(
        ":redacted" if len(segment) >= 24 or re.fullmatch(r"[0-9a-f-]{32,}", segment, re.I) else segment
        for segment in parsed.path.split("/")
    )
    return urlunsplit((parsed.scheme, parsed.netloc, path, "", ""))


def sanitize_sentry_event(event: Event, hint: Hint | None = None) -> Event:
    del hint
    source: dict[str, Any] = dict(event)
    safe: dict[str, Any] = {
        key: source[key]
        for key in ("event_id", "timestamp", "platform", "level", "logger", "release", "environment")
        if key in source
    }
    values = source.get("exception", {}).get("values", [])
    if isinstance(values, list):
        safe["exception"] = {
            "values": [
                {
                    "type": str(item.get("type") or "Error")[:120],
                    "value": "[redacted]",
                    "mechanism": {
                        key: item.get("mechanism", {}).get(key)
                        for key in ("type", "handled")
                        if key in item.get("mechanism", {})
                    },
                    "stacktrace": {
                        "frames": [
                            {
                                "filename": _safe_url(frame.get("filename")),
                                "function": str(frame["function"])[:160]
                                if "function" in frame
                                else None,
                                "module": str(frame["module"])[:160]
                                if "module" in frame
                                else None,
                                "lineno": frame.get("lineno")
                                if isinstance(frame.get("lineno"), int)
                                else None,
                                "colno": frame.get("colno")
                                if isinstance(frame.get("colno"), int)
                                else None,
                                "in_app": frame.get("in_app")
                                if isinstance(frame.get("in_app"), bool)
                                else None,
                            }
                            for frame in item.get("stacktrace", {}).get("frames", [])
                            if isinstance(frame, dict)
                        ]
                    }
                    if isinstance(item.get("stacktrace"), dict)
                    else None,
                }
                for item in values
                if isinstance(item, dict)
            ]
        }
    request = source.get("request")
    if isinstance(request, dict):
        safe["request"] = {"method": request.get("method"), "url": _safe_url(request.get("url"))}
    transaction = _safe_url(source.get("transaction"))
    if transaction:
        safe["transaction"] = transaction
    tags = source.get("tags")
    if isinstance(tags, dict):
        safe_tags = {
            key: value
            for key in ("component", "operation", "request_id")
            if isinstance((value := tags.get(key)), str)
            and len(value) <= 80
            and re.fullmatch(r"[A-Za-z0-9_.:-]+", value)
        }
        if safe_tags:
            safe["tags"] = safe_tags
    safe["breadcrumbs"] = []
    return cast(Event, safe)


def configure_sentry() -> None:
    settings = get_settings()
    if settings.tableus_telemetry_mode == "off" or not settings.sentry_dsn:
        return
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        release=settings.build_sha or None,
        send_default_pii=False,
        traces_sample_rate=0.0,
        profiles_sample_rate=0.0,
        max_breadcrumbs=0,
        before_send=sanitize_sentry_event,
    )
