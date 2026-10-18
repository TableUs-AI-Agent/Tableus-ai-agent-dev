import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import (
    JSON,
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
    # The Supabase Auth user ID.
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(100))
    # Standing tastes the recommender reads in every plan; only its owner sees it.
    taste_profile: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Plan(Base):
    __tablename__ = "plans"
    __table_args__ = (Index("ix_plans_organizer_updated", "organizer_id", "updated_at"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    organizer_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(20), default=PlanStatus.collecting.value)
    # Anyone in the plan can re-share its link, so the token is stored as-is.
    share_token: Mapped[str] = mapped_column(String(64), unique=True)
    location_label: Mapped[str] = mapped_column(String(160))
    location_place_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
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
    __table_args__ = (Index("ix_recommendation_runs_plan_id", "plan_id"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    plan_id: Mapped[str] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"))
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
    # Only the Place ID is stored; Google's terms keep place details out of our database.
    place_id: Mapped[str] = mapped_column(String(255))
    match_score: Mapped[float] = mapped_column(Float)
    reasoning: Mapped[str] = mapped_column(Text)
    rank: Mapped[int] = mapped_column(Integer)


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (
        UniqueConstraint("run_id", "profile_id"),
        Index("ix_votes_plan_id", "plan_id"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    plan_id: Mapped[str] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"))
    run_id: Mapped[str] = mapped_column(ForeignKey("recommendation_runs.id", ondelete="CASCADE"))
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    ranking: Mapped[list[str]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class PushToken(Base):
    """An Expo push token for one phone. A phone belongs to whoever signed in on it last."""

    __tablename__ = "push_tokens"
    __table_args__ = (Index("ix_push_tokens_profile", "profile_id"),)
    token: Mapped[str] = mapped_column(String(255), primary_key=True)
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc, onupdate=now_utc
    )
