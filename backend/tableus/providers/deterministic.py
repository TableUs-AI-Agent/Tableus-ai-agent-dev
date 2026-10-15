"""Free, offline providers for local development, tests and CI."""

from .base import Diner, Place, Recommendation, ResolvedLocation

FIXTURE_LOCATION_ID = "fixture-location-boston"

FIXTURE_PLACES = [
    Place(
        "fixture-sakura", "Sakura Table", "Japanese", "12 Beacon St, Boston, MA",
        4.7, 3, 42.357, -71.063,
        summary="Omakase counter and izakaya plates in a calm, wood-lined room.",
        features=("takes reservations", "serves wine"), rating_count=640,
    ),
    Place(
        "fixture-oleana", "Garden Mezze", "Mediterranean", "34 Hampshire St, Cambridge, MA",
        4.6, 3, 42.369, -71.099,
        summary="Shared mezze, wood-fired breads and a leafy patio.",
        features=("serves vegetarian food", "good for groups", "outdoor seating"),
        rating_count=1210,
    ),
    Place(
        "fixture-noodle", "Noodle Assembly", "Vietnamese", "8 Washington St, Boston, MA",
        4.5, 2, 42.351, -71.063,
        summary="Fast, bright pho and rice-noodle bowls.",
        features=("serves vegetarian food",), rating_count=880,
    ),
    Place(
        "fixture-trattoria", "Trattoria Together", "Italian", "45 Hanover St, Boston, MA",
        4.6, 3, 42.363, -71.055,
        summary="Handmade pasta and long family-style tables.",
        features=("good for groups", "takes reservations", "serves wine"), rating_count=2030,
    ),
    Place(
        "fixture-tacos", "Common Ground Tacos", "Mexican", "20 Somerville Ave, Somerville, MA",
        4.4, 2, 42.38, -71.099,
        summary="Street tacos, big salsa bar and a lively back patio.",
        features=("serves vegetarian food", "outdoor seating", "serves beer"), rating_count=950,
    ),
    Place(
        "fixture-bistro", "Neighborhood Bistro", "American", "17 Newbury St, Boston, MA",
        4.3, 2, 42.35, -71.079,
        summary="Burgers, salads and a quiet dining room.",
        features=("good for children",), rating_count=410,
    ),
]

_FIXTURE_LOCATION = ResolvedLocation(
    place_id=FIXTURE_LOCATION_ID, label="Boston, MA", latitude=42.3601, longitude=-71.0589,
    region_code="US",
)


class DeterministicPlacesProvider:
    name = "deterministic"

    async def resolve_location(self, query: str) -> ResolvedLocation:
        label = query.strip() or _FIXTURE_LOCATION.label
        return ResolvedLocation(**{**_FIXTURE_LOCATION.__dict__, "label": label})

    async def get_location(self, place_id: str) -> ResolvedLocation:
        if place_id != FIXTURE_LOCATION_ID:
            raise ValueError("Location could not be resolved")
        return _FIXTURE_LOCATION

    async def discover(
        self, latitude: float, longitude: float, query: str, limit: int = 20
    ) -> list[Place]:
        return FIXTURE_PLACES[: min(max(limit, 1), 20)]

    async def get_places(self, place_ids: list[str]) -> list[Place]:
        by_id = {place.place_id: place for place in FIXTURE_PLACES}
        return [by_id[place_id] for place_id in place_ids if place_id in by_id]


def _fit(place: Place, diners: list[Diner]) -> float:
    """A transparent stand-in for the model: reward cuisine, budget and dietary fit."""
    score = place.rating / 5
    for diner in diners:
        if place.cuisine.lower() in {cuisine.lower() for cuisine in diner.cuisines}:
            score += 0.5
        if diner.max_price_level is not None and place.price_level > diner.max_price_level:
            score -= 0.4
        wishes = " ".join([*diner.dietary_notes, diner.notes, diner.taste]).lower()
        if "vegetarian" in wishes or "vegan" in wishes:
            score += 0.3 if "serves vegetarian food" in place.features else -0.3
    return score


class DeterministicAiProvider:
    name = "deterministic"

    async def recommend(
        self, request: str, diners: list[Diner], places: list[Place]
    ) -> list[Recommendation]:
        if "no result" in request.lower() or len(places) < 4:
            return []
        ranked = sorted(places, key=lambda place: (-_fit(place, diners), place.place_id))[:4]
        return [
            Recommendation(
                place_id=place.place_id,
                score=round(0.94 - index * 0.04, 2),
                reasoning=place.summary or f"Well-reviewed {place.cuisine.lower()} nearby.",
            )
            for index, place in enumerate(ranked)
        ]
