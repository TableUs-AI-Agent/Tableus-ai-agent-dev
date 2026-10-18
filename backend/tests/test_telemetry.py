import json

from tableus import telemetry


def test_error_reports_drop_messages_bodies_and_people() -> None:
    event = {
        "event_id": "abc",
        "level": "error",
        "transaction": "/api/v1/plans/{plan_id}",
        "user": {"email": "ana@example.com"},
        "extra": {"notes": "near Ana's place"},
        "breadcrumbs": {"values": [{"message": "ana@example.com"}]},
        "request": {
            "method": "POST",
            "url": "https://api.example/api/v1/plans/123/join",
            "data": {"share_token": "secret"},
            "headers": {"Authorization": "Bearer secret"},
        },
        "exception": {"values": [{
            "type": "IntegrityError",
            "value": "duplicate key (email)=(ana@example.com)",
            "stacktrace": {"frames": [
                {"filename": "tableus/api.py", "function": "join_plan", "lineno": 9,
                 "vars": {"body": "secret"}},
            ]},
        }]},
    }
    scrubbed = telemetry.scrub_sentry_event(event)
    raw = json.dumps(scrubbed)
    for private in ("ana@example.com", "Ana", "secret", "/123/"):
        assert private not in raw
    assert scrubbed["exception"]["values"][0]["type"] == "IntegrityError"
    assert scrubbed["exception"]["values"][0]["stacktrace"]["frames"][0]["function"] == "join_plan"
    assert scrubbed["transaction"] == "/api/v1/plans/{plan_id}"
    assert scrubbed["request"] == {"method": "POST"}
