import io
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest
from fastapi.responses import JSONResponse
from httpx import ASGITransport, AsyncClient
from PIL import Image
from sqlalchemy import func, select

from main import app
from tableus import api as tableus_api
from tableus.db import SessionFactory, init_database
from tableus.models import (
    Connection,
    Invite,
    InviteRedemption,
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
from tableus.security import hash_value, issue_redemption_token

_idempotency_500_calls = {"count": 0}


@app.post("/__test/idempotency-500")
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
                model="gemini-2.5-flash-lite",
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
        model = "gemini-2.5-flash-lite"

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
    app.state.idempotency_cache = {}
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
    failed = await client.post("/__test/idempotency-500", headers=failure_headers, json={})
    recovered = await client.post("/__test/idempotency-500", headers=failure_headers, json={})
    assert failed.status_code == 503
    assert recovered.status_code == 200
    assert "X-Idempotent-Replay" not in recovered.headers
    assert _idempotency_500_calls["count"] == 2


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
        headers=headers(member_id),
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
