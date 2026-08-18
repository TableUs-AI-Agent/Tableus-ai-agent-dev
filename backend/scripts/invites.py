import argparse
import asyncio
import json
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from tableus.config import get_settings
from tableus.models import Invite
from tableus.security import hash_value


def _status(invite: Invite, now: datetime) -> str:
    expires_at = invite.expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if invite.revoked_at:
        return "revoked"
    if expires_at and expires_at < now:
        return "expired"
    if invite.use_count >= invite.max_uses:
        return "fully_redeemed"
    return "active"


async def run(args: argparse.Namespace) -> None:
    settings = get_settings()
    engine = create_async_engine(settings.migration_sqlalchemy_url, pool_pre_ping=True)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    try:
        async with sessions() as session:
            if args.command == "create":
                code = secrets.token_urlsafe(24)
                invite = Invite(
                    code_hash=hash_value(code),
                    max_uses=args.max_uses,
                    expires_at=datetime.now(UTC) + timedelta(hours=args.expires_hours),
                )
                session.add(invite)
                await session.commit()
                print(
                    json.dumps(
                        {
                            "id": invite.id,
                            "invite_code": code,
                            "max_uses": invite.max_uses,
                            "expires_at": invite.expires_at.isoformat(),
                            "warning": "Store the invite code now; only its hash is persisted.",
                        }
                    )
                )
                return

            if args.command == "revoke":
                invite = await session.get(Invite, args.invite_id)
                if not invite:
                    raise SystemExit("Invite not found")
                invite.revoked_at = datetime.now(UTC)
                await session.commit()
                print(json.dumps({"id": invite.id, "status": "revoked"}))
                return

            invites = list(
                (await session.scalars(select(Invite).order_by(Invite.expires_at.desc()))).all()
            )
            now = datetime.now(UTC)
            print(
                json.dumps(
                    [
                        {
                            "id": invite.id,
                            "status": _status(invite, now),
                            "use_count": invite.use_count,
                            "max_uses": invite.max_uses,
                            "expires_at": invite.expires_at.isoformat()
                            if invite.expires_at
                            else None,
                        }
                        for invite in invites
                    ]
                )
            )
    finally:
        await engine.dispose()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Administer hashed TableUs invite codes")
    subcommands = parser.add_subparsers(dest="command", required=True)

    create = subcommands.add_parser("create", help="Generate and persist a new invite")
    create.add_argument("--max-uses", type=int, default=1, choices=range(1, 9))
    create.add_argument("--expires-hours", type=int, default=168, choices=range(1, 721))

    revoke = subcommands.add_parser("revoke", help="Revoke an invite by ID")
    revoke.add_argument("invite_id")

    subcommands.add_parser("list", help="List invite metadata without codes or hashes")
    return parser.parse_args()


if __name__ == "__main__":
    asyncio.run(run(parse_args()))
