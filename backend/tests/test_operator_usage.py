"""Operator authorization and bounded aggregate visibility through the API."""

from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
from tableus import api, auth, operators
from tableus.auth import Identity
from tableus.db import SessionFactory, init_database
from tableus.models import Invite, InviteRedemption, Profile, ProviderUsage
from tableus.security import hash_value


@pytest.fixture(scope="module", autouse=True)
async def database() -> None:
    await init_database()


@pytest.fixture
async def client():
    app.state.request_rate_limiter.clear()
    app.state.readiness_rate_limiter.clear()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value


@pytest.fixture
async def approved_subjects() -> tuple[str, str]:
    operator, ordinary = f"operator-{uuid4().hex}", f"ordinary-{uuid4().hex}"
    async with SessionFactory() as session:
        session.add_all(
            Profile(id=subject, display_name=subject, email_hash=hash_value(subject))
            for subject in (operator, ordinary)
        )
        await session.commit()
    return operator, ordinary


def allow(monkeypatch: pytest.MonkeyPatch, subjects: str) -> None:
    monkeypatch.setattr(
        operators, "get_settings", lambda: SimpleNamespace(tableus_operator_subjects=subjects)
    )


@pytest.mark.asyncio
async def test_empty_allowlist_denies_approved_user(
    client: AsyncClient, approved_subjects: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    operator, _ = approved_subjects
    allow(monkeypatch, " , ")
    response = await client.get("/api/v1/provider-usage/summary", headers={"X-Demo-User-ID": operator})
    assert response.status_code == 403
    assert "data" not in response.json()


@pytest.mark.asyncio
async def test_only_exact_allowlisted_approved_subject_can_read_aggregate(
    client: AsyncClient, approved_subjects: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    operator, ordinary = approved_subjects
    allow(monkeypatch, f"  {operator}  ,")
    denied = await client.get(
        "/api/v1/provider-usage/summary", headers={"X-Demo-User-ID": ordinary}
    )
    assert denied.status_code == 403

    provider = f"test-{uuid4().hex}"
    async with SessionFactory() as session:
        session.add(ProviderUsage(
            provider=provider, operation="operator.aggregate", latency_ms=5,
            input_units=2, output_units=3, estimated_cost_usd=0.00012,
        ))
        await session.commit()
    allowed = await client.get(
        "/api/v1/provider-usage/summary", headers={"X-Demo-User-ID": operator}
    )
    assert allowed.status_code == 200
    record = next(item for item in allowed.json()["data"] if item["provider"] == provider)
    assert record == {
        "provider": provider, "operation": "operator.aggregate", "operation_count": 1,
        "input_units": 2, "output_units": 3, "estimated_cost_usd": 0.00012,
    }
    assert set(record) == {
        "provider", "operation", "operation_count", "input_units", "output_units",
        "estimated_cost_usd",
    }


@pytest.mark.asyncio
async def test_hosted_forged_headers_cannot_grant_operator_role(
    client: AsyncClient, approved_subjects: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    operator, ordinary = approved_subjects
    allow(monkeypatch, operator)
    async with SessionFactory() as session:
        invite = Invite(code_hash=hash_value(uuid4().hex), max_uses=1)
        session.add(invite)
        await session.flush()
        session.add(InviteRedemption(invite_id=invite.id, profile_id=ordinary))
        await session.commit()

    async def trusted_resolver(_authorization: str | None, _demo_id: str | None) -> Identity:
        return Identity(subject=ordinary)

    monkeypatch.setattr(auth, "resolve_identity", trusted_resolver)
    monkeypatch.setattr(auth, "get_settings", lambda: SimpleNamespace(tableus_auth_mode="supabase"))
    response = await client.get(
        "/api/v1/provider-usage/summary",
        headers={
            "Authorization": "Bearer local-fake-token", "X-Demo-User-ID": operator,
            "X-Operator-Role": "admin", "X-User-Metadata": '{"role":"operator"}',
        },
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_window_includes_cutoff_and_rejects_outside_or_invalid_days(
    client: AsyncClient, approved_subjects: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    operator, _ = approved_subjects
    allow(monkeypatch, operator)
    fixed = datetime(2026, 9, 24, 12, tzinfo=UTC)

    class FrozenDatetime(datetime):
        @classmethod
        def now(cls, tz=None):
            return fixed if tz is not None else fixed.replace(tzinfo=None)

    monkeypatch.setattr(api, "datetime", FrozenDatetime)
    provider = f"window-{uuid4().hex}"
    cutoff = fixed - timedelta(days=30)
    async with SessionFactory() as session:
        session.add_all([
            ProviderUsage(
                provider=provider, operation="inside", latency_ms=1,
                input_units=1, created_at=cutoff,
            ),
            ProviderUsage(
                provider=provider, operation="outside", latency_ms=1,
                input_units=2, created_at=cutoff - timedelta(microseconds=1),
            ),
        ])
        await session.commit()
    headers = {"X-Demo-User-ID": operator}
    result = await client.get("/api/v1/provider-usage/summary?days=30", headers=headers)
    assert result.status_code == 200
    records = [item for item in result.json()["data"] if item["provider"] == provider]
    assert [(item["operation"], item["input_units"]) for item in records] == [("inside", 1)]
    for days in ("0", "31", "hello"):
        invalid = await client.get(f"/api/v1/provider-usage/summary?days={days}", headers=headers)
        assert invalid.status_code == 422


@pytest.mark.asyncio
async def test_allowlist_revocation_is_effective_on_next_request(
    client: AsyncClient, approved_subjects: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    operator, _ = approved_subjects
    settings = SimpleNamespace(tableus_operator_subjects=operator)
    monkeypatch.setattr(operators, "get_settings", lambda: settings)
    headers = {"X-Demo-User-ID": operator}
    first = await client.get("/api/v1/provider-usage/summary", headers=headers)
    assert first.status_code == 200
    settings.tableus_operator_subjects = ""
    second = await client.get("/api/v1/provider-usage/summary", headers=headers)
    assert second.status_code == 403
