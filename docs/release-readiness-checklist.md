# Closed-beta security and privacy checklist

This checklist is bound to the eventual source candidate SHA. Technical items
may be completed by Codex; owner attestations remain human decisions and must
not be inferred from a passing test.

## Source and dependency controls

- [x] Candidate SHA `069473c24e7921e5b4b2ad51faa04e71899721ad`
  recorded after a clean `make ready`.
- [ ] Public CI passes at that exact SHA.
- [x] Expo SDK remains 57; React Native remains 0.86.2.
- [x] Expo Router and compatible Expo/Metro packages use current SDK 57 patches.
- [x] Expo Doctor passes all checks, including native dependency deduplication.
- [x] The production dependency audit reports 0 critical and 0 high findings.
  The full developer graph's EAS/Expo release-tool exception is recorded below.
- [x] Replacement exact-SHA focused security review is complete with no P0/P1
  or exposed secret. Scan `b737ba37-01d4-4ba8-841d-f1da1d09d61a` blocked superseded
  `d0955f5`; scan `0933625b-4d73-4da7-ba6a-946128c29089` then blocked local
  `5206303` on one remaining P1 multipart boundary. Its source-owned high/medium
  findings are remediated locally. Full scan
  `2c12edd1-65ce-4cee-af11-c78c0b21ae85` then blocked local SHA `b2823652`
  on 12 distinct high-severity root causes (13 raw high records). All identified
  high paths and the highest-confidence medium paths are remediated locally.
  Exact-diff scan `273335ab-78d3-4d77-9ba6-6cd3ebd96fbb` found no issue in all
  20 changed security files at `3a215e7`. Deep scan
  `2482f6f3-b05c-4c40-bc9f-e5d5a0ec41a0` was canceled for disproportionate
  usage; its unsealed candidates were manually consolidated and reviewed. The
  local replacement passes `make ready`. Frozen candidate `069473c` passed
  focused exact-diff scan `528a703f-7ff1-4505-828d-1a8b1de1fdc5` with complete
  coverage and zero findings. No additional deep or diff scan is authorized
  without separate owner confirmation.
- [x] GitHub Actions, CI service images, and backend OCI inputs are pinned to
  immutable commits or multi-platform digests with executable policy tests.
- [ ] Runtime bundle inspection finds no service-role material, loopback origin,
  local-network/cleartext exception, demo identity, E2E control, or production
  endpoint. The superseded iOS artifact failed the strengthened native-plist
  check and cannot supply replacement evidence.

## Product and privacy controls

- [x] Product authorization derives from an invite-approved API profile, not a
  Supabase session alone.
- [x] Organizer-only transitions, plan membership checks, hashed invite/share
  tokens, one-time invite redemption, and idempotency conflict checks are tested.
- [x] Hosted staging fails closed against demo auth/routes, weak secrets,
  non-Postgres runtime credentials, mismatched roles, and unsafe origins.
- [x] Declared and chunked multipart bodies are bounded before FastAPI parsing;
  invite validations are deduplicated, capacity-reserved, and expiry-pruned.
- [x] Web private caches are subject-partitioned and cleared on auth/deletion;
  plan-local state remounts by subject; live evidence retains no raw screenshots,
  uses no-echo secret prompts, and removes new user-level Maestro logs.
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
- [x] Supabase staging email says “verification code”, not “six-digit code”.
- [x] The superseded unused invite is expired or explicitly revoked; the latest
  aggregate audit reports zero active and eight expired invites.

## Exact-SHA staging evidence

- [ ] Railway and Vercel staging report the source candidate SHA.
- [ ] Deterministic iOS and Android lifecycle/offline evidence passes.
- [ ] Web, physical-iOS, and ARM64-Android production-shaped staging evidence
  passes with live Places/Gemini and Supabase authentication.
- [ ] AASA and Android App Links match the inspected signed artifacts.
- [ ] Sentry/PostHog canaries correlate to the exact release without private data.
- [ ] Sanitized telemetry evidence comes from isolated exact-SHA telemetry-test
  artifacts; readiness artifacts compile no telemetry E2E route or control.
- [ ] Export/deletion readiness is read-only; no account is deleted.
- [ ] The cumulative evidence validator accepts the sanitized evidence set.

## Residual-risk register

| Risk | Current control | Owner / expiry | Production effect |
| --- | --- | --- | --- |
| The full developer dependency graph reports four high, 19 moderate, and one low advisory through the local EAS CLI/Expo build toolchain; the production graph has zero critical/high findings and 12 moderate Expo build-chain findings. | EAS CLI is locked exactly at `23.2.0`, SDK 57-compatible packages are fully patched, Expo Doctor passes, release inputs are inspected, and no forced audit rewrite or unsupported SDK downgrade is accepted. Recheck upstream patches and audit reachability on every release packet. | Repository owner; exception expires 2026-09-30 or before any production/store approval, whichever is earlier. | Blocks production if unresolved or newly runtime-reachable; does not block isolated staging while the shipped runtime graph remains free of critical/high findings. |
| Idempotency response cache and paid-operation reservation locks are process-local. | Single Railway API process; explicit retry UX; verified-subject/role replay; fixed entry, byte, request, and response bounds; request fingerprints; conservative rate/spend limits. | Repository owner; replace before horizontal scaling. | Horizontal scaling is blocked until durable coordination exists. |
| Private-plan capability remains in the canonical join URL query. | Approved authentication is also required; tokens are random, hashed at rest, rotatable, redacted from telemetry/evidence, and old links are rejected after rotation. | Repository owner; design a short-lived exchange before production. | Production is blocked on a reviewed exchange or explicit risk acceptance. |
| Aggregate provider usage is readable by any approved beta profile. | Output excludes identities, queries, coordinates, Place IDs, provider content, prompts, responses, and credentials. | Repository owner; add an operator boundary before cohort expansion. | Does not block isolated staging; cohort expansion is blocked until resolved. |
| A bearer of a reusable invite can repeatedly renew one email reservation until invite expiry. | Closed beta issues one-use invites to named recipients, reservations expire, redemption is email-bound, and approved profiles cannot consume a different invite. Do not issue multi-use cohort invites. | Repository owner; redesign as server-bound recipient invitations before cohort expansion. | Does not block isolated one-use staging evidence; multi-use invites and cohort expansion are blocked. |
| One approved user can consume the shared rolling Places/Gemini budget before other approved users. | Per-user and global minute limits, a hard rolling database ceiling, isolated small cohort, and provider budgets bound spend. | Repository owner; add durable per-actor quotas before cohort expansion or scaling. | Does not block isolated staging; broader cohort activation is blocked. |
| Plan and event storage have no per-user lifetime plan quota or archival policy. | Invite-only access, bounded participants/reviews/providers, request limits, and operator monitoring constrain the current staging cohort. | Repository owner; define quotas, retention, and archival before cohort expansion. | Does not block isolated staging; broader cohort and production retention approval are blocked. |
| Deterministic simulator artifacts are locally attested rather than remotely signed. | The isolated exact-SHA orchestrator, signer inspection, digest-bound receipts, private same-byte installation, and signed production-shaped artifacts separate deterministic evidence from release evidence. | Repository owner; require store/remote signing evidence at production gate. | Does not block local deterministic evidence; store submission remains blocked. |
| Supabase JWKS and same-`kid` replacement may remain cached for at most five minutes. | One bounded provider cache, no indefinite per-key LRU, coalesced refresh, negative cache, and cached-known-key behavior under unknown-key traffic. | Repository owner; re-evaluate if revocation SLA becomes shorter than five minutes. | Accepted for isolated closed beta; a stricter production revocation SLA would require a shorter/provider-driven policy. |
| Staging Vercel uses an exact-SHA Preview deployment because the Production target also owns production-facing aliases. | Cumulative validator binds deployment ID and SHA; do not move production aliases. | Repository owner; revisit before production. | Production deployment remains blocked by a separate gate. |
| Production Google Play signing fingerprint is not yet associated. | Preview certificate remains isolated; verified links are tested only against inspected preview artifacts. | Repository owner; required before Play submission. | Google Play submission is blocked. |
| Legal text is operational disclosure, not counsel-reviewed legal advice. | Owner review is mandatory before source freeze; formal counsel review remains separately recordable. | Repository owner; before closed-beta cohort. | Cohort activation is blocked until owner acceptance. |

## Approval record

Complete only after the named person actually confirms each item.

- Source candidate SHA: `069473c24e7921e5b4b2ad51faa04e71899721ad`.
  This checklist update is an evidence-only descendant and does not change the
  reviewed source tree.
- Security review report ID: focused exact-diff report
  `528a703f-7ff1-4505-828d-1a8b1de1fdc5`; blocked reports
  `b737ba37-01d4-4ba8-841d-f1da1d09d61a`,
  `0933625b-4d73-4da7-ba6a-946128c29089`, and
  `2c12edd1-65ce-4cee-af11-c78c0b21ae85` at `b2823652` are retained for
  remediation traceability. Clean focused diff report
  `273335ab-78d3-4d77-9ba6-6cd3ebd96fbb` and canceled deep report
  `2482f6f3-b05c-4c40-bc9f-e5d5a0ec41a0` are also recorded; unsealed deep-scan
  candidates are not release findings.
- Policy review date/version: Google Maps policy last reviewed 2026-08-26
- Legal/privacy owner: Brian Chei (confirmed 2026-08-26)
- Rollback owner: Brian Chei, repository and cloud account owner
- Contact delivery confirmation: `support@table-us.com` and
  `privacy@table-us.com` confirmed 2026-08-26
- Owner signature/date: Brian Chei, 2026-08-26
