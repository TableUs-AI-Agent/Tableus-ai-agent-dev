"""secure Alembic's public version table

Revision ID: 5c9a1d7e2b3f
Revises: f2fbc489660e
Create Date: 2026-08-18
"""

from collections.abc import Sequence

from sqlalchemy import text

from alembic import op

revision: str = "5c9a1d7e2b3f"
down_revision: str | Sequence[str] | None = "f2fbc489660e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        bind.execute(text("ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY"))


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        bind.execute(text("ALTER TABLE public.alembic_version DISABLE ROW LEVEL SECURITY"))
