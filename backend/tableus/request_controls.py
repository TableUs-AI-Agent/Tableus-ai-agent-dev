from __future__ import annotations

import re
from collections import OrderedDict
from dataclasses import dataclass

_IDEMPOTENT_EXACT_ROUTES = {
    ("POST", "/api/v1/access/redeem"),
    ("PATCH", "/api/v1/me"),
    ("DELETE", "/api/v1/me"),
    ("POST", "/api/v1/connections"),
    ("POST", "/api/v1/reviews"),
    ("POST", "/api/v1/taste-profile/regenerate"),
    ("POST", "/api/v1/locations/resolve"),
    ("POST", "/api/v1/discover"),
    ("POST", "/api/v1/plans"),
}

_IDEMPOTENT_DYNAMIC_ROUTES = (
    ("DELETE", re.compile(r"^/api/v1/connections/[^/]{1,255}$")),
    (
        "POST",
        re.compile(
            r"^/api/v1/plans/[^/]{1,255}/(?:join|recommendations|finalize|reopen|share-token/rotate)$"
        ),
    ),
    ("PATCH", re.compile(r"^/api/v1/plans/[^/]{1,255}/constraints$")),
    ("PUT", re.compile(r"^/api/v1/plans/[^/]{1,255}/vote$")),
)


def is_idempotency_eligible(method: str, path: str) -> bool:
    if (method, path) in _IDEMPOTENT_EXACT_ROUTES:
        return True
    return any(method == allowed_method and pattern.fullmatch(path) for allowed_method, pattern in _IDEMPOTENT_DYNAMIC_ROUTES)


@dataclass(frozen=True)
class CachedResponse:
    expires_at: float
    status_code: int
    body: bytes
    media_type: str
    request_fingerprint: str


class FixedWindowRateLimiter:
    """Process-local pre-authentication limiter with bounded state."""

    def __init__(
        self,
        *,
        per_source_limit: int = 120,
        global_limit: int = 1200,
        max_sources: int = 2048,
    ) -> None:
        self.per_source_limit = per_source_limit
        self.global_limit = global_limit
        self.max_sources = max_sources
        self._minute = -1
        self._global_count = 0
        self._source_counts: OrderedDict[str, int] = OrderedDict()

    @property
    def source_count(self) -> int:
        return len(self._source_counts)

    def clear(self) -> None:
        self._minute = -1
        self._global_count = 0
        self._source_counts.clear()

    def consume(self, source_key: str, now: float) -> bool:
        minute = int(now // 60)
        if minute != self._minute:
            self._minute = minute
            self._global_count = 0
            self._source_counts.clear()

        self._global_count += 1
        source_count = self._source_counts.pop(source_key, 0) + 1
        self._source_counts[source_key] = source_count
        while len(self._source_counts) > self.max_sources:
            self._source_counts.popitem(last=False)

        return source_count > self.per_source_limit or self._global_count > self.global_limit


class IdempotencyReplayCache:
    """Bounded 24-hour process-local replay storage for successful writes."""

    def __init__(
        self,
        *,
        max_entries: int = 1024,
        max_total_bytes: int = 64 * 1024 * 1024,
        max_response_bytes: int = 1024 * 1024,
    ) -> None:
        self.max_entries = max_entries
        self.max_total_bytes = max_total_bytes
        self.max_response_bytes = max_response_bytes
        self._entries: OrderedDict[tuple[str, str, str, str], CachedResponse] = OrderedDict()
        self._total_bytes = 0

    def __len__(self) -> int:
        return len(self._entries)

    @property
    def total_bytes(self) -> int:
        return self._total_bytes

    def clear(self) -> None:
        self._entries.clear()
        self._total_bytes = 0

    def _delete(self, key: tuple[str, str, str, str]) -> None:
        entry = self._entries.pop(key, None)
        if entry is not None:
            self._total_bytes -= len(entry.body)

    def _prune_expired(self, now: float) -> None:
        while self._entries:
            key, entry = next(iter(self._entries.items()))
            if entry.expires_at > now:
                break
            self._delete(key)

    def get(
        self, key: tuple[str, str, str, str], now: float
    ) -> CachedResponse | None:
        self._prune_expired(now)
        entry = self._entries.get(key)
        if entry is None:
            return None
        if entry.expires_at <= now:
            self._delete(key)
            return None
        return entry

    def store(self, key: tuple[str, str, str, str], entry: CachedResponse, now: float) -> bool:
        if len(entry.body) > self.max_response_bytes:
            return False
        self._prune_expired(now)
        self._delete(key)
        self._entries[key] = entry
        self._total_bytes += len(entry.body)
        while len(self._entries) > self.max_entries or self._total_bytes > self.max_total_bytes:
            oldest_key = next(iter(self._entries))
            self._delete(oldest_key)
        return key in self._entries
