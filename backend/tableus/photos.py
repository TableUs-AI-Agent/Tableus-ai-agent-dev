"""Place photos without exposing the Google key.

Plan responses carry a signed link to our own API. Opening it redirects to
Google's key-free image URL, which is cached per place so repeat views and
refetched plans don't each pay for a Place Photos call.
"""

import hashlib
import hmac
import time
from urllib.parse import urlencode

from .config import get_settings
from .providers import get_places_provider

CACHE_SECONDS = 3600
_MAX_CACHED = 2000
_cache: dict[str, tuple[str, float]] = {}


def _key() -> bytes:
    # Derived from the Places key so photo links need no secret of their own.
    secret = get_settings().google_maps_api_key
    return hashlib.sha256(f"tableus-place-photo:{secret}".encode()).digest()


def _signature(photo_name: str) -> str:
    return hmac.new(_key(), photo_name.encode(), hashlib.sha256).hexdigest()[:32]


def _place_id(photo_name: str) -> str:
    # Google names photos "places/{place_id}/photos/{reference}".
    parts = photo_name.split("/")
    return parts[1] if len(parts) == 4 and parts[0] == "places" and parts[2] == "photos" else ""


def photo_path(photo_name: str) -> str | None:
    """The API path a client loads the photo from, or None without a photo."""
    if not _place_id(photo_name) or not get_settings().google_maps_api_key:
        return None
    return "/api/v1/place-photos?" + urlencode({"name": photo_name, "sig": _signature(photo_name)})


def is_valid(photo_name: str, signature: str) -> bool:
    return (
        bool(get_settings().google_maps_api_key)
        and bool(_place_id(photo_name))
        and hmac.compare_digest(_signature(photo_name), signature)
    )


async def photo_uri(photo_name: str) -> str:
    # Keyed by place, since a place's photo names can change between lookups.
    place_id = _place_id(photo_name)
    now = time.monotonic()
    cached = _cache.get(place_id)
    if cached and cached[1] > now:
        return cached[0]
    uri = await get_places_provider().photo_uri(photo_name)
    if len(_cache) >= _MAX_CACHED:
        _cache.clear()
    _cache[place_id] = (uri, now + CACHE_SECONDS)
    return uri


def reset() -> None:
    _cache.clear()
