"""push tokens

Revision ID: 0002_push_tokens
Revises: 0001_initial
Create Date: 2026-10-17

One row per phone that allowed notifications, owned by whoever signed in on it last.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy import text

from alembic import op
from tableus.config import get_settings

revision: str = "0002_push_tokens"
down_revision: str | Sequence[str] | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    settings = get_settings()
    schema = settings.database_schema
    profiles = f"{schema}.profiles" if schema else "profiles"
    op.create_table(
        "push_tokens",
        sa.Column("token", sa.String(255), primary_key=True),
        sa.Column("profile_id", sa.String(64),
                  sa.ForeignKey(f"{profiles}.id", ondelete="CASCADE"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        schema=schema,
    )
    op.create_index("ix_push_tokens_profile", "push_tokens", ["profile_id"], schema=schema)

    role = settings.tableus_runtime_db_role
    if op.get_bind().dialect.name == "postgresql" and schema and role:
        op.get_bind().execute(text(
            f'GRANT SELECT, INSERT, UPDATE, DELETE ON "{schema}".push_tokens TO "{role}"'
        ))


def downgrade() -> None:
    op.drop_table("push_tokens", schema=get_settings().database_schema)
