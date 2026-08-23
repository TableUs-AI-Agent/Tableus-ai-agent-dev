# Active packet: mobile offline mutation resilience and replay safety

## Status

Implementation and local deterministic verification are complete on
`codex/mobile-offline-resilience`, branched from local evidence commit
`c4df4eb0880e2ee8a4f7cec0f615111af02c8dcd`. Final candidate
`9acf4fe2a648d4226be028d947ca8d08d7fc7029` passed `make ready`, exact-SHA
artifact inspection, and clean iOS 26.5 and Android API 36 ARM64 fault-proxy
journeys. Both platforms proved one-plan and one-finalized-event same-key
replays, zero known-offline constraint requests, one explicit recovered
constraint request, and four deterministic candidates. Sanitized receipts,
summaries, and screenshots are in `docs/evidence/9acf4fe/`. Superseded
candidates `96588f3` and `c9a0149` are retained only in the history. Local Android
builds are ARM64-only and cap Gradle/CMake concurrency; simulators run
sequentially and verbose native/Maestro output is file-backed to bound host and
Codex desktop memory.

## Objective

Keep private reads in memory, queue no mobile product writes, require explicit
recovery after offline or ambiguous failures, and prove that a retry cannot
duplicate a committed create, constraint update, or finalization.

## Deliverables

- NetInfo-backed connectivity state, an accessible global offline banner,
  foreground/reconnect refetch, and cached-data-preserving offline refresh.
- One in-memory recoverable attempt per mobile product mutation, with explicit
  Retry and Dismiss, stable payload/key replay, edit-to-reset semantics, and no
  automatic dispatch after reconnection.
- Shared API-client options and generated keys for every write method, preserving
  explicit keys through the existing single `401` refresh retry.
- Backend request-body fingerprinting with actor isolation, successful replay
  headers, structured conflicts, and no `5xx` caching.
- Triple-gated in-memory connectivity controls, a loopback fault proxy, sanitized
  Maestro orchestration, artifact inspection, and exact-SHA iOS/Android evidence.
- Exact pinned React Native component-test dependencies and focused tests for
  offline messaging, preserved drafts, explicit recovery, and terminal errors.

## Acceptance

- No API call occurs while connectivity is known offline, and reconnection alone
  dispatches nothing.
- Status `0`, `408`, `429`, and `5xx` failures are recoverable; `401`, `403`,
  `404`, `409`, and `422` are terminal product responses.
- Explicit retry uses the original payload and key; editing or dismissal creates
  a new logical operation. Photo bytes/FormData are never retained for retry.
- A dropped create response yields exactly one plan after retry, offline
  constraints yield zero proxy requests before retry, and a dropped finalization
  yields exactly one transition/event plus an idempotent replay.
- Focused checks and `make ready` pass before an exact candidate SHA is frozen.
- Both built artifacts embed that SHA, loopback/demo configuration and local
  connectivity control, while excluding Railway and production origins.

## Boundaries

- No persistent query cache, background write queue, optimistic mutation,
  idempotency database migration, staging change, OTP, account deletion, paid
  provider, production build, store submission, or deployment.
- Pending attempts disappear when dismissed, edited, unmounted, or terminated.
- Process restart and multi-instance idempotency are accepted closed-beta risks
  until a separately approved persistent ledger is justified.
