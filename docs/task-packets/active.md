# Active packet: privacy-safe observability staging validation

## Status

Local implementation and deterministic readiness are complete on
`codex/privacy-safe-observability`, branched from merged `main` at
`3820297ff3a91a04695a4f7187bd8fc850a234dd`. The exact candidate SHA is recorded
in the handoff; the external staging gate remains pending.

## Objective

Make staging failures diagnosable and closed-beta behavior measurable without
creating telemetry identities or sending private dining data. Use three isolated
Sentry staging projects (API, web, mobile) for sanitized errors only and one
isolated US PostHog staging project for anonymous allowlisted events.

## Deliverables

- Random memory-only telemetry session identifiers shared with the API only as
  request context. They reset with the page/app process, are never account IDs,
  are not stored, and never create person profiles.
- PostHog autocapture, lifecycle/page capture, surveys, feature flags, GeoIP,
  persistence, and session replay disabled behind a strict event/property
  allowlist.
- Sentry error capture with private values and request content removed. Tracing,
  profiling, replay, attachments, and breadcrumbs remain disabled; useful stack,
  component, request ID, environment, and exact release evidence remain.
- Exact-SHA readiness, source-map upload with public client-map deletion, gated
  telemetry-test profiles, synthetic canary surfaces, leakage tests, and an
  aggregate-only `make telemetry-staging-e2e` verifier.
- Updated privacy disclosures, current state, roadmap, decisions, and runbook.

## Acceptance

- Deterministic `make ready` is credential-free and produces no live event.
- Staging readiness is exact-SHA and reports anonymous analytics, error-only
  reporting, and explicitly gated E2E controls.
- PostHog receives allowlisted bounded properties, platform, release, and
  no-person/no-GeoIP flags only. No identifier survives process termination or
  links to an application profile.
- Sentry receives one sanitized canary per component with usable stack/release
  evidence and none of the prohibited private fields.
- Retained evidence contains aggregate counts and booleans only.

## External gate

After the candidate passes `make ready`, request explicit approval for the public
push, three free-tier Sentry staging projects, one free-tier US PostHog staging
project, their runtime/build/read-only secrets, exact-SHA Railway/Vercel
deployment, and memory-bounded local iOS/Android telemetry-test builds. Merging
is a separate explicit approval.

## Boundaries

No migration, production resource/deployment/build, store action, new invite,
paid provider call, account deletion, cohort invitation, replay, performance
tracing, profiling, or person analytics is included. Build-time source-map
tokens never enter client artifacts. A correction after the candidate commit
requires a new SHA and new deployment/build evidence.
