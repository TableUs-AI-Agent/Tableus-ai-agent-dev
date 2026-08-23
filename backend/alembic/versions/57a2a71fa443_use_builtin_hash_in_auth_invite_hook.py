"""Use PostgreSQL's built-in SHA-256 function in the Auth invite hook.

Revision ID: 57a2a71fa443
Revises: 5c9a1d7e2b3f
Create Date: 2026-08-19
"""

from collections.abc import Sequence

from sqlalchemy import text

from alembic import op

revision: str = "57a2a71fa443"
down_revision: str | Sequence[str] | None = "5c9a1d7e2b3f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _replace_hook(email_hash_expression: str) -> None:
    op.get_bind().execute(
        text(
            f"""
            CREATE OR REPLACE FUNCTION app.hook_restrict_signup_to_validated_invite(event jsonb)
            RETURNS jsonb
            LANGUAGE plpgsql
            SET search_path = ''
            AS $$
            DECLARE
                requested_email_hash text;
            BEGIN
                requested_email_hash := {email_hash_expression};
                IF EXISTS (
                    SELECT 1
                    FROM app.pending_auth_validations
                    WHERE email_hash = requested_email_hash
                      AND expires_at > now()
                      AND redeemed_at IS NULL
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
            """
        )
    )


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        _replace_hook(
            "pg_catalog.encode("
            "pg_catalog.sha256("
            "pg_catalog.convert_to("
            "pg_catalog.lower(pg_catalog.btrim(event->'user'->>'email')), 'UTF8'"
            ")"
            "), 'hex'"
            ")"
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        _replace_hook(
            "encode("
            "extensions.digest(lower(trim(event->'user'->>'email')), 'sha256'), "
            "'hex'"
            ")"
        )
