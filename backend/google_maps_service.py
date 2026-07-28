"""
Google Maps helpers for geocoding locations and finding nearby restaurants.
"""
from __future__ import annotations

import math
import os
import time
from typing import Any, Dict, List, Optional
from urllib.parse import quote

import requests


class GoogleMapsServiceError(RuntimeError):
    """Raised when Google Maps APIs cannot satisfy a request."""


RESTAURANT_LIKE_TYPES = {
    "bar",
    "cafe",
    "bakery",
    "meal_takeaway",
    "meal_delivery",
    "coffee_shop",
    "ice_cream_shop",
    "juice_shop",
    "sandwich_shop",
    "deli",
    "diner",
}

RESTAURANT_LIKE_NAME_TERMS = {
    "restaurant",
    "bar",
    "cafe",
    "coffee",
    "bakery",
    "bistro",
    "brasserie",
    "cantina",
    "deli",
    "diner",
    "eatery",
    "grill",
    "kitchen",
    "pub",
    "ramen",
    "steakhouse",
    "sushi",
    "taqueria",
    "tavern",
    "trattoria",
}

LODGING_NAME_TERMS = {
    "hotel",
    "hostel",
    "inn",
    "motel",
    "resort",
    "suites",
    "crowne plaza",
    "fairmont",
    "hilton",
    "hyatt",
    "ihg",
    "intercontinental",
    "marriott",
    "sonesta",
    "swissotel",
}


class GoogleMapsService:
    def __init__(self) -> None:
        api_key = (os.getenv("GOOGLE_MAPS_API_KEY") or "").strip().strip("'\"")
        if not api_key:
            raise GoogleMapsServiceError(
                "GOOGLE_MAPS_API_KEY is not configured in backend/.env."
            )
        self.api_key = api_key

    def resolve_location(self, query: str) -> Dict[str, Any]:
        cleaned = query.strip()
        if not cleaned:
            raise GoogleMapsServiceError("Location query cannot be empty.")

        response = requests.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={"address": cleaned, "key": self.api_key},
            timeout=10,
        )
        self._raise_for_http(response, "Google Geocoding API")

        payload = response.json()
        status = payload.get("status")
        if status == "ZERO_RESULTS":
            raise GoogleMapsServiceError(f'Could not find a location for "{cleaned}".')
        if status != "OK":
            raise GoogleMapsServiceError(self._google_error("Google Geocoding API", payload))

        result = payload["results"][0]
        location = result["geometry"]["location"]
        return {
            "label": self._format_geocode_label(result),
            "latitude": location["lat"],
            "longitude": location["lng"],
        }

    def search_nearby_restaurants(
        self,
        latitude: float,
        longitude: float,
        radius_meters: int = 2000,
        limit: int = 20,
        keyword: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Nearby Search returns up to ~20 per page; paginate when limit exceeds one page."""
        limit = min(max(limit, 1), 60)
        base_params: Dict[str, Any] = {
            "location": f"{latitude},{longitude}",
            "radius": radius_meters,
            "type": "restaurant",
            "key": self.api_key,
        }
        if keyword:
            base_params["keyword"] = keyword

        raw_places: List[Dict[str, Any]] = []
        pagetoken: Optional[str] = None

        for _ in range(3):
            params = dict(base_params)
            if pagetoken:
                params["pagetoken"] = pagetoken

            response = requests.get(
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                params=params,
                timeout=12,
            )
            self._raise_for_http(response, "Google Places Nearby Search")

            payload = response.json()
            status = payload.get("status")
            if status == "INVALID_REQUEST" and pagetoken:
                time.sleep(2.5)
                response = requests.get(
                    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                    params=params,
                    timeout=12,
                )
                self._raise_for_http(response, "Google Places Nearby Search")
                payload = response.json()
                status = payload.get("status")

            if status not in {"OK", "ZERO_RESULTS"}:
                raise GoogleMapsServiceError(self._google_error("Google Places Nearby Search", payload))

            raw_places.extend(
                place
                for place in payload.get("results", [])
                if self._should_keep_nearby_result(place)
            )
            if len(raw_places) >= limit:
                break

            pagetoken = payload.get("next_page_token")
            if not pagetoken:
                break
            time.sleep(2.2)

        seen: set[str] = set()
        unique_places: List[Dict[str, Any]] = []
        for place in raw_places:
            pid = place.get("place_id")
            if not pid or pid in seen:
                continue
            seen.add(pid)
            unique_places.append(place)
            if len(unique_places) >= limit:
                break

        restaurants = [
            self._normalize_restaurant(place, latitude, longitude)
            for place in unique_places
        ]
        restaurants.sort(
            key=lambda item: (
                item.get("distance_meters", float("inf")),
                -(item.get("quality_score", 0.0)),
            )
        )
        return restaurants

    def _normalize_restaurant(
        self, place: Dict[str, Any], origin_latitude: float, origin_longitude: float
    ) -> Dict[str, Any]:
        geometry = place.get("geometry", {}).get("location", {})
        latitude = geometry.get("lat")
        longitude = geometry.get("lng")
        rating = float(place.get("rating", 0.0) or 0.0)
        review_count = int(place.get("user_ratings_total", 0) or 0)
        price_level = int(place.get("price_level", 2) or 2)
        distance_meters = self._calculate_distance_meters(
            origin_latitude,
            origin_longitude,
            latitude,
            longitude,
        )
        cuisine = self._infer_cuisine(place)
        atmosphere = self._infer_atmosphere(place, price_level)
        photo_reference = self._photo_reference(place)

        return {
            "id": place.get("place_id"),
            "place_id": place.get("place_id"),
            "name": place.get("name", "Unknown restaurant"),
            "cuisine": cuisine,
            "rating": rating,
            "user_ratings_total": review_count,
            "price_level": max(price_level, 1),
            "atmosphere": atmosphere,
            "address": place.get("vicinity")
            or place.get("formatted_address")
            or "Address unavailable",
            "description": self._build_description(cuisine, atmosphere, rating, review_count),
            "latitude": latitude,
            "longitude": longitude,
            "distance_meters": distance_meters,
            "distance_label": self._format_distance(distance_meters),
            "photo_reference": photo_reference,
            "photo_url": self._photo_url(photo_reference),
            "quality_score": rating * math.log(review_count + 1),
            "types": place.get("types", []),
        }

    def fetch_place_photo(
        self, photo_reference: str, max_width: int = 800
    ) -> tuple[bytes, str]:
        reference = photo_reference.strip()
        if not reference:
            raise GoogleMapsServiceError("Photo reference cannot be empty.")

        width = min(max(int(max_width or 800), 1), 1600)
        try:
            response = requests.get(
                "https://maps.googleapis.com/maps/api/place/photo",
                params={
                    "maxwidth": width,
                    "photo_reference": reference,
                    "key": self.api_key,
                },
                timeout=12,
            )
        except requests.RequestException as exc:
            raise GoogleMapsServiceError("Google Place Photo request failed.") from exc

        self._raise_for_http(response, "Google Place Photo")
        content_type = response.headers.get("content-type", "image/jpeg").split(";")[0]
        if not content_type.lower().startswith("image/"):
            raise GoogleMapsServiceError("Google Place Photo did not return image content.")
        return response.content, content_type

    def _photo_reference(self, place: Dict[str, Any]) -> str:
        photos = place.get("photos") or []
        if photos:
            reference = photos[0].get("photo_reference")
            if reference:
                return str(reference)
        return ""

    def _photo_url(self, photo_reference: str) -> str:
        if not photo_reference:
            return ""
        encoded_reference = quote(photo_reference, safe="")
        path = f"/api/places/photo/{encoded_reference}?maxwidth=800"
        return f"{self._photo_proxy_base_url()}{path}"

    def _photo_proxy_base_url(self) -> str:
        # Keep photo_url directly usable by frontend img tags without exposing the Google key.
        for key in ("BACKEND_PUBLIC_URL", "TABLEUS_API_BASE_URL", "NEXT_PUBLIC_API_URL"):
            base_url = (os.getenv(key) or "").strip().strip("'\"")
            if base_url:
                return base_url.rstrip("/")
        return "http://localhost:8000"

    def _should_keep_nearby_result(self, place: Dict[str, Any]) -> bool:
        """Drop pure lodging hits; keep hotel venues only with a clear dining signal."""
        types = set(place.get("types") or [])
        if "lodging" not in types:
            return True
        if self._has_lodging_name(place) and not self._has_restaurant_name_signal(place):
            return False
        if self._has_restaurant_signal(place):
            return True
        return False

    def _has_lodging_name(self, place: Dict[str, Any]) -> bool:
        name = str(place.get("name") or "").lower()
        return any(term in name for term in LODGING_NAME_TERMS)

    def _has_restaurant_name_signal(self, place: Dict[str, Any]) -> bool:
        name = str(place.get("name") or "").lower()
        return any(term in name for term in RESTAURANT_LIKE_NAME_TERMS)

    def _has_restaurant_signal(self, place: Dict[str, Any]) -> bool:
        types = set(place.get("types") or [])
        if types & RESTAURANT_LIKE_TYPES:
            return True
        if any(item.endswith("_restaurant") for item in types):
            return True

        if self._has_restaurant_name_signal(place):
            return True
        return False

    def _infer_cuisine(self, place: Dict[str, Any]) -> str:
        types = place.get("types", [])
        mapping = {
            "japanese_restaurant": "Japanese",
            "sushi_restaurant": "Japanese",
            "italian_restaurant": "Italian",
            "pizza_restaurant": "Italian",
            "thai_restaurant": "Thai",
            "indian_restaurant": "Indian",
            "mexican_restaurant": "Mexican",
            "chinese_restaurant": "Chinese",
            "korean_restaurant": "Korean",
            "vietnamese_restaurant": "Vietnamese",
            "greek_restaurant": "Greek",
            "seafood_restaurant": "Seafood",
            "american_restaurant": "American",
            "mediterranean_restaurant": "Mediterranean",
            "french_restaurant": "French",
            "barbecue_restaurant": "American",
            "hamburger_restaurant": "American",
            "vegan_restaurant": "Mediterranean",
            "vegetarian_restaurant": "Mediterranean",
        }
        for item in types:
            if item in mapping:
                return mapping[item]

        name_blob = f"{place.get('name', '')} {' '.join(types)}".lower()
        keyword_mapping = {
            "sushi": "Japanese",
            "ramen": "Japanese",
            "pizza": "Italian",
            "pasta": "Italian",
            "taco": "Mexican",
            "burrito": "Mexican",
            "thai": "Thai",
            "curry": "Indian",
            "bbq": "American",
            "burger": "American",
            "seafood": "Seafood",
            "pho": "Vietnamese",
            "korean": "Korean",
            "greek": "Greek",
        }
        for keyword, cuisine in keyword_mapping.items():
            if keyword in name_blob:
                return cuisine
        return "Restaurant"

    def _infer_atmosphere(self, place: Dict[str, Any], price_level: int) -> str:
        types = set(place.get("types", []))
        vibes: List[str] = []
        if "bar" in types:
            vibes.append("lively")
        if "cafe" in types or "bakery" in types:
            vibes.append("casual")
        if price_level >= 4:
            vibes.append("upscale")
        elif price_level == 3:
            vibes.append("stylish")
        else:
            vibes.append("casual")
        if place.get("business_status") == "OPERATIONAL":
            vibes.append("popular")
        unique_vibes: List[str] = []
        for vibe in vibes:
            if vibe not in unique_vibes:
                unique_vibes.append(vibe)
        return ", ".join(unique_vibes[:3])

    def _build_description(
        self, cuisine: str, atmosphere: str, rating: float, review_count: int
    ) -> str:
        rating_phrase = f"{rating:.1f}-star favorite" if rating > 0 else "well-reviewed local spot"
        return (
            f"{rating_phrase} for {cuisine.lower()} food with a {atmosphere} vibe"
            f" and {review_count} Google reviews."
        )

    def _format_geocode_label(self, result: Dict[str, Any]) -> str:
        components = result.get("address_components", [])
        city = None
        state = None
        country = None
        for component in components:
            kinds = set(component.get("types", []))
            if not city and {"locality"} & kinds:
                city = component.get("long_name")
            if not city and {"administrative_area_level_2"} & kinds:
                city = component.get("long_name")
            if not state and {"administrative_area_level_1"} & kinds:
                state = component.get("short_name")
            if not country and {"country"} & kinds:
                country = component.get("long_name")

        if city and state:
            return f"{city}, {state}"
        if city and country:
            return f"{city}, {country}"
        if state and country:
            return f"{state}, {country}"
        return result.get("formatted_address") or "Selected location"

    def _calculate_distance_meters(
        self,
        lat1: Optional[float],
        lon1: Optional[float],
        lat2: Optional[float],
        lon2: Optional[float],
    ) -> float:
        if None in {lat1, lon1, lat2, lon2}:
            return float("inf")
        radius = 6371000
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        d_phi = math.radians(lat2 - lat1)
        d_lambda = math.radians(lon2 - lon1)
        a = (
            math.sin(d_phi / 2) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
        )
        return radius * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

    def _format_distance(self, distance_meters: float) -> str:
        if not math.isfinite(distance_meters):
            return "Distance unavailable"
        if distance_meters < 1000:
            return f"{int(round(distance_meters / 10.0) * 10)} m away"
        miles = distance_meters / 1609.34
        return f"{miles:.1f} mi away"

    def _raise_for_http(self, response: requests.Response, service_name: str) -> None:
        if response.ok:
            return
        raise GoogleMapsServiceError(
            f"{service_name} returned HTTP {response.status_code}."
        )

    def _google_error(self, service_name: str, payload: Dict[str, Any]) -> str:
        status = payload.get("status") or "UNKNOWN_ERROR"
        message = payload.get("error_message")
        if message:
            return f"{service_name} failed: {status} - {message}"
        return f"{service_name} failed: {status}"


_service: Optional[GoogleMapsService] = None


def get_google_maps_service() -> GoogleMapsService:
    global _service
    if _service is None:
        _service = GoogleMapsService()
    return _service
