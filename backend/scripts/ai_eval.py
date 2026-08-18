import argparse
import asyncio
import json
import os
import time
from pathlib import Path

from tableus.config import get_settings
from tableus.providers.deterministic import FIXTURE_PLACES, DeterministicAiProvider
from tableus.providers.google_live import LiveGeminiProvider

ROOT = Path(__file__).resolve().parents[1]


async def run(live: bool) -> None:
    settings = get_settings()
    if live and os.getenv("TABLEUS_LIVE_AI_APPROVED") != "1":
        raise SystemExit("Live evaluation requires TABLEUS_LIVE_AI_APPROVED=1")
    if live and not settings.gemini_api_key:
        raise SystemExit("GEMINI_API_KEY is required for live evaluation")
    projected_max = 0.05
    if live and projected_max > settings.live_ai_max_usd:
        raise SystemExit("Projected evaluation cost exceeds LIVE_AI_MAX_USD")

    artifact_dir = ROOT / ".artifacts" / "ai-eval"
    artifact_dir.mkdir(parents=True, exist_ok=True)
    lock = artifact_dir / "live.lock"
    if live:
        try:
            lock.touch(exist_ok=False)
        except FileExistsError as exc:
            raise SystemExit("Another live evaluation lock exists") from exc

    cases = json.loads((ROOT / "evaluations" / "cases.json").read_text(encoding="utf-8"))
    provider = (
        LiveGeminiProvider(settings.gemini_api_key, settings.gemini_model)
        if live
        else DeterministicAiProvider()
    )
    passed = 0
    started = time.perf_counter()
    try:
        for case in cases:
            result = await provider.recommend(case["query"], [], FIXTURE_PLACES)
            grounded = {item.place_id for item in result}.issubset(
                {place.place_id for place in FIXTURE_PLACES}
            )
            if len(result) == case["expected_count"] and grounded:
                passed += 1
        report = {
            "mode": "live" if live else "deterministic",
            "model": settings.gemini_model if live else "fixture-v1",
            "cases": len(cases),
            "passed": passed,
            "latency_ms": int((time.perf_counter() - started) * 1000),
            "estimated_max_cost_usd": projected_max if live else 0,
        }
        report_path = artifact_dir / f"report-{'live' if live else 'deterministic'}.json"
        report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(report))
        if passed != len(cases):
            raise SystemExit(1)
    finally:
        if live and lock.exists():
            lock.unlink()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true")
    asyncio.run(run(parser.parse_args().live))
