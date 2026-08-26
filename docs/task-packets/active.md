# Active packet: Gemini Enterprise Agent Platform staging validation

## Status

Completed on `codex/gemini-agent-platform` at exact candidate
`2eb428a05913c60dd1af1ae59fdd79fb233c5ede`. Public CI run `32915965276`
passed. The frozen six-case Agent Platform evaluation passed 6/6 with six total
attempts for `$0.0018905`. Railway deployment
`a1030828-a505-417e-8285-c2b49dbbb39c` and Vercel deployment
`dpl_Ad4H9FqVAQJviSkP2KYTKWMkKxbt` are pinned to the exact SHA. Sanitized
two-user staging evidence passed with live Places and live Gemini, four distinct
candidates, policy-safe candidate rows, and aggregate-only usage accounting.
The active service-account-bound authorization key is limited to
`aiplatform.googleapis.com` and Railway's three static egress addresses; the
superseded Developer API key is revoked.

## Objective

Run recommendation, ephemeral food-photo analysis, and taste-summary generation
through Gemini Enterprise Agent Platform with pinned `gemini-3.1-flash-lite`,
then prove them with a frozen, budgeted, sanitized live evaluation before
enabling Gemini on staging.

## Deliverables

- Exact `google-genai==1.75.0` dependency, pinned model configuration, current
  Agent Platform transport, current token-cost accounting, and minimal Gemini 3
  thinking level.
- Strict structured outputs, request-local candidate aliases, bounded inputs,
  output privacy/safety guards, 12-second timeouts, typed errors, and at most
  three TableUs-owned attempts with no provider fallback.
- Shared AI usage recording with token totals, estimated cost, error outcomes,
  five-per-user/30-global minute limits, and a database-backed rolling `$4`
  staging ceiling with one-process reservations.
- Metadata-stripped, maximum-1600-pixel ephemeral food images and a maximum of
  25/12,000-character review inputs.
- Frozen deterministic evaluation plus checkpointed `make ai-eval-live` under a
  `$0.25` ceiling and sanitized `make gemini-staging-e2e` two-user evidence. The
  checkpoint and readiness evidence bind `agent-platform`, preventing accidental
  standalone Developer API validation.
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

The approved external gate is complete. No production deployment, store action,
new invite, migration, telemetry activation, account deletion, or cohort
invitation occurred. Merging this objective remains a separate owner gate.

## Boundaries

No database migration, EAS artifact, new invite, production deployment, store
submission, Sentry/PostHog activation, account deletion, or cohort invitation is
included. The runtime reservation lock assumes the current single Railway
process; horizontally scaled reservations require a durable ledger.
