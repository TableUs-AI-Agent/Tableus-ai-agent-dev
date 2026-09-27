import asyncio
import json

import pytest
from fastapi import HTTPException

from tableus import auth
from tableus.request_controls import (
    CachedResponse,
    FixedWindowRateLimiter,
    IdempotencyReplayCache,
    RequestBodyLimitMiddleware,
    is_idempotency_eligible,
)


def test_idempotency_uses_an_explicit_product_route_allowlist() -> None:
    assert is_idempotency_eligible("POST", "/api/v1/plans") is True
    assert is_idempotency_eligible("POST", "/api/v1/plans/plan-id/finalize") is True
    assert is_idempotency_eligible("DELETE", "/api/v1/me") is True
    assert is_idempotency_eligible("POST", "/api/v1/access/validate") is False
    assert is_idempotency_eligible("POST", "/api/v1/food/analyze") is False
    assert is_idempotency_eligible("POST", "/api/v1/connections") is False
    assert is_idempotency_eligible("POST", "/api/v1/not-a-route") is False


async def invoke_body_limiter(
    chunks: list[bytes],
    *,
    path: str = "/api/v1/plans",
    content_length: int | None = None,
    rate_limiter: FixedWindowRateLimiter | None = None,
    cors_origins: tuple[str, ...] = (),
) -> tuple[list[dict], int]:
    consumed = 0
    messages = [
        {
            "type": "http.request",
            "body": chunk,
            "more_body": index < len(chunks) - 1,
        }
        for index, chunk in enumerate(chunks)
    ]

    async def receive():
        nonlocal consumed
        consumed += 1
        return messages.pop(0)

    async def downstream(scope, limited_receive, send):
        while True:
            message = await limited_receive()
            if not message.get("more_body"):
                break
        body = b'{"data":{"ok":true},"meta":{}}'
        await send(
            {
                "type": "http.response.start",
                "status": 200,
                "headers": [(b"content-length", str(len(body)).encode())],
            }
        )
        await send({"type": "http.response.body", "body": body})

    headers = [] if content_length is None else [(b"content-length", str(content_length).encode())]
    sent: list[dict] = []

    async def send(message: dict) -> None:
        sent.append(message)

    middleware = RequestBodyLimitMiddleware(
        downstream,
        default_limit=8,
        photo_upload_limit=16,
        rate_limiter=rate_limiter,
        cors_origins=cors_origins,
    )
    await middleware(
        {
            "type": "http",
            "path": path,
            "headers": headers,
            "state": {"request_id": "body-limit-test"},
        },
        receive,
        send,
    )
    return sent, consumed


@pytest.mark.asyncio
async def test_request_body_limiter_rejects_declared_length_before_consumption() -> None:
    sent, consumed = await invoke_body_limiter([b"ignored"], content_length=9)

    assert sent[0]["status"] == 413
    assert consumed == 0
    assert json.loads(sent[1]["body"])["error"]["code"] == "request_too_large"


@pytest.mark.asyncio
async def test_request_body_limiter_rejects_chunked_body_and_preserves_photo_envelope() -> None:
    rejected, consumed = await invoke_body_limiter([b"12345", b"6789"])
    accepted, accepted_chunks = await invoke_body_limiter(
        [b"12345678", b"9"], path="/api/v1/food/analyze"
    )

    assert rejected[0]["status"] == 413
    assert consumed == 2
    assert accepted[0]["status"] == 200
    assert accepted_chunks == 2


@pytest.mark.asyncio
async def test_request_admission_rejects_before_consuming_a_body() -> None:
    limiter = FixedWindowRateLimiter(per_source_limit=0, global_limit=10)

    sent, consumed = await invoke_body_limiter([b"never-read"], rate_limiter=limiter)

    assert sent[0]["status"] == 429
    assert consumed == 0
    assert json.loads(sent[1]["body"])["error"]["code"] == "rate_limited"


@pytest.mark.asyncio
async def test_request_admission_preserves_allowed_cors_on_rejection() -> None:
    limiter = FixedWindowRateLimiter(per_source_limit=0, global_limit=10)
    sent, _ = await invoke_body_limiter(
        [b"never-read"],
        rate_limiter=limiter,
        cors_origins=("https://tableus.example",),
    )

    headers = dict(sent[0]["headers"])
    assert headers.get(b"access-control-allow-origin") is None

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    rejected: list[dict] = []

    async def send(message: dict) -> None:
        rejected.append(message)

    middleware = RequestBodyLimitMiddleware(
        lambda scope, receive, send: None,
        rate_limiter=FixedWindowRateLimiter(per_source_limit=0),
        cors_origins=("https://tableus.example",),
    )
    await middleware(
        {
            "type": "http",
            "method": "OPTIONS",
            "path": "/api/v1/plans",
            "headers": [(b"origin", b"https://tableus.example")],
            "client": ("127.0.0.1", 1234),
        },
        receive,
        send,
    )
    assert dict(rejected[0]["headers"])[b"access-control-allow-origin"] == b"https://tableus.example"


def test_rate_limiter_ignores_rotating_credential_headers_at_the_boundary() -> None:
    limiter = FixedWindowRateLimiter(per_source_limit=2, global_limit=10, max_sources=2)

    assert limiter.consume("trusted-source-a", 60.0) is False
    assert limiter.consume("trusted-source-a", 60.0) is False
    assert limiter.consume("trusted-source-a", 60.0) is True
    assert limiter.source_count == 1

    assert limiter.consume("trusted-source-b", 120.0) is False
    assert limiter.source_count == 1


def test_rate_limiter_enforces_a_global_ceiling_and_bounded_sources() -> None:
    limiter = FixedWindowRateLimiter(per_source_limit=10, global_limit=3, max_sources=2)

    assert limiter.consume("source-a", 60.0) is False
    assert limiter.consume("source-b", 60.0) is False
    assert limiter.consume("source-c", 60.0) is False
    assert limiter.source_count == 2


def test_source_rejections_do_not_consume_unrelated_global_capacity() -> None:
    limiter = FixedWindowRateLimiter(per_source_limit=2, global_limit=4, max_sources=8)

    assert limiter.consume("abusive-source", 60.0) is False
    assert limiter.consume("abusive-source", 60.0) is False
    for _ in range(100):
        assert limiter.consume("abusive-source", 60.0) is True

    assert limiter.consume("fresh-source-a", 60.0) is False
    assert limiter.consume("fresh-source-b", 60.0) is False
    assert limiter.consume("fresh-source-c", 60.0) is True


@pytest.mark.asyncio
async def test_body_receive_timeout_releases_the_active_slot() -> None:
    sent: list[dict] = []

    async def stalled_receive():
        await asyncio.Event().wait()

    async def send(message: dict) -> None:
        sent.append(message)

    middleware = RequestBodyLimitMiddleware(
        lambda scope, receive, send: None,
        body_idle_timeout_seconds=0.01,
        body_total_timeout_seconds=0.02,
        max_active_body_reads=1,
        max_active_body_reads_per_source=1,
    )
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/v1/plans",
        "headers": [(b"transfer-encoding", b"chunked")],
        "client": ("127.0.0.1", 1234),
    }
    await middleware(scope, stalled_receive, send)
    assert sent[0]["status"] == 408
    assert json.loads(sent[1]["body"])["error"]["code"] == "request_timeout"

    released: list[dict] = []

    async def empty_receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def downstream(scope, receive, send):
        await receive()
        await send({"type": "http.response.start", "status": 204, "headers": []})
        await send({"type": "http.response.body", "body": b""})

    middleware.app = downstream
    async def collect_released(message: dict) -> None:
        released.append(message)

    await middleware(scope, empty_receive, collect_released)
    assert released[0]["status"] == 204


@pytest.mark.asyncio
async def test_health_probe_rejects_body_before_receive_and_bounds_readiness() -> None:
    consumed = 0

    async def receive():
        nonlocal consumed
        consumed += 1
        return {"type": "http.request", "body": b"ignored", "more_body": False}

    sent: list[dict] = []
    limiter = FixedWindowRateLimiter(per_source_limit=1, global_limit=2)
    middleware = RequestBodyLimitMiddleware(
        lambda scope, receive, send: None,
        readiness_rate_limiter=limiter,
    )
    body_scope = {
        "type": "http",
        "method": "POST",
        "path": "/health/ready",
        "headers": [(b"content-length", b"7")],
        "client": ("127.0.0.1", 1234),
    }
    async def collect_body_rejection(message: dict) -> None:
        sent.append(message)

    await middleware(body_scope, receive, collect_body_rejection)
    assert sent[0]["status"] == 400
    assert consumed == 0

    async def downstream(scope, receive, send):
        await send({"type": "http.response.start", "status": 200, "headers": []})
        await send({"type": "http.response.body", "body": b""})

    middleware.app = downstream
    ready_scope = {**body_scope, "method": "GET", "headers": []}
    first: list[dict] = []
    second: list[dict] = []

    async def collect_first(message: dict) -> None:
        first.append(message)

    async def collect_second(message: dict) -> None:
        second.append(message)

    await middleware(ready_scope, receive, collect_first)
    await middleware(ready_scope, receive, collect_second)
    assert first[0]["status"] == 200
    assert second[0]["status"] == 429


def test_idempotency_cache_bounds_entries_bytes_and_expiry() -> None:
    cache = IdempotencyReplayCache(max_entries=2, max_total_bytes=8, max_response_bytes=6)

    def entry(body: bytes, expires_at: float = 100.0) -> CachedResponse:
        return CachedResponse(expires_at, 200, body, "application/json", "fingerprint")

    first = ("actor", "POST", "/one", "key-one")
    second = ("actor", "POST", "/two", "key-two")
    third = ("actor", "POST", "/three", "key-three")
    assert cache.store(first, entry(b"1234"), 1.0) is True
    assert cache.store(second, entry(b"5678"), 1.0) is True
    assert cache.store(third, entry(b"90"), 1.0) is True
    assert len(cache) == 2
    assert cache.total_bytes == 6
    assert cache.get(first, 1.0) is None
    assert cache.store(first, entry(b"1234567"), 1.0) is False
    assert cache.get(second, 101.0) is None
    assert cache.get(third, 101.0) is None
    assert cache.total_bytes == 0


def test_jwks_client_is_reused_per_supabase_endpoint(monkeypatch) -> None:
    created: list[str] = []
    monkeypatch.setattr(auth, "PyJWKClient", lambda url, **kwargs: created.append(url) or object())
    auth._jwks_client.cache_clear()
    first = auth._jwks_client("https://example.supabase.co/auth/v1/.well-known/jwks.json")
    second = auth._jwks_client("https://example.supabase.co/auth/v1/.well-known/jwks.json")

    assert first is second
    assert created == ["https://example.supabase.co/auth/v1/.well-known/jwks.json"]
    auth._jwks_client.cache_clear()


@pytest.mark.asyncio
async def test_unknown_jwt_key_ids_are_coalesced_and_negatively_cached(monkeypatch) -> None:
    calls = 0

    class RejectingClient:
        def get_signing_key_from_jwt(self, token):
            nonlocal calls
            calls += 1
            raise auth.PyJWKClientError("unknown key")

    auth._jwks_client.cache_clear()
    auth._unknown_kids.clear()
    auth._last_unknown_refresh.clear()
    auth._jwks_refresh_locks.clear()
    monkeypatch.setattr(auth, "_jwks_client", lambda url: RejectingClient())
    tokens = [
        auth.jwt.encode(
            {"sub": "subject"},
            "unused-test-signing-key-that-is-long-enough",
            algorithm="HS256",
            headers={"kid": f"kid-{index}"},
        )
        for index in range(20)
    ]

    results = await asyncio.gather(
        *(auth._get_signing_key("https://example.test/jwks", token) for token in tokens),
        return_exceptions=True,
    )

    assert all(isinstance(result, HTTPException) for result in results)
    assert calls == 1
    auth._unknown_kids.clear()
    auth._last_unknown_refresh.clear()
    auth._jwks_refresh_locks.clear()


@pytest.mark.asyncio
async def test_unknown_jwt_key_does_not_block_a_cached_known_key(monkeypatch) -> None:
    known_key = object()
    calls: list[str] = []

    class Cache:
        def get(self):
            return auth.jwt.PyJWKSet.from_dict(
                {
                    "keys": [
                        {
                            "kty": "oct",
                            "k": "c2VjcmV0LXRlc3Qta2V5",
                            "kid": "known-kid",
                            "use": "sig",
                            "alg": "HS256",
                        }
                    ]
                }
            )

    class SigningKey:
        key_id = "known-kid"
        key = known_key

    class Client:
        jwk_set_cache = Cache()

        @staticmethod
        def match_kid(signing_keys, key_id):
            if key_id == "known-kid":
                return SigningKey()
            return None

        def get_signing_key_from_jwt(self, token):
            key_id = auth.jwt.get_unverified_header(token)["kid"]
            calls.append(key_id)
            raise auth.PyJWKClientError("unknown key")

    client = Client()
    auth._jwks_client.cache_clear()
    auth._unknown_kids.clear()
    auth._last_unknown_refresh.clear()
    auth._jwks_refresh_locks.clear()
    monkeypatch.setattr(auth, "_jwks_client", lambda url: client)
    unknown_token = auth.jwt.encode(
        {"sub": "subject"},
        "unused-test-signing-key-that-is-long-enough",
        algorithm="HS256",
        headers={"kid": "unknown-kid"},
    )
    known_token = auth.jwt.encode(
        {"sub": "subject"},
        "unused-test-signing-key-that-is-long-enough",
        algorithm="HS256",
        headers={"kid": "known-kid"},
    )

    with pytest.raises(HTTPException) as rejected:
        await auth._get_signing_key("https://example.test/jwks", unknown_token)
    assert rejected.value.status_code == 401
    assert (await auth._get_signing_key("https://example.test/jwks", known_token)).key is known_key
    assert calls == ["unknown-kid"]

    auth._unknown_kids.clear()
    auth._last_unknown_refresh.clear()
    auth._jwks_refresh_locks.clear()


@pytest.mark.asyncio
async def test_production_jwks_client_uses_only_the_bounded_jwk_set_cache(monkeypatch) -> None:
    first_key = object()
    replacement_key = object()
    calls = 0

    class SigningKey:
        def __init__(self, key_id: str, key: object) -> None:
            self.key_id = key_id
            self.key = key

    key_sets = [
        [SigningKey("rotated-kid", first_key)],
        [SigningKey("rotated-kid", replacement_key)],
    ]

    def rotating_signing_keys(refresh: bool = False):
        del refresh
        nonlocal calls
        calls += 1
        return key_sets[min(calls - 1, len(key_sets) - 1)]

    auth._jwks_client.cache_clear()
    auth._unknown_kids.clear()
    auth._last_unknown_refresh.clear()
    auth._jwks_refresh_locks.clear()
    client = auth._jwks_client("https://example.test/jwks")
    monkeypatch.setattr(client, "get_signing_keys", rotating_signing_keys)
    token = auth.jwt.encode(
        {"sub": "subject"},
        "unused-test-signing-key-that-is-long-enough",
        algorithm="HS256",
        headers={"kid": "rotated-kid"},
    )

    assert (await auth._get_signing_key("https://example.test/jwks", token)).key is first_key
    assert (await auth._get_signing_key("https://example.test/jwks", token)).key is replacement_key
    assert calls == 2
    assert not hasattr(client.get_signing_key, "cache_info")
    assert client.jwk_set_cache is not None
    assert client.jwk_set_cache.lifespan == 300

    auth._jwks_client.cache_clear()
    auth._unknown_kids.clear()
    auth._last_unknown_refresh.clear()
    auth._jwks_refresh_locks.clear()


@pytest.mark.asyncio
async def test_removed_signing_key_is_rejected_when_authoritative_client_expires_it(monkeypatch) -> None:
    calls = 0
    accepted_key = object()

    class ExpiringClient:
        def get_signing_key_from_jwt(self, token):
            nonlocal calls
            calls += 1
            if calls == 1:
                return accepted_key
            raise auth.PyJWKClientError("key removed")

    auth._unknown_kids.clear()
    auth._last_unknown_refresh.clear()
    auth._jwks_refresh_locks.clear()
    monkeypatch.setattr(auth, "_jwks_client", lambda url: ExpiringClient())
    token = auth.jwt.encode(
        {"sub": "subject"},
        "unused-test-signing-key-that-is-long-enough",
        algorithm="HS256",
        headers={"kid": "removed-kid"},
    )

    assert await auth._get_signing_key("https://example.test/jwks", token) is accepted_key
    with pytest.raises(HTTPException) as rejected:
        await auth._get_signing_key("https://example.test/jwks", token)
    assert rejected.value.status_code == 401
    assert calls == 2

    auth._unknown_kids.clear()
    auth._last_unknown_refresh.clear()
    auth._jwks_refresh_locks.clear()
