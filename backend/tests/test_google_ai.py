import json
from types import SimpleNamespace

import pytest
from google.genai import errors

from tableus.providers.base import Diner, ProviderError
from tableus.providers.deterministic import FIXTURE_PLACES
from tableus.providers.google_live import LiveGeminiProvider, RecommendationOutput


def response(parsed):
    return SimpleNamespace(parsed=parsed)


def picks(reasoning=lambda index: "Pasta and long shared tables suit a big group."):
    return response({
        "outcome": "recommendations",
        "restaurants": [
            {"candidate_key": f"candidate_{index}", "score": 0.9 - index / 100,
             "reasoning": reasoning(index)}
            for index in range(1, 5)
        ],
    })


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


DINER = Diner(cuisines=["Italian"], dietary_notes=["vegetarian"], max_price_level=3,
              notes="relaxed", taste="Loves shareable plates")


async def test_prompt_carries_place_facts_and_every_diner_but_no_ids_or_addresses() -> None:
    provider, models = provider_with([picks()])
    result = await provider.recommend("quiet dinner", [DINER, DINER], FIXTURE_PLACES)

    assert [item.place_id for item in result] == [p.place_id for p in FIXTURE_PLACES[:4]]
    prompt = json.loads(models.calls[0]["contents"])
    first = prompt["allowed_candidates"][0]
    assert first["name"] == FIXTURE_PLACES[0].name
    assert first["summary"] == FIXTURE_PLACES[0].summary
    assert first["features"] == list(FIXTURE_PLACES[0].features)
    assert len(prompt["diners"]) == 2
    assert prompt["diners"][0]["standing_tastes"] == "Loves shareable plates"
    serialized = models.calls[0]["contents"]
    assert FIXTURE_PLACES[0].place_id not in serialized
    assert FIXTURE_PLACES[0].address not in serialized

    config = models.calls[0]["config"]
    assert config.temperature == 0
    assert config.thinking_config.thinking_level.value == "MINIMAL"
    wire_schema = json.dumps(config.response_schema)
    for keyword in ["pattern", "minLength", "maxLength", "additionalProperties", "title"]:
        assert f'"{keyword}"' not in wire_schema
    assert config.response_schema["$defs"]["RecommendationItem"]["properties"][
        "candidate_key"
    ]["enum"] == [f"candidate_{index}" for index in range(1, 7)]


@pytest.mark.parametrize(
    "bad_reason",
    ["Email private@example.com to book", "Guaranteed allergy-safe kitchen"],
)
async def test_private_or_unsafe_reasons_are_rejected(bad_reason) -> None:
    provider, _ = provider_with([picks(lambda index: bad_reason if index == 1 else "Fine.")])
    with pytest.raises(ProviderError) as captured:
        await provider.recommend("dinner", [], FIXTURE_PLACES)
    assert captured.value.kind == "invalid_output"


async def test_retryable_errors_retry_up_to_three_times(monkeypatch) -> None:
    delays = []

    async def fake_sleep(delay):
        delays.append(delay)

    monkeypatch.setattr("tableus.providers.google_live.asyncio.sleep", fake_sleep)
    provider, models = provider_with([
        errors.ServerError(500, {"error": {"message": "temporary"}}),
        errors.ClientError(429, {"error": {"message": "limited"}}),
        picks(),
    ])
    assert len(await provider.recommend("dinner", [], FIXTURE_PLACES)) == 4
    assert len(models.calls) == 3
    assert delays == [0.5, 1.0]


async def test_client_errors_are_not_retried() -> None:
    provider, models = provider_with([errors.ClientError(400, {"error": {"message": "bad"}})])
    with pytest.raises(ProviderError) as captured:
        await provider.recommend("dinner", [], FIXTURE_PLACES)
    assert captured.value.kind == "configuration"
    assert len(models.calls) == 1


async def test_blocked_response_is_a_refusal() -> None:
    blocked = response(None)
    blocked.text = ""
    provider, _ = provider_with([blocked])
    with pytest.raises(ProviderError) as captured:
        await provider.recommend("dinner", [], FIXTURE_PLACES)
    assert captured.value.kind == "refused"


async def test_fewer_than_four_places_skip_the_model() -> None:
    provider, models = provider_with([])
    assert await provider.recommend("dinner", [], FIXTURE_PLACES[:3]) == []
    assert models.calls == []


def test_live_provider_rejects_unapproved_model_or_missing_key() -> None:
    with pytest.raises(ProviderError, match="not approved"):
        LiveGeminiProvider("secret", "gemini-latest")
    with pytest.raises(ProviderError, match="not configured"):
        LiveGeminiProvider("", "gemini-3.1-flash-lite")


def test_local_validation_stays_strict() -> None:
    with pytest.raises(ValueError):
        RecommendationOutput.model_validate({
            "outcome": "recommendations",
            "restaurants": [
                {"candidate_key": "not-a-key", "score": 0.5, "reasoning": "Fine."}
                for _ in range(4)
            ],
        })
