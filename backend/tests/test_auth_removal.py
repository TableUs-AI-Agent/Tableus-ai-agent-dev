import json

import httpx
import pytest
from pydantic import SecretStr

from tableus import auth_removal
from tableus.config import get_settings

SUBJECT = "3568e2ea-4b58-4589-a48a-36daecb2076c"


@pytest.fixture
def configured(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "tableus_account_deletion_enabled", True)
    monkeypatch.setattr(settings, "tableus_auth_mode", "supabase")
    monkeypatch.setattr(settings, "supabase_url", "https://example.supabase.co")
    monkeypatch.setattr(settings, "supabase_service_role_key", SecretStr("test-server-key"))
    return settings


def mock_http(monkeypatch, handler):
    client_type = httpx.AsyncClient

    def create_client(**kwargs):
        assert kwargs["follow_redirects"] is False
        assert kwargs["trust_env"] is False
        return client_type(transport=httpx.MockTransport(handler), **kwargs)

    monkeypatch.setattr(auth_removal.httpx, "AsyncClient", create_client)


async def test_hard_delete_is_bound_to_subject_and_server_credentials(configured, monkeypatch):
    requests = []

    def handle(request):
        requests.append(request)
        assert request.method == "DELETE"
        assert request.url == f"https://example.supabase.co/auth/v1/admin/users/{SUBJECT}"
        assert request.headers["authorization"] == "Bearer test-server-key"
        assert request.headers["apikey"] == "test-server-key"
        assert json.loads(request.content) == {"should_soft_delete": False}
        return httpx.Response(200, json={"id": SUBJECT})

    mock_http(monkeypatch, handle)
    await auth_removal.remove_auth_identity(SUBJECT)
    assert len(requests) == 1
    assert "test-server-key" not in repr(configured)


@pytest.mark.parametrize(
    ("status", "body", "expected"),
    [
        (200, {}, None),
        (404, {"code": "user_not_found"}, None),
        (404, {"error_code": "user_not_found"}, None),
        (404, {"message": "route missing"}, "rejected"),
        (403, {"message": "private upstream detail"}, "rejected"),
        (302, {}, "rejected"),
        (429, {}, "retryable"),
        (503, {}, "retryable"),
        (200, {"id": "some-other-user"}, "retryable"),
        (200, [], "retryable"),
    ],
)
async def test_provider_outcomes_are_truthful_and_sanitized(
    configured, monkeypatch, status, body, expected
):
    mock_http(monkeypatch, lambda _: httpx.Response(status, json=body))
    if expected is None:
        await auth_removal.remove_auth_identity(SUBJECT)
    else:
        with pytest.raises(auth_removal.AuthRemovalError) as caught:
            await auth_removal.remove_auth_identity(SUBJECT)
        assert str(caught.value) == expected
        assert caught.value.code == expected


async def test_timeout_does_not_retry_or_leak_provider_message(configured, monkeypatch):
    calls = []

    def handle(request):
        calls.append(request)
        raise httpx.ReadTimeout("private upstream detail")

    mock_http(monkeypatch, handle)
    with pytest.raises(auth_removal.AuthRemovalError, match="^retryable$"):
        await auth_removal.remove_auth_identity(SUBJECT)
    assert len(calls) == 1


@pytest.mark.parametrize("body", [b"not-json", b"x" * 65537])
async def test_bad_or_oversized_success_body_stays_pending(configured, monkeypatch, body):
    mock_http(monkeypatch, lambda _: httpx.Response(200, content=body))
    with pytest.raises(auth_removal.AuthRemovalError, match="^retryable$"):
        await auth_removal.remove_auth_identity(SUBJECT)


async def test_disabled_and_invalid_configuration_never_contacts_auth(configured, monkeypatch):
    mock_http(monkeypatch, lambda _: pytest.fail("HTTP must not run"))
    for field, value in [
        ("tableus_account_deletion_enabled", False),
        ("supabase_service_role_key", SecretStr("")),
        ("supabase_url", "http://localhost:1234"),
        ("supabase_url", "https://example.supabase.co/path"),
    ]:
        with monkeypatch.context() as patch:
            patch.setattr(configured, field, value)
            assert not auth_removal.full_deletion_available()
            with pytest.raises(auth_removal.AuthRemovalError, match="^unavailable$"):
                await auth_removal.remove_auth_identity(SUBJECT)
    with pytest.raises(auth_removal.AuthRemovalError, match="^rejected$"):
        await auth_removal.remove_auth_identity("../other")


async def test_demo_is_network_free_and_never_enabled_on_hosted(configured, monkeypatch):
    mock_http(monkeypatch, lambda _: pytest.fail("HTTP must not run"))
    monkeypatch.setattr(configured, "tableus_auth_mode", "demo")
    monkeypatch.setattr(configured, "environment", "test")
    await auth_removal.remove_auth_identity("demo-member")
    monkeypatch.setattr(configured, "environment", "staging")
    assert not auth_removal.full_deletion_available()
