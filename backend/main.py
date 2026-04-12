"""
TableUs - FastAPI backend.

This service powers:
  1. Image-based food analysis
  2. Natural-language reviews that refresh stored dining preferences
  3. Restaurant search over nearby candidates
  4. Multi-person search using combined preference summaries
"""
import io
import json
import math
import os
import re
import time
from contextlib import asynccontextmanager
from difflib import get_close_matches
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv

_BACKEND_ROOT = Path(__file__).resolve().parent
load_dotenv(_BACKEND_ROOT / ".env", override=True)

import google.generativeai as genai
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google.api_core.exceptions import InvalidArgument, NotFound, ResourceExhausted
from pydantic import BaseModel

import data
from google_maps_service import GoogleMapsServiceError, get_google_maps_service

_models: dict = {}

ALLOWED_CUISINES = {
    "American", "Italian", "French", "Chinese", "Japanese", "Mexican",
    "Indian", "Thai", "Greek", "Spanish", "Korean", "Vietnamese",
    "Lebanese", "Turkish", "Moroccan", "Ethiopian", "Brazilian",
    "Peruvian", "Cuban", "German", "Portuguese", "Filipino",
    "Malaysian", "Indonesian", "Mediterranean", "Seafood",
}

_PRIMARY = "gemini-2.5-flash-lite"
_FALLBACKS = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash"]

# Max Places candidates fetched and max venues returned for the orbit UI.
MAX_RESTAURANT_CANDIDATES = 20


def _get_gemini_api_key() -> str:
    raw = os.getenv("GEMINI_API_KEY") or ""
    return raw.strip().strip("'\"")


def _build_model(name: str):
    api_key = _get_gemini_api_key()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(name)


def _response_text(response) -> str:
    """Gemini sometimes omits `.text` (blocked parts, empty candidates); read parts safely."""
    if response is None:
        return ""
    try:
        t = response.text
        if isinstance(t, str) and t.strip():
            return t.strip()
    except (ValueError, AttributeError):
        pass
    try:
        chunks: list[str] = []
        for cand in getattr(response, "candidates", None) or []:
            content = getattr(cand, "content", None)
            if not content:
                continue
            for part in getattr(content, "parts", None) or []:
                pt = getattr(part, "text", None)
                if pt:
                    chunks.append(pt)
        return "".join(chunks).strip()
    except Exception:
        return ""


def _call_with_fallback(prompt, image=None) -> str:
    models_to_try = [_PRIMARY] + _FALLBACKS
    last_empty = False
    for model_name in models_to_try:
        if model_name not in _models:
            _models[model_name] = _build_model(model_name)
        try:
            model = _models[model_name]
            response = model.generate_content([prompt, image]) if image is not None else model.generate_content(prompt)
            raw = _response_text(response)
            if raw:
                return raw
            last_empty = True
            continue
        except InvalidArgument as exc:
            message = str(exc).lower()
            if "api key" in message or "api_key_invalid" in message:
                raise HTTPException(
                    status_code=401,
                    detail=(
                        "Gemini rejected GEMINI_API_KEY. Create a valid key in Google AI Studio, "
                        "store it in backend/.env, and restart the backend."
                    ),
                ) from exc
            raise
        except (ResourceExhausted, NotFound):
            continue

    if last_empty:
        raise HTTPException(
            status_code=503,
            detail=(
                "Gemini returned an empty response for all tried models "
                "(often safety filters or blocked output). Try a different query or check API settings."
            ),
        )
    raise HTTPException(
        status_code=429,
        detail="Gemini API quota is currently exhausted for all configured models.",
    )


def get_model():
    if _PRIMARY not in _models:
        _models[_PRIMARY] = _build_model(_PRIMARY)
    return _models[_PRIMARY]


def clean_json_response(text: str) -> str:
    if not text:
        return ""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def parse_gemini_json(text: str) -> dict:
    cleaned = clean_json_response(text or "")
    if not cleaned:
        return {}
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end > start:
        try:
            return json.loads(cleaned[start : end + 1])
        except json.JSONDecodeError:
            pass
    return {}


def validate_cuisine(raw: str) -> str:
    for cuisine in ALLOWED_CUISINES:
        if raw.lower() == cuisine.lower():
            return cuisine
    return raw


def get_maps_service():
    try:
        return get_google_maps_service()
    except GoogleMapsServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def compute_quality_score(restaurant: dict) -> float:
    rating = float(restaurant.get("rating", 0) or 0)
    review_count = int(restaurant.get("user_ratings_total", 0) or 0)
    return rating * math.log(review_count + 1)


def dedupe_restaurants(restaurants: list) -> list:
    seen: set[str] = set()
    deduped = []
    for restaurant in restaurants:
        key = restaurant.get("place_id") or restaurant.get("id") or restaurant.get("name")
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(restaurant)
    return deduped


def sort_by_quality(restaurants: list) -> list:
    for restaurant in restaurants:
        restaurant["quality_score"] = compute_quality_score(restaurant)
    restaurants.sort(
        key=lambda restaurant: (
            restaurant.get("quality_score", 0.0),
            -(restaurant.get("distance_meters", float("inf"))),
        ),
        reverse=True,
    )
    return restaurants


def fetch_nearby_candidates(
    latitude: float,
    longitude: float,
    radius_meters: int,
    limit: int = MAX_RESTAURANT_CANDIDATES,
    keyword: Optional[str] = None,
) -> list:
    maps_service = get_maps_service()
    restaurants = maps_service.search_nearby_restaurants(
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
        limit=limit,
        keyword=keyword,
    )
    return sort_by_quality(restaurants)


def filter_restaurants_by_cuisine(restaurants: list, cuisine: Optional[str]) -> list:
    if not cuisine:
        return restaurants
    return [
        restaurant
        for restaurant in restaurants
        if cuisine.lower() in (restaurant.get("cuisine") or "").lower()
    ]


def parse_preferences_locally(preferences_text: str) -> dict:
    text = preferences_text.lower()
    cuisines = [
        cuisine
        for cuisine in sorted(ALLOWED_CUISINES)
        if cuisine.lower() in text
    ]

    atmosphere_keywords = [
        "casual", "cozy", "upscale", "romantic", "lively", "vibrant", "warm",
        "communal", "intimate", "elegant", "trendy", "retro", "energetic",
        "family-friendly", "classic", "garden", "waterfront", "bustling",
        "cultural",
    ]
    atmospheres = [word for word in atmosphere_keywords if word in text]

    price_hints = []
    for amount_range in re.findall(r"\$\d+(?:-\$\d+)?(?:\s*per person)?", preferences_text):
        cleaned = amount_range.replace(" per person", "")
        if cleaned not in price_hints:
            price_hints.append(cleaned)
    if not price_hints:
        for price in ["$$$$", "$$$", "$$", "$"]:
            if price in preferences_text and price not in price_hints:
                price_hints.append(price)

    flavor_keywords = [
        "spicy", "savory", "umami", "rich", "smoky", "tangy", "aromatic",
        "delicate", "bold", "fermented", "fresh", "sweet", "creamy",
    ]
    flavor_tags = [word for word in flavor_keywords if word in text]

    return {
        "cuisines": cuisines,
        "atmospheres": atmospheres,
        "price_hints": price_hints,
        "flavor_tags": flavor_tags,
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        get_model()
        print("[STARTUP] Gemini model ready")
    except Exception as exc:
        print(f"[STARTUP] Gemini not configured yet: {exc}")
    yield


app = FastAPI(title="TableUs", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReviewSubmitRequest(BaseModel):
    user_id: str
    restaurant_name: str
    review_text: str
    rating: float
    dish: Optional[str] = None
    cuisine: Optional[str] = None


class LocationResolveRequest(BaseModel):
    query: str


class NearbyRequest(BaseModel):
    latitude: float
    longitude: float
    radius_meters: int = 2000
    limit: int = MAX_RESTAURANT_CANDIDATES


class SearchRequest(BaseModel):
    query: str
    user_id: str
    latitude: float
    longitude: float
    location_label: str
    radius_meters: int = 2000


class GroupSearchRequest(BaseModel):
    query: str
    user_ids: List[str]
    latitude: float
    longitude: float
    location_label: str
    radius_meters: int = 2000


class BlendRequest(BaseModel):
    user_ids: List[str]


class FriendAction(BaseModel):
    user_id: str
    friend_id: str


def extract_cuisine_preferences(preferences_text: str) -> List[str]:
    cuisines: List[str] = []
    try:
        struct_prompt = f"""Extract ONLY the cuisine types from this text. Return JSON:
{{"cuisines": ["Italian", "Japanese"]}}

Text: {preferences_text}"""
        cuisines = parse_gemini_json(_call_with_fallback(struct_prompt)).get("cuisines", [])
    except Exception:
        pass
    return cuisines


def build_restaurants_prompt_text(restaurants: list, max_items: int = MAX_RESTAURANT_CANDIDATES) -> str:
    return "\n".join([
        f"{i+1}. {restaurant['name']}\n"
        f"   - Cuisine: {restaurant['cuisine']}\n"
        f"   - Rating: {restaurant['rating']} stars ({restaurant['user_ratings_total']} reviews)\n"
        f"   - Price: {'$' * restaurant['price_level']}\n"
        f"   - Atmosphere: {restaurant['atmosphere']}\n"
        f"   - Distance: {restaurant.get('distance_label', 'Distance unavailable')}\n"
        f"   - Address: {restaurant['address']}\n"
        f"   - About: {restaurant['description']}"
        for i, restaurant in enumerate(restaurants[:max_items])
    ])


def map_matched_names_to_restaurants(matched_names: list, restaurants: list) -> list:
    """Map LLM output names back to restaurant dicts (exact or fuzzy name match)."""
    out: list = []
    seen: set[str] = set()
    all_names = [r["name"] for r in restaurants]
    for raw in matched_names:
        if not isinstance(raw, str):
            continue
        name = raw.strip()
        if not name:
            continue
        match = next((r for r in restaurants if r["name"] == name), None)
        if not match:
            close = get_close_matches(name, all_names, n=1, cutoff=0.55)
            if close:
                match = next((r for r in restaurants if r["name"] == close[0]), None)
        if match:
            key = str(match.get("place_id") or match.get("id") or match["name"])
            if key not in seen:
                seen.add(key)
                out.append(match)
    return out


def filter_restaurants_by_user_query(
    restaurants: list,
    user_query: str,
    location_label: str,
) -> list:
    """
    Primary filter: keep venues that satisfy the natural-language request.
    Runs before quality sort and top-N ranking.
    """
    if not restaurants:
        return []
    if len(restaurants) == 1:
        return list(restaurants)

    numbered = build_restaurants_prompt_text(restaurants)
    prompt = f"""You filter restaurants using the USER REQUEST as the primary rule.

USER REQUEST:
"{user_query}"

LOCATION CONTEXT: {location_label}

RESTAURANTS (numbered — each line starts with the venue name right after the number):
{numbered}

Return ONLY valid JSON (no markdown):
{{"matched_names": ["Exact Name One", "Exact Name Two"]}}

Rules:
- Include every restaurant from the list above that plausibly fits the USER REQUEST (cuisine, dish, price, vibe, occasion, dietary hints, "quiet", "romantic", "late night", etc.).
- Exclude only clear mismatches when the request is specific.
- If the request is very broad (e.g. "good dinner nearby"), include most reasonable options and exclude only poor fits.
- Each string in matched_names MUST copy a restaurant name exactly as it appears right after "N. " at the start of that restaurant's block (character-for-character)."""

    parsed = parse_gemini_json(_call_with_fallback(prompt))
    names = parsed.get("matched_names")
    if not isinstance(names, list):
        names = []
    mapped = map_matched_names_to_restaurants(names, restaurants)
    return mapped


def prepare_nearby_pool(
    latitude: float,
    longitude: float,
    radius_meters: int,
    detected_cuisine: Optional[str] = None,
    limit: int = MAX_RESTAURANT_CANDIDATES,
) -> tuple[list, int]:
    nearby_pool = fetch_nearby_candidates(
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
        limit=limit,
    )
    radius_used = radius_meters

    if len(nearby_pool) < 8 and radius_meters < 5000:
        expanded_pool = fetch_nearby_candidates(
            latitude=latitude,
            longitude=longitude,
            radius_meters=5000,
            limit=limit,
        )
        nearby_pool = sort_by_quality(dedupe_restaurants(nearby_pool + expanded_pool))
        radius_used = 5000

    if detected_cuisine:
        cuisine_matches = filter_restaurants_by_cuisine(nearby_pool, detected_cuisine)
        if len(cuisine_matches) < 4:
            keyword_pool = fetch_nearby_candidates(
                latitude=latitude,
                longitude=longitude,
                radius_meters=radius_used,
                limit=limit,
                keyword=detected_cuisine,
            )
            nearby_pool = sort_by_quality(dedupe_restaurants(nearby_pool + keyword_pool))

    return nearby_pool, radius_used


@app.post("/api/food/analyze")
async def analyze_food_image(image: UploadFile = File(...)):
    from PIL import Image

    image_bytes = await image.read()
    pil_image = Image.open(io.BytesIO(image_bytes))

    prompt = """Identify this food image and return ONLY valid JSON (no markdown):
{
  "dish": "Name of the dish",
  "cuisine": "ONE cuisine type",
  "description": "One sentence about the food",
  "flavor_tags": ["savory", "umami", "rich"]
}"""

    raw = _call_with_fallback(prompt, image=pil_image)
    result = parse_gemini_json(raw)
    cuisine = validate_cuisine(result.get("cuisine", "Unknown"))
    return {
        "dish": result.get("dish") or "Unknown dish",
        "cuisine": cuisine,
        "description": result.get("description") or "",
        "flavor_tags": result["flavor_tags"]
        if isinstance(result.get("flavor_tags"), list)
        else [],
    }


@app.post("/api/reviews/submit")
async def submit_review(req: ReviewSubmitRequest):
    review = {
        "restaurant_name": req.restaurant_name,
        "review_text": req.review_text,
        "rating": req.rating,
        "dish": req.dish,
        "cuisine": req.cuisine,
    }
    saved = data.add_review(req.user_id, review)

    current_prefs = data.get_user_preferences(req.user_id)
    all_reviews = data.get_reviews(req.user_id)
    reviews_summary = "\n".join([
        f"- {r['restaurant_name']} ({r.get('cuisine', 'Unknown')}): "
        f"\"{r['review_text']}\" - {r['rating']}/5"
        for r in all_reviews[-10:]
    ])

    prompt = f"""You are a food preference analyst. Generate a natural language preference profile based on this user's reviews.

CURRENT PREFERENCES:
{current_prefs if current_prefs else "(No preferences yet - create from scratch)"}

ALL REVIEWS:
{reviews_summary}

Generate a concise, scannable preference profile using short bullet lines.
Write in third person and be specific about cuisines, atmosphere, flavors, and budget.
Return ONLY the preference text."""

    new_profile = _call_with_fallback(prompt).strip()
    if new_profile.startswith('"') and new_profile.endswith('"'):
        new_profile = new_profile[1:-1]

    data.set_user_preferences(req.user_id, new_profile)
    return {"review": saved, "updated_taste_profile": new_profile}


@app.get("/api/reviews/{user_id}")
async def get_reviews(user_id: str):
    return data.get_reviews(user_id)


@app.get("/api/profile/{user_id}/taste")
async def get_taste_profile(user_id: str):
    prefs_text = data.get_user_preferences(user_id)
    if not prefs_text:
        return {
            "preferences_text": "",
            "structured": {
                "cuisines": [],
                "atmospheres": [],
                "price_hints": [],
                "flavor_tags": [],
            },
        }

    structured = parse_preferences_locally(prefs_text)
    return {"preferences_text": prefs_text, "structured": structured}


@app.post("/api/location/resolve")
async def resolve_location(req: LocationResolveRequest):
    maps_service = get_maps_service()
    try:
        return maps_service.resolve_location(req.query)
    except GoogleMapsServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/restaurants/nearby")
async def get_nearby_restaurants(req: NearbyRequest):
    cap = min(max(req.limit, 1), MAX_RESTAURANT_CANDIDATES)
    nearby_pool, radius_used = prepare_nearby_pool(
        latitude=req.latitude,
        longitude=req.longitude,
        radius_meters=req.radius_meters,
        limit=cap,
    )
    sliced = nearby_pool[:cap]
    return {
        "status": "success",
        "restaurants": sliced,
        "radius_meters": radius_used,
        "count": len(sliced),
    }


@app.post("/api/restaurants/search")
async def search_restaurants(req: SearchRequest):
    t0 = time.time()

    prefs_text = data.get_user_preferences(req.user_id)
    if not prefs_text:
        prefs_text = (
            "No specific preferences yet. Assume they like good quality food "
            "with positive vibes and high ratings."
        )

    user_cuisines = extract_cuisine_preferences(prefs_text)
    detected_cuisine = await _detect_cuisine(req.query)
    nearby_pool, radius_used = prepare_nearby_pool(
        latitude=req.latitude,
        longitude=req.longitude,
        radius_meters=req.radius_meters,
        detected_cuisine=detected_cuisine,
        limit=MAX_RESTAURANT_CANDIDATES,
    )
    candidates = sort_by_quality(dedupe_restaurants(list(nearby_pool)))[:MAX_RESTAURANT_CANDIDATES]
    if not candidates:
        return {
            "status": "success",
            "query": req.query,
            "search_summary": f"No nearby restaurants found around {req.location_label}.",
            "top_restaurants": [],
            "nearby_restaurants": [],
            "user_preferences": prefs_text,
            "location": {
                "label": req.location_label,
                "latitude": req.latitude,
                "longitude": req.longitude,
                "radius_meters": radius_used,
            },
            "elapsed_ms": int((time.time() - t0) * 1000),
        }

    query_filtered = filter_restaurants_by_user_query(
        candidates, req.query, req.location_label
    )
    if not query_filtered:
        query_filtered = list(candidates)

    restaurants = sort_by_quality(query_filtered)
    restaurants_text = build_restaurants_prompt_text(restaurants)

    prompt = f"""You are a restaurant recommendation expert. The list below already matches the user's search request. Select the TOP 4 that best fit their tastes and the query.

USER QUERY: "{req.query}"
SEARCH LOCATION: {req.location_label}

USER PREFERENCES:
{prefs_text}

Preferred Cuisines: {', '.join(user_cuisines) if user_cuisines else 'Open to all cuisines'}

CANDIDATES (already filtered to match the user query — rank these):
{restaurants_text}

Return ONLY valid JSON:
{{
  "restaurants": [
    {{
      "name": "Exact restaurant name from the list above",
      "match_score": 0.95,
      "reasoning": "Brief reason why this matches"
    }}
  ],
  "search_summary": "One friendly sentence explaining what you found"
}}

Return exactly 4 restaurants. Use exact names from the list."""

    llm_result = parse_gemini_json(_call_with_fallback(prompt))
    enriched = _enrich_results(llm_result.get("restaurants", []), restaurants)
    summary = (llm_result.get("search_summary") or "").strip()
    if not summary:
        summary = f"Here are top matches near {req.location_label} based on your query and local ratings."

    orbit_pool = restaurants[:MAX_RESTAURANT_CANDIDATES]

    return {
        "status": "success",
        "query": req.query,
        "search_summary": summary,
        "top_restaurants": enriched[:4],
        "nearby_restaurants": orbit_pool,
        "user_preferences": prefs_text,
        "location": {
            "label": req.location_label,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "radius_meters": radius_used,
        },
        "elapsed_ms": int((time.time() - t0) * 1000),
    }


@app.post("/api/restaurants/search-group")
async def search_group(req: GroupSearchRequest):
    t0 = time.time()

    individual_prefs = []
    user_names = []
    for uid in req.user_ids:
        user = data.get_user(uid)
        if not user:
            continue
        user_names.append(user["name"])
        pref = data.get_user_preferences(uid)
        if pref:
            individual_prefs.append(f"{user['name']}: {pref}")

    if len(individual_prefs) >= 2:
        if len(user_names) == 2:
            group_phrase = f"{user_names[0]} and {user_names[1]}"
        else:
            group_phrase = f"{user_names[0]} and {len(user_names) - 1} friends"

        merge_prompt = f"""Combine these dining notes into one short group summary.

Individual notes:

{chr(10).join([f"Person {i+1}: {p}" for i, p in enumerate(individual_prefs)])}

Instructions:
1. Start with "{group_phrase}"
2. Keep it to no more than 2 sentences
3. Mention the strongest overlap and any useful contrast
4. Keep the tone natural and concise

Return only the summary text."""

        merged_prefs = _call_with_fallback(merge_prompt).strip().strip('"')
        has_group_preferences = True
    elif individual_prefs:
        merged_prefs = individual_prefs[0]
        has_group_preferences = True
    else:
        merged_prefs = (
            f"Group of {len(req.user_ids)} diners with varied tastes "
            "looking for a versatile restaurant."
        )
        has_group_preferences = False

    detected_cuisine = await _detect_cuisine(req.query)
    nearby_pool, radius_used = prepare_nearby_pool(
        latitude=req.latitude,
        longitude=req.longitude,
        radius_meters=req.radius_meters,
        detected_cuisine=detected_cuisine,
        limit=MAX_RESTAURANT_CANDIDATES,
    )
    candidates = sort_by_quality(dedupe_restaurants(list(nearby_pool)))[:MAX_RESTAURANT_CANDIDATES]
    if not candidates:
        return {
            "status": "success",
            "query": req.query,
            "search_summary": f"No nearby restaurants found around {req.location_label}.",
            "top_restaurants": [],
            "nearby_restaurants": [],
            "merged_preferences": merged_prefs,
            "user_count": len(req.user_ids),
            "location": {
                "label": req.location_label,
                "latitude": req.latitude,
                "longitude": req.longitude,
                "radius_meters": radius_used,
            },
            "elapsed_ms": int((time.time() - t0) * 1000),
        }

    query_filtered = filter_restaurants_by_user_query(
        candidates, req.query, req.location_label
    )
    if not query_filtered:
        query_filtered = list(candidates)

    restaurants = sort_by_quality(query_filtered)
    restaurants_text = build_restaurants_prompt_text(restaurants)

    prompt = f"""You are choosing restaurants for {len(req.user_ids)} people dining together.

The restaurant list below already matches the group's REQUEST (same venues they asked for).

REQUEST: "{req.query}"
AREA: {req.location_label}

COMBINED DINING NOTES:
{merged_prefs}

CANDIDATES (query-filtered — rank for this group):
{restaurants_text}

SELECTION GUIDANCE:
1. Honor the request first; use combined notes to break ties and balance the group.
2. If the combined notes are limited, lean on request fit, quality, and group suitability.
3. If the request is broad, let the combined notes guide the ranking.

GROUP NOTES ARE {"DETAILED" if has_group_preferences else "LIGHT"}.

Return only valid JSON:
{{
  "restaurants": [
    {{
      "name": "Exact name from the list above",
      "match_score": 0.95,
      "reasoning": "Why this fits the group"
    }}
  ],
  "search_summary": "One sentence explaining the top matches"
}}

Return exactly 4 restaurants."""

    llm_result = parse_gemini_json(_call_with_fallback(prompt))
    enriched = _enrich_results(llm_result.get("restaurants", []), restaurants)
    summary = (llm_result.get("search_summary") or "").strip()
    if not summary:
        summary = f"Here are group-friendly picks near {req.location_label} based on your request."

    orbit_pool = restaurants[:MAX_RESTAURANT_CANDIDATES]

    return {
        "status": "success",
        "query": req.query,
        "search_summary": summary,
        "top_restaurants": enriched[:4],
        "nearby_restaurants": orbit_pool,
        "merged_preferences": merged_prefs,
        "user_count": len(req.user_ids),
        "location": {
            "label": req.location_label,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "radius_meters": radius_used,
        },
        "elapsed_ms": int((time.time() - t0) * 1000),
    }


@app.post("/api/preferences/blend")
async def blend_preferences(req: BlendRequest):
    individual_prefs = []
    user_names = []
    for uid in req.user_ids:
        user = data.get_user(uid)
        if not user:
            continue
        user_names.append(user["name"])
        pref = data.get_user_preferences(uid)
        if pref:
            individual_prefs.append(pref)

    if len(individual_prefs) >= 2:
        group_label = " and ".join(user_names[:2])
        if len(user_names) > 2:
            group_label += f" and {len(user_names) - 2} more"

        merge_prompt = f"""Combine these dining notes into one short group summary.

{chr(10).join([f"Person {i+1} ({user_names[i]}): {p}" for i, p in enumerate(individual_prefs)])}

Write up to 2 sentences and start with "{group_label}".
Keep it natural and concise.
Return only the summary text."""

        blended_text = _call_with_fallback(merge_prompt).strip().strip('"')
    elif individual_prefs:
        blended_text = individual_prefs[0]
    else:
        blended_text = "Group with varied tastes."

    structured = {"cuisines": [], "atmosphere": [], "price_range": "$25-$45 per person"}
    try:
        extract_prompt = f"""Read this group's dining notes and extract structured information.

Group summary:
{blended_text}

Individual preferences:
{chr(10).join([f"- {p}" for p in individual_prefs])}

Return only valid JSON:
{{
  "cuisines": ["Italian", "Japanese", "Mexican"],
  "atmosphere": ["casual", "cozy"],
  "price_range": "$25-$45 per person"
}}

Use a numeric dollar range for "price_range" whenever possible."""
        structured = parse_gemini_json(_call_with_fallback(extract_prompt))
    except Exception:
        pass

    return {
        "blended_text": blended_text,
        "user_count": len(req.user_ids),
        "user_names": user_names,
        "top_cuisines": structured.get("cuisines", []),
        "atmosphere_preferences": structured.get("atmosphere", []),
        "price_range": structured.get("price_range", "$25-$45 per person"),
    }


@app.get("/api/friends/{user_id}")
async def get_friends(user_id: str):
    return data.get_friends(user_id)


@app.post("/api/friends/add")
async def add_friend(req: FriendAction):
    ok = data.add_friend(req.user_id, req.friend_id)
    if not ok:
        raise HTTPException(404, "User not found")
    return {"status": "ok"}


@app.post("/api/friends/remove")
async def remove_friend(req: FriendAction):
    ok = data.remove_friend(req.user_id, req.friend_id)
    if not ok:
        raise HTTPException(404, "User not found")
    return {"status": "ok"}


@app.get("/api/users")
async def list_users():
    return data.get_all_users()


@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    user = data.get_user(user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return {"id": user["id"], "name": user["name"], "avatar": user["avatar"]}


@app.get("/")
@app.get("/health")
async def health():
    has_key = bool(_get_gemini_api_key())
    has_maps_key = bool((os.getenv("GOOGLE_MAPS_API_KEY") or "").strip().strip("'\""))
    return {
        "status": "ok",
        "gemini_configured": has_key,
        "google_maps_configured": has_maps_key,
        "restaurants": len(data.RESTAURANTS),
        "users": len(data.DEMO_USERS),
    }


async def _detect_cuisine(query: str) -> Optional[str]:
    prompt = f"""Analyze this restaurant search query and identify the cuisine type if present.

Query: "{query}"

If the query mentions a specific cuisine or a dish strongly associated with one cuisine, return that cuisine.
Otherwise return null.

Return only valid JSON:
{{"cuisine": "mexican"}} or {{"cuisine": null}}"""

    try:
        result = parse_gemini_json(_call_with_fallback(prompt))
        return result.get("cuisine")
    except Exception:
        return None


def _enrich_results(llm_recs: list, all_restaurants: list, min_results: int = 3) -> list:
    enriched = []
    all_names = [restaurant["name"] for restaurant in all_restaurants]

    for rec in llm_recs:
        name = rec.get("name", "")
        match = next((restaurant for restaurant in all_restaurants if restaurant["name"] == name), None)

        if not match:
            close = get_close_matches(name, all_names, n=1, cutoff=0.5)
            if close:
                match = next(restaurant for restaurant in all_restaurants if restaurant["name"] == close[0])

        if match:
            enriched.append({
                **match,
                "match_score": rec.get("match_score", 0.8),
                "reasoning": rec.get("reasoning", ""),
            })

    if len(enriched) < min_results:
        for restaurant in all_restaurants:
            if restaurant["name"] not in [item["name"] for item in enriched]:
                enriched.append({
                    **restaurant,
                    "match_score": 0.5,
                    "reasoning": "Top-rated option",
                })
            if len(enriched) >= 4:
                break

    return enriched
