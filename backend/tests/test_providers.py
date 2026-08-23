import pytest

from tableus.providers.deterministic import DeterministicAiProvider, DeterministicPlacesProvider


@pytest.mark.asyncio
async def test_deterministic_recommendations_are_exact_and_grounded() -> None:
    places = await DeterministicPlacesProvider().discover(42.36, -71.05, "", 20)
    recommendations = await DeterministicAiProvider().recommend("dinner", [], places)
    assert len(recommendations) == 4
    assert {item.place_id for item in recommendations}.issubset(
        {place.place_id for place in places}
    )


@pytest.mark.asyncio
async def test_deterministic_no_result_is_honest() -> None:
    places = await DeterministicPlacesProvider().discover(42.36, -71.05, "", 20)
    assert await DeterministicAiProvider().recommend("no result", [], places) == []
