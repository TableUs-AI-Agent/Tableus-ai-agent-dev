import asyncio
import json

from sqlalchemy import func, select

from tableus.db import SessionFactory
from tableus.models import Candidate, ProviderUsage, RecommendationRun

SAFE_CANDIDATE_COLUMNS = {
    "id",
    "run_id",
    "place_id",
    "match_score",
    "reasoning",
    "rank",
}


async def main() -> None:
    async with SessionFactory() as session:
        latest_run = await session.scalar(
            select(RecommendationRun)
            .where(RecommendationRun.provider == "gemini")
            .order_by(RecommendationRun.created_at.desc())
            .limit(1)
        )
        candidate_count = 0
        if latest_run:
            candidate_count = (
                await session.scalar(
                    select(func.count())
                    .select_from(Candidate)
                    .where(Candidate.run_id == latest_run.id)
                )
                or 0
            )
        usage = (
            await session.execute(
                select(
                    func.count(ProviderUsage.id),
                    func.coalesce(func.sum(ProviderUsage.input_units), 0),
                    func.coalesce(func.sum(ProviderUsage.output_units), 0),
                    func.coalesce(func.sum(ProviderUsage.estimated_cost_usd), 0.0),
                ).where(ProviderUsage.provider == "gemini")
            )
        ).one()
    columns = {column.name for column in Candidate.__table__.columns}
    report = {
        "schema_version": 1,
        "latest_gemini_run_found": latest_run is not None,
        "candidate_count": candidate_count,
        "candidate_table_policy_safe": columns == SAFE_CANDIDATE_COLUMNS,
        "usage_operation_count": int(usage[0]),
        "usage_input_units": int(usage[1]),
        "usage_output_units": int(usage[2]),
        "usage_estimated_cost_usd": round(float(usage[3]), 8),
    }
    print(json.dumps(report))
    if (
        not report["latest_gemini_run_found"]
        or report["candidate_count"] != 4
        or not report["candidate_table_policy_safe"]
        or report["usage_operation_count"] < 1
        or report["usage_input_units"] < 1
        or report["usage_output_units"] < 1
        or report["usage_estimated_cost_usd"] <= 0
    ):
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
