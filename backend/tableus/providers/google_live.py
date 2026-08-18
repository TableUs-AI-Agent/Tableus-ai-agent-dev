import asyncio
import json

import httpx
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter

from .base import Place, Recommendation


class RecommendationItem(BaseModel):
    place_id: str
    score: float = Field(ge=0, le=1)
    reasoning: str = Field(min_length=1, max_length=500)


class RecommendationOutput(BaseModel):
    restaurants: list[RecommendationItem]


class LivePlacesProvider:
    name = "google-places-new"
    field_mask = ",".join(
        [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.location",
            "places.rating",
            "places.priceLevel",
            "places.primaryTypeDisplayName",
        ]
    )

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def resolve_location(self, query: str) -> dict:
        async with httpx.AsyncClient(
            timeout=10, transport=httpx.AsyncHTTPTransport(retries=2)
        ) as client:
            response = await client.get(
                "https://maps.googleapis.com/maps/api/geocode/json",
                params={"address": query, "region": "us", "key": self.api_key},
            )
            response.raise_for_status()
        results = response.json().get("results") or []
        if not results:
            raise ValueError("Location could not be resolved")
        item = results[0]
        location = item["geometry"]["location"]
        return {
            "label": item["formatted_address"],
            "latitude": location["lat"],
            "longitude": location["lng"],
        }

    async def discover(
        self, latitude: float, longitude: float, query: str, limit: int = 20
    ) -> list[Place]:
        payload = {
            "includedTypes": ["restaurant"],
            "maxResultCount": min(max(limit, 1), 20),
            "rankPreference": "POPULARITY",
            "locationRestriction": {
                "circle": {"center": {"latitude": latitude, "longitude": longitude}, "radius": 5000}
            },
        }
        if query.strip():
            payload["includedPrimaryTypes"] = ["restaurant"]
        async with httpx.AsyncClient(
            timeout=12, transport=httpx.AsyncHTTPTransport(retries=2)
        ) as client:
            response = await client.post(
                "https://places.googleapis.com/v1/places:searchNearby",
                headers={"X-Goog-Api-Key": self.api_key, "X-Goog-FieldMask": self.field_mask},
                json=payload,
            )
            response.raise_for_status()
        return [self._normalize(item) for item in response.json().get("places", [])]

    async def get_places(self, place_ids: list[str]) -> list[Place]:
        async with httpx.AsyncClient(
            timeout=10, transport=httpx.AsyncHTTPTransport(retries=2)
        ) as client:
            responses = await asyncio.gather(
                *[
                    client.get(
                        f"https://places.googleapis.com/v1/places/{place_id}",
                        headers={
                            "X-Goog-Api-Key": self.api_key,
                            "X-Goog-FieldMask": self.field_mask.replace("places.", ""),
                        },
                    )
                    for place_id in place_ids
                ]
            )
        return [self._normalize(response.raise_for_status().json()) for response in responses]

    def _normalize(self, item: dict) -> Place:
        price = str(item.get("priceLevel", "PRICE_LEVEL_MODERATE"))
        return Place(
            place_id=str(item["id"]),
            name=str((item.get("displayName") or {}).get("text") or "Restaurant"),
            cuisine=str((item.get("primaryTypeDisplayName") or {}).get("text") or "Restaurant"),
            address=str(item.get("formattedAddress") or "Address unavailable"),
            rating=float(item.get("rating") or 0),
            price_level={
                "PRICE_LEVEL_INEXPENSIVE": 1,
                "PRICE_LEVEL_MODERATE": 2,
                "PRICE_LEVEL_EXPENSIVE": 3,
                "PRICE_LEVEL_VERY_EXPENSIVE": 4,
            }.get(price, 2),
            latitude=float((item.get("location") or {}).get("latitude") or 0),
            longitude=float((item.get("location") or {}).get("longitude") or 0),
            data_provider="google_maps",
        )


class LiveGeminiProvider:
    name = "gemini"

    def __init__(self, api_key: str, model: str):
        self.client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=15_000),
        )
        self.model = model

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential_jitter(initial=0.5, max=4),
        retry=retry_if_exception_type((TimeoutError, ConnectionError)),
        reraise=True,
    )
    async def _generate(self, **kwargs):
        return await self.client.aio.models.generate_content(**kwargs)

    async def recommend(
        self, query: str, constraints: list[dict], places: list[Place]
    ) -> list[Recommendation]:
        prompt = json.dumps(
            {
                "request": query,
                "constraints": constraints,
                "allowed_places": [place.__dict__ for place in places],
            }
        )
        response = await self._generate(
            model=self.model,
            contents=f"Choose exactly four allowed place IDs. Return JSON only.\n{prompt}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RecommendationOutput,
                temperature=0.2,
            ),
        )
        parsed = RecommendationOutput.model_validate_json(response.text or "{}")
        allowed = {place.place_id for place in places}
        unique = []
        seen: set[str] = set()
        for item in parsed.restaurants:
            if item.place_id in allowed and item.place_id not in seen:
                seen.add(item.place_id)
                unique.append(Recommendation(item.place_id, item.score, item.reasoning))
        return unique if len(unique) == 4 else []

    async def analyze_food(self, image_bytes: bytes, media_type: str) -> dict:
        response = await self._generate(
            model=self.model,
            contents=types.Content(
                parts=[
                    types.Part.from_text(
                        text="Identify the food. Return dish, cuisine, description, and flavor_tags as JSON."
                    ),
                    types.Part.from_bytes(data=image_bytes, mime_type=media_type),
                ]
            ),
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        return json.loads(response.text or "{}")

    async def regenerate_taste(self, reviews: list[dict]) -> str:
        response = await self._generate(
            model=self.model,
            contents=f"Summarize these dining preferences without safety claims: {json.dumps(reviews)}",
        )
        return (response.text or "").strip()
