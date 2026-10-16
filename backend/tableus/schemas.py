from datetime import datetime
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, Field, field_validator, model_validator

T = TypeVar("T")
PlanStatusValue = Literal["collecting", "voting", "finalized"]


def _single_spaced(value: str) -> str:
    return " ".join(str(value).split())


class Envelope(BaseModel, Generic[T]):
    data: T
    meta: dict = Field(default_factory=dict)


class MeOut(BaseModel):
    id: str
    display_name: str
    taste_profile: str
    can_create_plans: bool


class MeIn(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)
    taste_profile: str | None = Field(default=None, max_length=600)

    normalize_name = field_validator("display_name", mode="before")(_single_spaced)


class LocationIn(BaseModel):
    query: str = Field(min_length=2, max_length=200)

    normalize_query = field_validator("query", mode="before")(_single_spaced)


class LocationOut(BaseModel):
    place_id: str
    label: str
    data_provider: Literal["fixture", "google_maps"]


class PhotoCreditOut(BaseModel):
    name: str
    uri: str = ""


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
    summary: str = ""
    features: list[str] = Field(default_factory=list)
    rating_count: int = 0
    # An API path (join it to the API origin), shown with its photo credits.
    photo_url: str | None = None
    photo_credits: list[PhotoCreditOut] = Field(default_factory=list)


class PlanCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    location_label: str = Field(min_length=1, max_length=160)
    location_place_id: str | None = Field(default=None, min_length=1, max_length=255)
    # Coordinates are accepted only with the deterministic Places provider.
    latitude: float | None = Field(default=None, ge=24.0, le=50.0)
    longitude: float | None = Field(default=None, ge=-125.0, le=-66.0)

    normalize_label = field_validator("location_label", mode="before")(_single_spaced)

    @model_validator(mode="after")
    def one_location_source(self):
        has_place = self.location_place_id is not None
        has_coordinates = self.latitude is not None or self.longitude is not None
        if has_place == has_coordinates:
            raise ValueError("Provide either a location Place ID or coordinates")
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
    query: str = Field(default="", max_length=500)


class VoteIn(BaseModel):
    ranking: list[str] = Field(min_length=3, max_length=3)

    @field_validator("ranking")
    @classmethod
    def ranking_is_unique(cls, value: list[str]) -> list[str]:
        if len(set(value)) != 3:
            raise ValueError("Ranking must contain three different options")
        return value


class FinalizeIn(BaseModel):
    candidate_id: str | None = None


class ParticipantOut(BaseModel):
    profile_id: str
    display_name: str
    constraints: dict
    is_organizer: bool
    has_voted: bool = False


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
    status: PlanStatusValue
    location_label: str
    latitude: float | None
    longitude: float | None
    share_token: str
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
    status: PlanStatusValue
    location_label: str
    participant_count: int
    viewer_is_organizer: bool
    created_at: datetime
    updated_at: datetime


class PlanRevisionOut(BaseModel):
    updated_at: datetime


class ShareTokenOut(BaseModel):
    share_token: str


class DeletedOut(BaseModel):
    deleted: bool
