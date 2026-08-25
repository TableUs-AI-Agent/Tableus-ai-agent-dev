import json

import httpx
import pytest

from tableus.providers.google_live import LivePlacesProvider, PlacesProviderError


def restaurant(place_id: str, primary_type: str = "japanese_restaurant") -> dict:
    return {
        "id": place_id,
        "displayName": {"text": f"Restaurant {place_id}"},
        "formattedAddress": "Address",
        "location": {"latitude": 42.36, "longitude": -71.06},
        "rating": 4.5,
        "priceLevel": "PRICE_LEVEL_MODERATE",
        "primaryType": primary_type,
    }


@pytest.mark.asyncio
async def test_location_resolution_uses_text_search_and_requires_us() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(
            200,
            json={
                "places": [
                    {
                        "id": "location-id",
                        "displayName": {"text": "Boston"},
                        "formattedAddress": "Boston, MA, USA",
                        "location": {"latitude": 42.36, "longitude": -71.06},
                        "postalAddress": {"regionCode": "US"},
                    }
                ]
            },
        )

    provider = LivePlacesProvider("secret", httpx.MockTransport(handler))
    resolved = await provider.resolve_location("Boston")

    assert resolved.place_id == "location-id"
    assert requests[0].url.path.endswith("places:searchText")
    assert json.loads(requests[0].content)["pageSize"] == 1
    assert "places.postalAddress" in requests[0].headers["X-Goog-FieldMask"]
    assert "rating" not in requests[0].headers["X-Goog-FieldMask"]


@pytest.mark.asyncio
async def test_text_and_nearby_search_use_policy_bounded_payloads() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(200, json={"places": [restaurant("one")]})

    provider = LivePlacesProvider("secret", httpx.MockTransport(handler))
    text_results = await provider.discover(42.36, -71.06, "ramen", 99)
    nearby_results = await provider.discover(42.36, -71.06, "", 99)
    text_body = json.loads(requests[0].content)
    nearby_body = json.loads(requests[1].content)

    assert requests[0].url.path.endswith("places:searchText")
    assert text_body["pageSize"] == 20
    assert text_body["strictTypeFiltering"] is True
    assert text_body["regionCode"] == "US"
    assert "primaryTypeDisplayName" not in requests[0].headers["X-Goog-FieldMask"]
    assert requests[1].url.path.endswith("places:searchNearby")
    assert nearby_body["maxResultCount"] == 20
    assert nearby_body["rankPreference"] == "POPULARITY"
    assert text_results[0].cuisine == "Japanese"
    assert len(nearby_results) == 1


@pytest.mark.asyncio
async def test_transient_responses_retry_three_times_but_terminal_4xx_does_not() -> None:
    transient_calls = 0
    usage_events: list[tuple[str, int, int, bool]] = []

    async def usage(operation: str, attempts: int, output_units: int, failed: bool) -> None:
        usage_events.append((operation, attempts, output_units, failed))

    def transient(request: httpx.Request) -> httpx.Response:
        nonlocal transient_calls
        transient_calls += 1
        return httpx.Response(503, json={})

    with pytest.raises(PlacesProviderError, match="temporarily unavailable"):
        await LivePlacesProvider("secret", httpx.MockTransport(transient)).discover(
            42.36, -71.06, "", 20, usage
        )
    assert transient_calls == 3
    assert usage_events == [("restaurant.nearby_search", 3, 0, True)]

    terminal_calls = 0

    def terminal(request: httpx.Request) -> httpx.Response:
        nonlocal terminal_calls
        terminal_calls += 1
        return httpx.Response(400, json={})

    with pytest.raises(PlacesProviderError, match="rejected"):
        await LivePlacesProvider("secret", httpx.MockTransport(terminal)).discover(
            42.36, -71.06, "", 20
        )
    assert terminal_calls == 1


@pytest.mark.asyncio
async def test_details_deduplicate_preserve_order_and_encode_ids() -> None:
    paths: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        paths.append(request.url.raw_path.decode())
        place_id = "second/id" if "second%2Fid" in paths[-1] else "first"
        return httpx.Response(200, json=restaurant(place_id))

    provider = LivePlacesProvider("secret", httpx.MockTransport(handler))
    places = await provider.get_places(["second/id", "first", "second/id"])

    assert [item.place_id for item in places] == ["second/id", "first"]
    assert len(paths) == 2
    assert any("second%2Fid" in path for path in paths)
