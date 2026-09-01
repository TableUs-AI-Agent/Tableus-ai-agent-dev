import asyncio
import io
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from typing import Annotated, Literal, cast

import jwt
import sentry_sdk
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image
from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .auth import CurrentIdentity, CurrentProfile, DbSession
from .config import get_settings
from .db import SessionFactory
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
from .providers.base import AiCallUsage
from .providers.google_live import AiProviderError, PlacesProviderError
from .ranking import borda_scores, ordered_candidates
from .schemas import (
    AccountControlOut,
    AccountExportConnection,
    AccountExportEvent,
    AccountExportMembership,
    AccountExportOut,
    AccountExportRedemption,
    AccountExportVote,
    CandidateOut,
    ConnectionIn,
    ConnectionOut,
    ConstraintsIn,
    DeleteAccountIn,
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
    PlanRevisionOut,
    PlanSummaryOut,
    ProfileOut,
    ProfilePatch,
    ProviderUsageAggregateOut,
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

_places_user_windows: dict[str, deque[float]] = defaultdict(deque)
_places_global_window: deque[float] = deque()
_ai_user_windows: dict[str, deque[float]] = defaultdict(deque)
_ai_global_window: deque[float] = deque()
_ai_budget_lock = asyncio.Lock()
_places_budget_lock = asyncio.Lock()
_ai_reserved_usd = 0.0
_places_reserved_attempts = 0
_ai_reservation_usd = 0.02
_food_image_slots = asyncio.Semaphore(2)
_FOOD_IMAGE_SLOT_TIMEOUT_SECONDS = 0.25
_MAX_REVIEWS_PER_PROFILE = 100


def ok(data, **meta):
    return {"data": data, "meta": meta}


@router.post("/e2e/telemetry", include_in_schema=False)
async def telemetry_e2e(profile: CurrentProfile):
    del profile
    if not get_settings().tableus_telemetry_e2e:
        raise HTTPException(status_code=404, detail="Not found")
    await capture_event("telemetry_e2e", {"component": "api", "platform": "api"})
    sentry_sdk.capture_exception(RuntimeError("TableUs sanitized telemetry canary"))
    return ok({"accepted": True})


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


async def _plan(session: AsyncSession, plan_id: str, *, for_update: bool = False) -> Plan:
    statement = select(Plan).where(Plan.id == plan_id)
    if for_update:
        statement = statement.with_for_update()
    plan = await session.scalar(statement)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


async def _plan_out(
    session: AsyncSession, plan: Plan, viewer_id: str, hydrated_places: list | None = None
) -> PlanOut:
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
    places = (
        hydrated_places
        if hydrated_places is not None
        else (await _call_places(viewer_id, "get_places", place_ids) if place_ids else [])
    )
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


def _touch(plan: Plan) -> None:
    plan.updated_at = datetime.now(UTC)


def _consume_places_limit(profile_id: str) -> None:
    if get_settings().places_provider_mode != "live":
        return
    now = time.monotonic()
    cutoff = now - 60
    user_window = _places_user_windows[profile_id]
    while user_window and user_window[0] <= cutoff:
        user_window.popleft()
    while _places_global_window and _places_global_window[0] <= cutoff:
        _places_global_window.popleft()
    if len(user_window) >= 10 or len(_places_global_window) >= 60:
        raise HTTPException(status_code=429, detail="Google Places request limit reached; try again soon")
    user_window.append(now)
    _places_global_window.append(now)


async def _record_places_usage(
    operation: str, attempts: int, output_units: int, failed: bool, started: float
) -> None:
    async with SessionFactory() as usage_session:
        usage_session.add(
            ProviderUsage(
                provider="google-places-new",
                operation=f"{operation}.error" if failed else operation,
                model=None,
                latency_ms=int((time.perf_counter() - started) * 1000),
                input_units=attempts,
                output_units=output_units,
            )
        )
        await usage_session.commit()


async def _reserve_places_budget(max_attempts: int) -> bool:
    global _places_reserved_attempts
    settings = get_settings()
    if settings.places_provider_mode != "live":
        return False
    async with _places_budget_lock:
        cutoff = datetime.now(UTC) - timedelta(days=30)
        async with SessionFactory() as budget_session:
            spent = (
                await budget_session.scalar(
                    select(func.coalesce(func.sum(ProviderUsage.input_units), 0)).where(
                        ProviderUsage.provider == "google-places-new",
                        ProviderUsage.created_at >= cutoff,
                    )
                )
                or 0
            )
        if int(spent) + _places_reserved_attempts + max_attempts > settings.places_runtime_max_attempts_30d:
            raise HTTPException(
                status_code=429,
                detail="Places staging usage limit reached; try again after the budget window resets",
            )
        _places_reserved_attempts += max_attempts
        return True


async def _release_places_budget(reserved: bool, max_attempts: int) -> None:
    global _places_reserved_attempts
    if not reserved:
        return
    async with _places_budget_lock:
        _places_reserved_attempts = max(0, _places_reserved_attempts - max_attempts)


async def _call_places(profile_id: str, method: str, *args):
    _consume_places_limit(profile_id)
    max_attempts = 12 if method == "get_places" else 3
    reserved = await _reserve_places_budget(max_attempts)
    provider = get_places_provider()
    started = time.perf_counter()

    async def usage(operation: str, attempts: int, output_units: int, failed: bool) -> None:
        await _record_places_usage(operation, attempts, output_units, failed, started)

    try:
        return await getattr(provider, method)(*args, usage=usage)
    except PlacesProviderError as exc:
        status = 404 if exc.kind == "not_found" else 503
        raise HTTPException(status_code=status, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    finally:
        await _release_places_budget(reserved, max_attempts)


def _consume_ai_limit(
    profile_id: str, *, include_user: bool = True, include_global: bool = True
) -> None:
    if get_settings().ai_provider_mode != "live":
        return
    now = time.monotonic()
    cutoff = now - 60
    user_window = _ai_user_windows[profile_id]
    while user_window and user_window[0] <= cutoff:
        user_window.popleft()
    while _ai_global_window and _ai_global_window[0] <= cutoff:
        _ai_global_window.popleft()
    if (include_user and len(user_window) >= 5) or (
        include_global and len(_ai_global_window) >= 30
    ):
        raise HTTPException(status_code=429, detail="AI request limit reached; try again soon")
    if include_user:
        user_window.append(now)
    if include_global:
        _ai_global_window.append(now)


async def _reserve_ai_budget() -> bool:
    global _ai_reserved_usd
    settings = get_settings()
    if settings.ai_provider_mode != "live":
        return False
    async with _ai_budget_lock:
        cutoff = datetime.now(UTC) - timedelta(days=30)
        async with SessionFactory() as budget_session:
            spent = (
                await budget_session.scalar(
                    select(func.coalesce(func.sum(ProviderUsage.estimated_cost_usd), 0.0)).where(
                        ProviderUsage.provider == "gemini",
                        ProviderUsage.created_at >= cutoff,
                    )
                )
                or 0.0
            )
        if float(spent) + _ai_reserved_usd + _ai_reservation_usd > settings.ai_runtime_max_usd_30d:
            raise HTTPException(
                status_code=429,
                detail="AI staging spend limit reached; try again after the budget window resets",
            )
        _ai_reserved_usd += _ai_reservation_usd
        return True


async def _release_ai_budget(reserved: bool) -> None:
    global _ai_reserved_usd
    if not reserved:
        return
    async with _ai_budget_lock:
        _ai_reserved_usd = max(0.0, _ai_reserved_usd - _ai_reservation_usd)


async def _record_ai_usage(
    provider_name: str, model: str | None, usage: AiCallUsage, started: float
) -> None:
    async with SessionFactory() as usage_session:
        usage_session.add(
            ProviderUsage(
                provider=provider_name,
                operation=f"{usage.operation}.error" if usage.failed else usage.operation,
                model=model,
                latency_ms=int((time.perf_counter() - started) * 1000),
                input_units=usage.input_tokens,
                output_units=usage.output_tokens,
                estimated_cost_usd=usage.estimated_cost_usd,
            )
        )
        await usage_session.commit()


@asynccontextmanager
async def _ai_admission(
    profile_id: str, *, include_user: bool = True, include_global: bool = True
):
    _consume_ai_limit(
        profile_id, include_user=include_user, include_global=include_global
    )
    reserved = await _reserve_ai_budget()
    try:
        yield
    finally:
        await _release_ai_budget(reserved)


async def _invoke_ai(method: str, *args):
    started = time.perf_counter()
    recorded = False

    try:
        provider = get_ai_provider()

        async def usage(event: AiCallUsage) -> None:
            nonlocal recorded
            await _record_ai_usage(
                provider.name, getattr(provider, "model", None), event, started
            )
            recorded = True

        result = await getattr(provider, method)(*args, usage=usage)
        if not recorded:
            await usage(AiCallUsage(method, 0, 0, 0, 0, False))
        return result
    except AiProviderError as exc:
        status = 422 if exc.kind in {"refused", "no_result"} else 502
        if exc.kind in {"transient", "configuration"}:
            status = 503
        raise HTTPException(status_code=status, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail="AI provider is not configured") from exc


async def _call_ai(profile_id: str, method: str, *args):
    async with _ai_admission(profile_id):
        return await _invoke_ai(method, *args)


def _sanitize_food_image(image_bytes: bytes) -> bytes:
    try:
        with Image.open(io.BytesIO(image_bytes)) as opened:
            if opened.width * opened.height > 20_000_000:
                raise HTTPException(
                    status_code=413, detail="Image must be 20 megapixels or smaller"
                )
            opened.verify()
        with Image.open(io.BytesIO(image_bytes)) as opened:
            sanitized = io.BytesIO()
            with opened.convert("RGB") as converted:
                converted.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
                converted.save(sanitized, format="JPEG", quality=85, optimize=True)
        return sanitized.getvalue()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Image data is invalid") from exc


def _release_food_image_slot(worker: asyncio.Task[bytes]) -> None:
    _food_image_slots.release()
    if not worker.cancelled():
        worker.exception()


async def _sanitize_food_image_bounded(image_bytes: bytes) -> bytes:
    try:
        await asyncio.wait_for(
            _food_image_slots.acquire(), timeout=_FOOD_IMAGE_SLOT_TIMEOUT_SECONDS
        )
    except TimeoutError as exc:
        raise HTTPException(
            status_code=503, detail="Image analysis is busy; try again soon"
        ) from exc
    try:
        worker = asyncio.create_task(asyncio.to_thread(_sanitize_food_image, image_bytes))
    except BaseException:
        _food_image_slots.release()
        raise
    worker.add_done_callback(_release_food_image_slot)
    return await asyncio.shield(worker)


async def _event(
    session: AsyncSession, plan: Plan, actor: Profile, event_type: str, payload: dict | None = None
) -> None:
    session.add(
        PlanEvent(plan_id=plan.id, actor_id=actor.id, event_type=event_type, payload=payload or {})
    )


async def _account_control(session: AsyncSession, profile_id: str) -> AccountControlOut:
    organized_plan_count = (
        await session.scalar(
            select(func.count()).select_from(Plan).where(Plan.organizer_id == profile_id)
        )
        or 0
    )
    blockers: list[Literal["organized_plans"]] = (
        ["organized_plans"] if organized_plan_count else []
    )
    return AccountControlOut(
        can_delete=not blockers,
        blockers=blockers,
        organized_plan_count=organized_plan_count,
    )


def _require_organizer(plan: Plan, profile: Profile) -> None:
    if plan.organizer_id != profile.id:
        raise HTTPException(status_code=403, detail="Only the organizer can perform this action")


def _require_reopened(plan: Plan) -> None:
    if plan.status == "finalized":
        raise HTTPException(
            status_code=409,
            detail="The organizer must reopen this finalized plan before making changes",
        )


@router.post("/access/validate", response_model=Envelope[InviteValidation])
async def validate_access(body: InviteValidateIn, session: DbSession):
    settings = get_settings()
    if settings.tableus_auth_mode == "supabase" and not body.email:
        raise HTTPException(status_code=422, detail="Email is required for hosted invite validation")
    invite = await session.scalar(
        select(Invite)
        .where(Invite.code_hash == hash_value(body.code))
        .with_for_update()
    )
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
        await session.execute(
            delete(PendingAuthValidation).where(
                PendingAuthValidation.invite_id == invite.id,
                PendingAuthValidation.redeemed_at.is_(None),
                PendingAuthValidation.expires_at <= now,
            )
        )
        email_hash = hash_value(body.email)
        pending_validation = await session.scalar(
            select(PendingAuthValidation).where(
                PendingAuthValidation.invite_id == invite.id,
                PendingAuthValidation.email_hash == email_hash,
                PendingAuthValidation.redeemed_at.is_(None),
                PendingAuthValidation.expires_at > now,
            )
        )
        if pending_validation:
            pending_validation.expires_at = now + timedelta(minutes=20)
        else:
            active_count = (
                await session.scalar(
                    select(func.count())
                    .select_from(PendingAuthValidation)
                    .where(
                        PendingAuthValidation.invite_id == invite.id,
                        PendingAuthValidation.redeemed_at.is_(None),
                        PendingAuthValidation.expires_at > now,
                    )
                )
                or 0
            )
            remaining_uses = invite.max_uses - invite.use_count
            if active_count >= remaining_uses:
                raise HTTPException(
                    status_code=409,
                    detail="Invite validation is already reserved; retry after it expires",
                )
            pending_validation = PendingAuthValidation(
                invite_id=invite.id,
                email_hash=email_hash,
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
    settings = get_settings()
    try:
        grant = decode_redemption_token(body.redemption_token)
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=400, detail="Redemption token is invalid or expired"
        ) from exc
    if settings.tableus_auth_mode == "supabase" and (
        not grant.email_hash or not grant.pending_validation_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Hosted redemption token is missing its email reservation",
        )
    if grant.email_hash and hash_value((identity.email or "").lower()) != grant.email_hash:
        raise HTTPException(
            status_code=403, detail="Invite validation email does not match session"
        )
    now = datetime.now(UTC)
    profile = await session.get(Profile, identity.subject)
    if profile:
        redeemed_invite_ids = set(
            (
                await session.scalars(
                    select(InviteRedemption.invite_id).where(
                        InviteRedemption.profile_id == profile.id
                    )
                )
            ).all()
        )
        same_invite_retry = grant.invite_id in redeemed_invite_ids
        reservation_changed = False
        if grant.pending_validation_id:
            existing_reservation = await session.get(
                PendingAuthValidation, grant.pending_validation_id, with_for_update=True
            )
            if (
                existing_reservation
                and existing_reservation.invite_id == grant.invite_id
                and existing_reservation.email_hash == grant.email_hash
                and not _is_expired(existing_reservation.expires_at, now)
                and not existing_reservation.redeemed_at
            ):
                if same_invite_retry:
                    existing_reservation.redeemed_at = now
                else:
                    await session.delete(existing_reservation)
                reservation_changed = True
        if reservation_changed:
            await session.commit()
        if same_invite_retry:
            return ok(ProfileOut.model_validate(profile))
        if redeemed_invite_ids:
            raise HTTPException(status_code=409, detail="This account has already joined TableUs")
    invite = await session.get(Invite, grant.invite_id, with_for_update=True)
    if (
        not invite
        or invite.revoked_at
        or _is_expired(invite.expires_at, now)
        or invite.use_count >= invite.max_uses
    ):
        raise HTTPException(status_code=409, detail="Invite can no longer be redeemed")
    pending_validation = None
    if grant.pending_validation_id:
        pending_validation = await session.get(
            PendingAuthValidation, grant.pending_validation_id, with_for_update=True
        )
        if (
            not pending_validation
            or pending_validation.invite_id != invite.id
            or pending_validation.email_hash != grant.email_hash
            or pending_validation.redeemed_at
            or _is_expired(pending_validation.expires_at, now)
        ):
            raise HTTPException(status_code=409, detail="Invite validation can no longer be used")
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
    await capture_event("auth_approved", {"mode": "signup"})
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


@router.get("/me/account-control", response_model=Envelope[AccountControlOut])
async def account_control(profile: CurrentProfile, session: DbSession):
    return ok(await _account_control(session, profile.id))


@router.delete("/me", response_model=Envelope[DeleteAccountOut])
async def delete_me(body: DeleteAccountIn, profile: CurrentProfile, session: DbSession):
    control = await _account_control(session, profile.id)
    if not control.can_delete:
        raise HTTPException(
            status_code=409, detail="Transfer or delete organized plans before deleting the account"
        )
    await session.execute(
        update(PlanEvent).where(PlanEvent.actor_id == profile.id).values(actor_id=None)
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


@router.get("/me/export", response_model=Envelope[AccountExportOut])
async def export_me(profile: CurrentProfile, session: DbSession):
    reviews = list(
        (
            await session.scalars(
                select(Review)
                .where(Review.profile_id == profile.id)
                .order_by(Review.created_at, Review.id)
            )
        ).all()
    )
    connections = list(
        (
            await session.scalars(
                select(Connection)
                .where(Connection.profile_id == profile.id)
                .order_by(Connection.connected_profile_id)
            )
        ).all()
    )
    redemptions = list(
        (
            await session.scalars(
                select(InviteRedemption)
                .where(InviteRedemption.profile_id == profile.id)
                .order_by(InviteRedemption.redeemed_at, InviteRedemption.id)
            )
        ).all()
    )
    memberships = list(
        (
            await session.execute(
                select(PlanParticipant, Plan)
                .join(Plan, Plan.id == PlanParticipant.plan_id)
                .where(PlanParticipant.profile_id == profile.id)
                .order_by(Plan.created_at, Plan.id)
            )
        ).all()
    )
    votes = list(
        (
            await session.scalars(
                select(Vote)
                .where(Vote.profile_id == profile.id)
                .order_by(Vote.created_at, Vote.id)
            )
        ).all()
    )
    events = list(
        (
            await session.scalars(
                select(PlanEvent)
                .where(PlanEvent.actor_id == profile.id)
                .order_by(PlanEvent.created_at, PlanEvent.id)
            )
        ).all()
    )
    return ok(
        AccountExportOut(
            exported_at=datetime.now(UTC),
            profile=ProfileOut.model_validate(profile),
            connections=[
                AccountExportConnection(connected_profile_id=connection.connected_profile_id)
                for connection in connections
            ],
            reviews=[ReviewOut.model_validate(review) for review in reviews],
            invite_redemptions=[
                AccountExportRedemption(redeemed_at=redemption.redeemed_at)
                for redemption in redemptions
            ],
            plan_memberships=[
                AccountExportMembership(
                    plan_id=plan.id,
                    title=plan.title,
                    status=cast(Literal["collecting", "voting", "finalized"], plan.status),
                    is_organizer=plan.organizer_id == profile.id,
                    constraints=participant.constraints or {},
                )
                for participant, plan in memberships
            ],
            votes=[
                AccountExportVote(
                    plan_id=vote.plan_id,
                    run_id=vote.run_id,
                    ranking=vote.ranking,
                    created_at=vote.created_at,
                )
                for vote in votes
            ],
            authored_plan_events=[
                AccountExportEvent(
                    plan_id=event.plan_id,
                    event_type=event.event_type,
                    payload=event.payload or {},
                    created_at=event.created_at,
                )
                for event in events
            ],
        )
    )


@router.get("/reviews", response_model=Envelope[list[ReviewOut]])
async def list_reviews(profile: CurrentProfile, session: DbSession):
    reviews = list(
        (
            await session.scalars(
                select(Review)
                .where(Review.profile_id == profile.id)
                .order_by(Review.created_at.desc())
                .limit(_MAX_REVIEWS_PER_PROFILE)
            )
        ).all()
    )
    return ok([ReviewOut.model_validate(review) for review in reviews])


@router.post("/reviews", response_model=Envelope[ReviewOut])
async def create_review(body: ReviewIn, profile: CurrentProfile, session: DbSession):
    await session.scalar(select(Profile.id).where(Profile.id == profile.id).with_for_update())
    review_count = await session.scalar(
        select(func.count()).select_from(Review).where(Review.profile_id == profile.id)
    )
    if (review_count or 0) >= _MAX_REVIEWS_PER_PROFILE:
        raise HTTPException(
            status_code=409,
            detail="The closed beta supports at most 100 reviews per account",
        )
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
        (
            await session.scalars(
                select(Review)
                .where(Review.profile_id == profile.id)
                .order_by(Review.created_at.desc())
                .limit(25)
            )
        ).all()
    )
    summary = await _call_ai(
        profile.id,
        "regenerate_taste",
        [
            {"rating": item.rating, "cuisine": item.cuisine, "review_text": item.review_text}
            for item in reversed(reviews)
        ],
    )
    profile.taste_profile = summary
    await session.commit()
    return ok(TasteProfileOut(preferences_text=summary, share_taste=profile.share_taste))


@router.post("/food/analyze", response_model=Envelope[FoodAnalysisOut])
async def analyze_food(profile: CurrentProfile, image: Annotated[UploadFile, File()]):
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if image.content_type not in allowed:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are supported")
    _consume_ai_limit(profile.id, include_global=False)
    image_bytes = await image.read(8 * 1024 * 1024 + 1)
    if len(image_bytes) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 8 MB or smaller")
    sanitized = await _sanitize_food_image_bounded(image_bytes)
    async with _ai_admission(profile.id, include_user=False):
        result = await _invoke_ai("analyze_food", sanitized, "image/jpeg")
    return ok(FoodAnalysisOut.model_validate(result))


@router.post("/locations/resolve", response_model=Envelope[LocationOut])
async def resolve_location(body: LocationIn, profile: CurrentProfile):
    resolved = await _call_places(profile.id, "resolve_location", body.query)
    return ok(
        LocationOut(
            place_id=resolved.place_id,
            label=resolved.label,
            data_provider=resolved.data_provider,
        )
    )


@router.post("/discover", response_model=Envelope[list[PlaceOut]])
async def discover(body: DiscoverIn, profile: CurrentProfile):
    places = await _call_places(
        profile.id, "discover", body.latitude, body.longitude, body.query, body.limit
    )
    return ok([PlaceOut(**place.__dict__) for place in places], count=len(places))


@router.get(
    "/provider-usage/summary", response_model=Envelope[list[ProviderUsageAggregateOut]]
)
async def provider_usage_summary(profile: CurrentProfile, session: DbSession):
    rows = (
        await session.execute(
            select(
                ProviderUsage.provider,
                ProviderUsage.operation,
                func.count().label("operation_count"),
                func.coalesce(func.sum(ProviderUsage.input_units), 0).label("input_units"),
                func.coalesce(func.sum(ProviderUsage.output_units), 0).label("output_units"),
                func.coalesce(func.sum(ProviderUsage.estimated_cost_usd), 0.0).label(
                    "estimated_cost_usd"
                ),
            ).group_by(ProviderUsage.provider, ProviderUsage.operation)
        )
    ).all()
    return ok(
        [
            ProviderUsageAggregateOut(
                provider=provider,
                operation=operation,
                operation_count=operation_count,
                input_units=input_units,
                output_units=output_units,
                estimated_cost_usd=round(float(estimated_cost_usd), 8),
            )
            for (
                provider,
                operation,
                operation_count,
                input_units,
                output_units,
                estimated_cost_usd,
            ) in rows
        ]
    )


@router.get("/plans", response_model=Envelope[list[PlanSummaryOut]])
async def list_plans(profile: CurrentProfile, session: DbSession):
    participant_counts = (
        select(PlanParticipant.plan_id, func.count().label("participant_count"))
        .group_by(PlanParticipant.plan_id)
        .subquery()
    )
    rows = (
        await session.execute(
            select(Plan, participant_counts.c.participant_count)
            .join(PlanParticipant, PlanParticipant.plan_id == Plan.id)
            .join(participant_counts, participant_counts.c.plan_id == Plan.id)
            .where(PlanParticipant.profile_id == profile.id)
            .order_by(Plan.updated_at.desc())
        )
    ).all()
    return ok(
        [
            PlanSummaryOut(
                id=plan.id,
                title=plan.title,
                status=cast(Literal["collecting", "voting", "finalized"], plan.status),
                location_label=plan.location_label,
                participant_count=count,
                created_at=plan.created_at,
                updated_at=plan.updated_at,
            )
            for plan, count in rows
        ]
    )


@router.post("/plans", response_model=Envelope[PlanCreated])
async def create_plan(body: PlanCreateIn, profile: CurrentProfile, session: DbSession):
    settings = get_settings()
    if body.location_place_id:
        resolved = await _call_places(profile.id, "get_location", body.location_place_id)
        if resolved.region_code != "US":
            raise HTTPException(status_code=422, detail="Only United States locations are supported")
    elif settings.places_provider_mode == "live":
        raise HTTPException(status_code=422, detail="A resolved Google Place ID is required")
    token = new_share_token()
    plan = Plan(
        organizer_id=profile.id,
        share_token_hash=hash_value(token),
        title=body.title,
        location_label=" ".join(body.location_label.split()),
        location_place_id=body.location_place_id,
        latitude=None if body.location_place_id else body.latitude,
        longitude=None if body.location_place_id else body.longitude,
    )
    session.add(plan)
    await session.flush()
    session.add(PlanParticipant(plan_id=plan.id, profile_id=profile.id, constraints={}))
    await _event(session, plan, profile, "plan.created")
    await session.commit()
    await capture_event("plan_created")
    return ok(PlanCreated(plan=await _plan_out(session, plan, profile.id), share_token=token))


@router.get("/plans/{plan_id}", response_model=Envelope[PlanOut])
async def get_plan(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id)
    await _participant(session, plan_id, profile.id)
    return ok(await _plan_out(session, plan, profile.id))


@router.get("/plans/{plan_id}/revision", response_model=Envelope[PlanRevisionOut])
async def get_plan_revision(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id)
    await _participant(session, plan_id, profile.id)
    return ok(PlanRevisionOut(updated_at=plan.updated_at))


@router.post("/plans/{plan_id}/join", response_model=Envelope[PlanOut])
async def join_plan(plan_id: str, body: PlanJoinIn, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
    if plan.share_token_hash != hash_value(body.share_token):
        raise HTTPException(status_code=404, detail="Share link is invalid or has been rotated")
    existing = await session.scalar(
        select(PlanParticipant).where(
            PlanParticipant.plan_id == plan.id, PlanParticipant.profile_id == profile.id
        )
    )
    if not existing:
        _require_reopened(plan)
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
        _touch(plan)
        await _event(session, plan, profile, "participant.joined")
        await session.commit()
        await capture_event("plan_joined")
    return ok(await _plan_out(session, plan, profile.id))


@router.patch("/plans/{plan_id}/constraints", response_model=Envelope[PlanOut])
async def update_constraints(
    plan_id: str, body: ConstraintsIn, profile: CurrentProfile, session: DbSession
):
    plan = await _plan(session, plan_id, for_update=True)
    participant = await _participant(session, plan.id, profile.id)
    _require_reopened(plan)
    participant.constraints = body.model_dump()
    plan.status = "collecting"
    plan.active_run_id = None
    plan.finalized_candidate_id = None
    _touch(plan)
    await _event(session, plan, profile, "constraints.updated")
    await session.commit()
    await capture_event("constraints_saved")
    return ok(await _plan_out(session, plan, profile.id), recommendations_stale=True)


@router.post("/plans/{plan_id}/recommendations", response_model=Envelope[PlanOut])
async def generate_recommendations(
    plan_id: str, body: RecommendationIn, profile: CurrentProfile, session: DbSession
):
    plan = await _plan(session, plan_id, for_update=True)
    await _participant(session, plan.id, profile.id)
    _require_reopened(plan)
    participant_rows = list(
        (
            await session.scalars(select(PlanParticipant).where(PlanParticipant.plan_id == plan.id))
        ).all()
    )
    if len(participant_rows) < 2:
        raise HTTPException(
            status_code=409, detail="At least two participants are required before voting"
        )

    if plan.location_place_id:
        location = await _call_places(profile.id, "get_location", plan.location_place_id)
        latitude, longitude = location.latitude, location.longitude
    elif plan.latitude is not None and plan.longitude is not None:
        latitude, longitude = plan.latitude, plan.longitude
    else:
        raise HTTPException(status_code=422, detail="Plan location must be resolved again")
    places = await _call_places(profile.id, "discover", latitude, longitude, body.query, 20)
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
    recommendations = await _call_ai(
        profile.id,
        "recommend",
        body.query,
        [participant.constraints or {} for participant in participant_rows],
        eligible,
    )
    if len(recommendations) != 4:
        raise HTTPException(
            status_code=422,
            detail="No four-place recommendation set satisfies the current constraints",
        )
    ai_provider = get_ai_provider()
    selected_places = await _call_places(
        profile.id, "get_places", [item.place_id for item in recommendations]
    )
    if len(selected_places) != 4:
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
    _touch(plan)
    await _event(session, plan, profile, "recommendations.generated", {"run_id": run.id})
    await session.commit()
    await capture_event(
        "recommendations_generated",
        {"candidate_count": 4, "provider": ai_provider.name},
    )
    return ok(await _plan_out(session, plan, profile.id, selected_places))


@router.put("/plans/{plan_id}/vote", response_model=Envelope[PlanOut])
async def vote(plan_id: str, body: VoteIn, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
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
    _touch(plan)
    await _event(session, plan, profile, "vote.updated")
    await session.commit()
    await capture_event("vote_submitted", {"ranking_count": len(body.ranking)})
    return ok(await _plan_out(session, plan, profile.id))


@router.post("/plans/{plan_id}/finalize", response_model=Envelope[PlanOut])
async def finalize(plan_id: str, body: FinalizeIn, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
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
    _touch(plan)
    await _event(session, plan, profile, "plan.finalized", {"candidate_id": selected_id})
    await session.commit()
    await capture_event("plan_finalized", {"vote_count": len(votes)})
    return ok(await _plan_out(session, plan, profile.id))


@router.post("/plans/{plan_id}/reopen", response_model=Envelope[PlanOut])
async def reopen(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
    _require_organizer(plan, profile)
    if not plan.active_run_id:
        plan.status = "collecting"
    else:
        plan.status = "voting"
    plan.finalized_candidate_id = None
    _touch(plan)
    await _event(session, plan, profile, "plan.reopened")
    await session.commit()
    await capture_event("plan_reopened")
    return ok(await _plan_out(session, plan, profile.id))


@router.post("/plans/{plan_id}/share-token/rotate", response_model=Envelope[ShareTokenOut])
async def rotate_share_token(plan_id: str, profile: CurrentProfile, session: DbSession):
    plan = await _plan(session, plan_id, for_update=True)
    _require_organizer(plan, profile)
    token = new_share_token()
    plan.share_token_hash = hash_value(token)
    await _event(session, plan, profile, "share_token.rotated")
    await session.commit()
    return ok(ShareTokenOut(share_token=token))
