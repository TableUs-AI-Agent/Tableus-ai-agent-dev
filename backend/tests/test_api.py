import json

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select

from main import app
from tableus import limits, telemetry
from tableus.config import get_settings
from tableus.db import SessionFactory, init_database
from tableus.models import Plan, PlanParticipant, Profile
from tableus.providers.base import ProviderError
from tableus.providers.deterministic import DeterministicAiProvider

BOSTON = {"location_label": "Boston, MA", "latitude": 42.3601, "longitude": -71.0589}


@pytest.fixture(scope="module", autouse=True)
async def database() -> None:
    await init_database()


@pytest.fixture
async def client():
    limits.reset()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value


def as_user(user_id: str) -> dict[str, str]:
    return {"X-Demo-User-ID": user_id}


async def new_profile(client: AsyncClient, user_id: str, name: str = "Guest") -> None:
    response = await client.put("/api/v1/me", headers=as_user(user_id), json={"display_name": name})
    assert response.status_code == 200, response.text


async def new_plan(client: AsyncClient, organizer: str = "demo-organizer", **body) -> dict:
    response = await client.post(
        "/api/v1/plans", headers=as_user(organizer), json={"title": "Friday dinner", **BOSTON, **body}
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def join(client: AsyncClient, created: dict, user_id: str) -> dict:
    response = await client.post(
        f"/api/v1/plans/{created['plan']['id']}/join",
        headers=as_user(user_id),
        json={"share_token": created["share_token"]},
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_errors_use_one_envelope(client: AsyncClient) -> None:
    missing = await client.get("/api/v1/plans/does-not-exist", headers=as_user("demo-organizer"))
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "http_404"
    assert missing.json()["request_id"]

    invalid = await client.post("/api/v1/plans", headers=as_user("demo-organizer"), json={})
    assert invalid.status_code == 422
    assert invalid.json()["error"]["code"] == "validation_error"


async def test_first_sign_in_creates_a_profile_with_standing_tastes(client: AsyncClient) -> None:
    before = await client.get("/api/v1/me", headers=as_user("new-person"))
    assert before.status_code == 404

    created = await client.put(
        "/api/v1/me",
        headers=as_user("new-person"),
        json={"display_name": "  Sam   Kwak ", "taste_profile": "Spicy food, no shellfish"},
    )
    assert created.status_code == 200
    me = created.json()["data"]
    assert me["display_name"] == "Sam Kwak"
    assert me["taste_profile"] == "Spicy food, no shellfish"
    assert me["can_create_plans"] is True

    renamed = await client.put(
        "/api/v1/me", headers=as_user("new-person"), json={"display_name": "Sam"}
    )
    assert renamed.json()["data"]["taste_profile"] == "Spicy food, no shellfish"


async def test_complete_shared_plan_flow(client: AsyncClient) -> None:
    created = await new_plan(client)
    plan_id = created["plan"]["id"]
    assert created["plan"]["share_token"] == created["share_token"]

    listed = await client.get("/api/v1/plans", headers=as_user("demo-organizer"))
    summary = next(item for item in listed.json()["data"] if item["id"] == plan_id)
    assert summary["participant_count"] == 1
    assert summary["viewer_is_organizer"] is True

    too_few = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations", headers=as_user("demo-organizer"), json={}
    )
    assert too_few.status_code == 409

    joined = await join(client, created, "demo-guest")
    assert len(joined["participants"]) == 2
    assert joined["share_token"] == created["share_token"]

    saved = await client.patch(
        f"/api/v1/plans/{plan_id}/constraints",
        headers=as_user("demo-guest"),
        json={"dietary_notes": ["vegetarian"], "notes": "somewhere we can talk"},
    )
    assert saved.status_code == 200

    generated = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations",
        headers=as_user("demo-organizer"),
        json={"query": "group-friendly dinner"},
    )
    assert generated.status_code == 200, generated.text
    plan = generated.json()["data"]
    assert plan["status"] == "voting"
    assert len(plan["candidates"]) == 4
    assert all(item["reasoning"] and item["place"]["name"] for item in plan["candidates"])
    ids = [item["id"] for item in plan["candidates"][:3]]

    for user_id, ranking in [("demo-organizer", ids), ("demo-guest", [ids[1], ids[0], ids[2]])]:
        voted = await client.put(
            f"/api/v1/plans/{plan_id}/vote", headers=as_user(user_id), json={"ranking": ranking}
        )
        assert voted.status_code == 200
    plan = voted.json()["data"]
    assert all(person["has_voted"] for person in plan["participants"])
    assert plan["my_vote"] == [ids[1], ids[0], ids[2]]

    guest_finalize = await client.post(
        f"/api/v1/plans/{plan_id}/finalize", headers=as_user("demo-guest"), json={}
    )
    assert guest_finalize.status_code == 403

    finalized = await client.post(
        f"/api/v1/plans/{plan_id}/finalize", headers=as_user("demo-organizer"), json={}
    )
    assert finalized.status_code == 200
    # Both rankings give ids[0] and ids[1] five points; the AI's order breaks the tie.
    assert finalized.json()["data"]["finalized_candidate_id"] == ids[0]

    locked = await client.patch(
        f"/api/v1/plans/{plan_id}/constraints", headers=as_user("demo-guest"), json={"notes": "x"}
    )
    assert locked.status_code == 409

    reopened = await client.post(
        f"/api/v1/plans/{plan_id}/reopen", headers=as_user("demo-organizer")
    )
    assert reopened.json()["data"]["status"] == "voting"

    changed = await client.patch(
        f"/api/v1/plans/{plan_id}/constraints", headers=as_user("demo-guest"), json={"notes": "x"}
    )
    assert changed.json()["data"]["status"] == "collecting"
    assert changed.json()["data"]["candidates"] == []


async def test_conflicting_cuisine_wishes_still_produce_recommendations(
    client: AsyncClient,
) -> None:
    created = await new_plan(client)
    plan_id = created["plan"]["id"]
    await join(client, created, "demo-guest")
    for user_id, cuisine in [("demo-organizer", "Italian"), ("demo-guest", "Japanese")]:
        await client.patch(
            f"/api/v1/plans/{plan_id}/constraints",
            headers=as_user(user_id),
            json={"cuisines": [cuisine], "max_price_level": 1},
        )

    generated = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations", headers=as_user("demo-organizer"), json={}
    )

    assert generated.status_code == 200, generated.text
    names = {item["place"]["cuisine"] for item in generated.json()["data"]["candidates"]}
    assert {"Italian", "Japanese"} <= names


async def test_outsiders_and_stale_links_are_turned_away(client: AsyncClient) -> None:
    await new_profile(client, "outsider")
    created = await new_plan(client)
    plan_id = created["plan"]["id"]

    hidden = await client.get(f"/api/v1/plans/{plan_id}", headers=as_user("outsider"))
    assert hidden.status_code == 403

    rotated = await client.post(
        f"/api/v1/plans/{plan_id}/share-token/rotate", headers=as_user("demo-organizer")
    )
    assert rotated.status_code == 200
    stale = await client.post(
        f"/api/v1/plans/{plan_id}/join",
        headers=as_user("outsider"),
        json={"share_token": created["share_token"]},
    )
    assert stale.status_code == 404


async def test_plans_hold_at_most_eight_people(client: AsyncClient) -> None:
    created = await new_plan(client)
    for index in range(7):
        await new_profile(client, f"crowd-{index}")
        await join(client, created, f"crowd-{index}")
    await new_profile(client, "crowd-late")
    full = await client.post(
        f"/api/v1/plans/{created['plan']['id']}/join",
        headers=as_user("crowd-late"),
        json={"share_token": created["share_token"]},
    )
    assert full.status_code == 409


async def test_plan_creation_respects_the_creator_allowlist(
    client: AsyncClient, monkeypatch
) -> None:
    monkeypatch.setattr(get_settings(), "tableus_plan_creator_emails", "demo-guest@tableus.local")
    refused = await client.post(
        "/api/v1/plans", headers=as_user("demo-organizer"), json={"title": "Hi", **BOSTON}
    )
    assert refused.status_code == 403
    me = await client.get("/api/v1/me", headers=as_user("demo-organizer"))
    assert me.json()["data"]["can_create_plans"] is False
    allowed = await client.post(
        "/api/v1/plans", headers=as_user("demo-guest"), json={"title": "Hi", **BOSTON}
    )
    assert allowed.status_code == 200


async def test_ai_failure_leaves_the_plan_unchanged(client: AsyncClient, monkeypatch) -> None:
    created = await new_plan(client)
    plan_id = created["plan"]["id"]
    await join(client, created, "demo-guest")

    async def broken(self, *args):
        raise ProviderError("Gemini is temporarily unavailable")

    monkeypatch.setattr(DeterministicAiProvider, "recommend", broken)
    failed = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations", headers=as_user("demo-organizer"), json={}
    )
    assert failed.status_code == 503
    plan = await client.get(f"/api/v1/plans/{plan_id}", headers=as_user("demo-organizer"))
    assert plan.json()["data"]["status"] == "collecting"


async def test_recommendations_are_rate_limited_per_person(
    client: AsyncClient, monkeypatch
) -> None:
    monkeypatch.setattr(get_settings(), "recommendations_per_hour", 1)
    created = await new_plan(client)
    plan_id = created["plan"]["id"]
    await join(client, created, "demo-guest")
    url = f"/api/v1/plans/{plan_id}/recommendations"
    assert (await client.post(url, headers=as_user("demo-organizer"), json={})).status_code == 200
    assert (await client.post(url, headers=as_user("demo-organizer"), json={})).status_code == 429
    assert (await client.post(url, headers=as_user("demo-guest"), json={})).status_code == 200


async def test_only_the_organizer_deletes_a_plan(client: AsyncClient) -> None:
    created = await new_plan(client)
    plan_id = created["plan"]["id"]
    await join(client, created, "demo-guest")
    refused = await client.delete(f"/api/v1/plans/{plan_id}", headers=as_user("demo-guest"))
    assert refused.status_code == 403
    deleted = await client.delete(f"/api/v1/plans/{plan_id}", headers=as_user("demo-organizer"))
    assert deleted.status_code == 200
    gone = await client.get(f"/api/v1/plans/{plan_id}", headers=as_user("demo-organizer"))
    assert gone.status_code == 404


async def test_deleting_an_account_hands_shared_plans_to_the_next_person(
    client: AsyncClient,
) -> None:
    await new_profile(client, "leaving", "Leaving")
    await new_profile(client, "staying", "Staying")
    shared = await new_plan(client, organizer="leaving")
    await join(client, shared, "staying")
    solo = await new_plan(client, organizer="leaving")

    deleted = await client.delete("/api/v1/me", headers=as_user("leaving"))
    assert deleted.status_code == 200

    async with SessionFactory() as session:
        assert await session.get(Profile, "leaving") is None
        assert await session.get(Plan, solo["plan"]["id"]) is None
        kept = await session.get(Plan, shared["plan"]["id"])
        assert kept is not None and kept.organizer_id == "staying"
        remaining = await session.scalar(
            select(func.count()).select_from(PlanParticipant).where(
                PlanParticipant.plan_id == kept.id
            )
        )
        assert remaining == 1


async def test_health_endpoints(client: AsyncClient) -> None:
    assert (await client.get("/health")).json()["status"] == "ok"
    assert (await client.get("/health/ready")).json()["status"] == "ready"


async def test_a_leaving_guest_bumps_the_plan_so_others_refresh(client: AsyncClient) -> None:
    await new_profile(client, "brief-guest")
    created = await new_plan(client)
    plan_id = created["plan"]["id"]
    await join(client, created, "brief-guest")
    before = (await client.get(f"/api/v1/plans/{plan_id}/revision", headers=as_user("demo-organizer"))).json()
    assert (await client.delete("/api/v1/me", headers=as_user("brief-guest"))).status_code == 200
    after = (await client.get(f"/api/v1/plans/{plan_id}/revision", headers=as_user("demo-organizer"))).json()
    assert after["data"]["updated_at"] != before["data"]["updated_at"]


async def test_plan_reads_that_refresh_places_are_rate_limited(
    client: AsyncClient, monkeypatch
) -> None:
    created = await new_plan(client)
    plan_id = created["plan"]["id"]
    await join(client, created, "demo-guest")
    await client.post(f"/api/v1/plans/{plan_id}/recommendations", headers=as_user("demo-organizer"), json={})
    monkeypatch.setattr(get_settings(), "plan_reads_per_hour", 2)
    limits.reset()
    url = f"/api/v1/plans/{plan_id}"
    assert (await client.get(url, headers=as_user("demo-guest"))).status_code == 200
    assert (await client.get(url, headers=as_user("demo-guest"))).status_code == 200
    assert (await client.get(url, headers=as_user("demo-guest"))).status_code == 429
    # Revision polling never touches Places and stays available.
    assert (await client.get(f"{url}/revision", headers=as_user("demo-guest"))).status_code == 200


@pytest.mark.parametrize(("status", "allowed"), [(200, True), (403, False), (404, False)])
async def test_new_profiles_require_a_live_sign_in(monkeypatch, status, allowed) -> None:
    import httpx
    from fastapi import HTTPException

    from tableus import accounts

    settings = get_settings()
    monkeypatch.setattr(settings, "tableus_auth_mode", "supabase")
    monkeypatch.setattr(settings, "supabase_url", "https://example.supabase.co")
    monkeypatch.setattr(settings, "supabase_service_role_key", type(settings.supabase_service_role_key)("service"))
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(status, json={})

    real_client = httpx.AsyncClient
    monkeypatch.setattr(
        accounts.httpx, "AsyncClient",
        lambda **kwargs: real_client(transport=httpx.MockTransport(handler), **kwargs),
    )
    if allowed:
        await accounts.confirm_sign_in_exists("user-token")
    else:
        with pytest.raises(HTTPException) as captured:
            await accounts.confirm_sign_in_exists("user-token")
        assert captured.value.status_code == 401
    assert seen[0].url.path == "/auth/v1/user"
    assert seen[0].headers["Authorization"] == "Bearer user-token"


async def test_place_photos_are_signed_redirects_cached_per_place(
    client: AsyncClient, monkeypatch
) -> None:
    from tableus import photos
    from tableus.providers.deterministic import DeterministicPlacesProvider

    photos.reset()
    monkeypatch.setattr(get_settings(), "google_maps_api_key", "places-key")
    calls: list[str] = []

    async def photo_uri(self, name: str) -> str:
        calls.append(name)
        return "https://lh3.googleusercontent.com/photo"

    monkeypatch.setattr(DeterministicPlacesProvider, "photo_uri", photo_uri)
    path = photos.photo_path("places/place1/photos/a")
    assert path and path.startswith("/api/v1/place-photos?")
    assert "places-key" not in path

    first = await client.get(path)
    second = await client.get(path)
    assert first.status_code == second.status_code == 302
    assert first.headers["location"] == "https://lh3.googleusercontent.com/photo"
    assert calls == ["places/place1/photos/a"]

    forged = await client.get(path.replace("place1", "place2"))
    unsigned = await client.get("/api/v1/place-photos", params={"name": "places/p/photos/a", "sig": "0"})
    assert forged.status_code == unsigned.status_code == 404
    assert photos.photo_path("not-a-photo-name") is None
    assert len(calls) == 1
    photos.reset()


async def test_fixture_places_have_no_photo_link(client: AsyncClient) -> None:
    created = await new_plan(client)
    await new_profile(client, "demo-guest")
    await join(client, created, "demo-guest")
    response = await client.post(
        f"/api/v1/plans/{created['plan']['id']}/recommendations",
        headers=as_user("demo-organizer"), json={"query": ""},
    )
    assert response.status_code == 200, response.text
    place = response.json()["data"]["candidates"][0]["place"]
    assert place["photo_url"] is None
    assert place["photo_credits"] == []


async def test_plan_flow_sends_anonymous_counts_only_when_configured(
    client: AsyncClient, monkeypatch
) -> None:
    sent: list[dict] = []
    monkeypatch.setattr(telemetry, "_dispatch", lambda host, payload: sent.append(payload))

    await new_plan(client)
    assert sent == []

    monkeypatch.setattr(get_settings(), "posthog_project_key", "phc_test")
    created = await new_plan(client, title="Ana's birthday")
    plan_id = created["plan"]["id"]
    await join(client, created, "demo-guest")
    url = f"/api/v1/plans/{plan_id}"
    await client.patch(
        f"{url}/constraints", headers=as_user("demo-guest"), json={"notes": "near Ana's place"}
    )
    picks = await client.post(
        f"{url}/recommendations", headers=as_user("demo-organizer"), json={"query": "ramen"}
    )
    ids = [item["id"] for item in picks.json()["data"]["candidates"][:3]]
    await client.put(f"{url}/vote", headers=as_user("demo-guest"), json={"ranking": ids})
    await client.post(f"{url}/finalize", headers=as_user("demo-organizer"), json={})

    assert [item["event"] for item in sent] == [
        "plan_started", "friend_joined", "picks_shown", "vote_cast", "plan_locked",
    ]
    assert {item["distinct_id"] for item in sent} == {sent[0]["distinct_id"]}
    assert sent[1]["properties"]["people"] == 2
    assert sent[4]["properties"]["votes"] == 1
    raw = json.dumps(sent)
    for private in (plan_id, "Ana", "ramen", "demo-guest", "demo-organizer", "@"):
        assert private not in raw
