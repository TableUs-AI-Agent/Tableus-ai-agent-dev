from datetime import datetime
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

T = TypeVar("T")


class Envelope(BaseModel, Generic[T]):
    data: T
    meta: dict = Field(default_factory=dict)


class InviteValidateIn(BaseModel):
    code: str = Field(min_length=3, max_length=200)
    email: str | None = Field(default=None, max_length=320)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().lower()
        if normalized.count("@") != 1 or "." not in normalized.rsplit("@", 1)[1]:
            raise ValueError("A valid email is required")
        return normalized


class InviteValidation(BaseModel):
    redemption_token: str
    expires_in_seconds: int = 1200


class InviteRedeemIn(BaseModel):
    redemption_token: str
    display_name: str = Field(min_length=1, max_length=100)


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    display_name: str
    taste_profile: str
    share_taste: bool


class ProfilePatch(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    share_taste: bool | None = None


class DeleteAccountIn(BaseModel):
    confirmation: Literal["DELETE"]


class AccountControlOut(BaseModel):
    can_delete: bool
    blockers: list[Literal["organized_plans"]]
    organized_plan_count: int
    deletion_scope: Literal["application_profile"] = "application_profile"
    supabase_auth_removal: Literal["operator_required"] = "operator_required"


class AccountExportConnection(BaseModel):
    connected_profile_id: str


class AccountExportRedemption(BaseModel):
    redeemed_at: datetime


class AccountExportMembership(BaseModel):
    plan_id: str
    title: str
    status: Literal["collecting", "voting", "finalized"]
    is_organizer: bool
    constraints: dict


class AccountExportVote(BaseModel):
    plan_id: str
    run_id: str
    ranking: list[str]
    created_at: datetime


class AccountExportEvent(BaseModel):
    plan_id: str
    event_type: str
    payload: dict
    created_at: datetime


class ConnectionIn(BaseModel):
    profile_id: str = Field(min_length=1, max_length=64)


class ConnectionOut(BaseModel):
    profile_id: str
    display_name: str
    taste_profile: str | None


class ReviewIn(BaseModel):
    restaurant_name: str = Field(min_length=1, max_length=160)
    review_text: str = Field(min_length=1, max_length=3000)
    rating: float = Field(ge=1, le=5)
    dish: str | None = Field(default=None, max_length=120)
    cuisine: str | None = Field(default=None, max_length=80)


class ReviewOut(ReviewIn):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime


class AccountExportOut(BaseModel):
    schema_version: Literal["1"] = "1"
    exported_at: datetime
    profile: ProfileOut
    connections: list[AccountExportConnection]
    reviews: list[ReviewOut]
    invite_redemptions: list[AccountExportRedemption]
    plan_memberships: list[AccountExportMembership]
    votes: list[AccountExportVote]
    authored_plan_events: list[AccountExportEvent]


class TasteProfileOut(BaseModel):
    preferences_text: str
    share_taste: bool


class LocationIn(BaseModel):
    query: str = Field(min_length=2, max_length=200)

    @field_validator("query", mode="before")
    @classmethod
    def normalize_query(cls, value: str) -> str:
        return " ".join(str(value).split())


class LocationOut(BaseModel):
    place_id: str
    label: str
    data_provider: Literal["fixture", "google_maps"]


class DiscoverIn(BaseModel):
    query: str = Field(default="", max_length=500)
    latitude: float = Field(ge=24.0, le=50.0)
    longitude: float = Field(ge=-125.0, le=-66.0)
    limit: int = Field(default=20, ge=1, le=20)


class PlaceOut(BaseModel):
    place_id: str
    name: str
    cuisine: str
    address: str
    rating: float
    price_level: int
    latitude: float
    longitude: float
    data_provider: Literal["fixture", "google_maps"]


class PlanCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    location_label: str = Field(min_length=1, max_length=160)
    location_place_id: str | None = Field(default=None, min_length=1, max_length=255)
    latitude: float | None = Field(default=None, ge=24.0, le=50.0)
    longitude: float | None = Field(default=None, ge=-125.0, le=-66.0)

    @field_validator("location_label", mode="before")
    @classmethod
    def normalize_location_label(cls, value: str) -> str:
        return " ".join(str(value).split())

    @model_validator(mode="after")
    def one_location_source(self):
        has_place = self.location_place_id is not None
        has_coordinates = self.latitude is not None or self.longitude is not None
        if has_place == has_coordinates:
            raise ValueError("Provide either a location Place ID or legacy coordinates")
        if has_coordinates and (self.latitude is None or self.longitude is None):
            raise ValueError("Latitude and longitude must be provided together")
        return self


class PlanJoinIn(BaseModel):
    share_token: str = Field(min_length=20, max_length=200)


class ConstraintsIn(BaseModel):
    cuisines: list[str] = Field(default_factory=list, max_length=20)
    dietary_notes: list[str] = Field(default_factory=list, max_length=20)
    max_price_level: int | None = Field(default=None, ge=1, le=4)
    notes: str = Field(default="", max_length=500)


class RecommendationIn(BaseModel):
    query: str = Field(min_length=1, max_length=500)


class VoteIn(BaseModel):
    ranking: list[str] = Field(min_length=3, max_length=3)

    @field_validator("ranking")
    @classmethod
    def ranking_is_unique(cls, value: list[str]) -> list[str]:
        if len(set(value)) != 3:
            raise ValueError("Ranking must contain three unique candidate IDs")
        return value


class FinalizeIn(BaseModel):
    candidate_id: str | None = None


class ParticipantOut(BaseModel):
    profile_id: str
    display_name: str
    constraints: dict
    is_organizer: bool


class CandidateOut(BaseModel):
    id: str
    place: PlaceOut
    match_score: float
    reasoning: str
    rank: int
    vote_score: int = 0


class PlanOut(BaseModel):
    id: str
    title: str
    organizer_id: str
    viewer_is_organizer: bool
    status: Literal["collecting", "voting", "finalized"]
    location_label: str
    latitude: float | None
    longitude: float | None
    participants: list[ParticipantOut]
    candidates: list[CandidateOut]
    my_vote: list[str] | None
    finalized_candidate_id: str | None
    created_at: datetime
    updated_at: datetime


class PlanCreated(BaseModel):
    plan: PlanOut
    share_token: str


class PlanSummaryOut(BaseModel):
    id: str
    title: str
    status: Literal["collecting", "voting", "finalized"]
    location_label: str
    participant_count: int
    created_at: datetime
    updated_at: datetime


class PlanRevisionOut(BaseModel):
    updated_at: datetime


class ProviderUsageAggregateOut(BaseModel):
    provider: str
    operation: str
    operation_count: int
    input_units: int
    output_units: int


class ShareTokenOut(BaseModel):
    share_token: str


class FoodAnalysisOut(BaseModel):
    dish: str
    cuisine: str
    description: str
    flavor_tags: list[str]


class DeleteAccountOut(BaseModel):
    deleted: bool
