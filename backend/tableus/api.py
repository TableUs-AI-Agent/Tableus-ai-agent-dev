import io
import time
from datetime import UTC, datetime, timedelta
from typing import Annotated, Literal, cast

import jwt
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .auth import CurrentIdentity, CurrentProfile, DbSession
from .models import (
    Candidate,
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
from .providers import get_ai_provider, get_places_provider
from .ranking import borda_scores, ordered_candidates
from .schemas import (
    CandidateOut,
    ConnectionIn,
    ConnectionOut,
    ConstraintsIn,
    DeleteAccountOut,
    DiscoverIn,
    Envelope,
    FinalizeIn,
    FoodAnalysisOut,
    InviteRedeemIn,
    InviteValidateIn,
    InviteValidation,
    LocationIn,
    LocationOut,
    ParticipantOut,
    PlaceOut,
    PlanCreated,
    PlanCreateIn,
    PlanJoinIn,
    PlanOut,
    ProfileOut,
    ProfilePatch,
    RecommendationIn,
    ReviewIn,
    ReviewOut,
    ShareTokenOut,
    TasteProfileOut,
    VoteIn,
)
from .security import decode_redemption_token, hash_value, issue_redemption_token, new_share_token
from .telemetry import capture_event

router = APIRouter(prefix="/api/v1", tags=["v1"])


def ok(data, **meta):
    return {"data": data, "meta": meta}


def _is_expired(expires_at: datetime | None, now: datetime) -> bool:
    if expires_at is None:
        return False
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    return expires_at < now


async def _participant(session: AsyncSession, plan_id: str, profile_id: str) -> PlanParticipant:
    participant = await session.scalar(
        select(PlanParticipant).where(
            PlanParticipant.plan_id == plan_id,
            PlanParticipant.profile_id == profile_id,
        )
    )
    if not participant:
        raise HTTPException(status_code=403, detail="Plan membership is required")
    return participant


async def _plan(session: AsyncSession, plan_id: str) -> Plan:
    plan = await session.get(Plan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


async def _plan_out(session: AsyncSession, plan: Plan, viewer_id: str) -> PlanOut:
    rows = (
        await session.execute(
            select(PlanParticipant, Profile)
            .join(Profile, Profile.id == PlanParticipant.profile_id)
            .where(PlanParticipant.plan_id == plan.id)
            .order_by(PlanParticipant.joined_at)
        )
    ).all()
    participants = [
        ParticipantOut(
            profile_id=profile.id,
            display_name=profile.display_name,
            constraints=participant.constraints or {},
            is_organizer=profile.id == plan.organizer_id,
        )
        for participant, profile in rows
    ]

    candidates: list[Candidate] = []
    votes: list[Vote] = []
    if plan.active_run_id:
        candidates = list(
            (
                await session.scalars(
                    select(Candidate).where(Candidate.run_id == plan.active_run_id)
                )
            ).all()
        )
        votes = list(
            (await session.scalars(select(Vote).where(Vote.run_id == plan.active_run_id))).all()
        )
    scores = borda_scores(votes)
    place_ids = [candidate.place_id for candidate in candidates]
    places = await get_places_provider().get_places(place_ids)
    places_by_id = {place.place_id: place for place in places}
    candidate_outputs = []
    for candidate in sorted(candidates, key=lambda item: item.rank):
        place = places_by_id.get(candidate.place_id)
        if not place:
            continue
        candidate_outputs.append(
            CandidateOut(
                id=candidate.id,
                place=PlaceOut(**place.__dict__),
                match_score=candidate.match_score,
                reasoning=candidate.reasoning,
                rank=candidate.rank,
                vote_score=scores.get(candidate.id, 0),
            )
        )
    my_vote = next((vote.ranking for vote in votes if vote.profile_id == viewer_id), None)
    return PlanOut(
        id=plan.id,
        title=plan.title,
        organizer_id=plan.organizer_id,
        viewer_is_organizer=plan.organizer_id == viewer_id,
        status=cast(Literal["collecting", "voting", "finalized"], plan.status),
        location_label=plan.location_label,
        latitude=plan.latitude,
        longitude=plan.longitude,
        participants=participants,
        candidates=candidate_outputs,
        my_vote=my_vote,
        finalized_candidate_id=plan.finalized_candidate_id,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
    )


async def _event(
    session: AsyncSession, plan: Plan, actor: Profile, event_type: str, payload: dict | None = None
) -> None:
    session.add(
        PlanEvent(plan_id=plan.id, actor_id=actor.id, event_type=event_type, payload=payload or {})
    )


def _require_organizer(plan: Plan, profile: Profile) -> None:
    if plan.organizer_id != profile.id:
        raise HTTPException(status_code=403, detail="Only the organizer can perform this action")


@router.post("/access/validate", response_model=Envelope[InviteValidation])
async def validate_access(body: InviteValidateIn, session: DbSession):
    invite = await session.scalar(select(Invite).where(Invite.code_hash == hash_value(body.code)))
    now = datetime.now(UTC)
    if (
        not invite
        or invite.revoked_at
        or _is_expired(invite.expires_at, now)
        or invite.use_count >= invite.max_uses
    ):
        raise HTTPException(status_code=404, detail="Invite is invalid, expired, or fully redeemed")
    pending_validation = None
    if body.email:
        pending_validation = PendingAuthValidation(
            invite_id=invite.id,
            email_hash=hash_value(body.email),
            expires_at=now + timedelta(minutes=20),
        )
        session.add(pending_validation)
        await session.commit()
    return ok(
        InviteValidation(
            redemption_token=issue_redemption_token(
                invite.id,
                body.email,
                pending_validation.id if pending_validation else None,
            )
        )
    )


@router.post("/access/redeem", response_model=Envelope[ProfileOut])
async def redeem_access(body: InviteRedeemIn, identity: CurrentIdentity, session: DbSession):
    try:
        grant = decode_redemption_token(body.redemption_token)
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=400, detail="Redemption token is invalid or expired"
        ) from exc
    if grant.email_hash and hash_value((identity.email or "").lower()) != grant.email_hash:
        raise HTTPException(
            status_code=403, detail="Invite validation email does not match session"
        )
    pending_validation = None
    if grant.pending_validation_id:
        pending_validation = await session.get(
            PendingAuthValidation, grant.pending_validation_id, with_for_update=True
        )
        if (
            not pending_validation
            or pending_validation.email_hash != grant.email_hash
            or pending_validation.redeemed_at
            or _is_expired(pending_validation.expires_at, datetime.now(UTC))
        ):
            raise HTTPException(status_code=409, detail="Invite validation can no longer be used")
    invite = await session.get(Invite, grant.invite_id, with_for_update=True)
    now = datetime.now(UTC)
    if (
        not invite
        or invite.revoked_at
        or _is_expired(invite.expires_at, now)
        or invite.use_count >= invite.max_uses
    ):
        raise HTTPException(status_code=409, detail="Invite can no longer be redeemed")
    profile = await session.get(Profile, identity.subject)
    if not profile:
        email_hash = hash_value(identity.email or f"{identity.subject}@supabase.local")
        profile = Profile(
            id=identity.subject, display_name=body.display_name, email_hash=email_hash
        )
        session.add(profile)
        await session.flush()
    existing = await session.scalar(
        select(InviteRedemption).where(
            InviteRedemption.invite_id == invite.id,
            InviteRedemption.profile_id == profile.id,
        )
    )
    if not existing:
        session.add(InviteRedemption(invite_id=invite.id, profile_id=profile.id))
        invite.use_count += 1
    if pending_validation:
        pending_validation.redeemed_at = datetime.now(UTC)
    await session.commit()
    return ok(ProfileOut.model_validate(profile))


@router.get("/me", response_model=Envelope[ProfileOut])
async def get_me(profile: CurrentProfile):
    return ok(ProfileOut.model_validate(profile))


@router.patch("/me", response_model=Envelope[ProfileOut])
async def patch_me(body: ProfilePatch, profile: CurrentProfile, session: DbSession):
    if body.display_name is not None:
        profile.display_name = body.display_name
    if body.share_taste is not None:
        profile.share_taste = body.share_taste
    await session.commit()
    return ok(ProfileOut.model_validate(profile))


@router.delete("/me", response_model=Envelope[DeleteAccountOut])
async def delete_me(profile: CurrentProfile, session: DbSession):
    organized = await session.scalar(
        select(func.count()).select_from(Plan).where(Plan.organizer_id == profile.id)
    )
    if organized:
        raise HTTPException(
            status_code=409, detail="Transfer or delete organized plans before deleting the account"
        )
    await session.delete(profile)
    await session.commit()
    return ok(DeleteAccountOut(deleted=True))


@router.get("/connections", response_model=Envelope[list[ConnectionOut]])
async def list_connections(profile: CurrentProfile, session: DbSession):
    rows = (
        await session.execute(
            select(Connection, Profile)
            .join(Profile, Profile.id == Connection.connected_profile_id)
            .where(Connection.profile_id == profile.id)
            .order_by(Profile.display_name)
        )
    ).all()
    return ok(
        [
            ConnectionOut(
                profile_id=connected.id,
                display_name=connected.display_name,
                taste_profile=connected.taste_profile if connected.share_taste else None,
            )
            for _, connected in rows
        ]
    )


@router.post("/connections", response_model=Envelope[ConnectionOut])
async def create_connection(body: ConnectionIn, profile: CurrentProfile, session: DbSession):
    if body.profile_id == profile.id:
        raise HTTPException(status_code=422, detail="A profile cannot connect to itself")
    connected = await session.get(Profile, body.profile_id)
    if not connected:
        raise HTTPException(status_code=404, detail="Invite-approved profile not found")
    existing = await session.scalar(
        select(Connection).where(
            Connection.profile_id == profile.id,
            Connection.connected_profile_id == connected.id,
        )
    )
    if not existing:
        session.add(Connection(profile_id=profile.id, connected_profile_id=connected.id))
        await session.commit()
    return ok(
        ConnectionOut(
            profile_id=connected.id,
            display_name=connected.display_name,
            taste_profile=connected.taste_profile if connected.share_taste else None,
        )
    )


@router.delete("/connections/{connected_profile_id}", response_model=Envelope[DeleteAccountOut])
async def delete_connection(connected_profile_id: str, profile: CurrentProfile, session: DbSession):
    connection = await session.scalar(
        select(Connection).where(
            Connection.profile_id == profile.id,
            Connection.connected_profile_id == connected_profile_id,
        )
    )
    if connection:
        await session.delete(connection)
        await session.commit()
    return ok(DeleteAccountOut(deleted=True))


@router.get("/me/export")
async def export_me(profile: CurrentProfile, session: DbSession):
    reviews = list(
        (await session.scalars(select(Review).where(Review.profile_id == profile.id))).all()
    )
    plans = list(
        (
            await session.scalars(
                select(Plan).join(PlanParticipant).where(PlanParticipant.profile_id == profile.id)
            )
        ).all()
    )
    return ok(
        {
            "profile": ProfileOut.model_validate(profile).model_dump(),
            "reviews": [
                ReviewOut.model_validate(review).model_dump(mode="json") for review in reviews
            ],
            "plan_ids": [plan.id for plan in plans],
        }
    )


@router.get("/reviews", response_model=Envelope[list[ReviewOut]])
async def list_reviews(profile: CurrentProfile, session: DbSession):
    reviews = list(
        (
            await session.scalars(
                select(Review)
                .where(Review.profile_id == profile.id)
                .order_by(Review.created_at.desc())
            )
        ).all()
    )
    return ok([ReviewOut.model_validate(review) for review in reviews])


@router.post("/reviews", response_model=Envelope[ReviewOut])
async def create_review(body: ReviewIn, profile: CurrentProfile, session: DbSession):
    review = Review(profile_id=profile.id, **body.model_dump())
    session.add(review)
    await session.commit()
    await session.refresh(review)
    return ok(ReviewOut.model_validate(review))


@router.get("/taste-profile", response_model=Envelope[TasteProfileOut])
async def taste_profile(profile: CurrentProfile):
    return ok(
        TasteProfileOut(preferences_text=profile.taste_profile, share_taste=profile.share_taste)
    )


@router.post("/taste-profile/regenerate", response_model=Envelope[TasteProfileOut])
async def regenerate_taste(profile: CurrentProfile, session: DbSession):
    reviews = list(
        (await session.scalars(select(Review).where(Review.profile_id == profile.id))).all()
    )
    summary = await get_ai_provider().regenerate_taste(
        [
            {"rating": item.rating, "cuisine": item.cuisine, "review_text": item.review_text}
            for item in reviews
        ]
    )
    profile.taste_profile = summary
    await session.commit()
    return ok(TasteProfileOut(preferences_text=summary, share_taste=profile.share_taste))


@router.post("/food/analyze", response_model=Envelope[FoodAnalysisOut])
async def analyze_food(profile: CurrentProfile, image: Annotated[UploadFile, File()]):
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if image.content_type not in allowed:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are supported")
    image_bytes = await image.read(8 * 1024 * 1024 + 1)
    if len(image_bytes) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 8 MB or smaller")
    try:
        with Image.open(io.BytesIO(image_bytes)) as opened:
            if opened.width * opened.height > 20_000_000:
                raise HTTPException(
                    status_code=413, detail="Image must be 20 megapixels or smaller"
                )
            opened.verify()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Image data is invalid") from exc
    with Image.open(io.BytesIO(image_bytes)) as opened:
        sanitized = io.BytesIO()
        opened.convert("RGB").save(sanitized, format="JPEG", quality=90, optimize=True)
    result = await get_ai_provider().analyze_food(sanitized.getvalue(), "image/jpeg")
    return ok(FoodAnalysisOut.model_validate(result))


@router.post("/locations/resolve", response_model=Envelope[LocationOut])
async def resolve_location(body: LocationIn, profile: CurrentProfile):
    try:
        resolved = await get_places_provider().resolve_location(body.query)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ok(LocationOut.model_validate(resolved))


@router.post("/discover", response_model=Envelope[list[PlaceOut]])
async def discover(body: DiscoverIn, profile: CurrentProfile):
    places = await get_places_provider().discover(
        body.latitude, body.longitude, body.query, body.limit
    )
    return ok([PlaceOut(**place.__dict__) for place in places], count=len(places))


@router.get("/plans", response_model=Envelope[list[PlanOut]])
async def list_plans(profile: CurrentProfile, session: DbSession):
    plans = list(
        (
            await session.scalars(
                select(Plan)
                .join(PlanParticipant)
                .where(PlanParticipant.profile_id == profile.id)
                .order_by(Plan.updated_at.desc())
            )
        ).all()
    )
    return ok([await _plan_out(session, plan, profile.id) for plan in plans])


@router.post("/plans", response_model=Envelope[PlanCreated])
async def create_plan(body: PlanCreateIn, profile: CurrentProfile, session: DbSession):
    token = new_share_token()
    plan = Plan(organizer_id=profile.id, share_token_hash=hash_value(token), **body.model_dump())
    session.add(plan)
    await session.flush()
    session.add(PlanParticipant(plan_id=plan.id, profile_id=profile.id, constraints={}))
    await _event(session, plan, profile, "plan.created")
    await session.commit()
    await capture_event("plan_created", profile.id, {"platform": "api"})
    return ok(PlanCreated(plan=await _plan_out(session, plan, profile.id), share_token=token))


@router.get("/plans/{plan_id}", response_model=Envelope[PlanOut])
async def get_plan(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id)
    await _participant(session, plan_id, profile.id)
    return ok(await _plan_out(session, plan, profile.id))


@router.post("/plans/{plan_id}/join", response_model=Envelope[PlanOut])
async def join_plan(plan_id: str, body: PlanJoinIn, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id)
    if plan.share_token_hash != hash_value(body.share_token):
        raise HTTPException(status_code=404, detail="Share link is invalid or has been rotated")
    existing = await session.scalar(
        select(PlanParticipant).where(
            PlanParticipant.plan_id == plan.id, PlanParticipant.profile_id == profile.id
        )
    )
    if not existing:
        count = await session.scalar(
            select(func.count())
            .select_from(PlanParticipant)
            .where(PlanParticipant.plan_id == plan.id)
        )
        if (count or 0) >= 8:
            raise HTTPException(status_code=409, detail="This plan already has eight participants")
        session.add(PlanParticipant(plan_id=plan.id, profile_id=profile.id, constraints={}))
        plan.status = "collecting"
        plan.active_run_id = None
        plan.finalized_candidate_id = None
        await _event(session, plan, profile, "participant.joined")
        await session.commit()
    return ok(await _plan_out(session, plan, profile.id))


@router.patch("/plans/{plan_id}/constraints", response_model=Envelope[PlanOut])
async def update_constraints(
    plan_id: str, body: ConstraintsIn, profile: CurrentProfile, session: DbSession
):
    plan = await _plan(session, plan_id)
    participant = await _participant(session, plan.id, profile.id)
    participant.constraints = body.model_dump()
    plan.status = "collecting"
    plan.active_run_id = None
    plan.finalized_candidate_id = None
    await _event(session, plan, profile, "constraints.updated")
    await session.commit()
    return ok(await _plan_out(session, plan, profile.id), recommendations_stale=True)


@router.post("/plans/{plan_id}/recommendations", response_model=Envelope[PlanOut])
async def generate_recommendations(
    plan_id: str, body: RecommendationIn, profile: CurrentProfile, session: DbSession
):
    plan = await _plan(session, plan_id)
    await _participant(session, plan.id, profile.id)
    participant_rows = list(
        (
            await session.scalars(select(PlanParticipant).where(PlanParticipant.plan_id == plan.id))
        ).all()
    )
    if len(participant_rows) < 2:
        raise HTTPException(
            status_code=409, detail="At least two participants are required before voting"
        )

    started = time.perf_counter()
    places = await get_places_provider().discover(plan.latitude, plan.longitude, body.query, 20)
    cuisine_sets = [
        {str(cuisine).lower() for cuisine in (participant.constraints or {}).get("cuisines", [])}
        for participant in participant_rows
        if (participant.constraints or {}).get("cuisines")
    ]
    allowed_cuisines = set.intersection(*cuisine_sets) if cuisine_sets else set()
    price_limits = [
        int(participant.constraints["max_price_level"])
        for participant in participant_rows
        if (participant.constraints or {}).get("max_price_level")
    ]
    max_price = min(price_limits) if price_limits else 4
    eligible = [
        place
        for place in places
        if (not cuisine_sets or place.cuisine.lower() in allowed_cuisines)
        and place.price_level <= max_price
    ]
    ai_provider = get_ai_provider()
    recommendations = await ai_provider.recommend(
        body.query,
        [participant.constraints or {} for participant in participant_rows],
        eligible,
    )
    if len(recommendations) != 4:
        raise HTTPException(
            status_code=422,
            detail="No four-place recommendation set satisfies the current constraints",
        )

    run = RecommendationRun(plan_id=plan.id, query=body.query, provider=ai_provider.name)
    session.add(run)
    await session.flush()
    for index, item in enumerate(recommendations):
        session.add(
            Candidate(
                run_id=run.id,
                place_id=item.place_id,
                match_score=item.score,
                reasoning=item.reasoning,
                rank=index + 1,
            )
        )
    plan.active_run_id = run.id
    plan.status = "voting"
    plan.finalized_candidate_id = None
    session.add(
        ProviderUsage(
            provider=ai_provider.name,
            operation="recommend",
            model=getattr(ai_provider, "model", None),
            latency_ms=int((time.perf_counter() - started) * 1000),
        )
    )
    await _event(session, plan, profile, "recommendations.generated", {"run_id": run.id})
    await session.commit()
    await capture_event(
        "recommendations_generated",
        profile.id,
        {"candidate_count": 4, "provider": ai_provider.name},
    )
    return ok(await _plan_out(session, plan, profile.id))


@router.put("/plans/{plan_id}/vote", response_model=Envelope[PlanOut])
async def vote(plan_id: str, body: VoteIn, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id)
    await _participant(session, plan.id, profile.id)
    if plan.status != "voting" or not plan.active_run_id:
        raise HTTPException(status_code=409, detail="The plan is not currently accepting votes")
    valid_ids = set(
        (
            await session.scalars(
                select(Candidate.id).where(Candidate.run_id == plan.active_run_id)
            )
        ).all()
    )
    if not set(body.ranking).issubset(valid_ids):
        raise HTTPException(
            status_code=422, detail="Every ranked candidate must belong to the active run"
        )
    existing = await session.scalar(
        select(Vote).where(Vote.run_id == plan.active_run_id, Vote.profile_id == profile.id)
    )
    if existing:
        existing.ranking = body.ranking
    else:
        session.add(
            Vote(
                plan_id=plan.id,
                run_id=plan.active_run_id,
                profile_id=profile.id,
                ranking=body.ranking,
            )
        )
    await _event(session, plan, profile, "vote.updated")
    await session.commit()
    await capture_event("vote_submitted", profile.id)
    return ok(await _plan_out(session, plan, profile.id))


@router.post("/plans/{plan_id}/finalize", response_model=Envelope[PlanOut])
async def finalize(plan_id: str, body: FinalizeIn, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id)
    _require_organizer(plan, profile)
    if plan.status != "voting" or not plan.active_run_id:
        raise HTTPException(status_code=409, detail="Generate recommendations before finalizing")
    candidates = list(
        (
            await session.scalars(select(Candidate).where(Candidate.run_id == plan.active_run_id))
        ).all()
    )
    votes = list(
        (await session.scalars(select(Vote).where(Vote.run_id == plan.active_run_id))).all()
    )
    ordered = ordered_candidates(candidates, votes)
    selected_id = body.candidate_id or (ordered[0].id if ordered else None)
    if selected_id not in {candidate.id for candidate in candidates}:
        raise HTTPException(status_code=422, detail="Final candidate must belong to the active run")
    plan.finalized_candidate_id = selected_id
    plan.status = "finalized"
    await _event(session, plan, profile, "plan.finalized", {"candidate_id": selected_id})
    await session.commit()
    await capture_event("plan_finalized", profile.id, {"vote_count": len(votes)})
    return ok(await _plan_out(session, plan, profile.id))


@router.post("/plans/{plan_id}/reopen", response_model=Envelope[PlanOut])
async def reopen(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id)
    _require_organizer(plan, profile)
    if not plan.active_run_id:
        plan.status = "collecting"
    else:
        plan.status = "voting"
    plan.finalized_candidate_id = None
    await _event(session, plan, profile, "plan.reopened")
    await session.commit()
    return ok(await _plan_out(session, plan, profile.id))


@router.post("/plans/{plan_id}/share-token/rotate", response_model=Envelope[ShareTokenOut])
async def rotate_share_token(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id)
    _require_organizer(plan, profile)
    token = new_share_token()
    plan.share_token_hash = hash_value(token)
    await _event(session, plan, profile, "share_token.rotated")
    await session.commit()
    return ok(ShareTokenOut(share_token=token))
