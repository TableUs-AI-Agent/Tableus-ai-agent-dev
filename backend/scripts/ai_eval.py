import argparse
import asyncio
import hashlib
import io
import json
import os
import re
import subprocess
import time
from pathlib import Path

from PIL import Image, ImageDraw

from tableus.config import get_settings
from tableus.providers.base import AiCallUsage
from tableus.providers.deterministic import FIXTURE_PLACES, DeterministicAiProvider
from tableus.providers.google_live import LiveGeminiProvider

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = ROOT.parent
PINNED_MODEL = "gemini-3.1-flash-lite"
LIVE_CASE_IDS = {
    "recommend-balanced",
    "recommend-constraints",
    "recommend-prompt-injection",
    "photo-synthetic",
    "taste-preferences",
    "taste-prompt-injection",
}
CASE_RESULT_KEYS = {
    "id",
    "passed",
    "attempts",
    "input_tokens",
    "output_tokens",
    "estimated_cost_usd",
    "latency_ms",
}


def _fixture_bytes() -> bytes:
    return (ROOT / "evaluations" / "cases.json").read_bytes()


def _synthetic_food_image() -> bytes:
    image = Image.new("RGB", (512, 512), "#f2d4a7")
    draw = ImageDraw.Draw(image)
    draw.ellipse((70, 70, 442, 442), fill="#d59643")
    draw.ellipse((105, 105, 407, 407), fill="#c9432d")
    draw.ellipse((150, 150, 205, 205), fill="#f4e0a2")
    draw.ellipse((290, 190, 345, 245), fill="#f4e0a2")
    draw.ellipse((220, 300, 275, 355), fill="#f4e0a2")
    output = io.BytesIO()
    image.save(output, format="JPEG", quality=85, optimize=True)
    return output.getvalue()


def _head_sha() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def _lock(lock: Path, sha: str) -> None:
    if lock.exists():
        try:
            existing = json.loads(lock.read_text(encoding="utf-8"))
            pid = int(existing.get("pid", 0))
            if pid > 0:
                os.kill(pid, 0)
                raise SystemExit("Another live evaluation lock exists")
        except ProcessLookupError:
            lock.unlink()
        except (ValueError, json.JSONDecodeError, PermissionError):
            raise SystemExit("An unreadable live evaluation lock exists") from None
    lock.write_text(json.dumps({"pid": os.getpid(), "sha": sha}) + "\n", encoding="utf-8")


def _validate_case_result(result: dict) -> dict:
    if set(result) != CASE_RESULT_KEYS:
        raise RuntimeError("Evaluation result contained non-sanitized fields")
    if not re.fullmatch(r"[a-z0-9-]+", str(result["id"])):
        raise RuntimeError("Evaluation case ID is not sanitized")
    return result


async def _run_case(provider, case: dict) -> dict:
    usage_events: list[AiCallUsage] = []

    async def usage(event: AiCallUsage) -> None:
        usage_events.append(event)

    started = time.perf_counter()
    passed = False
    try:
        if case["type"] == "recommendation":
            places = FIXTURE_PLACES[: int(case.get("place_count", len(FIXTURE_PLACES)))]
            result = await provider.recommend(
                case["query"], case.get("constraints", []), places, usage=usage
            )
            allowed = {place.place_id for place in places}
            passed = len(result) == case["expected_count"] and {
                item.place_id for item in result
            }.issubset(allowed)
        elif case["type"] == "photo":
            result = await provider.analyze_food(
                _synthetic_food_image(), "image/jpeg", usage=usage
            )
            passed = set(result) == {"dish", "cuisine", "description", "flavor_tags"}
        elif case["type"] == "taste":
            result = await provider.regenerate_taste(case["reviews"], usage=usage)
            passed = bool(result) and len(result) <= 600 and "@" not in result
        else:
            raise RuntimeError("Unknown frozen evaluation case type")
    except Exception:
        passed = bool(case.get("expect_error"))
    attempts = sum(event.attempts for event in usage_events)
    input_tokens = sum(event.input_tokens for event in usage_events)
    output_tokens = sum(event.output_tokens for event in usage_events)
    estimated_cost = sum(event.estimated_cost_usd for event in usage_events)
    return _validate_case_result(
        {
            "id": case["id"],
            "passed": passed,
            "attempts": attempts,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "estimated_cost_usd": round(estimated_cost, 8),
            "latency_ms": int((time.perf_counter() - started) * 1000),
        }
    )


async def run(live: bool, sha: str | None, evidence: str | None) -> None:
    settings = get_settings()
    fixture_bytes = _fixture_bytes()
    fixture_hash = hashlib.sha256(fixture_bytes).hexdigest()
    cases = json.loads(fixture_bytes)["cases"]
    if live:
        if os.getenv("TABLEUS_LIVE_AI_APPROVED") != "1":
            raise SystemExit("Live evaluation requires TABLEUS_LIVE_AI_APPROVED=1")
        if not settings.gemini_api_key:
            raise SystemExit("GEMINI_API_KEY is required for live evaluation")
        if settings.gemini_model != PINNED_MODEL:
            raise SystemExit("Live evaluation requires the pinned Gemini model")
        if not sha or not evidence:
            raise SystemExit("Live evaluation requires --sha and --evidence")
        if not re.fullmatch(r"[0-9a-f]{40}", sha) or sha != _head_sha():
            raise SystemExit("Live evaluation SHA must equal the exact checked-out candidate")
        cases = [case for case in cases if case["id"] in LIVE_CASE_IDS]

    artifact_dir = ROOT / ".artifacts" / "ai-eval"
    artifact_dir.mkdir(parents=True, exist_ok=True)
    namespace = f"{sha}-{PINNED_MODEL}-{fixture_hash}" if live else "deterministic"
    checkpoint_path = artifact_dir / f"checkpoint-{namespace}.json"
    lock_path = artifact_dir / f"live-{sha}.lock" if live else None
    if lock_path:
        _lock(lock_path, sha or "")

    checkpoint = {"completed": []}
    if live and checkpoint_path.exists():
        loaded = json.loads(checkpoint_path.read_text(encoding="utf-8"))
        if set(loaded) != {"completed"}:
            raise SystemExit("Live evaluation checkpoint is not sanitized")
        checkpoint = loaded
    completed = {item["id"]: _validate_case_result(item) for item in checkpoint["completed"]}
    provider = (
        LiveGeminiProvider(settings.gemini_api_key, settings.gemini_model)
        if live
        else DeterministicAiProvider()
    )
    try:
        for case in cases:
            if case["id"] in completed:
                continue
            spent = sum(item["estimated_cost_usd"] for item in completed.values())
            if (
                live
                and spent + LiveGeminiProvider.ambiguous_call_reservation_usd
                > settings.live_ai_max_usd
            ):
                raise SystemExit("Next live case would exceed LIVE_AI_MAX_USD")
            result = await _run_case(provider, case)
            completed[result["id"]] = result
            if live:
                checkpoint_path.write_text(
                    json.dumps({"completed": list(completed.values())}, indent=2) + "\n",
                    encoding="utf-8",
                )

        selected = [completed[case["id"]] for case in cases]
        report = {
            "schema_version": 1,
            "mode": "live" if live else "deterministic",
            "sha": sha if live else _head_sha(),
            "model": settings.gemini_model if live else "fixture-v1",
            "fixture_sha256": fixture_hash,
            "case_count": len(selected),
            "passed_count": sum(bool(item["passed"]) for item in selected),
            "attempt_count": sum(item["attempts"] for item in selected),
            "input_tokens": sum(item["input_tokens"] for item in selected),
            "output_tokens": sum(item["output_tokens"] for item in selected),
            "estimated_cost_usd": round(
                sum(item["estimated_cost_usd"] for item in selected), 8
            ),
            "case_results": selected,
        }
        output_dir = Path(evidence).resolve() if live else artifact_dir  # noqa: ASYNC240
        output_dir.mkdir(parents=True, exist_ok=True)
        report_path = output_dir / f"{str(report['sha'])[:7]}-ai-eval-{report['mode']}.json"
        report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print(
            json.dumps(
                {
                    "mode": report["mode"],
                    "case_count": report["case_count"],
                    "passed_count": report["passed_count"],
                    "estimated_cost_usd": report["estimated_cost_usd"],
                }
            )
        )
        if report["passed_count"] != report["case_count"]:
            raise SystemExit(1)
    finally:
        if lock_path and lock_path.exists():
            lock_path.unlink()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--sha")
    parser.add_argument("--evidence")
    arguments = parser.parse_args()
    asyncio.run(run(arguments.live, arguments.sha, arguments.evidence))
