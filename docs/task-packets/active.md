# Active packet: budgeted Gemini staging validation

## Status

Implementation is complete locally on `codex/gemini-staging-validation`,
branched from merged `origin/main` at
`6606771383b2a991f3a787dbc612ecc710d31195`. Focused provider/API checks, the
full backend and workspace suites, deterministic AI evaluation, generated
contract, builds, smoke checks, performance report, and cumulative `make ready`
pass. The candidate is ready to freeze. No Gemini credential, paid call, cloud
project, public push, migration, or deployment is authorized by this packet
status.

## Objective

Harden recommendation, ephemeral food-photo analysis, and taste-summary
generation around pinned `gemini-2.5-flash-lite`, then prove them with a frozen,
budgeted, sanitized live evaluation before enabling Gemini on staging.

## Deliverables

- Exact `google-genai==1.75.0` dependency and pinned model configuration.
- Strict structured outputs, request-local candidate aliases, bounded inputs,
  output privacy/safety guards, 12-second timeouts, typed errors, and at most
  three TableUs-owned attempts with no provider fallback.
- Shared AI usage recording with token totals, estimated cost, error outcomes,
  five-per-user/30-global minute limits, and a database-backed rolling `$4`
  staging ceiling with one-process reservations.
- Metadata-stripped, maximum-1600-pixel ephemeral food images and a maximum of
  25/12,000-character review inputs.
- Frozen deterministic evaluation plus checkpointed `make ai-eval-live` under a
  `$0.25` ceiling and sanitized `make gemini-staging-e2e` two-user evidence.
- Updated privacy disclosures, generated API contract, release runbook, current
  state, roadmap, and durable decision record.

## Acceptance

- Deterministic CI and `make ready` remain credential-free and make no live call.
- Every live operation either yields schema-valid bounded output or a typed
  terminal/transient failure; invalid output never changes a plan or taste
  profile and images are never persisted.
- Recommendation prompts contain request-local candidate keys and normalized
  TableUs fields, not Place IDs, names, addresses, coordinates, or Google
  response bodies.
- Provider usage exposes aggregate tokens and estimated cost only. Staging
  rejects calls before Gemini when user/global limits or the rolling ceiling are
  exhausted.
- Paid evidence is pinned to one exact SHA, model, fixture hash, and `$0.25`
  ceiling. Staging readiness then reports Supabase auth, live Places, live AI,
  and compatibility `live` from that SHA.

## External gate

After the candidate passes `make ready`, request one explicit approval covering
the exact-SHA public push; isolated `TableUs Staging AI` project and billing;
Gemini-only IP-restricted authorization key; `$5` 50/80/100-percent budget
alerts; paid live evaluation; Railway secret/configuration and deployment;
Vercel deployment; and one returning code for each of two existing approved
accounts. Leave staging live only if the sanitized evaluation and two-user
journey pass.

## Boundaries

No database migration, EAS artifact, new invite, production deployment, store
submission, Sentry/PostHog activation, account deletion, or cohort invitation is
included. The runtime reservation lock assumes the current single Railway
process; horizontally scaled reservations require a durable ledger.
