"""closed beta foundation

Revision ID: f2fbc489660e
Revises:
Create Date: 2026-08-16
"""

from collections.abc import Sequence

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    UniqueConstraint,
    text,
)

from alembic import op
from tableus.config import get_settings

revision: str = "f2fbc489660e"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _foundation_metadata(schema: str | None) -> MetaData:
    """Return the immutable schema snapshot owned by this migration."""

    metadata = MetaData(schema=schema)

    def fk(target: str) -> str:
        return f"{schema}.{target}" if schema else target

    Table(
        "profiles",
        metadata,
        Column("id", String(64), primary_key=True),
        Column("display_name", String(100), nullable=False),
        Column("email_hash", String(64), nullable=False, unique=True),
        Column("taste_profile", Text, nullable=False),
        Column("share_taste", Boolean, nullable=False),
        Column("created_at", DateTime(timezone=True), nullable=False),
    )
    invites = Table(
        "invites",
        metadata,
        Column("id", String(36), primary_key=True),
        Column("code_hash", String(64), nullable=False, unique=True),
        Column("max_uses", Integer, nullable=False),
        Column("use_count", Integer, nullable=False),
        Column("expires_at", DateTime(timezone=True)),
        Column("revoked_at", DateTime(timezone=True)),
    )
    Index("ix_invites_code_hash", invites.c.code_hash)
    Table(
        "invite_redemptions",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "invite_id",
            String(36),
            ForeignKey(fk("invites.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        Column(
            "profile_id",
            String(64),
            ForeignKey(fk("profiles.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        Column("redeemed_at", DateTime(timezone=True), nullable=False),
        UniqueConstraint("invite_id", "profile_id"),
    )
    pending = Table(
        "pending_auth_validations",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "invite_id",
            String(36),
            ForeignKey(fk("invites.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        Column("email_hash", String(64), nullable=False),
        Column("expires_at", DateTime(timezone=True), nullable=False),
        Column("redeemed_at", DateTime(timezone=True)),
    )
    Index("ix_pending_auth_email_expiry", pending.c.email_hash, pending.c.expires_at)
    Table(
        "connections",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "profile_id",
            String(64),
            ForeignKey(fk("profiles.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        Column(
            "connected_profile_id",
            String(64),
            ForeignKey(fk("profiles.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        UniqueConstraint("profile_id", "connected_profile_id"),
    )
    reviews = Table(
        "reviews",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "profile_id",
            String(64),
            ForeignKey(fk("profiles.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        Column("restaurant_name", String(160), nullable=False),
        Column("review_text", Text, nullable=False),
        Column("rating", Float, nullable=False),
        Column("cuisine", String(80)),
        Column("dish", String(120)),
        Column("created_at", DateTime(timezone=True), nullable=False),
    )
    Index("ix_reviews_profile_id", reviews.c.profile_id)
    plans = Table(
        "plans",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "organizer_id",
            String(64),
            ForeignKey(fk("profiles.id"), ondelete="RESTRICT"),
            nullable=False,
        ),
        Column("title", String(120), nullable=False),
        Column("status", String(20), nullable=False),
        Column("share_token_hash", String(64), nullable=False, unique=True),
        Column("location_label", String(160), nullable=False),
        Column("latitude", Float, nullable=False),
        Column("longitude", Float, nullable=False),
        Column("active_run_id", String(36)),
        Column("finalized_candidate_id", String(36)),
        Column("created_at", DateTime(timezone=True), nullable=False),
        Column("updated_at", DateTime(timezone=True), nullable=False),
    )
    Index("ix_plans_share_token_hash", plans.c.share_token_hash)
    Index("ix_plans_organizer_updated", plans.c.organizer_id, plans.c.updated_at)
    participants = Table(
        "plan_participants",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "plan_id", String(36), ForeignKey(fk("plans.id"), ondelete="CASCADE"), nullable=False
        ),
        Column(
            "profile_id",
            String(64),
            ForeignKey(fk("profiles.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        Column("constraints", JSON, nullable=False),
        Column("joined_at", DateTime(timezone=True), nullable=False),
        UniqueConstraint("plan_id", "profile_id"),
    )
    Index("ix_participants_profile", participants.c.profile_id)
    runs = Table(
        "recommendation_runs",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "plan_id", String(36), ForeignKey(fk("plans.id"), ondelete="CASCADE"), nullable=False
        ),
        Column("query", String(500), nullable=False),
        Column("provider", String(40), nullable=False),
        Column("created_at", DateTime(timezone=True), nullable=False),
    )
    Index("ix_recommendation_runs_plan_id", runs.c.plan_id)
    candidates = Table(
        "candidates",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "run_id",
            String(36),
            ForeignKey(fk("recommendation_runs.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        Column("place_id", String(255), nullable=False),
        Column("match_score", Float, nullable=False),
        Column("reasoning", Text, nullable=False),
        Column("rank", Integer, nullable=False),
        UniqueConstraint("run_id", "place_id"),
    )
    Index("ix_candidates_run_rank", candidates.c.run_id, candidates.c.rank)
    votes = Table(
        "votes",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "plan_id", String(36), ForeignKey(fk("plans.id"), ondelete="CASCADE"), nullable=False
        ),
        Column(
            "run_id",
            String(36),
            ForeignKey(fk("recommendation_runs.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        Column(
            "profile_id",
            String(64),
            ForeignKey(fk("profiles.id"), ondelete="CASCADE"),
            nullable=False,
        ),
        Column("ranking", JSON, nullable=False),
        Column("created_at", DateTime(timezone=True), nullable=False),
        UniqueConstraint("run_id", "profile_id"),
    )
    Index("ix_votes_plan_id", votes.c.plan_id)
    events = Table(
        "plan_events",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "plan_id", String(36), ForeignKey(fk("plans.id"), ondelete="CASCADE"), nullable=False
        ),
        Column(
            "actor_id",
            String(64),
            ForeignKey(fk("profiles.id"), ondelete="RESTRICT"),
            nullable=False,
        ),
        Column("event_type", String(60), nullable=False),
        Column("payload", JSON, nullable=False),
        Column("created_at", DateTime(timezone=True), nullable=False),
    )
    Index("ix_plan_events_plan_id", events.c.plan_id)
    Table(
        "provider_usage",
        metadata,
        Column("id", String(36), primary_key=True),
        Column("provider", String(40), nullable=False),
        Column("operation", String(80), nullable=False),
        Column("model", String(80)),
        Column("latency_ms", Integer, nullable=False),
        Column("input_units", Integer, nullable=False),
        Column("output_units", Integer, nullable=False),
        Column("estimated_cost_usd", Float, nullable=False),
        Column("created_at", DateTime(timezone=True), nullable=False),
    )
    return metadata


def upgrade() -> None:
    bind = op.get_bind()
    settings = get_settings()
    schema = settings.database_schema
    if schema:
        bind.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema}"'))
    _foundation_metadata(schema).create_all(bind=bind)
    if schema and bind.dialect.name == "postgresql":
        bind.execute(text('CREATE SCHEMA IF NOT EXISTS "extensions"'))
        bind.execute(text('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA "extensions"'))
        bind.execute(
            text(
                """
                CREATE OR REPLACE FUNCTION app.hook_restrict_signup_to_validated_invite(event jsonb)
                RETURNS jsonb
                LANGUAGE plpgsql
                SECURITY DEFINER
                SET search_path = ''
                AS $$
                DECLARE
                    requested_email_hash text;
                BEGIN
                    requested_email_hash := encode(
                        extensions.digest(lower(trim(event->'user'->>'email')), 'sha256'),
                        'hex'
                    );
                    IF EXISTS (
                        SELECT 1
                        FROM app.pending_auth_validations
                        WHERE email_hash = requested_email_hash
                          AND expires_at > now()
                          AND redeemed_at IS NULL
                    ) THEN
                        RETURN '{}'::jsonb;
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
        bind.execute(
            text(
                """
                REVOKE ALL ON FUNCTION app.hook_restrict_signup_to_validated_invite(jsonb)
                FROM PUBLIC
                """
            )
        )
        bind.execute(
            text(
                """
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
                        GRANT USAGE ON SCHEMA app TO supabase_auth_admin;
                        GRANT EXECUTE ON FUNCTION
                            app.hook_restrict_signup_to_validated_invite(jsonb)
                            TO supabase_auth_admin;
                    END IF;
                END
                $$
                """
            )
        )
    if schema and settings.tableus_runtime_db_role:
        role = settings.tableus_runtime_db_role
        bind.execute(text(f'REVOKE CREATE ON SCHEMA "{schema}" FROM PUBLIC'))
        bind.execute(text(f'REVOKE ALL ON ALL TABLES IN SCHEMA "{schema}" FROM PUBLIC'))
        bind.execute(text(f'GRANT USAGE ON SCHEMA "{schema}" TO "{role}"'))
        bind.execute(
            text(
                f'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "{schema}" '
                f'TO "{role}"'
            )
        )
        bind.execute(
            text(
                f'ALTER DEFAULT PRIVILEGES IN SCHEMA "{schema}" '
                f'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "{role}"'
            )
        )


def downgrade() -> None:
    bind = op.get_bind()
    if get_settings().database_schema and bind.dialect.name == "postgresql":
        bind.execute(
            text("DROP FUNCTION IF EXISTS app.hook_restrict_signup_to_validated_invite(jsonb)")
        )
    _foundation_metadata(get_settings().database_schema).drop_all(bind=bind)
