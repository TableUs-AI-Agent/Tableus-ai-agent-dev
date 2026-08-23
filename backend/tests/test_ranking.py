from types import SimpleNamespace

from tableus.ranking import borda_scores, ordered_candidates


def test_borda_scores_three_two_one() -> None:
    votes = [
        SimpleNamespace(ranking=["a", "b", "c"]),
        SimpleNamespace(ranking=["b", "a", "d"]),
    ]
    assert borda_scores(votes) == {"a": 5, "b": 5, "c": 1, "d": 1}


def test_ties_use_provider_rank_then_place_id() -> None:
    candidates = [
        SimpleNamespace(id="a", rank=2, place_id="place-a"),
        SimpleNamespace(id="b", rank=1, place_id="place-b"),
    ]
    assert [item.id for item in ordered_candidates(candidates, [])] == ["b", "a"]
