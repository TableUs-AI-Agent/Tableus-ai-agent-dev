# Active packet: Gemini Enterprise Agent Platform staging validation

## Status

Implementation continues locally on `codex/gemini-agent-platform`, based on the
verified schema-correction commit `0c92aaa0534551cbb0f4f6603e678ee7d87ab3ab`.
Candidates `90691b1c53812fc140da465e1b5e362c781f1139`,
`e89d5c4f1664ab0ec0e7d5bec3dd196439283aeb`, and
`82c1d45f010a686df8802ab4b8a502731aa1be6f` passed public CI. Their approved
live checks consumed zero reported tokens and `$0`: the first exposed unsupported
wire-schema keywords; the second proved the restricted credential, billing
tier, project import, and model catalog but received `404` for Gemini 2.5
Flash-Lite; and the third isolated an additional Gemini 3.1 rejection of
Pydantic `additionalProperties` metadata. A sanitized compatibility probe proved
that removing it and non-semantic titles advances the request past schema
validation. Plain and corrected-schema generation then returned generic
`429 RESOURCE_EXHAUSTED` despite active linked billing. Google has since renamed
Vertex AI to Gemini Enterprise Agent Platform and explicitly makes its Cloud
platform eligible for new-customer Google Cloud credits, while Welcome credits
remain ineligible for the standalone Gemini Developer API. The adapter now uses
the SDK's explicit `enterprise=True` transport and fail-closed readiness reports
`ai_backend=agent-platform`. Staging AI remains deterministic, no deployment or
returning code was sent, and candidate
`4a804bc54330289cafbcfbe1f6f35c9f48f3beea` passes cumulative `make ready`.
The Agent Platform API and `roles/aiplatform.expressUser` grant are active in the
isolated project. Retargeting the existing service-account-bound key was denied
by the managed `disableServiceAccountApiKeyCreation` organization policy; the
key therefore remains restricted to the standalone Developer API and Railway's
three addresses. Resolving that policy or choosing a new credential form is the
remaining cloud-configuration decision before public push and live evaluation.

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

The isolated project, active linked billing, budget alerts, and Railway-
restricted service-account-bound authorization key are already provisioned.
The approved external gate enables only `aiplatform.googleapis.com`, grants the
bound identity least-privilege `roles/aiplatform.expressUser`, changes the key's
API target from the standalone Developer API to Agent Platform, and runs the
new exact-SHA evaluation under the existing `$0.25` ceiling. Railway/Vercel
deployment and one returning code for each evidence account remain conditional
on a fully passing evaluation. Leave staging live only if the sanitized
evaluation and two-user journey pass.

## Boundaries

No database migration, EAS artifact, new invite, production deployment, store
submission, Sentry/PostHog activation, account deletion, or cohort invitation is
included. The runtime reservation lock assumes the current single Railway
process; horizontally scaled reservations require a durable ledger.
