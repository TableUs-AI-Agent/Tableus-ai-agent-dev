from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class Place:
    place_id: str
    name: str
    cuisine: str
    address: str
    rating: float
    price_level: int
    latitude: float
    longitude: float
    data_provider: str = "fixture"
    summary: str = ""
    features: tuple[str, ...] = ()
    rating_count: int = 0


@dataclass(frozen=True)
class ResolvedLocation:
    place_id: str
    label: str
    latitude: float
    longitude: float
    region_code: str
    data_provider: str = "fixture"


@dataclass(frozen=True)
class Recommendation:
    place_id: str
    score: float
    reasoning: str


@dataclass(frozen=True)
class Diner:
    """One person's wishes for a plan, as the recommender sees them."""

    cuisines: list[str]
    dietary_notes: list[str]
    max_price_level: int | None
    notes: str
    taste: str = ""


class ProviderError(RuntimeError):
    """A provider failed in a way the user can retry later (kind=transient) or not."""

    def __init__(self, message: str, *, kind: str = "transient", status_code: int | None = None):
        super().__init__(message)
        self.kind = kind
        self.status_code = status_code


class PlacesProvider(Protocol):
    name: str

    async def resolve_location(self, query: str) -> ResolvedLocation: ...

    async def get_location(self, place_id: str) -> ResolvedLocation: ...

    async def discover(
        self, latitude: float, longitude: float, query: str, limit: int = 20
    ) -> list[Place]: ...

    async def get_places(self, place_ids: list[str]) -> list[Place]: ...


class AiProvider(Protocol):
    name: str

    async def recommend(
        self, request: str, diners: list[Diner], places: list[Place]
    ) -> list[Recommendation]: ...
