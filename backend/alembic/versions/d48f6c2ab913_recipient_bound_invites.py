"""Bind new hosted signups to current one-use recipient invites.

Revision ID: d48f6c2ab913
Revises: ab72e4f39d10
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

from tableus.config import get_settings

revision: str = "d48f6c2ab913"
down_revision: str | Sequence[str] | None = "ab72e4f39d10"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _replace_hook(*, bound: bool) -> None:
    admission = (
        """
                    FROM app.pending_auth_validations AS pending
                    JOIN app.invites AS invite ON invite.id = pending.invite_id
                    WHERE pending.email_hash = requested_email_hash
                      AND pending.expires_at > pg_catalog.now()
                      AND pending.redeemed_at IS NULL
                      AND invite.recipient_email_hash = requested_email_hash
                      AND invite.max_uses = 1
                      AND invite.use_count < 1
                      AND invite.revoked_at IS NULL
                      AND (invite.expires_at IS NULL OR invite.expires_at > pg_catalog.now())
        """
        if bound else
        """
                    FROM app.pending_auth_validations
                    WHERE email_hash = requested_email_hash
                      AND expires_at > now()
                      AND redeemed_at IS NULL
        """
    )
    # The unbound branch is the exact predecessor body from revision
    # 57a2a71fa443, so downgrade restores its admission semantics.
    op.get_bind().execute(sa.text(f"""
        CREATE OR REPLACE FUNCTION app.hook_restrict_signup_to_validated_invite(event jsonb)
        RETURNS jsonb
        LANGUAGE plpgsql
        SET search_path = ''
        AS $$
        DECLARE
            requested_email_hash text;
        BEGIN
            requested_email_hash := pg_catalog.encode(
                pg_catalog.sha256(
                    pg_catalog.convert_to(
                        pg_catalog.lower(pg_catalog.btrim(event->'user'->>'email')), 'UTF8'
                    )
                ), 'hex'
            );
            IF EXISTS (
                SELECT 1
                {admission}
            ) THEN
                RETURN '{{}}'::jsonb;
            END IF;
            RETURN jsonb_build_object(
                'error', jsonb_build_object(
                    'http_code', 403,
                    'message', 'A current TableUs invite validation is required.'
                )
            );
        END;
        $$
    """))
    op.get_bind().execute(sa.text(
        "REVOKE ALL ON FUNCTION app.hook_restrict_signup_to_validated_invite(jsonb) FROM PUBLIC"
    ))


def _auth_admin_grants(*, bound: bool) -> None:
    bind = op.get_bind()
    if bound:
        bind.execute(sa.text("""
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
                    GRANT USAGE ON SCHEMA app TO supabase_auth_admin;
                    GRANT SELECT ON TABLE app.pending_auth_validations TO supabase_auth_admin;
                    GRANT SELECT ON TABLE app.invites TO supabase_auth_admin;
                    GRANT EXECUTE ON FUNCTION
                        app.hook_restrict_signup_to_validated_invite(jsonb)
                        TO supabase_auth_admin;
                END IF;
            END
            $$
        """))
    else:
        bind.execute(sa.text("""
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
                    REVOKE SELECT ON TABLE app.invites FROM supabase_auth_admin;
                END IF;
            END
            $$
        """))


def upgrade() -> None:
    schema = get_settings().database_schema
    with op.batch_alter_table("invites", schema=schema) as batch:
        batch.add_column(sa.Column("recipient_email_hash", sa.String(64), nullable=True))
        batch.create_check_constraint(
            "ck_invites_recipient_one_use", "recipient_email_hash IS NULL OR max_uses = 1"
        )
    if op.get_bind().dialect.name == "postgresql" and schema:
        _replace_hook(bound=True)
        _auth_admin_grants(bound=True)


def downgrade() -> None:
    schema = get_settings().database_schema
    if op.get_bind().dialect.name == "postgresql" and schema:
        _replace_hook(bound=False)
        _auth_admin_grants(bound=False)
    with op.batch_alter_table("invites", schema=schema) as batch:
        batch.drop_constraint("ck_invites_recipient_one_use", type_="check")
        batch.drop_column("recipient_email_hash")
