"""policy-safe plan locations

Revision ID: 8b1d4a6c2e90
Revises: 161b86fcb7f4
Create Date: 2026-08-24
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

from tableus.config import get_settings

revision: str = "8b1d4a6c2e90"
down_revision: str | Sequence[str] | None = "161b86fcb7f4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    schema = get_settings().database_schema
    with op.batch_alter_table("plans", schema=schema) as batch:
        batch.add_column(sa.Column("location_place_id", sa.String(length=255), nullable=True))
        batch.alter_column("latitude", existing_type=sa.Float(), nullable=True)
        batch.alter_column("longitude", existing_type=sa.Float(), nullable=True)


def downgrade() -> None:
    schema = get_settings().database_schema
    with op.batch_alter_table("plans", schema=schema) as batch:
        batch.alter_column("longitude", existing_type=sa.Float(), nullable=False)
        batch.alter_column("latitude", existing_type=sa.Float(), nullable=False)
        batch.drop_column("location_place_id")
