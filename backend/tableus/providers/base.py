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


@dataclass(frozen=True)
class Recommendation:
    place_id: str
    score: float
    reasoning: str


class PlacesProvider(Protocol):
    name: str

    async def resolve_location(self, query: str) -> dict: ...

    async def discover(
        self, latitude: float, longitude: float, query: str, limit: int = 20
    ) -> list[Place]: ...

    async def get_places(self, place_ids: list[str]) -> list[Place]: ...


class AiProvider(Protocol):
    name: str

    async def recommend(
        self, query: str, constraints: list[dict], places: list[Place]
    ) -> list[Recommendation]: ...

    async def analyze_food(self, image_bytes: bytes, media_type: str) -> dict: ...

    async def regenerate_taste(self, reviews: list[dict]) -> str: ...
