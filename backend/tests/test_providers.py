from tableus.providers.base import Diner
from tableus.providers.deterministic import DeterministicAiProvider, DeterministicPlacesProvider


def diner(**wishes) -> Diner:
    return Diner(**{"cuisines": [], "dietary_notes": [], "max_price_level": None, "notes": "",
                    **wishes})


async def test_deterministic_recommendations_are_exact_and_grounded() -> None:
    places = await DeterministicPlacesProvider().discover(42.36, -71.05, "", 20)
    picks = await DeterministicAiProvider().recommend("dinner", [], places)
    assert len(picks) == 4
    assert {item.place_id for item in picks} <= {place.place_id for place in places}


async def test_deterministic_picks_follow_the_group() -> None:
    places = await DeterministicPlacesProvider().discover(42.36, -71.05, "", 20)
    picks = await DeterministicAiProvider().recommend(
        "dinner", [diner(cuisines=["Italian"]), diner(dietary_notes=["vegetarian"])], places
    )
    chosen = [item.place_id for item in picks]
    assert "fixture-trattoria" in chosen
    assert "fixture-bistro" not in chosen
    assert chosen[0] == "fixture-oleana"  # vegetarian-friendly and highly rated


async def test_deterministic_no_result_is_honest() -> None:
    places = await DeterministicPlacesProvider().discover(42.36, -71.05, "", 20)
    assert await DeterministicAiProvider().recommend("no result", [], places) == []
