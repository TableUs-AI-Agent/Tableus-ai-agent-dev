# Active packet: mobile offline mutation resilience and replay safety

## Status

Implementation and local deterministic verification are complete on
`codex/mobile-offline-resilience`, branched from local evidence commit
`c4df4eb0880e2ee8a4f7cec0f615111af02c8dcd`. Device diagnostics hardened the
Android cold-start wait and gave the global offline alert an explicit semantic
label; the complete Android fault journey then passed diagnostically with only
the old artifact's missing label assertion omitted. Focused checks and the
cumulative `make ready` gate pass at the corrected branch tip. New exact-SHA
`test-ios` and `test-android` artifacts remain explicit approval gates, and
device evidence is not yet claimed. The Expo free-plan iOS build allowance is
currently exhausted and reports a September 1, 2026 reset. Local EAS artifacts
are now the approved deterministic-evidence fallback, with sanitized receipts;
an iOS diagnostic exposed a merged plan-card accessibility label, and the
cross-platform Maestro selector now matches that label without weakening the
visible title/status assertions. Local artifacts from candidate `0b08859`
passed binary inspection, but the iOS evidence run exposed two more deterministic
runner/UI gaps: a fully visible finalization control is impossible at the bottom
safe area, and foreground refetch can reveal a committed finalization while
hiding its ambiguous-failure retry. The runner now starts from clean app data,
uses a tappable visibility threshold, and keeps the same-key finalization retry
available after the read model reports `finalized`. Candidate `0b08859` and both
of its local artifacts are superseded; replacement exact-SHA artifacts and both
device journeys remain the only incomplete acceptance evidence.

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
