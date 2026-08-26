# Active packet: closed-beta cumulative staging readiness

## Status

Implementation is active on `codex/closed-beta-readiness`, branched from merged
`main` at `e1184eca9b73e1a9f26d1007ab543df9d54c7124`. Local deterministic checks,
the repository security scan, owner legal/contact confirmations, candidate
freeze, public CI, deployments, signed builds, and cumulative evidence must all
complete before this packet can be signed off.

## Objective

Close the remaining pre-production gates without changing the public API,
database schema, or product behavior. Establish one exact source SHA across
Railway, Vercel, web, a registered physical iPhone, and an ARM64 Android
emulator, with policy-safe retained evidence and an accountable rollback owner.

## Deliverables

- Canonical `support@table-us.com` and `privacy@table-us.com` contacts shared by
  web and mobile legal notices.
- Owner-reviewed terms/privacy copy with direct Google Maps Platform Terms and
  Google Privacy Policy links and retained Supabase, Gemini, Sentry, PostHog,
  location, photo, retention, export, and deletion disclosures.
- The official unmodified Google Maps attribution asset in the same visual
  container as provider content, with accessible labeling and policy guards.
- Expo SDK 57 patch releases only, Expo Doctor/dependency/audit evidence, and a
  time-bounded exception for build-tool-only `uuid` reachability if no supported
  SDK 57 fix is available.
- A repository-wide authentication, authorization, secret, provider-boundary,
  telemetry, CORS, configuration-gate, and dependency-reachability scan.
- Production-shaped `readiness-ios` and `readiness-android` profiles, signed
  artifact inspection, guided device runners, and one-SHA cumulative evidence
  validation.
- A signed security/privacy checklist, residual-risk register, release-candidate
  procedure, and rollback matrix naming the repository owner as accountable.

## Acceptance

- Deterministic CI and `make ready` require no provider or cloud credentials.
- Expo Doctor passes; npm reports zero critical/high findings, with any accepted
  moderate advisory documented by reachability and expiry.
- No P0/P1 security finding, exposed credential, or exploitable high runtime
  issue remains.
- The owner confirms the final legal copy, attribution presentation, and actual
  delivery to both public contact mailboxes before candidate freeze.
- Public CI and all retained Railway, Vercel, web, deterministic mobile,
  production-shaped mobile, link-association, telemetry, and security evidence
  reference one exact candidate SHA.
- Evidence contains only approved identifiers, checksums, counts, booleans,
  policy versions, and sanitized screenshots; it contains no personal, secret,
  private-plan, location, restaurant, or provider response data.

## External gates

After a clean local candidate exists, one explicit owner approval is required
before the public push, Supabase OTP-template change, contact-alias creation,
Railway/Vercel staging deployment, budgeted live smoke, four sequential local
mobile builds, or returning OTP delivery. A separate explicit approval is
required to merge the evidence descendant into `main`.

## Boundaries

No migration, public API or OpenAPI change, production deployment, TestFlight,
Google Play, production signing fingerprint, store submission, new invite,
account deletion, or cohort invitation is included. Production/store/cohort
activation remains a separate objective.
