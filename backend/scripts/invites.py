import argparse
import asyncio
import getpass
import json
import secrets
import sys
import warnings
from datetime import UTC, datetime, timedelta

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from tableus.config import get_settings
from tableus.models import Invite
from tableus.schemas import InviteValidateIn
from tableus.security import hash_value


def _status(invite: Invite, now: datetime) -> str:
    expires_at = invite.expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if invite.revoked_at:
        return "revoked"
    if expires_at and expires_at <= now:
        return "expired"
    if invite.use_count >= invite.max_uses:
        return "fully_redeemed"
    return "active"


def _recipient_email(args: argparse.Namespace) -> str:
    """Read one private value and apply the same normalization as API validation."""
    if args.recipient_email_stdin:
        raw = sys.stdin.readline(323)
        if len(raw) > 321 or sys.stdin.read(1):
            raise SystemExit("A single valid recipient email is required")
        raw = raw.removesuffix("\n").removesuffix("\r")
    else:
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("error", getpass.GetPassWarning)
                raw = getpass.getpass("Recipient email: ")
        except (EOFError, KeyboardInterrupt, getpass.GetPassWarning):
            raise SystemExit("Recipient email was not provided") from None
    try:
        email = InviteValidateIn(code="cli", email=raw).email
    except ValidationError:
        raise SystemExit("A single valid recipient email is required") from None
    if email is None:
        raise SystemExit("A single valid recipient email is required")
    return email


async def run(args: argparse.Namespace) -> None:
    recipient = _recipient_email(args) if args.command == "create" else None
    settings = get_settings()
    engine = create_async_engine(settings.migration_sqlalchemy_url, pool_pre_ping=True)
    if engine.dialect.name == "sqlite" and Invite.__table__.schema:
        engine = engine.execution_options(
            schema_translate_map={Invite.__table__.schema: None}
        )
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    try:
        async with sessions() as session:
            if args.command == "create":
                assert recipient is not None
                code = secrets.token_urlsafe(24)
                invite = Invite(
                    code_hash=hash_value(code),
                    recipient_email_hash=hash_value(recipient),
                    max_uses=1,
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
                            "recipient_bound": True,
                            "hosted_eligible": True,
                            "expires_at": invite.expires_at.isoformat(),
                            "warning": "Store the invite code now; only its hash is persisted.",
                        }
                    )
                )
                return

            if args.command == "revoke":
                invite = await session.get(Invite, args.invite_id, with_for_update=True)
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
                            "status": status,
                            "recipient_bound": bool(invite.recipient_email_hash),
                            "legacy_requires_replacement": (
                                not invite.recipient_email_hash or invite.max_uses != 1
                            ),
                            "hosted_eligible": (
                                status == "active"
                                and bool(invite.recipient_email_hash)
                                and invite.max_uses == 1
                            ),
                            "use_count": invite.use_count,
                            "max_uses": invite.max_uses,
                            "expires_at": invite.expires_at.isoformat()
                            if invite.expires_at
                            else None,
                        }
                        for invite in invites
                        for status in [_status(invite, now)]
                    ]
                )
            )
    finally:
        await engine.dispose()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Administer hashed TableUs invite codes")
    subcommands = parser.add_subparsers(dest="command", required=True)

    create = subcommands.add_parser("create", help="Generate and persist a new invite")
    create.add_argument(
        "--recipient-email-stdin", action="store_true",
        help="Read one recipient email from standard input instead of a hidden prompt",
    )
    create.add_argument("--expires-hours", type=int, default=168, choices=range(1, 721))

    revoke = subcommands.add_parser("revoke", help="Revoke an invite by ID")
    revoke.add_argument("invite_id")

    subcommands.add_parser("list", help="List invite metadata without codes or hashes")
    return parser.parse_args(argv)


if __name__ == "__main__":
    asyncio.run(run(parse_args()))
