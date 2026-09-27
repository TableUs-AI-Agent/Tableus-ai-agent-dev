"""Private durable account deletion queue.

Revision ID: 6d7e3b91a2c4
Revises: 8b1d4a6c2e90
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

from tableus.config import get_settings

revision: str = "6d7e3b91a2c4"
down_revision: str | Sequence[str] | None = "8b1d4a6c2e90"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    schema = get_settings().database_schema
    op.create_table(
        "account_deletions",
        sa.Column("subject_hash", sa.String(64), primary_key=True),
        sa.Column("auth_subject", sa.String(64), nullable=True),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("next_retry_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lease_token", sa.String(36), nullable=True),
        sa.Column("lease_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error_code", sa.String(32), nullable=True),
        sa.Column("needs_attention", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.CheckConstraint("status IN ('pending', 'completed')", name="ck_account_deletions_status"),
        schema=schema,
    )
    op.create_index(
        "ix_account_deletions_due", "account_deletions", ["status", "next_retry_at"], schema=schema
    )
    bind = op.get_bind()
    if bind.dialect.name == "postgresql" and schema:
        quoted_schema = bind.dialect.identifier_preparer.quote(schema)
        bind.execute(sa.text(f"REVOKE ALL ON TABLE {quoted_schema}.account_deletions FROM PUBLIC"))
        role = get_settings().tableus_runtime_db_role
        if role:
            quoted_role = bind.dialect.identifier_preparer.quote(role)
            bind.execute(sa.text(
                f"GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE {quoted_schema}.account_deletions TO {quoted_role}"
            ))


def downgrade() -> None:
    schema = get_settings().database_schema
    op.drop_index("ix_account_deletions_due", table_name="account_deletions", schema=schema)
    op.drop_table("account_deletions", schema=schema)
