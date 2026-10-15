import secrets
from datetime import UTC, datetime
from typing import Literal, cast

from fastapi import APIRouter, HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .accounts import hand_off_organized_plans, remove_sign_in
from .auth import CurrentIdentity, CurrentProfile, DbSession, can_create_plans
from .config import get_settings
from .limits import check_rate
from .models import Candidate, Plan, PlanParticipant, Profile, RecommendationRun, Vote
from .providers import get_ai_provider, get_places_provider
from .providers.base import Diner, Place, ProviderError
from .ranking import borda_scores, ordered_candidates
from .schemas import (
    CandidateOut,
    ConstraintsIn,
    DeletedOut,
    Envelope,
    FinalizeIn,
    LocationIn,
    LocationOut,
    MeIn,
    MeOut,
    ParticipantOut,
    PlaceOut,
    PlanCreated,
    PlanCreateIn,
    PlanJoinIn,
    PlanOut,
    PlanRevisionOut,
    PlanStatusValue,
    PlanSummaryOut,
    RecommendationIn,
    ShareTokenOut,
    VoteIn,
)
from .security import new_share_token

router = APIRouter(prefix="/api/v1", tags=["v1"])

MAX_PARTICIPANTS = 8


def ok(data, **meta):
    return {"data": data, "meta": meta}


async def _places(method: str, *args):
    """Call the Places provider and turn its failures into user-facing errors."""
    try:
        return await getattr(get_places_provider(), method)(*args)
    except ProviderError as exc:
        if exc.kind == "not_found":
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        raise HTTPException(status_code=503, detail="Restaurant search is unavailable. Try again.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


# ---- Me ---------------------------------------------------------------------


def _me(profile: Profile, identity) -> MeOut:
    return MeOut(
        id=profile.id,
        display_name=profile.display_name,
        taste_profile=profile.taste_profile or "",
        can_create_plans=can_create_plans(identity),
    )


@router.get("/me", response_model=Envelope[MeOut])
async def get_me(identity: CurrentIdentity, profile: CurrentProfile):
    return ok(_me(profile, identity))


@router.put("/me", response_model=Envelope[MeOut])
async def put_me(body: MeIn, identity: CurrentIdentity, session: DbSession):
    """Create the caller's profile on first sign-in, or update it."""
    profile = await session.get(Profile, identity.subject)
    if not profile:
        profile = Profile(id=identity.subject, display_name=body.display_name)
        session.add(profile)
    profile.display_name = body.display_name
    if body.taste_profile is not None:
        profile.taste_profile = body.taste_profile.strip()
    await session.commit()
    return ok(_me(profile, identity))


@router.delete("/me", response_model=Envelope[DeletedOut])
async def delete_me(profile: CurrentProfile, session: DbSession):
    await hand_off_organized_plans(session, profile)
    await session.delete(profile)
    await session.flush()
    # Remove the sign-in before committing so a failure leaves the account intact.
    await remove_sign_in(profile.id)
    await session.commit()
    return ok(DeletedOut(deleted=True))


# ---- Locations --------------------------------------------------------------


@router.post("/locations/resolve", response_model=Envelope[LocationOut])
async def resolve_location(body: LocationIn, profile: CurrentProfile):
    check_rate("location", profile.id, get_settings().location_lookups_per_hour)
    resolved = await _places("resolve_location", body.query)
    return ok(LocationOut(
        place_id=resolved.place_id, label=resolved.label,
        data_provider=cast(Literal["fixture", "google_maps"], resolved.data_provider),
    ))


# ---- Plans ------------------------------------------------------------------


async def _plan(session: AsyncSession, plan_id: str, *, for_update: bool = False) -> Plan:
    statement = select(Plan).where(Plan.id == plan_id)
    if for_update:
        statement = statement.with_for_update().execution_options(populate_existing=True)
    plan = await session.scalar(statement)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


async def _participant(session: AsyncSession, plan_id: str, profile_id: str) -> PlanParticipant:
    participant = await session.scalar(
        select(PlanParticipant).where(
            PlanParticipant.plan_id == plan_id, PlanParticipant.profile_id == profile_id
        )
    )
    if not participant:
        raise HTTPException(status_code=403, detail="Join this plan to see it")
    return participant


def _require_organizer(plan: Plan, profile: Profile) -> None:
    if plan.organizer_id != profile.id:
        raise HTTPException(status_code=403, detail="Only the organizer can do that")


def _require_open(plan: Plan) -> None:
    if plan.status == "finalized":
        raise HTTPException(status_code=409, detail="This plan is locked in. Reopen it first.")


def _reset_choice(plan: Plan) -> None:
    """Inputs changed, so the current options no longer reflect the group."""
    plan.status = "collecting"
    plan.active_run_id = None
    plan.finalized_candidate_id = None
    _touch(plan)


def _touch(plan: Plan) -> None:
    plan.updated_at = datetime.now(UTC)


async def _run_rows(session: AsyncSession, plan: Plan) -> tuple[list[Candidate], list[Vote]]:
    if not plan.active_run_id:
        return [], []
    candidates = (
        await session.scalars(select(Candidate).where(Candidate.run_id == plan.active_run_id))
    ).all()
    votes = (await session.scalars(select(Vote).where(Vote.run_id == plan.active_run_id))).all()
    return list(candidates), list(votes)


async def _plan_out(
    session: AsyncSession, plan: Plan, viewer_id: str, places: list[Place] | None = None
) -> PlanOut:
    rows = (
        await session.execute(
            select(PlanParticipant, Profile)
            .join(Profile, Profile.id == PlanParticipant.profile_id)
            .where(PlanParticipant.plan_id == plan.id)
            .order_by(PlanParticipant.joined_at)
        )
    ).all()
    candidates, votes = await _run_rows(session, plan)
    voters = {vote.profile_id for vote in votes}
    if places is None:
        places = (
            await _places("get_places", [item.place_id for item in candidates]) if candidates else []
        )
    places_by_id = {place.place_id: place for place in places}
    scores = borda_scores(votes)
    return PlanOut(
        id=plan.id,
        title=plan.title,
        organizer_id=plan.organizer_id,
        viewer_is_organizer=plan.organizer_id == viewer_id,
        status=cast(PlanStatusValue, plan.status),
        location_label=plan.location_label,
        latitude=plan.latitude,
        longitude=plan.longitude,
        share_token=plan.share_token,
        participants=[
            ParticipantOut(
                profile_id=profile.id,
                display_name=profile.display_name,
                constraints=participant.constraints or {},
                is_organizer=profile.id == plan.organizer_id,
                has_voted=profile.id in voters,
            )
            for participant, profile in rows
        ],
        candidates=[
            CandidateOut(
                id=candidate.id,
                place=PlaceOut(
                    **{**places_by_id[candidate.place_id].__dict__,
                       "features": list(places_by_id[candidate.place_id].features)}
                ),
                match_score=candidate.match_score,
                reasoning=candidate.reasoning,
                rank=candidate.rank,
                vote_score=scores.get(candidate.id, 0),
            )
            for candidate in sorted(candidates, key=lambda item: item.rank)
            if candidate.place_id in places_by_id
        ],
        my_vote=next((vote.ranking for vote in votes if vote.profile_id == viewer_id), None),
        finalized_candidate_id=plan.finalized_candidate_id,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
    )


async def _current_places(session: AsyncSession, plan: Plan) -> list[Place]:
    """Fetch place details before changing a plan, so a provider failure changes nothing."""
    candidates, _ = await _run_rows(session, plan)
    return await _places("get_places", [item.place_id for item in candidates]) if candidates else []


@router.get("/plans", response_model=Envelope[list[PlanSummaryOut]])
async def list_plans(profile: CurrentProfile, session: DbSession):
    counts = (
        select(PlanParticipant.plan_id, func.count().label("participant_count"))
        .group_by(PlanParticipant.plan_id)
        .subquery()
    )
    rows = (
        await session.execute(
            select(Plan, counts.c.participant_count)
            .join(PlanParticipant, PlanParticipant.plan_id == Plan.id)
            .join(counts, counts.c.plan_id == Plan.id)
            .where(PlanParticipant.profile_id == profile.id)
            .order_by(Plan.updated_at.desc())
        )
    ).all()
    return ok([
        PlanSummaryOut(
            id=plan.id,
            title=plan.title,
            status=cast(PlanStatusValue, plan.status),
            location_label=plan.location_label,
            participant_count=count,
            viewer_is_organizer=plan.organizer_id == profile.id,
            created_at=plan.created_at,
            updated_at=plan.updated_at,
        )
        for plan, count in rows
    ])


@router.post("/plans", response_model=Envelope[PlanCreated])
async def create_plan(
    body: PlanCreateIn, identity: CurrentIdentity, profile: CurrentProfile, session: DbSession
):
    if not can_create_plans(identity):
        raise HTTPException(status_code=403, detail="Starting plans is invite-only for now")
    if body.location_place_id:
        await _places("get_location", body.location_place_id)
    elif get_settings().places_provider_mode == "live":
        raise HTTPException(status_code=422, detail="Pick a location from the search results")
    token = new_share_token()
    plan = Plan(
        organizer_id=profile.id,
        share_token=token,
        title=body.title,
        location_label=body.location_label,
        location_place_id=body.location_place_id,
        latitude=None if body.location_place_id else body.latitude,
        longitude=None if body.location_place_id else body.longitude,
    )
    session.add(plan)
    await session.flush()
    session.add(PlanParticipant(plan_id=plan.id, profile_id=profile.id, constraints={}))
    await session.commit()
    return ok(PlanCreated(plan=await _plan_out(session, plan, profile.id), share_token=token))


@router.get("/plans/{plan_id}", response_model=Envelope[PlanOut])
async def get_plan(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id)
    await _participant(session, plan_id, profile.id)
    return ok(await _plan_out(session, plan, profile.id))


@router.delete("/plans/{plan_id}", response_model=Envelope[DeletedOut])
async def delete_plan(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
    _require_organizer(plan, profile)
    await session.execute(delete(Plan).where(Plan.id == plan.id))
    await session.commit()
    return ok(DeletedOut(deleted=True))


@router.get("/plans/{plan_id}/revision", response_model=Envelope[PlanRevisionOut])
async def get_plan_revision(plan_id: str, profile: CurrentProfile, session: DbSession):
    """A cheap check clients poll to know when to refetch the plan."""
    plan = await _plan(session, plan_id)
    await _participant(session, plan_id, profile.id)
    return ok(PlanRevisionOut(updated_at=plan.updated_at))


@router.post("/plans/{plan_id}/join", response_model=Envelope[PlanOut])
async def join_plan(plan_id: str, body: PlanJoinIn, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
    if not secrets.compare_digest(plan.share_token, body.share_token):
        raise HTTPException(status_code=404, detail="This invite link is no longer valid")
    existing = await session.scalar(
        select(PlanParticipant).where(
            PlanParticipant.plan_id == plan.id, PlanParticipant.profile_id == profile.id
        )
    )
    if not existing:
        _require_open(plan)
        count = await session.scalar(
            select(func.count()).select_from(PlanParticipant).where(
                PlanParticipant.plan_id == plan.id
            )
        )
        if (count or 0) >= MAX_PARTICIPANTS:
            raise HTTPException(status_code=409, detail="This plan is full")
        session.add(PlanParticipant(plan_id=plan.id, profile_id=profile.id, constraints={}))
        _reset_choice(plan)
        await session.commit()
    return ok(await _plan_out(session, plan, profile.id))


@router.patch("/plans/{plan_id}/constraints", response_model=Envelope[PlanOut])
async def update_constraints(
    plan_id: str, body: ConstraintsIn, profile: CurrentProfile, session: DbSession
):
    plan = await _plan(session, plan_id, for_update=True)
    participant = await _participant(session, plan.id, profile.id)
    _require_open(plan)
    participant.constraints = body.model_dump()
    _reset_choice(plan)
    await session.commit()
    return ok(await _plan_out(session, plan, profile.id))


def _shortlist(places: list[Place], diners: list[Diner]) -> list[Place]:
    """Order places for the model: cuisine matches first; drop over-budget places
    only when enough remain for a full set."""
    budgets = [diner.max_price_level for diner in diners if diner.max_price_level]
    budget = min(budgets) if budgets else 4
    within_budget = [place for place in places if place.price_level <= budget]
    eligible = within_budget if len(within_budget) >= 4 else places
    wanted = [{cuisine.lower() for cuisine in diner.cuisines} for diner in diners]
    return sorted(
        eligible,
        key=lambda place: sum(place.cuisine.lower() in cuisines for cuisines in wanted),
        reverse=True,
    )


@router.post("/plans/{plan_id}/recommendations", response_model=Envelope[PlanOut])
async def generate_recommendations(
    plan_id: str, body: RecommendationIn, profile: CurrentProfile, session: DbSession
):
    plan = await _plan(session, plan_id, for_update=True)
    await _participant(session, plan.id, profile.id)
    _require_open(plan)
    rows = (
        await session.execute(
            select(PlanParticipant, Profile)
            .join(Profile, Profile.id == PlanParticipant.profile_id)
            .where(PlanParticipant.plan_id == plan.id)
        )
    ).all()
    if len(rows) < 2:
        raise HTTPException(status_code=409, detail="Invite at least one more person first")
    check_rate("recommendations", profile.id, get_settings().recommendations_per_hour)

    if plan.location_place_id:
        location = await _places("get_location", plan.location_place_id)
        latitude, longitude = location.latitude, location.longitude
    elif plan.latitude is not None and plan.longitude is not None:
        latitude, longitude = plan.latitude, plan.longitude
    else:
        raise HTTPException(status_code=422, detail="This plan needs a location")

    diners = [
        Diner(
            cuisines=list((participant.constraints or {}).get("cuisines", [])),
            dietary_notes=list((participant.constraints or {}).get("dietary_notes", [])),
            max_price_level=(participant.constraints or {}).get("max_price_level"),
            notes=str((participant.constraints or {}).get("notes", "")),
            taste=member.taste_profile or "",
        )
        for participant, member in rows
    ]
    places = await _places("discover", latitude, longitude, body.query, 20)
    ai = get_ai_provider()
    try:
        picks = await ai.recommend(body.query, diners, _shortlist(places, diners))
    except ProviderError as exc:
        raise HTTPException(status_code=503, detail="Couldn't get suggestions. Try again.") from exc
    if len(picks) != 4:
        raise HTTPException(
            status_code=422, detail="Not enough nearby places match. Try a broader request."
        )
    selected = await _places("get_places", [pick.place_id for pick in picks])

    run = RecommendationRun(plan_id=plan.id, query=body.query, provider=ai.name)
    session.add(run)
    await session.flush()
    session.add_all([
        Candidate(
            run_id=run.id, place_id=pick.place_id, match_score=pick.score,
            reasoning=pick.reasoning, rank=index + 1,
        )
        for index, pick in enumerate(picks)
    ])
    plan.active_run_id = run.id
    plan.status = "voting"
    plan.finalized_candidate_id = None
    _touch(plan)
    await session.commit()
    return ok(await _plan_out(session, plan, profile.id, selected))


@router.put("/plans/{plan_id}/vote", response_model=Envelope[PlanOut])
async def vote(plan_id: str, body: VoteIn, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
    await _participant(session, plan.id, profile.id)
    if plan.status != "voting" or not plan.active_run_id:
        raise HTTPException(status_code=409, detail="Voting isn't open right now")
    candidates, votes = await _run_rows(session, plan)
    if not set(body.ranking) <= {candidate.id for candidate in candidates}:
        raise HTTPException(status_code=422, detail="Vote for the current options")
    places = await _current_places(session, plan)
    existing = next((item for item in votes if item.profile_id == profile.id), None)
    if existing:
        existing.ranking = body.ranking
    else:
        session.add(Vote(
            plan_id=plan.id, run_id=plan.active_run_id, profile_id=profile.id,
            ranking=body.ranking,
        ))
    _touch(plan)
    await session.commit()
    return ok(await _plan_out(session, plan, profile.id, places))


@router.post("/plans/{plan_id}/finalize", response_model=Envelope[PlanOut])
async def finalize(plan_id: str, body: FinalizeIn, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
    _require_organizer(plan, profile)
    if plan.status != "voting" or not plan.active_run_id:
        raise HTTPException(status_code=409, detail="Get suggestions before locking one in")
    candidates, votes = await _run_rows(session, plan)
    selected_id = body.candidate_id or ordered_candidates(candidates, votes)[0].id
    if selected_id not in {candidate.id for candidate in candidates}:
        raise HTTPException(status_code=422, detail="Pick one of the current options")
    places = await _current_places(session, plan)
    plan.finalized_candidate_id = selected_id
    plan.status = "finalized"
    _touch(plan)
    await session.commit()
    return ok(await _plan_out(session, plan, profile.id, places))


@router.post("/plans/{plan_id}/reopen", response_model=Envelope[PlanOut])
async def reopen(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
    _require_organizer(plan, profile)
    places = await _current_places(session, plan)
    plan.status = "voting" if plan.active_run_id else "collecting"
    plan.finalized_candidate_id = None
    _touch(plan)
    await session.commit()
    return ok(await _plan_out(session, plan, profile.id, places))


@router.post("/plans/{plan_id}/share-token/rotate", response_model=Envelope[ShareTokenOut])
async def rotate_share_token(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
    _require_organizer(plan, profile)
    token = new_share_token()
    plan.share_token = token
    await session.commit()
    return ok(ShareTokenOut(share_token=token))
