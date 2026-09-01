import asyncio
import io
import threading
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from httpx import ASGITransport, AsyncClient
from PIL import Image
from sqlalchemy import delete, func, select

from main import app
from tableus import api as tableus_api
from tableus.auth import Identity
from tableus.db import SessionFactory, init_database
from tableus.models import (
    Connection,
    Invite,
    InviteRedemption,
    PendingAuthValidation,
    Plan,
    PlanEvent,
    PlanParticipant,
    Profile,
    ProviderUsage,
    RecommendationRun,
    Review,
    Vote,
)
from tableus.providers.base import AiCallUsage
from tableus.providers.deterministic import DeterministicPlacesProvider
from tableus.providers.google_live import AiProviderError
from tableus.schemas import InviteRedeemIn
from tableus.security import hash_value, issue_redemption_token

_idempotency_500_calls = {"count": 0}


@app.post("/api/v1/__test/idempotency-500")
async def idempotency_500_fixture():
    _idempotency_500_calls["count"] += 1
    if _idempotency_500_calls["count"] == 1:
        return JSONResponse(status_code=503, content={"error": "temporary"})
    return {"data": {"ok": True}, "meta": {}}


@pytest.fixture(scope="module", autouse=True)
async def database() -> None:
    await init_database()


@pytest.fixture
async def client() -> AsyncClient:
    app.state.request_rate_limiter.clear()
    app.state.readiness_rate_limiter.clear()
    app.state.readiness_probe_expires_at = 0.0
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value


def headers(user_id: str) -> dict[str, str]:
    return {"X-Demo-User-ID": user_id}


def nested_keys(value) -> set[str]:
    if isinstance(value, dict):
        return set(value).union(*(nested_keys(item) for item in value.values()))
    if isinstance(value, list):
        return set().union(*(nested_keys(item) for item in value))
    return set()


@pytest.mark.asyncio
async def test_error_envelope_and_invite_gate(client: AsyncClient) -> None:
    invalid = await client.post("/api/v1/access/validate", json={"code": "bad-code"})
    assert invalid.status_code == 404
    assert invalid.json()["error"]["code"] == "http_404"
    assert invalid.json()["request_id"]

    valid = await client.post("/api/v1/access/validate", json={"code": "tableus-beta"})
    assert valid.status_code == 200
    assert valid.json()["data"]["redemption_token"]


@pytest.mark.asyncio
async def test_supabase_invite_validation_requires_an_email_reservation(
    client: AsyncClient,
    monkeypatch,
) -> None:
    monkeypatch.setattr(tableus_api.get_settings(), "tableus_auth_mode", "supabase")

    response = await client.post("/api/v1/access/validate", json={"code": "tableus-beta"})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "http_422"


@pytest.mark.asyncio
async def test_invite_validation_reuses_email_reservation_and_bounds_capacity(
    client: AsyncClient,
) -> None:
    invite_code = "one-use-reservation-test"
    async with SessionFactory() as session:
        invite = Invite(code_hash=hash_value(invite_code), max_uses=1)
        session.add(invite)
        await session.commit()
        invite_id = invite.id

    first = await client.post(
        "/api/v1/access/validate",
        json={"code": invite_code, "email": "reserved@example.test"},
    )
    second = await client.post(
        "/api/v1/access/validate",
        json={"code": invite_code, "email": "RESERVED@example.test"},
    )
    blocked = await client.post(
        "/api/v1/access/validate",
        json={"code": invite_code, "email": "different@example.test"},
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert blocked.status_code == 409
    async with SessionFactory() as session:
        active = await session.scalar(
            select(func.count())
            .select_from(PendingAuthValidation)
            .where(
                PendingAuthValidation.invite_id == invite_id,
                PendingAuthValidation.redeemed_at.is_(None),
            )
        )
    assert active == 1


@pytest.mark.asyncio
async def test_expired_invite_validation_is_pruned_before_replacement(
    client: AsyncClient,
) -> None:
    invite_code = "expired-reservation-test"
    async with SessionFactory() as session:
        invite = Invite(code_hash=hash_value(invite_code), max_uses=1)
        session.add(invite)
        await session.flush()
        session.add(
            PendingAuthValidation(
                invite_id=invite.id,
                email_hash=hash_value("expired@example.test"),
                expires_at=datetime.now(UTC) - timedelta(seconds=1),
            )
        )
        await session.commit()
        invite_id = invite.id

    response = await client.post(
        "/api/v1/access/validate",
        json={"code": invite_code, "email": "replacement@example.test"},
    )

    assert response.status_code == 200
    async with SessionFactory() as session:
        rows = list(
            (
                await session.scalars(
                    select(PendingAuthValidation).where(
                        PendingAuthValidation.invite_id == invite_id
                    )
                )
            ).all()
        )
    assert len(rows) == 1
    assert rows[0].email_hash == hash_value("replacement@example.test")


@pytest.mark.asyncio
async def test_expired_invite_cannot_be_redeemed(client: AsyncClient) -> None:
    async with SessionFactory() as session:
        invite = Invite(
            code_hash=hash_value("expired-invite"),
            max_uses=1,
            expires_at=datetime.now(UTC) - timedelta(minutes=1),
        )
        session.add(invite)
        await session.commit()
        token = issue_redemption_token(invite.id)

    response = await client.post(
        "/api/v1/access/redeem",
        headers=headers("expired-invite-user"),
        json={"redemption_token": token, "display_name": "Expired User"},
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_approved_profile_cannot_consume_a_different_invite(
    client: AsyncClient,
) -> None:
    async with SessionFactory() as session:
        original = Invite(code_hash=hash_value("original-approved-invite"), max_uses=1, use_count=1)
        other = Invite(code_hash=hash_value("other-approved-invite"), max_uses=1)
        profile = Profile(
            id="approved-invite-reuse-user",
            display_name="Approved User",
            email_hash=hash_value("approved-invite-reuse@example.test"),
        )
        session.add_all([original, other, profile])
        await session.flush()
        session.add(InviteRedemption(invite_id=original.id, profile_id=profile.id))
        await session.commit()
        other_id = other.id

    response = await client.post(
        "/api/v1/access/redeem",
        headers=headers("approved-invite-reuse-user"),
        json={
            "redemption_token": issue_redemption_token(other_id),
            "display_name": "Approved User",
        },
    )

    assert response.status_code == 409
    async with SessionFactory() as session:
        other = await session.get(Invite, other_id)
        redemptions = list(
            (
                await session.scalars(
                    select(InviteRedemption).where(
                        InviteRedemption.profile_id == "approved-invite-reuse-user"
                    )
                )
            ).all()
        )
    assert other is not None
    assert other.use_count == 0
    assert len(redemptions) == 1


@pytest.mark.asyncio
async def test_same_invite_redemption_retry_succeeds_after_capacity_is_consumed(
    client: AsyncClient,
) -> None:
    async with SessionFactory() as session:
        invite = Invite(code_hash=hash_value("retry-consumed-invite"), max_uses=1, use_count=1)
        profile = Profile(
            id="invite-retry-user",
            display_name="Retry User",
            email_hash=hash_value("invite-retry@example.test"),
        )
        session.add_all([invite, profile])
        await session.flush()
        session.add(InviteRedemption(invite_id=invite.id, profile_id=profile.id))
        await session.commit()
        invite_id = invite.id

    response = await client.post(
        "/api/v1/access/redeem",
        headers=headers("invite-retry-user"),
        json={
            "redemption_token": issue_redemption_token(invite_id),
            "display_name": "Retry User",
        },
    )

    assert response.status_code == 200
    assert response.json()["data"]["id"] == "invite-retry-user"
    async with SessionFactory() as session:
        invite = await session.get(Invite, invite_id)
        redemption_count = await session.scalar(
            select(func.count())
            .select_from(InviteRedemption)
            .where(InviteRedemption.profile_id == "invite-retry-user")
        )
    assert invite is not None
    assert invite.use_count == 1
    assert redemption_count == 1


@pytest.mark.asyncio
async def test_same_invite_retry_releases_a_fresh_hosted_reservation(
    client: AsyncClient,
) -> None:
    email = "invite-reservation-retry@example.test"
    async with SessionFactory() as session:
        invite = Invite(code_hash=hash_value("retry-reserved-invite"), max_uses=2, use_count=1)
        profile = Profile(
            id="invite-reservation-retry-user",
            display_name="Reservation Retry User",
            email_hash=hash_value(email),
        )
        session.add_all([invite, profile])
        await session.flush()
        reservation = PendingAuthValidation(
            invite_id=invite.id,
            email_hash=hash_value(email),
            expires_at=datetime.now(UTC) + timedelta(minutes=20),
        )
        session.add_all(
            [
                InviteRedemption(invite_id=invite.id, profile_id=profile.id),
                reservation,
            ]
        )
        await session.commit()
        invite_id = invite.id
        reservation_id = reservation.id
        redemption_token = issue_redemption_token(invite.id, email, reservation.id)

    async with SessionFactory() as session:
        response = await tableus_api.redeem_access(
            InviteRedeemIn(
                redemption_token=redemption_token,
                display_name="Reservation Retry User",
            ),
            Identity(subject="invite-reservation-retry-user", email=email),
            session,
        )
    assert response["data"].id == "invite-reservation-retry-user"

    async with SessionFactory() as session:
        reservation = await session.get(PendingAuthValidation, reservation_id)
        invite = await session.get(Invite, invite_id)
    assert reservation is not None
    assert reservation.redeemed_at is not None
    assert invite is not None
    assert invite.use_count == 1

    available = await client.post(
        "/api/v1/access/validate",
        json={"code": "retry-reserved-invite", "email": "next-user@example.test"},
    )
    assert available.status_code == 200


@pytest.mark.asyncio
async def test_complete_shared_plan_flow(client: AsyncClient) -> None:
    created_response = await client.post(
        "/api/v1/plans",
        headers=headers("demo-organizer"),
        json={
            "title": "Friday dinner",
            "location_label": "Boston, MA",
            "latitude": 42.3601,
            "longitude": -71.0589,
        },
    )
    assert created_response.status_code == 200, created_response.text
    created = created_response.json()["data"]
    plan_id = created["plan"]["id"]

    listed = await client.get("/api/v1/plans", headers=headers("demo-organizer"))
    assert listed.status_code == 200
    summary = next(item for item in listed.json()["data"] if item["id"] == plan_id)
    assert summary["participant_count"] == 1
    assert "participants" not in summary
    initial_revision = await client.get(
        f"/api/v1/plans/{plan_id}/revision", headers=headers("demo-organizer")
    )
    assert initial_revision.status_code == 200

    joined = await client.post(
        f"/api/v1/plans/{plan_id}/join",
        headers=headers("demo-guest"),
        json={"share_token": created["share_token"]},
    )
    assert joined.status_code == 200
    assert len(joined.json()["data"]["participants"]) == 2

    generated = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations",
        headers=headers("demo-organizer"),
        json={"query": "group-friendly dinner"},
    )
    assert generated.status_code == 200, generated.text
    plan = generated.json()["data"]
    assert plan["status"] == "voting"
    assert len(plan["candidates"]) == 4
    ranking = [item["id"] for item in plan["candidates"][:3]]

    for user_id, user_ranking in [
        ("demo-organizer", ranking),
        ("demo-guest", [ranking[1], ranking[0], ranking[2]]),
    ]:
        response = await client.put(
            f"/api/v1/plans/{plan_id}/vote",
            headers=headers(user_id),
            json={"ranking": user_ranking},
        )
        assert response.status_code == 200

    forbidden = await client.post(
        f"/api/v1/plans/{plan_id}/finalize",
        headers=headers("demo-guest"),
        json={},
    )
    assert forbidden.status_code == 403

    finalized = await client.post(
        f"/api/v1/plans/{plan_id}/finalize",
        headers=headers("demo-organizer"),
        json={},
    )
    assert finalized.status_code == 200
    assert finalized.json()["data"]["status"] == "finalized"

    locked_constraints = await client.patch(
        f"/api/v1/plans/{plan_id}/constraints",
        headers=headers("demo-guest"),
        json={"notes": "quieter please"},
    )
    assert locked_constraints.status_code == 409

    locked_recommendations = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations",
        headers=headers("demo-guest"),
        json={"query": "replace the final choice"},
    )
    assert locked_recommendations.status_code == 409

    async with SessionFactory() as session:
        session.add(
            Profile(
                id="demo-late-guest",
                display_name="Late Guest",
                email_hash=hash_value("late-guest@example.test"),
            )
        )
        await session.commit()
    locked_join = await client.post(
        f"/api/v1/plans/{plan_id}/join",
        headers=headers("demo-late-guest"),
        json={"share_token": created["share_token"]},
    )
    assert locked_join.status_code == 409

    still_finalized = await client.get(
        f"/api/v1/plans/{plan_id}", headers=headers("demo-organizer")
    )
    assert still_finalized.status_code == 200
    assert still_finalized.json()["data"]["status"] == "finalized"
    assert still_finalized.json()["data"]["finalized_candidate_id"] is not None
    assert len(still_finalized.json()["data"]["participants"]) == 2

    reopened = await client.post(
        f"/api/v1/plans/{plan_id}/reopen", headers=headers("demo-organizer")
    )
    assert reopened.status_code == 200
    assert reopened.json()["data"]["status"] == "voting"

    stale = await client.patch(
        f"/api/v1/plans/{plan_id}/constraints",
        headers=headers("demo-guest"),
        json={"notes": "quieter please"},
    )
    assert stale.status_code == 200
    assert stale.json()["data"]["status"] == "collecting"
    assert stale.json()["data"]["candidates"] == []


@pytest.mark.asyncio
async def test_resolved_plan_stores_only_place_id_and_user_label(client: AsyncClient) -> None:
    resolved = await client.post(
        "/api/v1/locations/resolve",
        headers=headers("demo-organizer"),
        json={"query": "  Madison, Wisconsin  "},
    )
    assert resolved.status_code == 200
    location = resolved.json()["data"]
    assert set(location) == {"place_id", "label", "data_provider"}

    created = await client.post(
        "/api/v1/plans",
        headers=headers("demo-organizer"),
        json={
            "title": "Policy safe location",
            "location_label": "Madison,   Wisconsin",
            "location_place_id": location["place_id"],
        },
    )
    assert created.status_code == 200, created.text
    plan_id = created.json()["data"]["plan"]["id"]
    assert created.json()["data"]["plan"]["latitude"] is None
    assert created.json()["data"]["plan"]["longitude"] is None

    async with SessionFactory() as session:
        stored = await session.get(Plan, plan_id)
        assert stored is not None
        assert stored.location_label == "Madison, Wisconsin"
        assert stored.location_place_id == location["place_id"]
        assert stored.latitude is None
        assert stored.longitude is None


def test_live_places_rate_limits_are_per_user_and_global(monkeypatch) -> None:
    monkeypatch.setattr(
        tableus_api, "get_settings", lambda: SimpleNamespace(places_provider_mode="live")
    )
    tableus_api._places_user_windows.clear()
    tableus_api._places_global_window.clear()
    for _ in range(10):
        tableus_api._consume_places_limit("rate-user")
    with pytest.raises(Exception) as per_user:
        tableus_api._consume_places_limit("rate-user")
    assert per_user.value.status_code == 429

    tableus_api._places_user_windows.clear()
    tableus_api._places_global_window.clear()
    for user_index in range(6):
        for _ in range(10):
            tableus_api._consume_places_limit(f"global-user-{user_index}")
    with pytest.raises(Exception) as global_limit:
        tableus_api._consume_places_limit("one-more-user")
    assert global_limit.value.status_code == 429


@pytest.mark.asyncio
async def test_live_places_rolling_attempt_ceiling_reserves_before_provider_calls(
    monkeypatch,
) -> None:
    monkeypatch.setattr(
        tableus_api,
        "get_settings",
        lambda: SimpleNamespace(
            places_provider_mode="live",
            places_runtime_max_attempts_30d=3,
        ),
    )
    async with SessionFactory() as session:
        await session.execute(delete(ProviderUsage))
        await session.commit()
    tableus_api._places_reserved_attempts = 0

    reserved = await tableus_api._reserve_places_budget(3)
    with pytest.raises(Exception) as blocked:
        await tableus_api._reserve_places_budget(1)
    assert blocked.value.status_code == 429

    await tableus_api._release_places_budget(reserved, 3)
    assert tableus_api._places_reserved_attempts == 0


@pytest.mark.asyncio
async def test_provider_usage_summary_is_aggregate_only(client: AsyncClient) -> None:
    async with SessionFactory() as session:
        session.add(
            ProviderUsage(
                provider="google-places-new",
                operation="restaurant.text_search",
                latency_ms=10,
                input_units=2,
                output_units=4,
                estimated_cost_usd=0.00001234,
            )
        )
        await session.commit()

    response = await client.get(
        "/api/v1/provider-usage/summary", headers=headers("demo-organizer")
    )
    assert response.status_code == 200
    google = next(
        item for item in response.json()["data"] if item["provider"] == "google-places-new"
    )
    assert set(google) == {
        "provider",
        "operation",
        "operation_count",
        "input_units",
        "output_units",
        "estimated_cost_usd",
    }
    assert google["estimated_cost_usd"] == pytest.approx(0.00001234)


def test_live_ai_rate_limits_are_per_user_and_global(monkeypatch) -> None:
    monkeypatch.setattr(
        tableus_api,
        "get_settings",
        lambda: SimpleNamespace(ai_provider_mode="live"),
    )
    tableus_api._ai_user_windows.clear()
    tableus_api._ai_global_window.clear()
    for _ in range(5):
        tableus_api._consume_ai_limit("ai-rate-user")
    with pytest.raises(Exception) as per_user:
        tableus_api._consume_ai_limit("ai-rate-user")
    assert per_user.value.status_code == 429

    tableus_api._ai_user_windows.clear()
    tableus_api._ai_global_window.clear()
    for user_index in range(6):
        for _ in range(5):
            tableus_api._consume_ai_limit(f"ai-global-user-{user_index}")
    with pytest.raises(Exception) as global_limit:
        tableus_api._consume_ai_limit("ai-one-more-user")
    assert global_limit.value.status_code == 429


@pytest.mark.asyncio
async def test_live_ai_rolling_budget_rejects_before_provider_call(monkeypatch) -> None:
    monkeypatch.setattr(
        tableus_api,
        "get_settings",
        lambda: SimpleNamespace(ai_provider_mode="live", ai_runtime_max_usd_30d=4.0),
    )
    tableus_api._ai_reserved_usd = 0
    async with SessionFactory() as session:
        session.add(
            ProviderUsage(
                provider="gemini",
                operation="recommend",
                model="gemini-3.1-flash-lite",
                latency_ms=10,
                estimated_cost_usd=3.99,
            )
        )
        await session.commit()
    with pytest.raises(Exception) as captured:
        await tableus_api._reserve_ai_budget()
    assert captured.value.status_code == 429


@pytest.mark.asyncio
async def test_ai_failure_does_not_commit_recommendations_or_taste(
    client: AsyncClient, monkeypatch
) -> None:
    created = await client.post(
        "/api/v1/plans",
        headers=headers("demo-organizer"),
        json={
            "title": "AI failure dinner",
            "location_label": "Boston, MA",
            "latitude": 42.3601,
            "longitude": -71.0589,
        },
    )
    plan_id = created.json()["data"]["plan"]["id"]
    await client.post(
        f"/api/v1/plans/{plan_id}/join",
        headers=headers("demo-guest"),
        json={"share_token": created.json()["data"]["share_token"]},
    )

    class FailingAi:
        name = "gemini"
        model = "gemini-3.1-flash-lite"

        async def _fail(self, operation, usage):
            if usage:
                await usage(AiCallUsage(operation, 1, 20, 0, 0.000002, True))
            raise AiProviderError(
                "Gemini returned invalid data",
                kind="invalid_output",
                attempts=1,
                input_tokens=20,
                estimated_cost_usd=0.000002,
            )

        async def recommend(self, query, constraints, places, usage=None):
            return await self._fail("recommend", usage)

        async def regenerate_taste(self, reviews, usage=None):
            return await self._fail("regenerate_taste", usage)

    monkeypatch.setattr(tableus_api, "get_ai_provider", lambda: FailingAi())
    recommendation = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations",
        headers=headers("demo-organizer"),
        json={"query": "group-friendly dinner"},
    )
    assert recommendation.status_code == 502
    before = (
        await client.get("/api/v1/taste-profile", headers=headers("demo-organizer"))
    ).json()["data"]["preferences_text"]
    taste = await client.post(
        "/api/v1/taste-profile/regenerate", headers=headers("demo-organizer"), json={}
    )
    assert taste.status_code == 502
    after = (
        await client.get("/api/v1/taste-profile", headers=headers("demo-organizer"))
    ).json()["data"]["preferences_text"]
    assert after == before
    async with SessionFactory() as session:
        run_count = await session.scalar(
            select(func.count())
            .select_from(RecommendationRun)
            .where(RecommendationRun.plan_id == plan_id)
        )
        errors = list(
            (
                await session.scalars(
                    select(ProviderUsage).where(
                        ProviderUsage.provider == "gemini",
                        ProviderUsage.operation.in_(
                            ["recommend.error", "regenerate_taste.error"]
                        ),
                    )
                )
            ).all()
        )
    assert run_count == 0
    assert len(errors) == 2


@pytest.mark.asyncio
async def test_food_analysis_resizes_and_strips_input_before_provider(
    client: AsyncClient, monkeypatch
) -> None:
    observed = {}

    class CapturingAi:
        name = "deterministic"

        async def analyze_food(self, image_bytes, media_type, usage=None):
            with Image.open(io.BytesIO(image_bytes)) as sanitized:
                observed["size"] = sanitized.size
                observed["format"] = sanitized.format
                observed["metadata"] = sanitized.getexif()
            observed["media_type"] = media_type
            if usage:
                await usage(AiCallUsage("analyze_food", 0, 0, 0, 0, False))
            return {
                "dish": "Sample dish",
                "cuisine": "Contemporary",
                "description": "A visible plated dish.",
                "flavor_tags": ["savory"],
            }

    source = Image.new("RGB", (2400, 1800), "#c9432d")
    source_bytes = io.BytesIO()
    source.save(source_bytes, format="JPEG", exif=Image.Exif())
    monkeypatch.setattr(tableus_api, "get_ai_provider", lambda: CapturingAi())
    response = await client.post(
        "/api/v1/food/analyze",
        headers=headers("demo-organizer"),
        files={"image": ("dish.jpg", source_bytes.getvalue(), "image/jpeg")},
    )
    assert response.status_code == 200
    assert max(observed["size"]) == 1600
    assert observed["format"] == "JPEG"
    assert len(observed["metadata"]) == 0
    assert observed["media_type"] == "image/jpeg"


@pytest.mark.asyncio
async def test_food_analysis_checks_live_ai_limit_before_sanitizing(
    client: AsyncClient, monkeypatch
) -> None:
    monkeypatch.setattr(
        tableus_api, "get_settings", lambda: SimpleNamespace(ai_provider_mode="live")
    )
    tableus_api._ai_user_windows.clear()
    tableus_api._ai_global_window.clear()
    for _ in range(5):
        tableus_api._consume_ai_limit("demo-organizer", include_global=False)
    sanitized = False

    def unexpected_sanitizer(image_bytes: bytes) -> bytes:
        del image_bytes
        nonlocal sanitized
        sanitized = True
        raise AssertionError("sanitizer should not run after rate rejection")

    monkeypatch.setattr(tableus_api, "_sanitize_food_image", unexpected_sanitizer)
    source = Image.new("RGB", (8, 8), "#c9432d")
    source_bytes = io.BytesIO()
    source.save(source_bytes, format="JPEG")

    response = await client.post(
        "/api/v1/food/analyze",
        headers=headers("demo-organizer"),
        files={"image": ("dish.jpg", source_bytes.getvalue(), "image/jpeg")},
    )

    assert response.status_code == 429
    assert sanitized is False
    assert len(tableus_api._ai_global_window) == 0
    tableus_api._ai_user_windows.clear()
    tableus_api._ai_global_window.clear()


@pytest.mark.asyncio
async def test_food_analysis_checks_live_user_limit_before_reading(monkeypatch) -> None:
    monkeypatch.setattr(
        tableus_api, "get_settings", lambda: SimpleNamespace(ai_provider_mode="live")
    )
    tableus_api._ai_user_windows.clear()
    tableus_api._ai_global_window.clear()
    for _ in range(5):
        tableus_api._consume_ai_limit(
            "demo-organizer", include_global=False
        )
    read = False

    class UnreadUpload:
        content_type = "image/jpeg"

        async def read(self, size: int) -> bytes:
            del size
            nonlocal read
            read = True
            return b"unused"

    with pytest.raises(HTTPException) as rejected:
        await tableus_api.analyze_food(
            SimpleNamespace(id="demo-organizer"), UnreadUpload()
        )
    assert rejected.value.status_code == 429
    assert read is False
    assert len(tableus_api._ai_global_window) == 0
    tableus_api._ai_user_windows.clear()
    tableus_api._ai_global_window.clear()


@pytest.mark.asyncio
async def test_invalid_food_image_does_not_consume_global_ai_limit(
    client: AsyncClient, monkeypatch
) -> None:
    monkeypatch.setattr(
        tableus_api, "get_settings", lambda: SimpleNamespace(ai_provider_mode="live")
    )
    tableus_api._ai_user_windows.clear()
    tableus_api._ai_global_window.clear()

    response = await client.post(
        "/api/v1/food/analyze",
        headers=headers("demo-organizer"),
        files={"image": ("dish.jpg", b"not-an-image", "image/jpeg")},
    )

    assert response.status_code == 422
    assert len(tableus_api._ai_user_windows["demo-organizer"]) == 1
    assert len(tableus_api._ai_global_window) == 0
    assert tableus_api._ai_reserved_usd == 0
    tableus_api._ai_user_windows.clear()
    tableus_api._ai_global_window.clear()


@pytest.mark.asyncio
async def test_food_image_worker_slot_remains_held_after_caller_cancellation(monkeypatch) -> None:
    started = threading.Event()
    release = threading.Event()

    def blocking_sanitizer(image_bytes: bytes) -> bytes:
        started.set()
        release.wait(timeout=5)
        return image_bytes

    slots = asyncio.Semaphore(1)
    monkeypatch.setattr(tableus_api, "_food_image_slots", slots)
    monkeypatch.setattr(tableus_api, "_sanitize_food_image", blocking_sanitizer)
    first = asyncio.create_task(tableus_api._sanitize_food_image_bounded(b"first"))
    assert await asyncio.to_thread(started.wait, 1)

    first.cancel()
    with pytest.raises(asyncio.CancelledError):
        await first
    assert slots.locked()
    with pytest.raises(HTTPException) as saturated:
        await tableus_api._sanitize_food_image_bounded(b"second")
    assert saturated.value.status_code == 503

    release.set()
    for _ in range(50):
        if not slots.locked():
            break
        await asyncio.sleep(0.01)
    assert not slots.locked()


@pytest.mark.asyncio
async def test_food_analysis_rejects_oversized_declared_body_before_parsing(
    client: AsyncClient,
) -> None:
    response = await client.post(
        "/api/v1/food/analyze",
        headers={
            **headers("demo-organizer"),
            "Content-Length": str(10 * 1024 * 1024),
            "Origin": "http://localhost:3000",
        },
        content=b"not-read",
    )

    assert response.status_code == 413
    assert response.json()["error"]["code"] == "request_too_large"
    assert response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"


@pytest.mark.asyncio
async def test_food_analysis_rejects_oversized_chunked_multipart_before_handler(
    client: AsyncClient,
) -> None:
    boundary = "tableus-body-limit"

    async def body_chunks():
        yield (
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="image"; filename="dish.jpg"\r\n'
            "Content-Type: image/jpeg\r\n\r\n"
        ).encode()
        for _ in range(10):
            yield b"x" * (1024 * 1024)

    response = await client.post(
        "/api/v1/food/analyze",
        headers={
            **headers("demo-organizer"),
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        content=body_chunks(),
    )

    assert response.status_code == 413
    assert response.json()["error"]["code"] == "request_too_large"


@pytest.mark.asyncio
async def test_idempotent_json_rejects_oversized_chunked_body_before_fingerprinting(
    client: AsyncClient,
) -> None:
    async def body_chunks():
        yield b'{"title":"'
        for _ in range(17):
            yield b"x" * (64 * 1024)

    response = await client.post(
        "/api/v1/plans",
        headers={
            **headers("demo-organizer"),
            "Content-Type": "application/json",
            "Idempotency-Key": "oversized-json-test",
        },
        content=body_chunks(),
    )

    assert response.status_code == 413
    assert response.json()["error"]["code"] == "request_too_large"


@pytest.mark.asyncio
async def test_incomplete_place_details_do_not_commit_a_recommendation_run(
    client: AsyncClient, monkeypatch
) -> None:
    created = await client.post(
        "/api/v1/plans",
        headers=headers("demo-organizer"),
        json={
            "title": "Incomplete detail dinner",
            "location_label": "Boston, MA",
            "latitude": 42.3601,
            "longitude": -71.0589,
        },
    )
    plan_id = created.json()["data"]["plan"]["id"]
    await client.post(
        f"/api/v1/plans/{plan_id}/join",
        headers=headers("demo-guest"),
        json={"share_token": created.json()["data"]["share_token"]},
    )

    class IncompleteDetails(DeterministicPlacesProvider):
        async def get_places(self, place_ids, usage=None):
            return (await super().get_places(place_ids, usage))[:3]

    monkeypatch.setattr(tableus_api, "get_places_provider", lambda: IncompleteDetails())
    response = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations",
        headers=headers("demo-organizer"),
        json={"query": "group-friendly dinner"},
    )
    assert response.status_code == 422
    async with SessionFactory() as session:
        stored = await session.get(Plan, plan_id)
        assert stored is not None
        assert stored.active_run_id is None
        run_count = await session.scalar(
            select(func.count())
            .select_from(RecommendationRun)
            .where(RecommendationRun.plan_id == plan_id)
        )
        assert run_count == 0


@pytest.mark.asyncio
async def test_idempotency_replay_conflict_actor_isolation_and_5xx(client: AsyncClient) -> None:
    create_headers = {**headers("demo-organizer"), "Idempotency-Key": "create-replay-key"}
    body = {
        "title": "Idempotent dinner",
        "location_label": "Boston, MA",
        "latitude": 42.3601,
        "longitude": -71.0589,
    }

    first = await client.post("/api/v1/plans", headers=create_headers, json=body)
    replay = await client.post("/api/v1/plans", headers=create_headers, json=body)
    assert first.status_code == 200
    assert replay.status_code == 200
    assert replay.headers["X-Idempotent-Replay"] == "true"
    assert replay.json()["data"]["plan"]["id"] == first.json()["data"]["plan"]["id"]

    async with SessionFactory() as session:
        matching = list((await session.scalars(select(Plan).where(Plan.title == body["title"]))).all())
        assert len(matching) == 1

    conflict = await client.post(
        "/api/v1/plans",
        headers=create_headers,
        json={**body, "title": "Changed payload"},
    )
    assert conflict.status_code == 409
    assert conflict.json()["error"]["code"] == "idempotency_conflict"

    isolated = await client.post(
        "/api/v1/plans",
        headers={**headers("demo-guest"), "Idempotency-Key": "create-replay-key"},
        json={**body, "title": "Guest payload"},
    )
    assert isolated.status_code == 200

    _idempotency_500_calls["count"] = 0
    failure_headers = {"Idempotency-Key": "five-hundred-key"}
    failure_headers.update(headers("demo-organizer"))
    failed = await client.post("/api/v1/__test/idempotency-500", headers=failure_headers, json={})
    recovered = await client.post("/api/v1/__test/idempotency-500", headers=failure_headers, json={})
    assert failed.status_code == 503
    assert recovered.status_code == 200
    assert "X-Idempotent-Replay" not in recovered.headers
    assert _idempotency_500_calls["count"] == 2


@pytest.mark.asyncio
async def test_concurrent_same_key_plan_creation_executes_once(client: AsyncClient) -> None:
    request_headers = {
        **headers("demo-organizer"),
        "Idempotency-Key": "concurrent-plan-create-key",
    }
    payload = {
        "title": "Concurrent idempotency dinner",
        "location_label": "Fixture location",
        "latitude": 42.36,
        "longitude": -71.06,
    }

    first, second = await asyncio.gather(
        client.post("/api/v1/plans", headers=request_headers, json=payload),
        client.post("/api/v1/plans", headers=request_headers, json=payload),
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert sorted(
        [first.headers.get("X-Idempotent-Replay"), second.headers.get("X-Idempotent-Replay")],
        key=lambda value: value or "",
    ) == [None, "true"]
    async with SessionFactory() as session:
        count = await session.scalar(
            select(func.count()).select_from(Plan).where(Plan.title == payload["title"])
        )
    assert count == 1


@pytest.mark.asyncio
async def test_public_errors_do_not_enter_idempotency_cache(client: AsyncClient) -> None:
    request_headers = {
        "Authorization": "Bearer attacker-selected-value",
        "Idempotency-Key": "public-error-key",
    }
    first = await client.post(
        "/api/v1/access/validate", headers=request_headers, json={"code": "not-an-invite"}
    )
    second = await client.post(
        "/api/v1/access/validate", headers=request_headers, json={"code": "not-an-invite"}
    )

    assert first.status_code == 404
    assert second.status_code == 404
    assert "X-Idempotent-Replay" not in second.headers
    valid = await client.post(
        "/api/v1/access/validate",
        headers=request_headers,
        json={"code": "tableus-beta"},
    )
    assert valid.status_code == 200
    assert "X-Idempotent-Replay" not in valid.headers
    assert len(app.state.idempotency_cache) == 0


@pytest.mark.asyncio
async def test_idempotency_replay_requires_a_current_approved_profile(client: AsyncClient) -> None:
    profile_id = "stale-replay-profile"
    async with SessionFactory() as session:
        session.add(
            Profile(
                id=profile_id,
                display_name="Replay Profile",
                email_hash=hash_value("stale-replay@example.test"),
            )
        )
        await session.commit()

    request_headers = {**headers(profile_id), "Idempotency-Key": "profile-patch-replay"}
    first = await client.patch(
        "/api/v1/me", headers=request_headers, json={"display_name": "Updated Profile"}
    )
    assert first.status_code == 200

    async with SessionFactory() as session:
        profile = await session.get(Profile, profile_id)
        assert profile is not None
        await session.delete(profile)
        await session.commit()

    replay = await client.patch(
        "/api/v1/me", headers=request_headers, json={"display_name": "Updated Profile"}
    )
    assert replay.status_code == 403
    assert "X-Idempotent-Replay" not in replay.headers


@pytest.mark.asyncio
async def test_connection_retry_reloads_current_taste_sharing_state(
    client: AsyncClient,
) -> None:
    requester_id = "connection-retry-requester"
    target_id = "connection-retry-target"
    async with SessionFactory() as session:
        session.add_all(
            [
                Profile(
                    id=requester_id,
                    display_name="Connection Requester",
                    email_hash=hash_value("connection-requester@example.test"),
                ),
                Profile(
                    id=target_id,
                    display_name="Connection Target",
                    email_hash=hash_value("connection-target@example.test"),
                    taste_profile="Private after revocation",
                    share_taste=True,
                ),
            ]
        )
        await session.commit()

    request_headers = {
        **headers(requester_id),
        "Idempotency-Key": "connection-current-consent",
    }
    first = await client.post(
        "/api/v1/connections",
        headers=request_headers,
        json={"profile_id": target_id},
    )
    assert first.status_code == 200
    assert first.json()["data"]["taste_profile"] == "Private after revocation"

    disabled = await client.patch(
        "/api/v1/me",
        headers=headers(target_id),
        json={"share_taste": False},
    )
    assert disabled.status_code == 200

    retried = await client.post(
        "/api/v1/connections",
        headers=request_headers,
        json={"profile_id": target_id},
    )
    assert retried.status_code == 200
    assert retried.json()["data"]["taste_profile"] is None
    assert "X-Idempotent-Replay" not in retried.headers


@pytest.mark.asyncio
async def test_rotating_unverified_headers_cannot_bypass_source_limit(
    client: AsyncClient,
) -> None:
    limited = None
    for index in range(240):
        response = await client.post(
            "/api/v1/access/validate",
            headers={
                "Authorization": f"Bearer invalid-{index}",
                "X-Demo-User-ID": f"rotating-{index}",
            },
            json={"code": "not-an-invite"},
        )
        if response.status_code == 429:
            limited = response
            break
        assert response.status_code == 404

    assert limited is not None
    assert limited.status_code == 429
    assert limited.json()["error"]["code"] == "rate_limited"
    assert app.state.request_rate_limiter.source_count == 1

    ready = await client.get("/health/ready")
    assert ready.status_code == 200


@pytest.mark.asyncio
async def test_cors_preflight_cannot_bypass_outer_request_admission(
    client: AsyncClient,
) -> None:
    preflight_headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    for _ in range(120):
        response = await client.options("/api/v1/plans", headers=preflight_headers)
        assert response.status_code == 200

    limited = await client.options("/api/v1/plans", headers=preflight_headers)

    assert limited.status_code == 429
    assert limited.json()["error"]["code"] == "rate_limited"
    assert limited.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"


@pytest.mark.asyncio
async def test_account_export_and_deletion_readiness(client: AsyncClient) -> None:
    owner_id = "account-control-owner"
    member_id = "account-control-member"
    async with SessionFactory() as session:
        owner = Profile(
            id=owner_id,
            display_name="Account Owner",
            email_hash=hash_value("account-owner@example.test"),
        )
        member = Profile(
            id=member_id,
            display_name="Account Member",
            email_hash=hash_value("account-member@example.test"),
            taste_profile="Bright flavors",
            share_taste=True,
        )
        invite = Invite(code_hash=hash_value("account-control-invite"), max_uses=1, use_count=1)
        session.add_all([owner, member, invite])
        await session.flush()
        plan = Plan(
            organizer_id=owner.id,
            title="Account control dinner",
            share_token_hash=hash_value("account-control-share-token"),
            location_label="Madison, WI",
            latitude=43.0748,
            longitude=-89.3848,
        )
        session.add(plan)
        await session.flush()
        run = RecommendationRun(plan_id=plan.id, query="quiet dinner", provider="fixture")
        session.add(run)
        await session.flush()
        event = PlanEvent(
            plan_id=plan.id,
            actor_id=member.id,
            event_type="constraints.updated",
            payload={"safe": True},
        )
        session.add_all(
            [
                Connection(profile_id=member.id, connected_profile_id=owner.id),
                Review(
                    profile_id=member.id,
                    restaurant_name="Export Cafe",
                    review_text="A useful export fixture.",
                    rating=4,
                ),
                InviteRedemption(invite_id=invite.id, profile_id=member.id),
                PlanParticipant(
                    plan_id=plan.id,
                    profile_id=owner.id,
                    constraints={},
                ),
                PlanParticipant(
                    plan_id=plan.id,
                    profile_id=member.id,
                    constraints={"notes": "window seat"},
                ),
                Vote(
                    plan_id=plan.id,
                    run_id=run.id,
                    profile_id=member.id,
                    ranking=["candidate-a", "candidate-b", "candidate-c"],
                ),
                event,
            ]
        )
        await session.commit()
        plan_id = plan.id
        event_id = event.id

    control = await client.get("/api/v1/me/account-control", headers=headers(member_id))
    assert control.status_code == 200
    assert control.json()["data"] == {
        "can_delete": True,
        "blockers": [],
        "organized_plan_count": 0,
        "deletion_scope": "application_profile",
        "supabase_auth_removal": "operator_required",
    }

    exported = await client.get("/api/v1/me/export", headers=headers(member_id))
    assert exported.status_code == 200
    data = exported.json()["data"]
    assert data["schema_version"] == "1"
    assert data["profile"]["id"] == member_id
    assert data["connections"] == [{"connected_profile_id": owner_id}]
    assert len(data["reviews"]) == 1
    assert len(data["invite_redemptions"]) == 1
    assert data["plan_memberships"] == [
        {
            "plan_id": plan_id,
            "title": "Account control dinner",
            "status": "collecting",
            "is_organizer": False,
            "constraints": {"notes": "window seat"},
        }
    ]
    assert data["votes"][0]["ranking"] == ["candidate-a", "candidate-b", "candidate-c"]
    assert data["authored_plan_events"][0]["event_type"] == "constraints.updated"
    exported_keys = nested_keys(data)
    for forbidden in ["email_hash", "code_hash", "share_token", "access_token"]:
        assert forbidden not in exported_keys

    missing_confirmation = await client.request(
        "DELETE", "/api/v1/me", headers=headers(member_id)
    )
    assert missing_confirmation.status_code == 422
    incorrect_confirmation = await client.request(
        "DELETE",
        "/api/v1/me",
        headers=headers(member_id),
        json={"confirmation": "delete"},
    )
    assert incorrect_confirmation.status_code == 422

    deleted = await client.request(
        "DELETE",
        "/api/v1/me",
        headers={**headers(member_id), "Idempotency-Key": "delete-account-replay"},
        json={"confirmation": "DELETE"},
    )
    assert deleted.status_code == 200
    assert deleted.json()["data"]["deleted"] is True

    async with SessionFactory() as session:
        assert await session.get(Profile, member_id) is None
        assert await session.get(Plan, plan_id) is not None
        retained_event = await session.get(PlanEvent, event_id)
        assert retained_event is not None
        assert retained_event.actor_id is None

    deletion_replay = await client.request(
        "DELETE",
        "/api/v1/me",
        headers={**headers(member_id), "Idempotency-Key": "delete-account-replay"},
        json={"confirmation": "DELETE"},
    )
    assert deletion_replay.status_code == 200
    assert deletion_replay.headers["X-Idempotent-Replay"] == "true"
    assert deletion_replay.json()["data"]["deleted"] is True

    owner_control = await client.get("/api/v1/me/account-control", headers=headers(owner_id))
    assert owner_control.status_code == 200
    assert owner_control.json()["data"]["can_delete"] is False
    assert owner_control.json()["data"]["blockers"] == ["organized_plans"]
    blocked = await client.request(
        "DELETE",
        "/api/v1/me",
        headers=headers(owner_id),
        json={"confirmation": "DELETE"},
    )
    assert blocked.status_code == 409
    async with SessionFactory() as session:
        assert await session.scalar(select(Profile.id).where(Profile.id == owner_id)) == owner_id
