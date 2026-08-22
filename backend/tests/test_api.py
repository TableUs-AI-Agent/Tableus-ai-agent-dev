from datetime import UTC, datetime, timedelta

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from main import app
from tableus.db import SessionFactory, init_database
from tableus.models import (
    Connection,
    Invite,
    InviteRedemption,
    Plan,
    PlanEvent,
    PlanParticipant,
    Profile,
    RecommendationRun,
    Review,
    Vote,
)
from tableus.security import hash_value, issue_redemption_token


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
