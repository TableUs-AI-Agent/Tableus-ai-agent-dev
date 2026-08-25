# Active packet: budgeted Gemini staging validation

## Status

Implementation continues locally on `codex/gemini-staging-validation`, branched
from merged `origin/main` at `6606771383b2a991f3a787dbc612ecc710d31195`.
Candidates `90691b1c53812fc140da465e1b5e362c781f1139` and
`e89d5c4f1664ab0ec0e7d5bec3dd196439283aeb` passed public CI. Their approved
live checks consumed zero reported tokens and `$0`: the first exposed unsupported
wire-schema keywords, while the second proved the restricted credential,
billing tier, project import, and model catalog but received `404` because
Google no longer grants new projects generation access to Gemini 2.5
Flash-Lite. The owner approved Google's recommended stable replacement,
`gemini-3.1-flash-lite`, with its current token pricing and minimal-thinking
configuration. The replacement implementation, focused backend checks, frozen
deterministic evaluator, contract regeneration, and cumulative `make ready`
now pass locally. It is ready to freeze as a new exact-SHA candidate. Staging AI
remains deterministic, and no deployment or returning code was sent.

## Objective

Harden recommendation, ephemeral food-photo analysis, and taste-summary
generation around pinned `gemini-3.1-flash-lite`, then prove them with a frozen,
budgeted, sanitized live evaluation before enabling Gemini on staging.

## Deliverables

- Exact `google-genai==1.75.0` dependency, pinned model configuration, current
  token-cost accounting, and minimal Gemini 3 thinking level.
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

The isolated project, billing, budget alerts, and Gemini-only Railway-restricted
authorization key are already provisioned. After the replacement candidate
passes `make ready`, request one explicit approval covering its exact-SHA public
push, the paid live evaluation, Railway/Vercel deployment, and one returning
code for each of two existing approved accounts. Leave staging live only if the
sanitized evaluation and two-user journey pass.

## Boundaries

No database migration, EAS artifact, new invite, production deployment, store
submission, Sentry/PostHog activation, account deletion, or cohort invitation is
included. The runtime reservation lock assumes the current single Railway
process; horizontally scaled reservations require a durable ledger.
