from tableus import auth
from tableus.request_controls import (
    CachedResponse,
    FixedWindowRateLimiter,
    IdempotencyReplayCache,
    is_idempotency_eligible,
)


def test_idempotency_uses_an_explicit_product_route_allowlist() -> None:
    assert is_idempotency_eligible("POST", "/api/v1/plans") is True
    assert is_idempotency_eligible("POST", "/api/v1/plans/plan-id/finalize") is True
    assert is_idempotency_eligible("DELETE", "/api/v1/me") is True
    assert is_idempotency_eligible("POST", "/api/v1/access/validate") is False
    assert is_idempotency_eligible("POST", "/api/v1/food/analyze") is False
    assert is_idempotency_eligible("POST", "/api/v1/not-a-route") is False


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
    assert limiter.consume("source-d", 60.0) is True
    assert limiter.source_count == 2


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
    monkeypatch.setattr(auth, "PyJWKClient", lambda url: created.append(url) or object())
    auth._jwks_client.cache_clear()

    first = auth._jwks_client("https://example.supabase.co/auth/v1/.well-known/jwks.json")
    second = auth._jwks_client("https://example.supabase.co/auth/v1/.well-known/jwks.json")

    assert first is second
    assert created == ["https://example.supabase.co/auth/v1/.well-known/jwks.json"]
    auth._jwks_client.cache_clear()
