from __future__ import annotations

import asyncio
import hashlib
import json
import re
import tempfile
import time
import uuid
from collections import OrderedDict
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any

_IDEMPOTENT_EXACT_ROUTES = {
    ("POST", "/api/v1/access/redeem"),
    ("PATCH", "/api/v1/me"),
    ("DELETE", "/api/v1/me"),
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

DEFAULT_REQUEST_BODY_LIMIT = 1024 * 1024
PHOTO_UPLOAD_BODY_LIMIT = 9 * 1024 * 1024
_PHOTO_UPLOAD_PATHS = {"/api/v1/food/analyze", "/api/food/analyze"}


class RequestBodyLimitMiddleware:
    """Reject oversized declared and streamed bodies before framework parsing."""

    def __init__(
        self,
        app: Callable[..., Awaitable[None]],
        *,
        default_limit: int = DEFAULT_REQUEST_BODY_LIMIT,
        photo_upload_limit: int = PHOTO_UPLOAD_BODY_LIMIT,
        rate_limiter: Any | None = None,
        readiness_rate_limiter: Any | None = None,
        demo_legacy_allowed: bool = False,
        shared_plans_enabled: bool = True,
        cors_origins: tuple[str, ...] = (),
        body_idle_timeout_seconds: float = 5.0,
        body_total_timeout_seconds: float = 15.0,
        max_active_body_reads: int = 64,
        max_active_body_reads_per_source: int = 8,
    ) -> None:
        self.app = app
        self.default_limit = default_limit
        self.photo_upload_limit = photo_upload_limit
        self.rate_limiter = rate_limiter
        self.readiness_rate_limiter = readiness_rate_limiter
        self.demo_legacy_allowed = demo_legacy_allowed
        self.shared_plans_enabled = shared_plans_enabled
        self.cors_origins = frozenset(cors_origins)
        self.body_idle_timeout_seconds = body_idle_timeout_seconds
        self.body_total_timeout_seconds = body_total_timeout_seconds
        self.max_active_body_reads = max_active_body_reads
        self.max_active_body_reads_per_source = max_active_body_reads_per_source
        self._active_body_lock = asyncio.Lock()
        self._active_body_reads = 0
        self._active_body_reads_by_source: dict[str, int] = {}

    def _limit_for_path(self, path: str) -> int:
        return self.photo_upload_limit if path in _PHOTO_UPLOAD_PATHS else self.default_limit

    async def __call__(
        self,
        scope: dict[str, Any],
        receive: Callable[[], Awaitable[dict[str, Any]]],
        send: Callable[[dict[str, Any]], Awaitable[None]],
    ) -> None:
        if scope.get("type") != "http":
            await self.app(scope, receive, send)
            return

        path = str(scope.get("path", ""))
        headers = {key.lower(): value for key, value in scope.get("headers", [])}
        requested_id = headers.get(b"x-request-id", b"").decode(errors="ignore")
        request_id = (
            requested_id
            if re.fullmatch(r"[A-Za-z0-9._:-]{1,128}", requested_id)
            else str(uuid.uuid4())
        )
        scope.setdefault("state", {})["request_id"] = request_id
        client = scope.get("client")
        source = client[0] if client else "unknown"
        source_key = hashlib.sha256(str(source).encode()).hexdigest()
        is_legacy = path.startswith("/api/") and not path.startswith("/api/v1")
        if is_legacy and not self.demo_legacy_allowed:
            await self._reject(scope, send, 404, "not_found", "Not found")
            return
        if path.startswith("/api/v1/plans") and not self.shared_plans_enabled:
            await self._reject(scope, send, 404, "feature_disabled", "Shared plans are disabled")
            return
        health_probe = path in {"/health/live", "/health/ready"}
        if health_probe:
            method = str(scope.get("method", "GET")).upper()
            declared_health_body = headers.get(b"content-length", b"0") != b"0"
            streamed_health_body = b"transfer-encoding" in headers
            if method not in {"GET", "HEAD"} or declared_health_body or streamed_health_body:
                await self._reject(
                    scope,
                    send,
                    400,
                    "invalid_health_probe",
                    "Health probes must be bodyless GET or HEAD requests",
                )
                return
            if path == "/health/ready" and self.readiness_rate_limiter is not None:
                if self.readiness_rate_limiter.consume(source_key, time.time()):
                    await self._reject(scope, send, 429, "rate_limited", "Too many requests")
                    return
            await self.app(scope, receive, send)
            return

        if self.rate_limiter is not None:
            if self.rate_limiter.consume(source_key, time.time()):
                await self._reject(scope, send, 429, "rate_limited", "Too many requests")
                return

        limit = self._limit_for_path(path)
        declared = headers.get(b"content-length")
        if declared:
            try:
                if int(declared) > limit:
                    await self._reject(
                        scope,
                        send,
                        413,
                        "request_too_large",
                        "Request body is too large",
                    )
                    return
            except ValueError:
                pass

        if not await self._try_acquire_body_slot(source_key):
            await self._reject(scope, send, 503, "server_busy", "Server is busy; retry later")
            return

        received = 0
        disconnected = False
        body_file = tempfile.SpooledTemporaryFile(max_size=min(limit, DEFAULT_REQUEST_BODY_LIMIT))
        total_deadline = asyncio.get_running_loop().time() + self.body_total_timeout_seconds
        try:
            while True:
                remaining = total_deadline - asyncio.get_running_loop().time()
                if remaining <= 0:
                    await self._reject(
                        scope,
                        send,
                        408,
                        "request_timeout",
                        "Request body was not received in time",
                    )
                    return
                try:
                    message = await asyncio.wait_for(
                        receive(),
                        timeout=min(self.body_idle_timeout_seconds, remaining),
                    )
                except TimeoutError:
                    await self._reject(
                        scope,
                        send,
                        408,
                        "request_timeout",
                        "Request body was not received in time",
                    )
                    return
                if message.get("type") == "http.disconnect":
                    disconnected = True
                    break
                body = message.get("body", b"")
                received += len(body)
                if received > limit:
                    await self._reject(
                        scope,
                        send,
                        413,
                        "request_too_large",
                        "Request body is too large",
                    )
                    return
                body_file.write(body)
                if not message.get("more_body", False):
                    break

            body_file.seek(0)

            async def replay_receive() -> dict[str, Any]:
                chunk = body_file.read(64 * 1024)
                if chunk:
                    return {
                        "type": "http.request",
                        "body": chunk,
                        "more_body": body_file.tell() < received,
                    }
                if disconnected:
                    return {"type": "http.disconnect"}
                return {"type": "http.request", "body": b"", "more_body": False}

            await self.app(scope, replay_receive, send)
        finally:
            body_file.close()
            await self._release_body_slot(source_key)

    async def _try_acquire_body_slot(self, source_key: str) -> bool:
        async with self._active_body_lock:
            source_count = self._active_body_reads_by_source.get(source_key, 0)
            if (
                self._active_body_reads >= self.max_active_body_reads
                or source_count >= self.max_active_body_reads_per_source
            ):
                return False
            self._active_body_reads += 1
            self._active_body_reads_by_source[source_key] = source_count + 1
            return True

    async def _release_body_slot(self, source_key: str) -> None:
        async with self._active_body_lock:
            self._active_body_reads = max(0, self._active_body_reads - 1)
            source_count = self._active_body_reads_by_source.get(source_key, 0)
            if source_count <= 1:
                self._active_body_reads_by_source.pop(source_key, None)
            else:
                self._active_body_reads_by_source[source_key] = source_count - 1

    async def _reject(
        self,
        scope: dict[str, Any],
        send: Callable[[dict[str, Any]], Awaitable[None]],
        status: int,
        code: str,
        message: str,
    ) -> None:
        request_id = str(scope.get("state", {}).get("request_id", "unknown"))
        body = json.dumps(
            {
                "error": {
                    "code": code,
                    "message": message,
                },
                "request_id": request_id,
            }
        ).encode()
        await send(
            {
                "type": "http.response.start",
                "status": status,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"content-length", str(len(body)).encode()),
                    (b"x-request-id", request_id.encode()),
                    *self._cors_rejection_headers(scope),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body})

    def _cors_rejection_headers(self, scope: dict[str, Any]) -> list[tuple[bytes, bytes]]:
        headers = {key.lower(): value for key, value in scope.get("headers", [])}
        origin_bytes = headers.get(b"origin")
        if not origin_bytes:
            return []
        origin = origin_bytes.decode(errors="ignore")
        if origin not in self.cors_origins and "*" not in self.cors_origins:
            return []
        return [
            (b"access-control-allow-origin", origin.encode()),
            (b"access-control-allow-credentials", b"true"),
            (b"vary", b"Origin"),
        ]


def is_idempotency_eligible(method: str, path: str) -> bool:
    if (method, path) in _IDEMPOTENT_EXACT_ROUTES:
        return True
    return any(
        method == allowed_method and pattern.fullmatch(path)
        for allowed_method, pattern in _IDEMPOTENT_DYNAMIC_ROUTES
    )


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

        source_count = self._source_counts.pop(source_key, 0)
        if source_count >= self.per_source_limit:
            self._source_counts[source_key] = source_count
            return True
        if self._global_count >= self.global_limit:
            if source_count:
                self._source_counts[source_key] = source_count
            return True

        self._global_count += 1
        self._source_counts[source_key] = source_count + 1
        while len(self._source_counts) > self.max_sources:
            self._source_counts.popitem(last=False)

        return False


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

    def get(self, key: tuple[str, str, str, str], now: float) -> CachedResponse | None:
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


class IdempotencyInFlightCoordinator:
    """Serialize one process's requests that share an idempotency identity."""

    def __init__(self) -> None:
        self._guard = asyncio.Lock()
        self._locks: dict[tuple[str, str, str, str], tuple[asyncio.Lock, int]] = {}

    @property
    def active_key_count(self) -> int:
        return len(self._locks)

    async def acquire(self, key: tuple[str, str, str, str]) -> asyncio.Lock:
        async with self._guard:
            lock, users = self._locks.get(key, (asyncio.Lock(), 0))
            self._locks[key] = (lock, users + 1)
        await lock.acquire()
        return lock

    async def release(
        self,
        key: tuple[str, str, str, str],
        lock: asyncio.Lock,
    ) -> None:
        lock.release()
        async with self._guard:
            current = self._locks.get(key)
            if current is None or current[0] is not lock:
                return
            users = current[1] - 1
            if users <= 0:
                self._locks.pop(key, None)
            else:
                self._locks[key] = (lock, users)

    async def clear(self) -> None:
        async with self._guard:
            if any(lock.locked() or users > 0 for lock, users in self._locks.values()):
                raise RuntimeError("Cannot clear active idempotency requests")
            self._locks.clear()
