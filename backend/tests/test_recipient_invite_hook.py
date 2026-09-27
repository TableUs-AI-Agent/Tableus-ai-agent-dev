"""Actual invoker-role PostgreSQL tests for the hosted signup hook."""

import json
from collections.abc import AsyncIterator
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError, IntegrityError
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from tableus.config import get_settings
from tableus.db import SessionFactory, engine
from tableus.models import Invite, PendingAuthValidation
from tableus.security import hash_value

pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        engine.url.get_backend_name() != "postgresql",
        reason="The Auth hook and restricted invoker roles require migrated PostgreSQL",
    ),
]


@pytest.fixture(scope="module")
async def admin_engine() -> AsyncIterator[AsyncEngine]:
    value = create_async_engine(get_settings().migration_sqlalchemy_url)
    yield value
    await value.dispose()


async def seed_invite(
    email: str, *, recipient: str | None = None, max_uses: int = 1,
    use_count: int = 0, revoked: bool = False, invite_expired: bool = False,
    reservation_expired: bool = False, reservation_redeemed: bool = False,
) -> None:
    now = datetime.now(UTC)
    async with SessionFactory() as session:
        invite = Invite(
            code_hash=hash_value(uuid4().hex),
            recipient_email_hash=hash_value(recipient.lower()) if recipient else None,
            max_uses=max_uses,
            use_count=use_count,
            revoked_at=now if revoked else None,
            expires_at=now - timedelta(minutes=1) if invite_expired else now + timedelta(hours=1),
        )
        session.add(invite)
        await session.flush()
        session.add(PendingAuthValidation(
            invite_id=invite.id,
            email_hash=hash_value(email.lower()),
            expires_at=now - timedelta(minutes=1) if reservation_expired else now + timedelta(hours=1),
            redeemed_at=now if reservation_redeemed else None,
        ))
        await session.commit()


async def call_hook(admin_engine: AsyncEngine, email: str, role: str = "supabase_auth_admin") -> dict:
    assert role in {"supabase_auth_admin", "authenticated", "anon"}
    async with admin_engine.connect() as connection:
        await connection.execute(text(f"SET ROLE {role}"))
        result = await connection.scalar(text(
            "SELECT app.hook_restrict_signup_to_validated_invite(CAST(:event AS jsonb))"
        ), {"event": json.dumps({"user": {"email": email}})})
        assert isinstance(result, dict)
        return result


@pytest.mark.parametrize(
    ("changes", "allowed"),
    [
        ({}, True),
        ({"recipient": None}, False),
        ({"recipient": "other@example.test"}, False),
        ({"use_count": 1}, False),
        ({"revoked": True}, False),
        ({"invite_expired": True}, False),
        ({"reservation_expired": True}, False),
        ({"reservation_redeemed": True}, False),
    ],
)
async def test_current_one_use_recipient_and_reservation_are_required(
    admin_engine: AsyncEngine, changes: dict, allowed: bool,
) -> None:
    email = f"recipient-{uuid4().hex}@example.test"
    values = {"recipient": email, **changes}
    await seed_invite(email, **values)
    outcome = await call_hook(admin_engine, f"  {email.upper()}  ")
    if allowed:
        assert outcome == {}
    else:
        assert outcome["error"]["http_code"] == 403


async def test_matching_invite_does_not_authorize_another_email(
    admin_engine: AsyncEngine,
) -> None:
    recipient = f"recipient-{uuid4().hex}@example.test"
    await seed_invite(recipient, recipient=recipient)
    wrong = f"other-{uuid4().hex}@example.test"
    assert (await call_hook(admin_engine, wrong))["error"]["http_code"] == 403


async def test_database_forbids_binding_a_multi_use_legacy_invite() -> None:
    async with SessionFactory() as session:
        session.add(Invite(
            code_hash=hash_value(uuid4().hex),
            recipient_email_hash=hash_value(f"recipient-{uuid4().hex}@example.test"),
            max_uses=2,
        ))
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()


async def test_auth_admin_is_invoker_and_browser_roles_cannot_read_or_execute(
    admin_engine: AsyncEngine,
) -> None:
    async with admin_engine.connect() as connection:
        privileges = (await connection.execute(text("""
            SELECT
                has_table_privilege('supabase_auth_admin', 'app.invites', 'SELECT'),
                has_table_privilege('supabase_auth_admin', 'app.pending_auth_validations', 'SELECT'),
                has_function_privilege(
                    'supabase_auth_admin',
                    'app.hook_restrict_signup_to_validated_invite(jsonb)', 'EXECUTE'
                ),
                has_table_privilege('authenticated', 'app.invites', 'SELECT'),
                has_table_privilege('authenticated', 'app.pending_auth_validations', 'SELECT'),
                has_table_privilege('anon', 'app.invites', 'SELECT'),
                has_table_privilege('anon', 'app.pending_auth_validations', 'SELECT'),
                has_function_privilege(
                    'authenticated',
                    'app.hook_restrict_signup_to_validated_invite(jsonb)', 'EXECUTE'
                ),
                has_function_privilege(
                    'anon',
                    'app.hook_restrict_signup_to_validated_invite(jsonb)', 'EXECUTE'
                ),
                has_table_privilege('supabase_auth_admin', 'app.invites', 'INSERT, UPDATE, DELETE'),
                has_table_privilege(
                    'supabase_auth_admin', 'app.pending_auth_validations', 'INSERT, UPDATE, DELETE'
                ),
                EXISTS (
                    SELECT 1 FROM pg_proc AS p,
                    LATERAL aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) AS acl
                    WHERE p.oid = 'app.hook_restrict_signup_to_validated_invite(jsonb)'::regprocedure
                      AND acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
                )
        """))).one()
        assert tuple(privileges) == (
            True, True, True,
            False, False, False, False, False, False,
            False, False, False,
        )
        function_security = (await connection.execute(text("""
            SELECT p.prosecdef, p.proconfig
            FROM pg_proc AS p
            WHERE p.oid = 'app.hook_restrict_signup_to_validated_invite(jsonb)'::regprocedure
        """))).one()
        assert function_security[0] is False
        assert function_security[1] == ['search_path=""']
    for role in ("authenticated", "anon"):
        with pytest.raises(DBAPIError):
            await call_hook(admin_engine, "anyone@example.test", role=role)
