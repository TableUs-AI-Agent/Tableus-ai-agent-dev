import json
from types import SimpleNamespace

import pytest
from google.genai import errors

from tableus.providers.base import AiCallUsage
from tableus.providers.deterministic import FIXTURE_PLACES
from tableus.providers.google_live import (
    AiProviderError,
    FoodAnalysisOutput,
    LiveGeminiProvider,
    RecommendationOutput,
    TasteSummaryOutput,
)


def response(parsed, *, input_tokens=100, output_tokens=40):
    return SimpleNamespace(
        parsed=parsed,
        usage_metadata=SimpleNamespace(
            prompt_token_count=input_tokens,
            candidates_token_count=output_tokens,
            thoughts_token_count=0,
        ),
    )


class ScriptedModels:
    def __init__(self, events):
        self.events = list(events)
        self.calls = []

    async def generate_content(self, **kwargs):
        self.calls.append(kwargs)
        event = self.events.pop(0)
        if isinstance(event, Exception):
            raise event
        return event


def provider_with(events):
    provider = LiveGeminiProvider("secret", "gemini-3.1-flash-lite")
    models = ScriptedModels(events)
    provider.client = SimpleNamespace(aio=SimpleNamespace(models=models))
    return provider, models


def usage_collector():
    events: list[AiCallUsage] = []

    async def record(event: AiCallUsage) -> None:
        events.append(event)

    return events, record


@pytest.mark.asyncio
async def test_recommendations_alias_places_and_record_token_cost() -> None:
    provider, models = provider_with(
        [
            response(
                {
                    "outcome": "recommendations",
                    "restaurants": [
                        {
                            "candidate_key": f"candidate_{index}",
                            "score": 0.9 - index / 100,
                            "reasoning": "Balances the stated group preferences.",
                        }
                        for index in range(1, 5)
                    ],
                }
            )
        ]
    )
    usage, record_usage = usage_collector()
    result = await provider.recommend(
        "quiet dinner",
        [{"notes": "relaxed", "unknown_private_field": "do-not-send"}],
        FIXTURE_PLACES,
        usage=record_usage,
    )
    assert len(result) == 4
    prompt = models.calls[0]["contents"]
    assert "candidate_1" in prompt
    assert FIXTURE_PLACES[0].place_id not in prompt
    assert FIXTURE_PLACES[0].name not in prompt
    assert FIXTURE_PLACES[0].address not in prompt
    assert "unknown_private_field" not in prompt
    config = models.calls[0]["config"]
    assert config.max_output_tokens == 700
    assert config.temperature == 0
    assert config.seed == 0
    assert config.thinking_config.thinking_level.value == "MINIMAL"
    assert config.thinking_config.thinking_budget is None
    wire_schema = json.dumps(config.response_schema)
    assert '"pattern"' not in wire_schema
    assert '"minLength"' not in wire_schema
    assert '"maxLength"' not in wire_schema
    assert '"additionalProperties": false' in wire_schema
    assert usage == [
        AiCallUsage(
            operation="recommend",
            attempts=1,
            input_tokens=100,
            output_tokens=40,
            estimated_cost_usd=0.000085,
            failed=False,
        )
    ]


@pytest.mark.asyncio
async def test_invalid_or_private_output_fails_without_fallback() -> None:
    provider, _ = provider_with(
        [
            response(
                {
                    "outcome": "recommendations",
                    "restaurants": [
                        {
                            "candidate_key": f"candidate_{index}",
                            "score": 0.8,
                            "reasoning": (
                                "Contact private@example.com" if index == 1 else "Group-friendly."
                            ),
                        }
                        for index in range(1, 5)
                    ],
                }
            )
        ]
    )
    usage, record_usage = usage_collector()
    with pytest.raises(AiProviderError, match="invalid recommendation") as captured:
        await provider.recommend("dinner", [], FIXTURE_PLACES, usage=record_usage)
    assert captured.value.kind == "invalid_output"
    assert usage[0].failed is True
    assert usage[0].input_tokens == 100


@pytest.mark.asyncio
async def test_retryable_statuses_use_three_attempt_limit(monkeypatch) -> None:
    delays = []

    async def fake_sleep(delay):
        delays.append(delay)

    monkeypatch.setattr("tableus.providers.google_live.asyncio.sleep", fake_sleep)
    provider, models = provider_with(
        [
            errors.ServerError(500, {"error": {"message": "temporary"}}),
            errors.ClientError(429, {"error": {"message": "limited"}}),
            response({"summary": "Enjoys relaxed group dining."}),
        ]
    )
    usage, record_usage = usage_collector()
    result = await provider.regenerate_taste([], usage=record_usage)
    assert result == "Enjoys relaxed group dining."
    assert len(models.calls) == 3
    assert delays == [0.5, 1.0]
    assert usage[0].attempts == 3


@pytest.mark.asyncio
async def test_terminal_client_error_is_not_retried() -> None:
    provider, models = provider_with(
        [errors.ClientError(400, {"error": {"message": "bad request"}})]
    )
    usage, record_usage = usage_collector()
    with pytest.raises(AiProviderError, match="configuration") as captured:
        await provider.regenerate_taste([], usage=record_usage)
    assert captured.value.kind == "configuration"
    assert len(models.calls) == 1
    assert usage[0].attempts == 1
    assert usage[0].estimated_cost_usd == 0


@pytest.mark.asyncio
async def test_empty_blocked_response_is_a_terminal_refusal() -> None:
    blocked = response(None)
    blocked.text = ""
    provider, models = provider_with([blocked])
    usage, record_usage = usage_collector()
    with pytest.raises(AiProviderError, match="refused") as captured:
        await provider.regenerate_taste([], usage=record_usage)
    assert captured.value.kind == "refused"
    assert len(models.calls) == 1
    assert usage[0].failed is True
    assert usage[0].input_tokens == 100


@pytest.mark.asyncio
async def test_food_and_taste_outputs_are_strict_and_bounded() -> None:
    provider, models = provider_with(
        [
            response(
                {
                    "dish": "Pizza",
                    "cuisine": "Italian",
                    "description": "A baked flatbread with tomato and cheese.",
                    "flavor_tags": ["savory", "tomato"],
                }
            ),
            response({"summary": "Enjoys Italian food and shareable plates."}),
        ]
    )
    food = await provider.analyze_food(b"image", "image/jpeg")
    reviews = [
        {"rating": 5, "cuisine": "Italian", "review_text": "x" * 1000}
        for _ in range(40)
    ]
    taste = await provider.regenerate_taste(reviews)
    assert food["dish"] == "Pizza"
    assert taste.startswith("Enjoys Italian")
    assert models.calls[0]["config"].max_output_tokens == 400
    assert models.calls[1]["config"].max_output_tokens == 300
    assert len(models.calls[1]["contents"]) < 13_000


def test_live_provider_rejects_unapproved_model_or_missing_key() -> None:
    with pytest.raises(AiProviderError, match="not approved"):
        LiveGeminiProvider("secret", "gemini-latest")
    with pytest.raises(AiProviderError, match="not configured"):
        LiveGeminiProvider("", "gemini-3.1-flash-lite")


@pytest.mark.parametrize(
    "output_schema",
    [RecommendationOutput, FoodAnalysisOutput, TasteSummaryOutput],
)
def test_provider_schema_uses_supported_keywords(output_schema) -> None:
    schema = LiveGeminiProvider._provider_schema(output_schema)
    serialized = json.dumps(schema)
    assert '"pattern"' not in serialized
    assert '"minLength"' not in serialized
    assert '"maxLength"' not in serialized
    assert schema["additionalProperties"] is False


def test_provider_schema_keeps_strict_local_validation() -> None:

    with pytest.raises(ValueError):
        RecommendationOutput.model_validate(
            {
                "outcome": "recommendations",
                "restaurants": [
                    {
                        "candidate_key": "not-an-allowlisted-key",
                        "score": 0.5,
                        "reasoning": "Valid locally bounded text.",
                    }
                    for _ in range(4)
                ],
            }
        )
