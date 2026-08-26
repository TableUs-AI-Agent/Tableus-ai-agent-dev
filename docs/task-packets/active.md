# Active packet: privacy-safe observability staging validation

## Status

Complete in staging at exact candidate
`4920d99b11b06c4e0aa1c4afc3f91763bb53ee1c`. Railway deployment
`bed50df4-5ced-465f-8492-a24147e8f663` and Vercel deployment
`dpl_4M7eSvsht9UNB2wqmCjZ1pVUmHiD` are pinned to the candidate. Inspected,
memory-bounded local iOS and Android telemetry-test artifacts emitted sanitized
canaries, the preserved approved iOS session exercised the authenticated API
canary without a new OTP, and aggregate verification found one exact-release
issue in each Sentry project plus all four PostHog platforms. Sanitized evidence
is in `docs/evidence/4920d99/observability/`. Earlier candidates and incomplete
evidence remain superseded. Public merge remains a separate explicit gate.

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
- PostHog's required `distinct_id` is the random process-memory telemetry UUID;
  SDK device identifiers and account identifiers are not retained.
- Sentry receives one sanitized canary per component with usable stack/release
  evidence and none of the prohibited private fields.
- Retained evidence contains aggregate counts and booleans only.

## External gate

The approved public push, isolated staging resources, exact-SHA Railway/Vercel
deployments, memory-bounded local artifacts, and sanitized canaries are complete.
Merging `codex/privacy-safe-observability` to `main` remains a separate explicit
approval.

## Boundaries

No migration, production resource/deployment/build, store action, new invite,
paid provider call, account deletion, cohort invitation, replay, performance
tracing, profiling, or person analytics is included. Build-time source-map
tokens never enter client artifacts. A correction after the candidate commit
requires a new SHA and new deployment/build evidence.
