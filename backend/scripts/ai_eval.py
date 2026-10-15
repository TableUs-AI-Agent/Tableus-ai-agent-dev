"""Check how well the recommender fits groups.

Deterministic by default (free, runs in CI). `--live` sends the same cases to
Gemini with fixture places, so it costs a few cents and needs Brian's OK.
"""

import argparse
import asyncio
import json
from pathlib import Path

from tableus.config import get_settings
from tableus.providers.base import AiProvider, Diner
from tableus.providers.deterministic import FIXTURE_PLACES, DeterministicAiProvider
from tableus.providers.google_live import LiveGeminiProvider

CASES = Path(__file__).resolve().parents[1] / "evaluations" / "cases.json"


def _diner(wishes: dict) -> Diner:
    return Diner(
        cuisines=wishes.get("cuisines", []),
        dietary_notes=wishes.get("dietary_notes", []),
        max_price_level=wishes.get("max_price_level"),
        notes=wishes.get("notes", ""),
        taste=wishes.get("taste", ""),
    )


async def run_case(provider: AiProvider, case: dict) -> dict:
    places = FIXTURE_PLACES[: case.get("place_count", len(FIXTURE_PLACES))]
    picks = await provider.recommend(case["request"], [_diner(d) for d in case["diners"]], places)
    chosen = [pick.place_id for pick in picks]
    problems = []
    if case.get("expect_no_result"):
        if chosen:
            problems.append("expected no result")
    else:
        if len(chosen) != 4:
            problems.append(f"expected 4 picks, got {len(chosen)}")
        problems += [f"missing {place}" for place in case.get("must_include", [])
                     if place not in chosen]
        problems += [f"should exclude {place}" for place in case.get("must_exclude", [])
                     if place in chosen]
        problems += ["empty reason" for pick in picks if not pick.reasoning.strip()]
    return {
        "id": case["id"],
        "passed": not problems,
        "problems": problems,
        "picks": [{"place_id": pick.place_id, "reason": pick.reasoning} for pick in picks],
    }


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", help="call Gemini (costs money)")
    args = parser.parse_args()
    settings = get_settings()
    provider: AiProvider = (
        LiveGeminiProvider(settings.gemini_api_key, settings.gemini_model)
        if args.live else DeterministicAiProvider()
    )
    cases = json.loads(CASES.read_text())["cases"]
    results = [await run_case(provider, case) for case in cases]
    passed = sum(result["passed"] for result in results)
    print(json.dumps({"mode": "live" if args.live else "deterministic", "passed": passed,
                      "total": len(results), "results": results}, indent=2))
    if passed != len(results):
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
