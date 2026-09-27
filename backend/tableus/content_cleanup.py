"""Remove shared content dependent on a departing profile in its deletion transaction."""

from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import (
    Candidate,
    Plan,
    PlanEvent,
    PlanParticipant,
    RecommendationRun,
    RunContributor,
    Vote,
)

REPLACEMENT_TITLE = "Plan details need updating"


async def lock_affected_plans(session: AsyncSession, profile_id: str) -> list[Plan]:
    """Caller already holds the exclusive subject lock; take sorted plan locks."""
    ids: set[str] = set()
    for statement in (
        select(PlanParticipant.plan_id).where(PlanParticipant.profile_id == profile_id),
        select(Plan.id).where(Plan.metadata_author_id == profile_id),
        select(RecommendationRun.plan_id).where(
            (RecommendationRun.requester_id == profile_id)
            | (RecommendationRun.location_author_id == profile_id)
        ),
        select(RecommendationRun.plan_id).join(
            RunContributor, RunContributor.run_id == RecommendationRun.id
        ).where(RunContributor.profile_id == profile_id),
    ):
        ids.update((await session.scalars(statement)).all())
    plans: list[Plan] = []
    for plan_id in sorted(ids):
        plan = await session.scalar(
            select(Plan).where(Plan.id == plan_id).with_for_update()
            .execution_options(populate_existing=True)
        )
        if plan is not None:
            plans.append(plan)
    return plans


def _scrub_refs(value, identifiers: set[str]):
    if isinstance(value, dict):
        return {key: _scrub_refs(item, identifiers) for key, item in value.items()}
    if isinstance(value, list):
        return [_scrub_refs(item, identifiers) for item in value]
    if isinstance(value, str) and value in identifiers:
        return None
    return value


async def clean_departing_content(
    session: AsyncSession, profile_id: str, plans: list[Plan]
) -> None:
    """Conservatively classify unknown legacy content on deletion, without providers."""
    for plan in plans:
        member = await session.scalar(select(PlanParticipant.id).where(
            PlanParticipant.plan_id == plan.id, PlanParticipant.profile_id == profile_id,
        ))
        metadata_removed = plan.metadata_author_id == profile_id or (
            bool(member) and plan.metadata_provenance == "legacy_unknown"
        )
        if metadata_removed:
            plan.title = REPLACEMENT_TITLE
            plan.location_label = ""
            plan.location_place_id = None
            plan.latitude = None
            plan.longitude = None
            plan.metadata_author_id = None
            plan.metadata_provenance = "removed"
            plan.metadata_needs_replacement = True
            plan.metadata_version += 1

        runs = list((await session.scalars(
            select(RecommendationRun).where(RecommendationRun.plan_id == plan.id)
        )).all())
        contributor_ids = set((await session.scalars(
            select(RunContributor.run_id).where(RunContributor.profile_id == profile_id)
        )).all())
        removed_ids = {
            run.id for run in runs
            if run.requester_id == profile_id
            or run.location_author_id == profile_id
            or run.id in contributor_ids
            or ((member or metadata_removed) and run.provenance == "legacy_unknown")
        }
        if removed_ids:
            candidate_ids = set((await session.scalars(
                select(Candidate.id).where(Candidate.run_id.in_(removed_ids))
            )).all())
            await session.execute(delete(Vote).where(Vote.run_id.in_(removed_ids)))
            await session.execute(delete(Candidate).where(Candidate.run_id.in_(removed_ids)))
            await session.execute(delete(RunContributor).where(RunContributor.run_id.in_(removed_ids)))
            await session.execute(delete(RecommendationRun).where(RecommendationRun.id.in_(removed_ids)))
            if plan.active_run_id in removed_ids or plan.finalized_candidate_id in candidate_ids:
                plan.active_run_id = None
                plan.finalized_candidate_id = None
                plan.status = "collecting"
            refs = removed_ids | candidate_ids
            events = list((await session.scalars(
                select(PlanEvent).where(PlanEvent.plan_id == plan.id).with_for_update()
            )).all())
            for event in events:
                event.payload = _scrub_refs(event.payload or {}, refs)
        # Membership removal itself changes shared private content.
        plan.content_epoch += 1
        plan.updated_at = datetime.now(UTC)
