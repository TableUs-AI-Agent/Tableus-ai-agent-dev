from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from main import app
from tableus.db import SessionFactory, init_database
from tableus.models import (
    Candidate,
    Plan,
    PlanEvent,
    PlanParticipant,
    Profile,
    RecommendationRun,
    RunContributor,
    Vote,
)
from tableus.security import hash_value


@pytest.fixture(scope="module", autouse=True)
async def database() -> None:
    await init_database()


@pytest.fixture
async def client() -> AsyncClient:
    app.state.request_rate_limiter.clear()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value


async def profile(session, prefix: str) -> str:
    subject = f"{prefix}-{uuid4()}"
    session.add(Profile(id=subject, display_name=prefix, email_hash=hash_value(subject)))
    return subject


def headers(subject: str) -> dict[str, str]:
    return {"X-Demo-User-ID": subject}


@pytest.mark.asyncio
async def test_contributor_deletion_removes_historical_run_but_preserves_independent_run(
    client: AsyncClient,
) -> None:
    async with SessionFactory() as session:
        owner = await profile(session, "content-owner")
        departing = await profile(session, "content-departing")
        other = await profile(session, "content-other")
        await session.flush()
        plan = Plan(
            organizer_id=owner, metadata_author_id=owner, metadata_provenance="known",
            title="Surviving title", share_token_hash=hash_value(str(uuid4())),
            location_label="Chicago", latitude=41.8, longitude=-87.6,
        )
        session.add(plan)
        await session.flush()
        session.add_all([
            PlanParticipant(plan_id=plan.id, profile_id=owner, constraints={}),
            PlanParticipant(plan_id=plan.id, profile_id=departing, constraints={"notes": "private"}),
            PlanParticipant(plan_id=plan.id, profile_id=other, constraints={"notes": "other"}),
        ])
        affected = RecommendationRun(
            plan_id=plan.id, query="private dinner", provider="fixture",
            requester_id=owner, location_author_id=owner,
            location_version=1, provenance="known",
        )
        independent = RecommendationRun(
            plan_id=plan.id, query="later dinner", provider="fixture",
            requester_id=other, location_author_id=owner,
            location_version=1, provenance="known",
        )
        session.add_all([affected, independent])
        await session.flush()
        old_candidate = Candidate(run_id=affected.id, place_id="old", match_score=1, reasoning="private reasoning", rank=1)
        current_candidate = Candidate(run_id=independent.id, place_id="current", match_score=1, reasoning="other reasoning", rank=1)
        session.add_all([
            RunContributor(run_id=affected.id, profile_id=departing),
            RunContributor(run_id=affected.id, profile_id=owner),
            RunContributor(run_id=independent.id, profile_id=other),
            RunContributor(run_id=independent.id, profile_id=owner),
            old_candidate, current_candidate,
        ])
        await session.flush()
        session.add(Vote(plan_id=plan.id, run_id=affected.id, profile_id=owner, ranking=[old_candidate.id]))
        session.add(PlanEvent(plan_id=plan.id, actor_id=owner, event_type="recommendations.generated", payload={"run_id": affected.id}))
        plan.active_run_id = independent.id
        plan.status = "voting"
        plan_id, affected_id, independent_id = plan.id, affected.id, independent.id
        await session.commit()

    response = await client.request("DELETE", "/api/v1/me", headers=headers(departing), json={"confirmation": "DELETE"})
    assert response.status_code == 200, response.text
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        assert plan is not None and plan.active_run_id == independent_id
        assert plan.title == "Surviving title" and plan.status == "voting"
        assert await session.get(RecommendationRun, affected_id) is None
        assert await session.get(RecommendationRun, independent_id) is not None
        assert not (await session.scalars(select(Vote).where(Vote.run_id == affected_id))).all()
        assert not (await session.scalars(select(Candidate).where(Candidate.run_id == affected_id))).all()
        event = await session.scalar(select(PlanEvent).where(PlanEvent.plan_id == plan_id))
        assert event and event.payload == {"run_id": None}
        remaining = list((await session.scalars(select(PlanParticipant).where(PlanParticipant.plan_id == plan_id))).all())
        assert {row.profile_id for row in remaining} == {owner, other}
        assert any(row.constraints == {"notes": "other"} for row in remaining)


@pytest.mark.asyncio
async def test_metadata_author_deletion_requires_replacement(client: AsyncClient) -> None:
    async with SessionFactory() as session:
        former = await profile(session, "content-former")
        owner = await profile(session, "content-new-owner")
        await session.flush()
        plan = Plan(
            organizer_id=owner, metadata_author_id=former, metadata_provenance="known",
            title="Former title", share_token_hash=hash_value(str(uuid4())),
            location_label="Former location", latitude=41.8, longitude=-87.6,
        )
        session.add(plan)
        await session.flush()
        session.add_all([
            PlanParticipant(plan_id=plan.id, profile_id=former, constraints={}),
            PlanParticipant(plan_id=plan.id, profile_id=owner, constraints={"notes": "keep"}),
        ])
        plan_id = plan.id
        await session.commit()
    deleted = await client.request("DELETE", "/api/v1/me", headers=headers(former), json={"confirmation": "DELETE"})
    assert deleted.status_code == 200, deleted.text
    detail = await client.get(f"/api/v1/plans/{plan_id}", headers=headers(owner))
    assert detail.status_code == 200
    assert detail.json()["data"]["metadata_needs_replacement"] is True
    assert detail.json()["data"]["location_label"] == ""
    replacement = await client.patch(
        f"/api/v1/plans/{plan_id}/metadata", headers=headers(owner),
        json={"title": "New title", "location_label": "Chicago", "latitude": 41.8, "longitude": -87.6},
    )
    assert replacement.status_code == 200, replacement.text
    assert replacement.json()["data"]["metadata_needs_replacement"] is False
    assert replacement.json()["data"]["title"] == "New title"


@pytest.mark.asyncio
async def test_generated_provenance_survives_transfer_and_repair_flow(client: AsyncClient) -> None:
    async with SessionFactory() as session:
        creator = await profile(session, "content-creator")
        successor = await profile(session, "content-successor")
        third = await profile(session, "content-third")
        await session.flush()
        plan = Plan(
            organizer_id=creator, metadata_author_id=creator, metadata_provenance="known",
            title="Original dinner", share_token_hash=hash_value(str(uuid4())),
            location_label="Boston", latitude=42.3601, longitude=-71.0589,
        )
        session.add(plan)
        await session.flush()
        session.add_all([
            PlanParticipant(plan_id=plan.id, profile_id=person, constraints={})
            for person in (creator, successor, third)
        ])
        plan_id = plan.id
        await session.commit()

    generated = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations", headers=headers(successor),
        json={"query": "group dinner"},
    )
    assert generated.status_code == 200, generated.text
    async with SessionFactory() as session:
        old = await session.scalar(select(RecommendationRun).where(RecommendationRun.plan_id == plan_id))
        assert old is not None
        assert old.requester_id == successor and old.location_author_id == creator
        assert old.location_version == 1 and old.provenance == "known"
        contributor_ids = set((await session.scalars(
            select(RunContributor.profile_id).where(RunContributor.run_id == old.id)
        )).all())
        assert contributor_ids == {creator, successor, third}
        old_id = old.id

    transferred = await client.post(
        f"/api/v1/plans/{plan_id}/transfer-ownership", headers=headers(creator),
        json={"recipient_profile_id": successor},
    )
    assert transferred.status_code == 200, transferred.text
    deleted = await client.request(
        "DELETE", "/api/v1/me", headers=headers(creator), json={"confirmation": "DELETE"},
    )
    assert deleted.status_code == 200, deleted.text
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        assert plan is not None and plan.organizer_id == successor
        assert plan.status == "collecting" and plan.active_run_id is None
        assert plan.metadata_needs_replacement is True
        assert await session.get(RecommendationRun, old_id) is None
        members = set((await session.scalars(
            select(PlanParticipant.profile_id).where(PlanParticipant.plan_id == plan_id)
        )).all())
        assert members == {successor, third}
    blocked = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations", headers=headers(successor),
        json={"query": "new dinner"},
    )
    assert blocked.status_code == 409
    repaired = await client.patch(
        f"/api/v1/plans/{plan_id}/metadata", headers=headers(successor),
        json={"title": "New dinner", "location_label": "Boston", "latitude": 42.3601, "longitude": -71.0589},
    )
    assert repaired.status_code == 200, repaired.text
    regenerated = await client.post(
        f"/api/v1/plans/{plan_id}/recommendations", headers=headers(successor),
        json={"query": "new dinner"},
    )
    assert regenerated.status_code == 200, regenerated.text
    async with SessionFactory() as session:
        new = await session.scalar(select(RecommendationRun).where(RecommendationRun.plan_id == plan_id))
        assert new is not None and new.id != old_id
        assert new.requester_id == successor and new.location_author_id == successor
        assert new.location_version == 3
        contributors = set((await session.scalars(
            select(RunContributor.profile_id).where(RunContributor.run_id == new.id)
        )).all())
        assert contributors == {successor, third}


@pytest.mark.asyncio
async def test_historical_location_author_is_cleaned_after_membership_ended(
    client: AsyncClient,
) -> None:
    async with SessionFactory() as session:
        former = await profile(session, "content-location-author")
        owner = await profile(session, "content-location-owner")
        other = await profile(session, "content-location-other")
        await session.flush()
        plan = Plan(
            organizer_id=owner, metadata_author_id=owner, metadata_provenance="known",
            metadata_version=2, title="Current location", share_token_hash=hash_value(str(uuid4())),
            location_label="Boston", latitude=42.3601, longitude=-71.0589,
        )
        session.add(plan)
        await session.flush()
        session.add_all([
            PlanParticipant(plan_id=plan.id, profile_id=owner, constraints={}),
            PlanParticipant(plan_id=plan.id, profile_id=other, constraints={}),
        ])
        old = RecommendationRun(
            plan_id=plan.id, query="former location", provider="fixture",
            requester_id=owner, location_author_id=former, location_version=1,
            provenance="known",
        )
        current = RecommendationRun(
            plan_id=plan.id, query="current location", provider="fixture",
            requester_id=owner, location_author_id=owner, location_version=2,
            provenance="known",
        )
        session.add_all([old, current])
        await session.flush()
        session.add_all([
            RunContributor(run_id=old.id, profile_id=owner),
            RunContributor(run_id=current.id, profile_id=owner),
            RunContributor(run_id=current.id, profile_id=other),
        ])
        plan.active_run_id = current.id
        plan.status = "voting"
        old_id, current_id, plan_id = old.id, current.id, plan.id
        await session.commit()
    deleted = await client.request(
        "DELETE", "/api/v1/me", headers=headers(former), json={"confirmation": "DELETE"},
    )
    assert deleted.status_code == 200, deleted.text
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        assert plan is not None and plan.active_run_id == current_id
        assert plan.metadata_needs_replacement is False
        assert await session.get(RecommendationRun, old_id) is None
        assert await session.get(RecommendationRun, current_id) is not None


@pytest.mark.asyncio
async def test_unknown_legacy_content_is_removed_on_member_deletion(client: AsyncClient) -> None:
    async with SessionFactory() as session:
        owner = await profile(session, "content-legacy-owner")
        departing = await profile(session, "content-legacy-member")
        await session.flush()
        plan = Plan(
            organizer_id=owner, title="Legacy authored title",
            share_token_hash=hash_value(str(uuid4())), location_label="Legacy location",
            latitude=41.8, longitude=-87.6,
        )
        session.add(plan)
        await session.flush()
        session.add_all([
            PlanParticipant(plan_id=plan.id, profile_id=owner, constraints={"notes": "keep"}),
            PlanParticipant(plan_id=plan.id, profile_id=departing, constraints={"notes": "remove"}),
        ])
        run = RecommendationRun(plan_id=plan.id, query="unknown contributor", provider="fixture")
        session.add(run)
        await session.flush()
        plan.active_run_id = run.id
        plan.status = "voting"
        plan_id, run_id = plan.id, run.id
        await session.commit()
    deleted = await client.request(
        "DELETE", "/api/v1/me", headers=headers(departing), json={"confirmation": "DELETE"},
    )
    assert deleted.status_code == 200, deleted.text
    async with SessionFactory() as session:
        plan = await session.get(Plan, plan_id)
        assert plan is not None and plan.metadata_needs_replacement is True
        assert plan.title != "Legacy authored title" and plan.location_label == ""
        assert plan.status == "collecting" and plan.active_run_id is None
        assert await session.get(RecommendationRun, run_id) is None
