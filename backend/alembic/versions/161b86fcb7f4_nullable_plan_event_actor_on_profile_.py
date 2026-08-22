"""nullable plan event actor on profile deletion

Revision ID: 161b86fcb7f4
Revises: 57a2a71fa443
Create Date: 2026-08-21 23:13:16.586184
"""
from collections.abc import Sequence

from alembic import op
from tableus.config import get_settings


revision: str = "161b86fcb7f4"
down_revision: str | Sequence[str] | None = "57a2a71fa443"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return
    schema = get_settings().database_schema
    op.drop_constraint(
        "plan_events_actor_id_fkey", "plan_events", schema=schema, type_="foreignkey"
    )
    op.alter_column("plan_events", "actor_id", schema=schema, nullable=True)
    op.create_foreign_key(
        "plan_events_actor_id_fkey",
        "plan_events",
        "profiles",
        ["actor_id"],
        ["id"],
        source_schema=schema,
        referent_schema=schema,
        ondelete="SET NULL",
    )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return
    schema = get_settings().database_schema
    op.drop_constraint(
        "plan_events_actor_id_fkey", "plan_events", schema=schema, type_="foreignkey"
    )
    # Preserve audit history. Once an actor has been anonymized by profile
    # deletion, downgrading cannot safely reconstruct that relationship. The
    # NOT NULL alteration therefore fails visibly instead of deleting events.
    op.alter_column("plan_events", "actor_id", schema=schema, nullable=False)
    op.create_foreign_key(
        "plan_events_actor_id_fkey",
        "plan_events",
        "profiles",
        ["actor_id"],
        ["id"],
        source_schema=schema,
        referent_schema=schema,
        ondelete="RESTRICT",
    )
