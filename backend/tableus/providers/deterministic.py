from .base import Place, Recommendation

FIXTURE_PLACES = [
    Place(
        "fixture-sakura",
        "Sakura Table",
        "Japanese",
        "12 Beacon St, Boston, MA",
        4.7,
        3,
        42.357,
        -71.063,
    ),
    Place(
        "fixture-oleana",
        "Garden Mezze",
        "Mediterranean",
        "34 Hampshire St, Cambridge, MA",
        4.6,
        3,
        42.369,
        -71.099,
    ),
    Place(
        "fixture-noodle",
        "Noodle Assembly",
        "Vietnamese",
        "8 Washington St, Boston, MA",
        4.5,
        2,
        42.351,
        -71.063,
    ),
    Place(
        "fixture-trattoria",
        "Trattoria Together",
        "Italian",
        "45 Hanover St, Boston, MA",
        4.6,
        3,
        42.363,
        -71.055,
    ),
    Place(
        "fixture-tacos",
        "Common Ground Tacos",
        "Mexican",
        "20 Somerville Ave, Somerville, MA",
        4.4,
        2,
        42.38,
        -71.099,
    ),
    Place(
        "fixture-bistro",
        "Neighborhood Bistro",
        "American",
        "17 Newbury St, Boston, MA",
        4.3,
        2,
        42.35,
        -71.079,
    ),
]


class DeterministicPlacesProvider:
    name = "deterministic"

    async def resolve_location(self, query: str) -> dict:
        return {"label": query.strip() or "Boston, MA", "latitude": 42.3601, "longitude": -71.0589}

    async def discover(
        self, latitude: float, longitude: float, query: str, limit: int = 20
    ) -> list[Place]:
        normalized = query.lower().strip()
        matching = [
            place
            for place in FIXTURE_PLACES
            if not normalized or normalized in f"{place.name} {place.cuisine}".lower()
        ]
        return (matching or FIXTURE_PLACES)[: min(max(limit, 1), 20)]

    async def get_places(self, place_ids: list[str]) -> list[Place]:
        by_id = {place.place_id: place for place in FIXTURE_PLACES}
        return [by_id[place_id] for place_id in place_ids if place_id in by_id]


class DeterministicAiProvider:
    name = "deterministic"

    async def recommend(
        self, query: str, constraints: list[dict], places: list[Place]
    ) -> list[Recommendation]:
        if "no result" in query.lower():
            return []
        return [
            Recommendation(
                place_id=place.place_id,
                score=round(0.94 - index * 0.04, 2),
                reasoning="Balances the group's stated preferences with quality and location.",
            )
            for index, place in enumerate(places[:4])
        ]

    async def analyze_food(self, image_bytes: bytes, media_type: str) -> dict:
        return {
            "dish": "Sample dish",
            "cuisine": "Contemporary",
            "description": "Deterministic analysis is active; live image bytes were not retained.",
            "flavor_tags": ["savory", "fresh"],
        }

    async def regenerate_taste(self, reviews: list[dict]) -> str:
        cuisines = sorted(
            {str(review.get("cuisine")) for review in reviews if review.get("cuisine")}
        )
        suffix = f" They often enjoy {', '.join(cuisines)} food." if cuisines else ""
        return (
            f"This diner values well-reviewed restaurants and clear group-friendly choices.{suffix}"
        )
