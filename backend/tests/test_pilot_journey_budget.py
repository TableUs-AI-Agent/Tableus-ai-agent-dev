"""Count real API admissions for a group journey; all provider bytes are synthetic."""

from collections import Counter
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from main import app
from tableus import api, cohort_limits
from tableus.auth import subject_digest
from tableus.config import get_settings
from tableus.db import SessionFactory, init_database
from tableus.models import CohortCounter, Profile
from tableus.providers.deterministic import DeterministicAiProvider, DeterministicPlacesProvider
from tableus.security import hash_value


@pytest.mark.asyncio
@pytest.mark.parametrize("members", [2, 4, 8])
async def test_complete_group_journey_budget(members: int, monkeypatch: pytest.MonkeyPatch) -> None:
    await init_database()
    subjects = [f"journey-{uuid4().hex}" for _ in range(members)]
    async with SessionFactory() as session:
        session.add_all(Profile(id=s, display_name="Synthetic diner", email_hash=hash_value(s)) for s in subjects)
        await session.commit()
    settings = get_settings().model_copy(update={
        "tableus_places_provider_mode": "live", "tableus_ai_provider_mode": "live",
        "cohort_places_operations_per_day": 40, "cohort_ai_operations_per_day": 3,
    })
    monkeypatch.setattr(api, "get_settings", lambda: settings)
    monkeypatch.setattr(cohort_limits, "get_settings", lambda: settings)
    # Journeys are paced over minutes in rehearsal. Isolate daily admissions here;
    # existing minute/global budget tests cover their separate refusal boundaries.
    monkeypatch.setattr(api, "_consume_places_limit", lambda *_: None)
    monkeypatch.setattr(api, "_consume_ai_limit", lambda *_, **__: None)

    async def reserve(*_):
        return True

    async def release(*_):
        pass

    monkeypatch.setattr(api, "_reserve_places_budget", reserve)
    monkeypatch.setattr(api, "_release_places_budget", release)
    monkeypatch.setattr(api, "_reserve_ai_budget", reserve)
    monkeypatch.setattr(api, "_release_ai_budget", release)
    monkeypatch.setattr(api, "get_places_provider", DeterministicPlacesProvider)
    monkeypatch.setattr(api, "get_ai_provider", DeterministicAiProvider)
    original = api._call_places
    calls: Counter[str] = Counter()

    async def counted(subject, method, *args):
        result = await original(subject, method, *args)
        calls[method] += 1
        return result

    monkeypatch.setattr(api, "_call_places", counted)
    app.state.request_rate_limiter.clear()
    app.state.idempotency_cache.clear()
    await app.state.idempotency_inflight.clear()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        async def request(method, path, actor=0, body=None):
            # Rate limiting is independently tested; the ledger models paced calls.
            app.state.request_rate_limiter.clear()
            response = await client.request(method, f"/api/v1{path}", headers={
                "X-Demo-User-ID": subjects[actor], "Idempotency-Key": uuid4().hex,
            }, **({"json": body} if body is not None else {}))
            assert response.status_code == 200, response.text
            return response.json()["data"]

        location = await request("POST", "/locations/resolve", body={"query": "Boston"})
        created = await request("POST", "/plans", body={
            "title": "Synthetic dinner", "location_label": "Boston",
            "location_place_id": location["place_id"],
        })
        path = f'/plans/{created["plan"]["id"]}'
        for actor in range(1, members):
            await request("POST", path + "/join", actor, {"share_token": created["share_token"]})
        for actor in range(members):
            await request("PATCH", path + "/constraints", actor, {"notes": "Synthetic preferences"})
        for round_number in range(2):
            if round_number:
                await request("POST", path + "/reopen")
                for actor in range(members):
                    await request("GET", path, actor)
            options = await request("POST", path + "/recommendations", body={"query": "dinner"})
            ranking = [c["id"] for c in options["candidates"][:3]]
            for actor in range(1, members):
                await request("GET", path, actor)
            for actor in range(members):
                await request("PUT", path + "/vote", actor, {"ranking": ranking})
                # Conservative web pattern: every other active screen observes
                # each revision separately and fetches its updated detail once.
                for observer in range(members):
                    if observer != actor:
                        await request("GET", path + "/revision", observer)
                        await request("GET", path, observer)
            await request("POST", path + "/finalize", body={"candidate_id": ranking[0]})
            for actor in range(members):
                await request("GET", path, actor)
        before = calls.copy()
        for actor in range(members):
            for endpoint in ["/plans", "/me/organized-plans", "/me/account-control", "/me/export", path + "/revision"]:
                await request("GET", endpoint, actor)
        assert calls == before, "Metadata/export/revision reads must stay provider-free"

    async with SessionFactory() as session:
        places_used = []
        ai_used = []
        for subject in subjects:
            rows = list((await session.scalars(select(CohortCounter).where(
                CohortCounter.subject_hash == subject_digest(subject),
            ))).all())
            places_used.append(sum(row.used for row in rows if row.kind == "places"))
            ai_used.append(sum(row.used for row in rows if row.kind == "ai"))
    assert places_used == [2 * members + 14] + [2 * members + 5] * (members - 1)
    assert ai_used == [2] + [0] * (members - 1)
    assert calls == {"resolve_location": 1, "get_location": 3, "discover": 2,
                     "get_places": 2 * members * members + 5 * members + 3}
    nominal_attempts = 6 + 4 * calls["get_places"]
    assert nominal_attempts == {2: 90, 4: 226, 8: 690}[members]
    print(f"members={members} places_per_actor={places_used} logical={sum(places_used)} "
          f"places_attempts={nominal_attempts} retry_ceiling={3 * nominal_attempts} ai_operations={sum(ai_used)}")
