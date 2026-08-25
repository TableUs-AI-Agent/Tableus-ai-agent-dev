from functools import lru_cache

from ..config import get_settings
from .base import AiProvider, PlacesProvider
from .deterministic import DeterministicAiProvider, DeterministicPlacesProvider
from .google_live import LiveGeminiProvider, LivePlacesProvider


@lru_cache
def get_places_provider() -> PlacesProvider:
    settings = get_settings()
    if settings.places_provider_mode == "live":
        if not settings.google_maps_api_key:
            raise RuntimeError("GOOGLE_MAPS_API_KEY is required for live provider mode")
        return LivePlacesProvider(settings.google_maps_api_key)
    return DeterministicPlacesProvider()


@lru_cache
def get_ai_provider() -> AiProvider:
    settings = get_settings()
    if settings.ai_provider_mode == "live":
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is required for live provider mode")
        return LiveGeminiProvider(settings.gemini_api_key, settings.gemini_model)
    return DeterministicAiProvider()
