from datetime import UTC, datetime, timedelta

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
from tableus.db import SessionFactory, init_database
from tableus.models import Invite
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
