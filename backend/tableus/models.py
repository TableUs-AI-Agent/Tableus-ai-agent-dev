import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def new_id() -> str:
    return str(uuid.uuid4())


def now_utc() -> datetime:
    return datetime.now(UTC)


class PlanStatus(StrEnum):
    collecting = "collecting"
    voting = "voting"
    finalized = "finalized"


class Profile(Base):
    __tablename__ = "profiles"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(100))
    email_hash: Mapped[str] = mapped_column(String(64), unique=True)
    taste_profile: Mapped[str] = mapped_column(Text, default="")
    share_taste: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Invite(Base):
    __tablename__ = "invites"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    code_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    max_uses: Mapped[int] = mapped_column(Integer, default=1)
    use_count: Mapped[int] = mapped_column(Integer, default=0)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class InviteRedemption(Base):
    __tablename__ = "invite_redemptions"
    __table_args__ = (UniqueConstraint("invite_id", "profile_id"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    invite_id: Mapped[str] = mapped_column(ForeignKey("invites.id", ondelete="CASCADE"))
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    redeemed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class PendingAuthValidation(Base):
    __tablename__ = "pending_auth_validations"
    __table_args__ = (Index("ix_pending_auth_email_expiry", "email_hash", "expires_at"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    invite_id: Mapped[str] = mapped_column(ForeignKey("invites.id", ondelete="CASCADE"))
    email_hash: Mapped[str] = mapped_column(String(64))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    redeemed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Connection(Base):
    __tablename__ = "connections"
    __table_args__ = (UniqueConstraint("profile_id", "connected_profile_id"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    connected_profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))


class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    profile_id: Mapped[str] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"), index=True
    )
    restaurant_name: Mapped[str] = mapped_column(String(160))
    review_text: Mapped[str] = mapped_column(Text)
    rating: Mapped[float] = mapped_column(Float)
    cuisine: Mapped[str | None] = mapped_column(String(80))
    dish: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Plan(Base):
    __tablename__ = "plans"
    __table_args__ = (Index("ix_plans_organizer_updated", "organizer_id", "updated_at"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    organizer_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="RESTRICT"))
    title: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(20), default=PlanStatus.collecting.value)
    share_token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    location_label: Mapped[str] = mapped_column(String(160))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    active_run_id: Mapped[str | None] = mapped_column(String(36))
    finalized_candidate_id: Mapped[str | None] = mapped_column(String(36))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc, onupdate=now_utc
    )


class PlanParticipant(Base):
    __tablename__ = "plan_participants"
    __table_args__ = (
        UniqueConstraint("plan_id", "profile_id"),
        Index("ix_participants_profile", "profile_id"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    plan_id: Mapped[str] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"))
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    constraints: Mapped[dict] = mapped_column(JSON, default=dict)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class RecommendationRun(Base):
    __tablename__ = "recommendation_runs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    plan_id: Mapped[str] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"), index=True)
    query: Mapped[str] = mapped_column(String(500))
    provider: Mapped[str] = mapped_column(String(40))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Candidate(Base):
    __tablename__ = "candidates"
    __table_args__ = (
        UniqueConstraint("run_id", "place_id"),
        Index("ix_candidates_run_rank", "run_id", "rank"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    run_id: Mapped[str] = mapped_column(ForeignKey("recommendation_runs.id", ondelete="CASCADE"))
    place_id: Mapped[str] = mapped_column(String(255))
    match_score: Mapped[float] = mapped_column(Float)
    reasoning: Mapped[str] = mapped_column(Text)
    rank: Mapped[int] = mapped_column(Integer)


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("run_id", "profile_id"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    plan_id: Mapped[str] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"), index=True)
    run_id: Mapped[str] = mapped_column(ForeignKey("recommendation_runs.id", ondelete="CASCADE"))
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    ranking: Mapped[list[str]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class PlanEvent(Base):
    __tablename__ = "plan_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    plan_id: Mapped[str] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"), index=True)
    actor_id: Mapped[str | None] = mapped_column(
        ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True
    )
    event_type: Mapped[str] = mapped_column(String(60))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class ProviderUsage(Base):
    __tablename__ = "provider_usage"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    provider: Mapped[str] = mapped_column(String(40))
    operation: Mapped[str] = mapped_column(String(80))
    model: Mapped[str | None] = mapped_column(String(80))
    latency_ms: Mapped[int] = mapped_column(Integer)
    input_units: Mapped[int] = mapped_column(Integer, default=0)
    output_units: Mapped[int] = mapped_column(Integer, default=0)
    estimated_cost_usd: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
