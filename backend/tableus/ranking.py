from collections import defaultdict

from .models import Candidate, Vote

POINTS = (3, 2, 1)


def borda_scores(votes: list[Vote]) -> dict[str, int]:
    scores: dict[str, int] = defaultdict(int)
    for vote in votes:
        for index, candidate_id in enumerate(vote.ranking[:3]):
            scores[candidate_id] += POINTS[index]
    return dict(scores)


def ordered_candidates(candidates: list[Candidate], votes: list[Vote]) -> list[Candidate]:
    scores = borda_scores(votes)
    return sorted(candidates, key=lambda item: (-scores.get(item.id, 0), item.rank, item.place_id))
