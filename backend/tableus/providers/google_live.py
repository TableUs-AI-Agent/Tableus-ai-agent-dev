import asyncio
import json
import math
from urllib.parse import quote

import httpx
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter

from .base import Place, PlacesUsageRecorder, Recommendation, ResolvedLocation


class RecommendationItem(BaseModel):
    place_id: str
    score: float = Field(ge=0, le=1)
    reasoning: str = Field(min_length=1, max_length=500)


class RecommendationOutput(BaseModel):
    restaurants: list[RecommendationItem]


class PlacesProviderError(RuntimeError):
    def __init__(
        self,
        message: str,
        *,
        kind: str,
        status_code: int | None = None,
        attempts: int = 0,
    ):
        super().__init__(message)
        self.kind = kind
        self.status_code = status_code
        self.attempts = attempts


class LivePlacesProvider:
    name = "google-places-new"
    search_field_mask = ",".join(
        [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.location",
            "places.rating",
            "places.priceLevel",
            "places.primaryType",
        ]
    )
    detail_field_mask = search_field_mask.replace("places.", "")
    location_search_field_mask = ",".join(
        [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.location",
            "places.postalAddress",
        ]
    )
    location_detail_field_mask = location_search_field_mask.replace("places.", "")

    def __init__(self, api_key: str, transport: httpx.AsyncBaseTransport | None = None):
        self.api_key = api_key
        self.transport = transport

    async def _request(self, client: httpx.AsyncClient, method: str, url: str, **kwargs):
        attempts = 0
        for attempt in range(3):
            attempts += 1
            try:
                response = await client.request(method, url, **kwargs)
            except (httpx.TimeoutException, httpx.NetworkError) as exc:
                if attempt == 2:
                    raise PlacesProviderError(
                        "Google Places is temporarily unavailable",
                        kind="transient",
                        attempts=attempts,
                    ) from exc
                await asyncio.sleep(0.25 * (2**attempt))
                continue
            if response.status_code in {408, 429} or response.status_code >= 500:
                if attempt == 2:
                    raise PlacesProviderError(
                        "Google Places is temporarily unavailable",
                        kind="transient",
                        status_code=response.status_code,
                        attempts=attempts,
                    )
                await asyncio.sleep(0.25 * (2**attempt))
                continue
            if response.status_code == 404:
                raise PlacesProviderError(
                    "Location or place could not be resolved",
                    kind="not_found",
                    status_code=404,
                    attempts=attempts,
                )
            if response.status_code >= 400:
                raise PlacesProviderError(
                    "Google Places rejected the configured request",
                    kind="configuration",
                    status_code=response.status_code,
                    attempts=attempts,
                )
            try:
                return response.json(), attempts
            except ValueError as exc:
                raise PlacesProviderError(
                    "Google Places returned an invalid response",
                    kind="configuration",
                    attempts=attempts,
                ) from exc
        raise AssertionError("unreachable")

    async def resolve_location(
        self, query: str, usage: PlacesUsageRecorder | None = None
    ) -> ResolvedLocation:
        attempts = 0
        try:
            async with httpx.AsyncClient(timeout=10, transport=self.transport) as client:
                data, attempts = await self._request(
                    client,
                    "POST",
                    "https://places.googleapis.com/v1/places:searchText",
                    headers={
                        "X-Goog-Api-Key": self.api_key,
                        "X-Goog-FieldMask": self.location_search_field_mask,
                    },
                    json={"textQuery": query, "pageSize": 1, "regionCode": "US"},
                )
            results = data.get("places") or []
            if not results:
                raise PlacesProviderError("Location could not be resolved", kind="not_found")
            resolved = self._normalize_location(results[0])
            if resolved.region_code != "US":
                raise PlacesProviderError("Only United States locations are supported", kind="not_found")
            if usage:
                await usage("location.resolve", attempts, 1, False)
            return resolved
        except PlacesProviderError as exc:
            if usage:
                await usage("location.resolve", exc.attempts or attempts or 1, 0, True)
            raise

    async def get_location(
        self, place_id: str, usage: PlacesUsageRecorder | None = None
    ) -> ResolvedLocation:
        attempts = 0
        try:
            async with httpx.AsyncClient(timeout=10, transport=self.transport) as client:
                data, attempts = await self._request(
                    client,
                    "GET",
                    f"https://places.googleapis.com/v1/places/{quote(place_id, safe='')}",
                    headers={
                        "X-Goog-Api-Key": self.api_key,
                        "X-Goog-FieldMask": self.location_detail_field_mask,
                    },
                )
            resolved = self._normalize_location(data)
            if resolved.region_code != "US":
                raise PlacesProviderError("Only United States locations are supported", kind="not_found")
            if usage:
                await usage("location.details", attempts, 1, False)
            return resolved
        except PlacesProviderError as exc:
            if usage:
                await usage("location.details", exc.attempts or attempts or 1, 0, True)
            raise

    async def discover(
        self,
        latitude: float,
        longitude: float,
        query: str,
        limit: int = 20,
        usage: PlacesUsageRecorder | None = None,
    ) -> list[Place]:
        normalized_query = query.strip()
        bounded_limit = min(max(limit, 1), 20)
        center = {"latitude": latitude, "longitude": longitude}
        if normalized_query:
            operation = "restaurant.text_search"
            url = "https://places.googleapis.com/v1/places:searchText"
            payload = {
                "textQuery": normalized_query,
                "pageSize": bounded_limit,
                "includedType": "restaurant",
                "strictTypeFiltering": True,
                "regionCode": "US",
                "locationBias": {"circle": {"center": center, "radius": 5000}},
            }
        else:
            operation = "restaurant.nearby_search"
            url = "https://places.googleapis.com/v1/places:searchNearby"
            payload = {
                "includedTypes": ["restaurant"],
                "maxResultCount": bounded_limit,
                "rankPreference": "POPULARITY",
                "locationRestriction": {"circle": {"center": center, "radius": 5000}},
            }
        attempts = 0
        try:
            async with httpx.AsyncClient(timeout=12, transport=self.transport) as client:
                data, attempts = await self._request(
                    client,
                    "POST",
                    url,
                    headers={
                        "X-Goog-Api-Key": self.api_key,
                        "X-Goog-FieldMask": self.search_field_mask,
                    },
                    json=payload,
                )
            places = [self._normalize(item) for item in data.get("places", [])]
            places = [
                place
                for place in places
                if self._distance_km(latitude, longitude, place.latitude, place.longitude) <= 5
            ][:bounded_limit]
            if usage:
                await usage(operation, attempts, len(places), False)
            return places
        except PlacesProviderError as exc:
            if usage:
                await usage(operation, exc.attempts or attempts or 1, 0, True)
            raise

    async def get_places(
        self, place_ids: list[str], usage: PlacesUsageRecorder | None = None
    ) -> list[Place]:
        unique_ids = list(dict.fromkeys(place_ids))
        semaphore = asyncio.Semaphore(4)

        async def fetch(client: httpx.AsyncClient, place_id: str):
            async with semaphore:
                return await self._request(
                    client,
                    "GET",
                    f"https://places.googleapis.com/v1/places/{quote(place_id, safe='')}",
                    headers={
                        "X-Goog-Api-Key": self.api_key,
                        "X-Goog-FieldMask": self.detail_field_mask,
                    },
                )

        attempts = 0
        try:
            async with httpx.AsyncClient(timeout=10, transport=self.transport) as client:
                results = await asyncio.gather(
                    *(fetch(client, item) for item in unique_ids), return_exceptions=True
                )
            attempts = sum(
                item.attempts if isinstance(item, PlacesProviderError) else item[1]
                for item in results
                if isinstance(item, PlacesProviderError) or isinstance(item, tuple)
            )
            first_error = next((item for item in results if isinstance(item, Exception)), None)
            if first_error:
                if isinstance(first_error, PlacesProviderError):
                    first_error.attempts = attempts
                    raise first_error
                raise PlacesProviderError(
                    "Google Places returned an invalid response",
                    kind="configuration",
                    attempts=attempts,
                ) from first_error
            normalized = [self._normalize(item[0]) for item in results if isinstance(item, tuple)]
            by_id = {place.place_id: place for place in normalized}
            places = [by_id[item] for item in unique_ids if item in by_id]
            if len(places) != len(unique_ids):
                raise PlacesProviderError("A complete place set could not be refreshed", kind="not_found")
            if usage:
                await usage("restaurant.details", attempts, len(places), False)
            return places
        except PlacesProviderError as exc:
            if usage:
                await usage("restaurant.details", exc.attempts or attempts or 1, 0, True)
            raise

    def _normalize_location(self, item: dict) -> ResolvedLocation:
        location = item.get("location") or {}
        region_code = str((item.get("postalAddress") or {}).get("regionCode") or "").upper()
        if not item.get("id") or "latitude" not in location or "longitude" not in location:
            raise PlacesProviderError("Google Places returned an incomplete location", kind="configuration")
        return ResolvedLocation(
            place_id=str(item["id"]),
            label=str(item.get("formattedAddress") or (item.get("displayName") or {}).get("text") or ""),
            latitude=float(location["latitude"]),
            longitude=float(location["longitude"]),
            region_code=region_code,
            data_provider="google_maps",
        )

    def _normalize(self, item: dict) -> Place:
        location = item.get("location") or {}
        if not item.get("id") or "latitude" not in location or "longitude" not in location:
            raise PlacesProviderError(
                "Google Places returned incomplete restaurant data", kind="configuration"
            )
        price = str(item.get("priceLevel", "PRICE_LEVEL_MODERATE"))
        return Place(
            place_id=str(item["id"]),
            name=str((item.get("displayName") or {}).get("text") or "Restaurant"),
            cuisine=self._normalize_cuisine(item),
            address=str(item.get("formattedAddress") or "Address unavailable"),
            rating=float(item.get("rating") or 0),
            price_level={
                "PRICE_LEVEL_INEXPENSIVE": 1,
                "PRICE_LEVEL_MODERATE": 2,
                "PRICE_LEVEL_EXPENSIVE": 3,
                "PRICE_LEVEL_VERY_EXPENSIVE": 4,
            }.get(price, 2),
            latitude=float(location["latitude"]),
            longitude=float(location["longitude"]),
            data_provider="google_maps",
        )

    @staticmethod
    def _normalize_cuisine(item: dict) -> str:
        primary_type = str(item.get("primaryType") or "")
        if primary_type.endswith("_restaurant"):
            return primary_type.removesuffix("_restaurant").replace("_", " ").title()
        return primary_type.replace("_", " ").title() or "Restaurant"

    @staticmethod
    def _distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        radius = 6371.0
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        value = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        return radius * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))


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
