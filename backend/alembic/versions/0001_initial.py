"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-10-15

Replaces the closed-beta migration chain. Apply to an empty database.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy import text

from alembic import op
from tableus.config import get_settings

revision: str = "0001_initial"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    settings = get_settings()
    schema = settings.database_schema
    if schema:
        bind.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema}"'))
    fk = (lambda table: f"{schema}.{table}") if schema else (lambda table: table)

    op.create_table(
        "profiles",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column("taste_profile", sa.Text, nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        schema=schema,
    )
    op.create_table(
        "plans",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organizer_id", sa.String(64),
                  sa.ForeignKey(f"{fk('profiles')}.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("share_token", sa.String(64), nullable=False, unique=True),
        sa.Column("location_label", sa.String(160), nullable=False),
        sa.Column("location_place_id", sa.String(255)),
        sa.Column("latitude", sa.Float),
        sa.Column("longitude", sa.Float),
        sa.Column("active_run_id", sa.String(36)),
        sa.Column("finalized_candidate_id", sa.String(36)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        schema=schema,
    )
    op.create_index("ix_plans_organizer_updated", "plans", ["organizer_id", "updated_at"],
                    schema=schema)
    op.create_table(
        "plan_participants",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("plan_id", sa.String(36),
                  sa.ForeignKey(f"{fk('plans')}.id", ondelete="CASCADE"), nullable=False),
        sa.Column("profile_id", sa.String(64),
                  sa.ForeignKey(f"{fk('profiles')}.id", ondelete="CASCADE"), nullable=False),
        sa.Column("constraints", sa.JSON, nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("plan_id", "profile_id"),
        schema=schema,
    )
    op.create_index("ix_participants_profile", "plan_participants", ["profile_id"], schema=schema)
    op.create_table(
        "recommendation_runs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("plan_id", sa.String(36),
                  sa.ForeignKey(f"{fk('plans')}.id", ondelete="CASCADE"), nullable=False),
        sa.Column("query", sa.String(500), nullable=False),
        sa.Column("provider", sa.String(40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        schema=schema,
    )
    op.create_index("ix_recommendation_runs_plan_id", "recommendation_runs", ["plan_id"],
                    schema=schema)
    op.create_table(
        "candidates",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36),
                  sa.ForeignKey(f"{fk('recommendation_runs')}.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("place_id", sa.String(255), nullable=False),
        sa.Column("match_score", sa.Float, nullable=False),
        sa.Column("reasoning", sa.Text, nullable=False),
        sa.Column("rank", sa.Integer, nullable=False),
        sa.UniqueConstraint("run_id", "place_id"),
        schema=schema,
    )
    op.create_index("ix_candidates_run_rank", "candidates", ["run_id", "rank"], schema=schema)
    op.create_table(
        "votes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("plan_id", sa.String(36),
                  sa.ForeignKey(f"{fk('plans')}.id", ondelete="CASCADE"), nullable=False),
        sa.Column("run_id", sa.String(36),
                  sa.ForeignKey(f"{fk('recommendation_runs')}.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("profile_id", sa.String(64),
                  sa.ForeignKey(f"{fk('profiles')}.id", ondelete="CASCADE"), nullable=False),
        sa.Column("ranking", sa.JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("run_id", "profile_id"),
        schema=schema,
    )
    op.create_index("ix_votes_plan_id", "votes", ["plan_id"], schema=schema)

    if bind.dialect.name != "postgresql":
        return
    # Keep Alembic's bookkeeping out of Supabase's public Data API.
    bind.execute(text("ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY"))
    role = settings.tableus_runtime_db_role
    if schema and role:
        # The API runs as a role that can read and write rows but not change the schema.
        bind.execute(text(f'REVOKE CREATE ON SCHEMA "{schema}" FROM PUBLIC'))
        bind.execute(text(f'REVOKE ALL ON ALL TABLES IN SCHEMA "{schema}" FROM PUBLIC'))
        bind.execute(text(f'GRANT USAGE ON SCHEMA "{schema}" TO "{role}"'))
        bind.execute(text(
            f'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "{schema}" TO "{role}"'
        ))


def downgrade() -> None:
    schema = get_settings().database_schema
    for table in ["votes", "candidates", "recommendation_runs", "plan_participants", "plans",
                  "profiles"]:
        op.drop_table(table, schema=schema)
