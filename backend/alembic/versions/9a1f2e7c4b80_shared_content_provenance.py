"""Record authored plan metadata and complete recommendation dependencies.

Revision ID: 9a1f2e7c4b80
Revises: d48f6c2ab913
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op
from tableus.config import get_settings

revision: str = "9a1f2e7c4b80"
down_revision: str | Sequence[str] | None = "d48f6c2ab913"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    schema = get_settings().database_schema
    with op.batch_alter_table("plans", schema=schema) as batch:
        batch.add_column(sa.Column("metadata_author_id", sa.String(64), nullable=True))
        batch.add_column(sa.Column("metadata_provenance", sa.String(20), nullable=False, server_default="legacy_unknown"))
        batch.add_column(sa.Column("metadata_version", sa.Integer(), nullable=False, server_default="1"))
        batch.add_column(sa.Column("metadata_needs_replacement", sa.Boolean(), nullable=False, server_default=sa.false()))
        batch.add_column(sa.Column("content_epoch", sa.Integer(), nullable=False, server_default="0"))
        batch.create_foreign_key("fk_plans_metadata_author", "profiles", ["metadata_author_id"], ["id"], referent_schema=schema, ondelete="SET NULL")
    with op.batch_alter_table("recommendation_runs", schema=schema) as batch:
        batch.add_column(sa.Column("requester_id", sa.String(64), nullable=True))
        batch.add_column(sa.Column("location_author_id", sa.String(64), nullable=True))
        batch.add_column(sa.Column("location_version", sa.Integer(), nullable=True))
        batch.add_column(sa.Column("provenance", sa.String(20), nullable=False, server_default="legacy_unknown"))
        batch.create_foreign_key("fk_runs_requester", "profiles", ["requester_id"], ["id"], referent_schema=schema, ondelete="SET NULL")
        batch.create_foreign_key("fk_runs_location_author", "profiles", ["location_author_id"], ["id"], referent_schema=schema, ondelete="SET NULL")
    op.create_index("ix_plans_metadata_author", "plans", ["metadata_author_id"], schema=schema)
    op.create_index("ix_runs_requester", "recommendation_runs", ["requester_id"], schema=schema)
    op.create_index("ix_runs_location_author", "recommendation_runs", ["location_author_id"], schema=schema)
    prefix = f"{schema}." if schema else ""
    op.create_table(
        "run_contributors",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey(f"{prefix}recommendation_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("profile_id", sa.String(64), sa.ForeignKey(f"{prefix}profiles.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("run_id", "profile_id"),
        schema=schema,
    )
    op.create_index("ix_run_contributors_profile", "run_contributors", ["profile_id"], schema=schema)
    bind = op.get_bind()
    if bind.dialect.name == "postgresql" and schema:
        quoted = bind.dialect.identifier_preparer
        table = f"{quoted.quote(schema)}.run_contributors"
        bind.execute(sa.text(f"REVOKE ALL ON TABLE {table} FROM PUBLIC"))
        for browser_role in ("anon", "authenticated"):
            exists = bind.execute(sa.text("SELECT 1 FROM pg_roles WHERE rolname = :name"), {"name": browser_role}).scalar()
            if exists:
                bind.execute(sa.text(f"REVOKE ALL ON TABLE {table} FROM {quoted.quote(browser_role)}"))
        role = get_settings().tableus_runtime_db_role
        if role:
            bind.execute(sa.text(f"REVOKE ALL ON TABLE {table} FROM {quoted.quote(role)}"))
            bind.execute(sa.text(f"GRANT SELECT, INSERT, DELETE ON TABLE {table} TO {quoted.quote(role)}"))


def downgrade() -> None:
    schema = get_settings().database_schema
    op.drop_index("ix_run_contributors_profile", table_name="run_contributors", schema=schema)
    op.drop_table("run_contributors", schema=schema)
    op.drop_index("ix_runs_location_author", table_name="recommendation_runs", schema=schema)
    op.drop_index("ix_runs_requester", table_name="recommendation_runs", schema=schema)
    op.drop_index("ix_plans_metadata_author", table_name="plans", schema=schema)
    with op.batch_alter_table("recommendation_runs", schema=schema) as batch:
        batch.drop_constraint("fk_runs_location_author", type_="foreignkey")
        batch.drop_constraint("fk_runs_requester", type_="foreignkey")
        for column in ("provenance", "location_version", "location_author_id", "requester_id"):
            batch.drop_column(column)
    with op.batch_alter_table("plans", schema=schema) as batch:
        batch.drop_constraint("fk_plans_metadata_author", type_="foreignkey")
        for column in ("content_epoch", "metadata_needs_replacement", "metadata_version", "metadata_provenance", "metadata_author_id"):
            batch.drop_column(column)
