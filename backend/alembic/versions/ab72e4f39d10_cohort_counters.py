"""Private durable cohort quota counters and surviving-plan backfill.

Revision ID: ab72e4f39d10
Revises: 6d7e3b91a2c4
"""

import hashlib
from collections import Counter
from collections.abc import Sequence
from datetime import UTC, datetime

import sqlalchemy as sa
from alembic import op

from tableus.config import get_settings

revision: str = "ab72e4f39d10"
down_revision: str | Sequence[str] | None = "6d7e3b91a2c4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _subject_hash(subject: str) -> str:
    # Match auth.subject_digest without importing runtime authentication here.
    return hashlib.sha256(("tableus-account-v1:" + subject).encode()).hexdigest()


def upgrade() -> None:
    schema = get_settings().database_schema
    op.create_table(
        "cohort_counters",
        sa.Column("subject_hash", sa.String(64), primary_key=True),
        sa.Column("kind", sa.String(12), primary_key=True),
        sa.Column("period_key", sa.String(10), primary_key=True),
        sa.Column("used", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("kind IN ('ai', 'places', 'plans')", name="ck_cohort_counters_kind"),
        sa.CheckConstraint("used >= 0", name="ck_cohort_counters_used"),
        schema=schema,
    )
    bind = op.get_bind()
    quoted = bind.dialect.identifier_preparer
    prefix = f"{quoted.quote(schema)}." if schema else ""
    plans = bind.execute(sa.text(f"SELECT id, organizer_id FROM {prefix}plans")).all()
    creation_events = bind.execute(sa.text(
        f"SELECT plan_id, actor_id FROM {prefix}plan_events "
        "WHERE event_type = 'plan.created' AND actor_id IS NOT NULL "
        "ORDER BY created_at, id"
    )).all()
    creator_by_plan: dict[str, str] = {}
    for plan_id, actor_id in creation_events:
        creator_by_plan.setdefault(plan_id, actor_id)
    # Events disappear with deleted plans. For an extant plan lacking a usable
    # creation event, use its present organizer as a baseline approximation.
    counts = Counter(
        _subject_hash(creator_by_plan.get(plan_id, organizer_id))
        for plan_id, organizer_id in plans
    )
    if counts:
        ledger = sa.table(
            "cohort_counters",
            sa.column("subject_hash", sa.String(64)),
            sa.column("kind", sa.String(12)),
            sa.column("period_key", sa.String(10)),
            sa.column("used", sa.Integer()),
            sa.column("updated_at", sa.DateTime(timezone=True)),
            schema=schema,
        )
        bind.execute(sa.insert(ledger), [
            {
                "subject_hash": digest,
                "kind": "plans",
                "period_key": "lifetime",
                "used": count,
                "updated_at": datetime.now(UTC),
            }
            for digest, count in counts.items()
        ])
    if bind.dialect.name == "postgresql" and schema:
        bind.execute(sa.text(f"REVOKE ALL ON TABLE {prefix}cohort_counters FROM PUBLIC"))
        role = get_settings().tableus_runtime_db_role
        if role:
            bind.execute(sa.text(
                f"REVOKE ALL ON TABLE {prefix}cohort_counters FROM {quoted.quote(role)}"
            ))
            bind.execute(sa.text(
                f"GRANT SELECT, INSERT, UPDATE ON TABLE {prefix}cohort_counters "
                f"TO {quoted.quote(role)}"
            ))


def downgrade() -> None:
    op.drop_table("cohort_counters", schema=get_settings().database_schema)
