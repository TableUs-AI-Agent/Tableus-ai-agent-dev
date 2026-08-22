# Current state

## Implemented

- Hackathon-era Next.js discovery, friends, review, and profile experiences.
- Legacy FastAPI demo endpoints backed by in-memory fixtures.
- Local environment templates for Node 22 and Python 3.12.

## Closed-beta foundation implemented

- Versioned `/api/v1`, persistence models, migrations, deterministic/live provider
  adapters, invite access, connections, reviews, and ranked shared plans.
- Next.js plan/invite surfaces and an Expo Router iOS/Android application.
- The web invite form only pre-fills the deterministic demo invite in demo
  mode; Supabase-backed staging requires an explicit issued invite code.
- Web and mobile keep account creation behind validated invites while giving
  returning invite-approved users a separate email-OTP sign-in path that checks
  `/api/v1/me` without consuming another invite.
- Supabase-backed web sessions load the authenticated profile and connections
  from `/api/v1`, including after Supabase replaces the active session; legacy
  demo identity switching remains demo-only.
- Web and Expo account settings expose a versioned application-data export and
  server-enforced typed-confirmation deletion controls. The export includes the
  profile, connections, reviews, invite-redemption timestamps, the user's plan
  memberships/constraints, votes, and authored plan events while excluding
  email/invite/share-token hashes and provider/auth secrets. A shared read-only
  readiness response reports organized-plan blockers. Eligible profile deletion
  anonymizes retained plan-event actors; neither client silently deletes the
  separate Supabase Auth record.
- Generated OpenAPI TypeScript contract, GitHub CI, EAS workflows, browser/API
  smoke journeys, privacy controls, telemetry hooks, and deployment templates.
- The shared TypeScript client can resolve a demo identity per request. Expo
  uses that capability only in local-E2E builds, where a hidden deep link selects
  one of the two seeded profiles in SecureStore and clears query caches. Demo
  mode, the Expo test flag, and a loopback API URL are all required.
- Mobile plan workspaces use explicit accessible ranking controls, restore the
  viewer's persisted vote, show saved constraint/vote states, and permit
  constraint revision during voting with a warning that recommendations and
  votes will be invalidated.
- A root `mobile-e2e` runner installs one simulator/APK artifact, starts a clean
  deterministic backend, drives organizer and guest Maestro phases, checks 5/5/2
  scoring and stale-run cleanup through the UI, and deletes raw token-bearing
  output. Host API access is limited to plan discovery and share-token rotation.
- Mobile Supabase authentication is coordinated above the router with explicit
  loading, signed-out, verification, retryable redemption, and approved states.
  Its versioned SecureStore transaction retains only normalized email, display
  name, redemption grant, mode, and expiry; invite codes and email OTPs remain
  memory-only. Restored sessions are checked through `/api/v1/me`, product routes
  require approval, and signed-out private-plan links return to their in-memory
  join intent after authentication.
- Supabase session refresh follows React Native foreground state, account changes
  and sign-out clear TanStack Query state, and the shared API client performs at
  most one explicit refresh/retry after `401` while preserving idempotency keys.
  It never retries `403` or switches authentication modes.
- Dedicated `auth-test-ios` and `auth-test-android` EAS profiles use the preview
  environment with Supabase auth and deterministic staging providers. They
  compile without demo identity configuration, loopback API defaults, cleartext
  networking, or local-E2E enablement. A separate gated refresh screen exposes
  only pass/fail status.
- `make mobile-auth-e2e` provides redacted interactive Maestro phases for invalid
  invite, signup, join-intent return, persistence, explicit/foreground refresh,
  sign-out, and returning sign-in. Sensitive flow values use Maestro's supported
  prefixed shell variables rather than command arguments, and an optional phase
  resume records skipped checks honestly for local stabilization. A read-only
  operator script reports invite usage/redemption/validation counts by invite ID
  without personal or secret data.
- The auth-test-only mobile account check validates export structure and deletion
  readiness while displaying aggregate counts only. `make mobile-account-e2e`
  signs an existing approved user in and records sanitized iOS/Android evidence
  without issuing a deletion request.
- Separate migration/runtime database credentials, a private application schema,
  an invite-only Supabase pre-signup hook, email-bound invite redemption, and a
  hashed invite administration CLI.
- Railway configuration keeps the privileged migration credential outside the
  hosted service; approved migrations run separately before runtime deployment.
- Fail-closed Apple/Android association manifests, production-shaped Expo link
  configuration, Railway port handling, expanded beta disclosures, and visible
  attribution on live Google Maps candidates.
- Next.js is pinned to 16.3.1 to resolve direct security advisories. npm still
  reports Expo/React Native build-tool advisories whose proposed remediation is
  an unsupported SDK downgrade; track upstream SDK 57 patches before release.

## External dependencies not provisioned in source

- Supabase staging client environment wiring. The `TableUs Staging` project is
  provisioned in East US and linked locally. Resend-backed custom SMTP is
  configured with the required `resend` username and a verified `table-us.com`
  sending domain. Confirm signup and Magic Link present Supabase's `Token` as the
  verification code. Supabase currently emits eight digits while the custom
  template still says "six-digit"; that copy must be corrected before beta. A
  real invite-approved OTP completed the Auth hook, email delivery,
  code verification, invite redemption, profile creation, and authenticated
  redirect to `/plans`. Sanitized staging evidence showed exactly one profile,
  one redemption, one consumed pending validation, and one used invite. Alembic
  revision `161b86fcb7f4` is applied and verified against staging. The
  `plan_events.actor_id` column is nullable and its profile foreign key uses
  `ON DELETE SET NULL`, preserving audit history when an eligible application
  profile is removed. The project's owner
  credential has been rotated, the least-privilege `tableus_runtime` role is
  active, and the Before User Created hook is enabled against
  `app.hook_restrict_signup_to_validated_invite`. Owner and runtime credentials
  are stored separately in macOS Keychain. One superseded unused invite remains
  active until 2026-08-27; its plaintext is unavailable and it should be revoked
  or allowed to expire before external beta access.
- Railway staging project `tableus-staging`, environment `staging`, and service
  `api` are provisioned. Deployment `fb204f7d-5b7a-4117-a4c8-ac620e659098`
  serves `https://api-staging-3795.up.railway.app` from exact SHA
  `8cde19309fa43787b04d2792d96c1cfc11c21317`; liveness, readiness,
  deterministic-provider mode, Supabase Auth mode, and Vercel CORS passed.
  Railway holds only the runtime database credential and application secret.
- Vercel staging client variables and the returning-sign-in deployment are live.
  Deployment `dpl_4U6nTGJ5WXar7b3q3TomYnwpSTuJ` is `READY` at
  `https://tableus-staging.vercel.app` from the same exact SHA. The dedicated
  staging project also retained its pre-existing `table-us.com` and
  `www.table-us.com` aliases; this packet did not change domain configuration.
  An authenticated
  Browser session showed the active `Jung` profile after the Supabase session
  changed, verifying the deployed identity-refresh fix. The hosted two-user
  journey then covered plan creation, private-link joining, per-user constraints,
  exactly four deterministic candidates, two persisted 3/2/1 votes, organizer-
  only finalization, deterministic tie resolution, reopening, and refinalization.
  Public invite and privacy routes return 200; Apple and Android association
  manifests correctly return 503 until real signing identifiers are supplied.
- Expo project `@tableus/tableus` is provisioned as
  `0601c3b9-0082-454c-b636-45a1fe377f7b`. Its preview environment contains only
  the staging API URL, Supabase URL/publishable client key, EAS project ID, and
  staging link host, plus the non-secret Sentry native-upload disable flag used
  when no Sentry project is configured. Preview profiles remain Supabase-
  authenticated; the two test profiles explicitly enable deterministic demo
  mode. All checked-in workflows validate after replacing paid EAS-hosted Maestro
  jobs with build-artifact jobs for local Maestro execution. The earlier
  `bc0d2f3` artifacts remain recorded as invalid because they sent a demo identity
  to Supabase-authenticated staging. Exact-SHA replacement builds
  `8d5ffefb-28ad-42a1-966d-426af059046b` (iOS simulator) and
  `41e5ece8-58d9-4d5f-84ff-a67dd2dfa607` (Android APK) finished from
  `9dd39fe9db72c52f96db4cf596401d32493a510f`. Their downloaded bundles contain
  the localhost deterministic endpoint and demo identity with no Railway hostname
  match. Separate clean-backend Maestro runs passed on iPhone 17 Pro/iOS 26.5 and
  an API 36 ARM64 Android emulator: no auth error, a real POST-backed plan create,
  refreshed plan-card selection, and navigation to `Your constraints`. The flow
  now dismisses the keyboard, requires the title field to reset after creation,
  and matches React Native's combined accessible card label, eliminating the two
  remaining false-positive paths. Test-only local networking remains isolated
  from preview/production builds. The supplied `@tableus/brian` project remains
  untouched and unused. Apple and Google Play store credentials remain
  unprovisioned.
- Replacement account-control auth-test artifacts were built from exact SHA
  `119171a2d9370b0929bc8d19da819538864745f0`: iOS simulator build
  `e64bb9a4-0fff-48f7-abae-235ec860b7af` and Android APK build
  `5dd01949-47bd-4485-874b-1cd19a1c7c39`. Both passed bundle inspection for the
  HTTPS Railway staging API, Supabase staging configuration, and
  `authE2E=true`, with no demo identities, loopback endpoints, local-E2E mode,
  service-role markers, or production endpoints. Standard artifact SHA-256
  checksums and build evidence are recorded in `docs/evidence/119171a/`. The
  superseded partial evidence remains documented in `docs/evidence/8cde193/`.
- Google Maps, Gemini, Sentry, and PostHog credentials.

## Release gates still requiring an owner or external system

- Supply the Apple Team ID, final bundle/package identifiers, and SHA-256
  fingerprints for every Android signing certificate; then verify the HTTPS
  association files against real builds.
- Confirm the final domain and support/privacy contact, obtain legal review of
  the beta notices, and validate Google Maps attribution against the production
  presentation and current brand requirements.
- Complete the remaining exact-SHA failure-state evidence. Exact-SHA
  returning-user OTP and authenticated-identity evidence is
  green. A second invite-approved account redeemed successfully, bringing
  sanitized staging evidence to two profiles, two redemptions, and two invite
  uses. The stale global identity cache exposed by that session change is fixed
  and verified on staging. The full two-user deterministic planning journey is
  green. Share-token rotation invalidated the prior private link with an explicit
  failure state. Xcode 26.6 with iOS 26.5 simulators, Android platform tools
  37.0.1 with an API 36 ARM64 emulator, and Maestro 2.8.0 are installed locally.
  Device execution invalidated the prior mobile evidence because both old
  artifacts called the Supabase staging API with a demo identity. Replacement
  exact-SHA iOS/Android artifacts now pass the tightened local deterministic plan
  create/open smoke on both platforms. The local two-user join, constraint,
  recommendation, voting, authorization, finalization, reopening, token-rotation,
  and stale-run suite now passes from exact SHA
  `a78a6d27229bc464d4998bdf3c3593f4167a831b` on iOS simulator build
  `d192d04a-73e8-401c-98ac-b6c7a3a9c551` and Android APK build
  `6dba0079-72fe-4c23-aa03-95028a7506c4`. Both bundles passed loopback/demo
  inspection with no Railway hostname, and both full journeys passed
  independently on iPhone 17 Pro/iOS 26.5 and the API 36 ARM64 emulator.
  Sanitized summaries and screenshots are in `docs/evidence/a78a6d2/`.
  Mobile OTP/invite automation is final from exact SHA
  `d6d1b3a99318aff5c904029328e6395a6e4236e4`. iOS simulator build
  `8bbf7822-ffa7-4a61-9670-2ebc6e16cad7` and Android APK build
  `3d6d40ad-43ed-45c6-ab8c-ad254c076322` passed artifact inspection and full
  real Supabase journeys covering invalid-invite rejection, signup, protected
  routing, join-intent restoration, relaunch persistence, explicit and
  foreground refresh, sign-out, and returning sign-in. Both one-use invites
  show one use, one redemption, and no active pending validation. Sanitized
  summaries and screenshots are in `docs/evidence/d6d1b3a/`.
  Offline-retry evidence remains. Account export/deletion controls are deployed,
  the staging migration is verified, and replacement read-only account-control
  journeys passed from exact SHA
  `119171a2d9370b0929bc8d19da819538864745f0` on iOS simulator build
  `e64bb9a4-0fff-48f7-abae-235ec860b7af` and Android APK build
  `5dd01949-47bd-4485-874b-1cd19a1c7c39`. Both journeys proved returning sign-in
  and aggregate-only export/deletion-readiness validation with the corrected
  semantic accessibility label, stale-session normalization, and standard
  evidence checksums. Sanitized summaries and screenshots are in
  `docs/evidence/119171a/account-controls/`. No application profile or Supabase
  Auth identity was deleted. Other failure-state checks remain.
  Maps staging and the budgeted pinned-model Gemini evaluation follow only after
  deterministic staging is green.
- Obtain explicit approval before any production migration, deployment, EAS
  build/submission, paid live-AI evaluation, or cohort invitation.
