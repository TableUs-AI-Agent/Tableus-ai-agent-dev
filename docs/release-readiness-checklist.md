# Closed-beta security and privacy checklist

This checklist is bound to the eventual source candidate SHA. Technical items
may be completed by Codex; owner attestations remain human decisions and must
not be inferred from a passing test.

## Source and dependency controls

- [ ] Candidate SHA recorded in sanitized evidence after a clean `make ready`.
- [ ] Public CI passes at that exact SHA.
- [x] Expo SDK remains 57; React Native remains 0.86.2.
- [x] Expo Router and compatible Expo/Metro packages use current SDK 57 patches.
- [x] Expo Doctor passes all checks, including native dependency deduplication.
- [x] npm audit reports 0 critical and 0 high findings.
- [x] Full repository security scan is complete with no P0/P1 or exposed secret.
- [ ] Runtime bundle inspection finds no service-role material, loopback origin,
  cleartext exception, demo identity, E2E control, or production endpoint.

## Product and privacy controls

- [x] Product authorization derives from an invite-approved API profile, not a
  Supabase session alone.
- [x] Organizer-only transitions, plan membership checks, hashed invite/share
  tokens, one-time invite redemption, and idempotency conflict checks are tested.
- [x] Google Places and Gemini inputs/outputs are bounded, validated, fail closed,
  and excluded from retained evidence and telemetry.
- [x] Sentry is error-only and PostHog is anonymous, aggregate-only, and
  allowlisted; replay, profiling, tracing, autocapture, GeoIP, and person profiles
  remain disabled.
- [x] Public notices use `support@table-us.com` and `privacy@table-us.com` and
  incorporate the Google Maps Platform Terms and Google Privacy Policy.
- [x] Official Google Maps attribution assets are unmodified and remain adjacent
  to provider content with an accessible `Google Maps` label.
- [x] Owner has reviewed and approved the final terms and privacy text.
- [x] Owner has reviewed the attribution presentation on web, iOS, and Android.
- [x] Delivery to both public contact mailboxes is confirmed.
- [ ] Supabase staging email says “verification code”, not “six-digit code”.
- [ ] The superseded unused invite is expired or explicitly revoked.

## Exact-SHA staging evidence

- [ ] Railway and Vercel staging report the source candidate SHA.
- [ ] Deterministic iOS and Android lifecycle/offline evidence passes.
- [ ] Web, physical-iOS, and ARM64-Android production-shaped staging evidence
  passes with live Places/Gemini and Supabase authentication.
- [ ] AASA and Android App Links match the inspected signed artifacts.
- [ ] Sentry/PostHog canaries correlate to the exact release without private data.
- [ ] Export/deletion readiness is read-only; no account is deleted.
- [ ] The cumulative evidence validator accepts the sanitized evidence set.

## Residual-risk register

| Risk | Current control | Owner / expiry | Production effect |
| --- | --- | --- | --- |
| Expo build tooling reaches `uuid@7` through `xcode`; npm reports GHSA-w5hq-g745-h8pq as moderate. The vulnerable buffered v3/v5/v6 API is not used by shipped JS/runtime code. | SDK 57-compatible packages are fully patched, Expo Doctor passes, native builds are trusted inputs, and no force/downgrade remediation is accepted. Recheck Expo patches and npm advisories on every release packet. | Repository owner; exception expires 2026-09-30 or before any production/store approval, whichever is earlier. | Blocks production if still unreviewed at expiry; does not block this staging candidate while runtime critical/high findings remain zero. |
| Idempotency response cache and paid-operation reservation locks are process-local. | Single Railway API process, explicit retry UX, request fingerprints, conservative rate/spend limits. | Repository owner; replace before horizontal scaling. | Horizontal scaling is blocked until durable coordination exists. |
| Staging Vercel uses an exact-SHA Preview deployment because the Production target also owns production-facing aliases. | Cumulative validator binds deployment ID and SHA; do not move production aliases. | Repository owner; revisit before production. | Production deployment remains blocked by a separate gate. |
| Production Google Play signing fingerprint is not yet associated. | Preview certificate remains isolated; verified links are tested only against inspected preview artifacts. | Repository owner; required before Play submission. | Google Play submission is blocked. |
| Legal text is operational disclosure, not counsel-reviewed legal advice. | Owner review is mandatory before source freeze; formal counsel review remains separately recordable. | Repository owner; before closed-beta cohort. | Cohort activation is blocked until owner acceptance. |

## Approval record

Complete only after the named person actually confirms each item.

- Source candidate SHA: the Git commit containing this signed checklist; its
  exact value is recorded in sanitized evidence after the final local gate.
- Security scan report ID: recorded with the exact-SHA sanitized evidence.
- Policy review date/version: Google Maps policy last reviewed 2026-08-26
- Legal/privacy owner: Brian Chei (confirmed 2026-08-26)
- Rollback owner: Brian Chei, repository and cloud account owner
- Contact delivery confirmation: `support@table-us.com` and
  `privacy@table-us.com` confirmed 2026-08-26
- Owner signature/date: Brian Chei, 2026-08-26
