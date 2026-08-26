from types import SimpleNamespace

import pytest

from tableus import telemetry


def test_context_accepts_only_random_v4_uuid_and_known_platform() -> None:
    valid = telemetry.parse_telemetry_context("5f6ad44d-42d8-4d11-b5c3-90d137e34b87", "ios")
    invalid = telemetry.parse_telemetry_context("profile-123", "browser")
    assert valid.session_id == "5f6ad44d-42d8-4d11-b5c3-90d137e34b87"
    assert valid.platform == "ios"
    assert invalid.session_id != "profile-123"
    assert invalid.platform == "api"


def test_event_allowlist_rejects_identifiers_and_bounds_counts() -> None:
    token = telemetry.set_telemetry_context(telemetry.parse_telemetry_context(None, "android"))
    try:
        assert telemetry.sanitize_event("plan_created") == {"platform": "android"}
        assert telemetry.sanitize_event("plan_created", {"email": "person@example.test"}) is None
        assert telemetry.sanitize_event("vote_submitted", {"ranking_count": 4}) is None
        assert telemetry.sanitize_event("vote_submitted", {"ranking_count": 3}) == {
            "platform": "android",
            "ranking_count": 3,
        }
    finally:
        telemetry.reset_telemetry_context(token)


def test_sentry_sanitizer_keeps_stack_and_removes_private_values() -> None:
    event = telemetry.sanitize_sentry_event({
        "message": "person@example.test token=secret",
        "user": {"email": "person@example.test"},
        "request": {
            "method": "POST",
            "url": "https://links.table-us.com/join/123e4567-e89b-42d3-a456-426614174000?token=secret",
            "headers": {"authorization": "secret"},
            "data": "private review",
        },
        "exception": {"values": [{"type": "ApiError", "value": "private", "stacktrace": {"frames": [{"filename": "api.py?token=secret", "vars": {"email": "person@example.test"}, "context_line": "private"}]}}]},
        "breadcrumbs": [{"message": "private"}],
        "extra": {"prompt": "private"},
    })
    assert "message" not in event and "user" not in event and "extra" not in event
    assert event["request"] == {"method": "POST", "url": "https://links.table-us.com/join/:redacted"}
    assert event["exception"]["values"][0]["value"] == "[redacted]"
    assert event["exception"]["values"][0]["stacktrace"]["frames"][0]["filename"] == "api.py"
    assert "vars" not in event["exception"]["values"][0]["stacktrace"]["frames"][0]
    assert event["breadcrumbs"] == []


@pytest.mark.asyncio
async def test_capture_is_anonymous_and_has_no_account_or_geoip(monkeypatch) -> None:
    captured = {}

    class Response:
        def raise_for_status(self):
            return None

    class Client:
        def __init__(self, **_kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def post(self, url, json):
            captured.update({"url": url, "json": json})
            return Response()

    monkeypatch.setattr(telemetry, "get_settings", lambda: SimpleNamespace(
        tableus_telemetry_mode="staging",
        posthog_key="phc_public",
        posthog_host="https://us.i.posthog.com",
        build_sha="candidate",
    ))
    monkeypatch.setattr(telemetry.httpx, "AsyncClient", Client)
    context = telemetry.parse_telemetry_context("5f6ad44d-42d8-4d11-b5c3-90d137e34b87", "web")
    token = telemetry.set_telemetry_context(context)
    try:
        await telemetry.capture_event("plan_created")
    finally:
        telemetry.reset_telemetry_context(token)
    assert captured["json"]["distinct_id"] == context.session_id
    assert captured["url"] == "https://us.i.posthog.com/i/v0/e/"
    assert captured["json"]["properties"] == {
        "platform": "web",
        "$process_person_profile": False,
        "$geoip_disable": True,
        "release": "candidate",
    }
    serialized = repr(captured).lower()
    assert "email" not in serialized and "profile_id" not in serialized and "user_id" not in serialized
