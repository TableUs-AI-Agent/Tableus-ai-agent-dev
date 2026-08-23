import argparse
import asyncio
import json
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from tableus.config import get_settings
from tableus.models import Invite, InviteRedemption, PendingAuthValidation


async def run(invite_ids: list[str]) -> None:
    settings = get_settings()
    engine = create_async_engine(settings.migration_sqlalchemy_url, pool_pre_ping=True)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    try:
        async with sessions() as session:
            rows = []
            for invite_id in invite_ids:
                invite = await session.get(Invite, invite_id)
                if not invite:
                    rows.append({"invite_id": invite_id, "found": False})
                    continue
                redemption_count = await session.scalar(
                    select(func.count()).select_from(InviteRedemption).where(InviteRedemption.invite_id == invite_id)
                )
                pending_count = await session.scalar(
                    select(func.count()).select_from(PendingAuthValidation).where(PendingAuthValidation.invite_id == invite_id)
                )
                redeemed_validation_count = await session.scalar(
                    select(func.count()).select_from(PendingAuthValidation).where(
                        PendingAuthValidation.invite_id == invite_id,
                        PendingAuthValidation.redeemed_at.is_not(None),
                    )
                )
                active_validation_count = await session.scalar(
                    select(func.count()).select_from(PendingAuthValidation).where(
                        PendingAuthValidation.invite_id == invite_id,
                        PendingAuthValidation.redeemed_at.is_(None),
                        PendingAuthValidation.expires_at > datetime.now(UTC),
                    )
                )
                rows.append({
                    "invite_id": invite.id,
                    "found": True,
                    "use_count": invite.use_count,
                    "max_uses": invite.max_uses,
                    "redemption_count": redemption_count or 0,
                    "validation_count": pending_count or 0,
                    "redeemed_validation_count": redeemed_validation_count or 0,
                    "active_pending_validation_count": active_validation_count or 0,
                })
            print(json.dumps({"read_only": True, "invites": rows}, sort_keys=True))
    finally:
        await engine.dispose()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Report sanitized invite authentication aggregates")
    parser.add_argument("--invite-id", action="append", required=True)
    return parser.parse_args()


if __name__ == "__main__":
    asyncio.run(run(parse_args().invite_id))
