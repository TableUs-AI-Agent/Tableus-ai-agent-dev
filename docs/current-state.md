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
- Mobile product reads remain in TanStack Query memory for the current process
  only. NetInfo drives an accessible global offline banner and explicit read
  refetch on reconnect/foreground; offline refresh leaves cached data visible.
  Product writes are never queued or automatically replayed. Known-offline and
  ambiguous network failures preserve form intent in memory and require an
  accessible Retry or Dismiss action; retry reuses one payload and idempotency
  key, while editing discards the attempt. Authentication retains its separate
  session coordinator, and photo retry requires choosing the image again.
- Every shared client write carries an idempotency key, including through the
  one-time `401` refresh path. The closed-beta API caches successful responses
  for 24 hours in one process and rejects a same-actor/key request whose body
  fingerprint differs with `409 idempotency_conflict`. This ledger is not yet
  durable across API restarts or shared across horizontally scaled instances.
- `make mobile-offline-e2e` starts a clean backend on loopback port 8001 and a
  fault proxy on 8000, then proves dropped-after-commit create/finalize replay,
  zero-request known-offline constraints, and explicit recovery on one exact-SHA
  test artifact per platform. The test-only connectivity deep link is triple-
  gated by local-E2E, demo mode, and loopback API configuration and is memory-only.
- Deterministic simulator/emulator evidence may use `eas build --local` when
  hosted EAS test-build allowance is unavailable. `make local-mobile-build-receipt`
  records only the exact candidate SHA, sanitized local build ID/profile, artifact
  checksum, EAS CLI version, host OS/architecture, and artifact-inspection result.
  Local receipts do not replace hosted EAS metadata for production or store builds.
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
- Verified-link implementation now targets the dedicated canonical host
  `links.table-us.com`. Shared domain helpers generate every web/mobile auth and
  private-plan URL, reject unsafe origins, and replace custom-scheme or
  current-origin sharing. Expo matches `/join/*` and exact `/auth` while leaving
  `/auth/confirm` on the web. A native-intent rewrite normalizes cold-start HTTPS
  paths, retains only the allowlisted auth mode or join token, and leaves other
  origins plus the development scheme unchanged. Web join auth renders inline
  and mobile auth is presented over the retained join route, so neither client
  persists the share token outside the current navigation process. Both expose
  an accessible invalid/expired/rotated state.
- `links-test-ios` and `links-test-android` inherit the Supabase-authenticated
  preview environment without demo or local/auth-E2E controls. Signed-artifact
  inspection verifies exact SHA, HTTPS staging markers, native associations,
  Apple Team ID or Android certificate, and forbidden origins. The redacted
  `make mobile-links-e2e` runner verifies hosted manifests, native routing,
  returning OTP, retained join intent, and rotated-link handling while deleting
  raw private URLs and Maestro output. Expo SDK 57 iOS artifacts are inspected
  through `EXConstants.bundle/app.config`; the legacy config path remains
  accepted. EAS CLI 22.4.0 is the minimum local-build version, and locally
  generated credential/keystore files are ignored.
- Verified-link DNS, TLS, canonical staging deployment, signing identifiers, and
  both direct association endpoints are configured. Exact candidate
  `341d67ec73c96f96f19c6e0e2911677e973a7d61` is deployed to Vercel and produced
  inspected physical-iOS and ARM64-Android signed artifacts. Android automation
  and a user-observed physical-iPhone journey proved web fallback, native auth
  and join routing, returning code authentication with retained join intent,
  and rotated-link rejection. Apple diagnostics approved the exact signed app
  identifier and Android reported the canonical host verified. Sanitized
  evidence is in `docs/evidence/341d67e/`; production Play App Signing remains a
  later fingerprint and store-release gate.
- Next.js is pinned to 16.3.1 to resolve direct security advisories. npm still
  reports Expo/React Native build-tool advisories whose proposed remediation is
  an unsupported SDK downgrade; track upstream SDK 57 patches before release.
- The Maps staging implementation now splits Places and AI modes, reports mixed
  readiness, and uses Places API New Text/Nearby/Details calls with explicit
  field masks, US-only location validation, 5 km filtering, bounded retries,
  four-way detail concurrency, and no fixture fallback. New resolved plans store
  the user's normalized label and a Place ID with null coordinates; legacy
  deterministic coordinate plans remain readable. Plan lists are summary-only,
  web polls a lightweight revision before refreshing detail, and live logical
  operations are process-rate-limited and recorded as aggregate attempt/result
  counts. Web and Expo require explicit location selection with Google Maps
  attribution and keep provider display content in memory only. Focused checks,
  empty/previous migration checks, API drift validation, `make ready`, and
  sequential Expo Go iOS/Android location-create smokes pass locally. Live
  staging proved that a city-level Text Search result can omit the postal
  address despite returning a populated `200`; location validation now prefers
  the postal region and uses the transient country address component only when
  the postal region is absent. It remains fail-closed unless the resulting
  country is conclusively `US`, and neither field is persisted.
  Exact candidate `4a790b4ee40a12cdba8540fb12da586b3373a895`
  passed public CI and is deployed to Railway and Vercel. Sanitized staging
  evidence proves two approved users, live location resolution, one persistent
  joined plan, four distinct candidates, refreshed Google details, aggregate
  provider usage, null stored coordinates, and a candidate schema with no Google
  display fields. Evidence is in `docs/evidence/4a790b4/maps-staging/`. Pull
  request #3 was merged to `main` as `7109cdcde86bd125c86c38980e823ab0a07abdc9`.
- Gemini staging hardening is implemented around `google-genai==1.75.0` and
  pinned `gemini-3.1-flash-lite`. Recommendation prompts use
  request-local aliases and normalized TableUs fields instead of Place IDs,
  names, addresses, coordinates, or Google response bodies. Recommendation,
  photo, and taste outputs use strict bounded schemas, privacy/safety guards,
  no tools or grounding, minimal Gemini 3 thinking, 12-second timeouts, and at
  most three explicitly classified attempts without silent fallback. Photos are
  resized to a maximum 1600-pixel edge after metadata stripping; taste inputs
  are bounded to 25 reviews and 12,000 characters. Every API AI call records
  aggregate token/cost totals and error outcomes, is limited to five operations
  per approved user and 30 globally per minute, and reserves against a
  database-backed rolling `$4` staging ceiling. Existing provider-usage columns
  are reused, so no migration is required. The frozen deterministic evaluator,
  checkpointed `$0.25` live evaluator, exact-SHA two-user staging runner,
  privacy disclosures, and generated client contract are updated. Exact SHAs
  `90691b1c53812fc140da465e1b5e362c781f1139`,
  `e89d5c4f1664ab0ec0e7d5bec3dd196439283aeb`, and
  `82c1d45f010a686df8802ab4b8a502731aa1be6f` passed public CI. Live validation
  against all three candidates stopped before inference and consumed zero
  reported tokens and `$0`. The first exposed unsupported generated
  `minLength`, `maxLength`, and `pattern` wire keywords. The third proved that
  Gemini 3.1 also rejects Pydantic's `additionalProperties` wire metadata;
  removing it and non-semantic `title` metadata advances the same request from
  `400` schema rejection to provider quota handling while strict Pydantic
  validation remains local. The second
  proved project import, Tier 1 billing, credential authorization, IP
  restrictions, and catalog visibility, but new-project generation returned
  `404` for Gemini 2.5 Flash-Lite. Google identifies Gemini 3.1 Flash-Lite as the
  stable replacement. The owner approved that model at `$0.25` per million input
  tokens and `$1.50` per million output/thinking tokens. Plain and corrected-
  schema 3.1 requests currently reach Google but return generic
  `429 RESOURCE_EXHAUSTED`; billing is confirmed active and linked, and the
  response is not reported as overload or a client rate-limit violation. A new
  implementation now selects Gemini Enterprise Agent Platform explicitly through
  `google-genai`'s `enterprise=True` transport, pins readiness/evaluation evidence
  to `agent-platform`, and retains the same model, privacy guards, schemas, and
  spend ceilings. Exact candidate
  `0b7de266d4b053d49267b2ac22bd85052ab3ab8f` passed public CI run
  `32911321560`. Its capped live evaluation stopped before inference with six
  terminal failures, zero tokens, and `$0`; a minimal sanitized request then
  isolated `401` authentication. Google documents that standard API keys have
  no IAM principal and cannot authenticate Agent Platform, while the required
  service-account-bound authorization key is blocked by the managed
  `disableServiceAccountApiKeyCreation` policy unless Agent Platform is
  allowlisted. The unused standard key was revoked, its Railway and Keychain
  values were removed, and Railway's prior Developer API key was restored with
  deploy suppression. No deployment or returning-sign-in message occurred.
  Staging remains on live Places and deterministic AI at SHA `4a790b4`.

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
  revision `8b1d4a6c2e90` is applied and verified against staging. The
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
  `api` are provisioned. Deployment `d9149f0e-080b-441d-8d17-f6498e0ba030`
  serves `https://api-staging-3795.up.railway.app` from exact SHA
  `4a790b4ee40a12cdba8540fb12da586b3373a895`; readiness reports Supabase
  Auth, live Places, deterministic AI, and `mixed`. High-availability static
  outbound IPs are active. Railway holds the runtime database credential,
  application secret, and the Places-only server key restricted to those IPs.
  The first CLI-created key was revoked immediately after its creation response
  exposed the value; only the non-exposed restricted replacement remains in
  Railway and the operator Keychain.
- Vercel staging client variables and the canonical verified-link deployment
  are live from exact SHA
  `4a790b4ee40a12cdba8540fb12da586b3373a895` at
  `https://tableus-staging.vercel.app` and `https://links.table-us.com`. The
  dedicated staging project also retains its pre-existing `table-us.com` and
  `www.table-us.com` aliases. An authenticated
  Browser session showed the active `Jung` profile after the Supabase session
  changed, verifying the deployed identity-refresh fix. The hosted two-user
  journey then covered plan creation, private-link joining, per-user constraints,
  exactly four deterministic candidates, two persisted 3/2/1 votes, organizer-
  only finalization, deterministic tie resolution, reopening, and refinalization.
  Public invite and privacy routes return 200. Apple and Android association
  manifests now return direct JSON 200 responses with the inspected preview
  signing identifiers and only the allowlisted native routes.
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
- The isolated `TableUs Staging Maps` Google project has billing attached,
  Places API New enabled as its only product API, a $10 monthly budget with
  50/80/100-percent alerts, and granted 60-request/minute preferences for Text,
  Nearby, and Details. The separate billed `TableUs Staging AI` project has a
  `$5` monthly budget with 50/80/100-percent alerts. The Agent Platform API is
  enabled and the bound runtime identity has least-privilege
  `roles/aiplatform.expressUser`. Its existing authorization key remains
  service-account-bound, restricted to the standalone Gemini Developer API and
  Railway's three staging static outbound IPs, and stored only in Railway
  staging and the operator Keychain. Google denied changing that key's API
  target to Agent Platform because the managed service-account API-key policy
  does not currently allow `aiplatform.googleapis.com`; no organization-policy
  override has been applied. A standard Agent Platform-only key was then proven
  insufficient with `401` because it has no bound IAM principal and was revoked
  before activation. A first standard key whose value appeared in CLI output
  was also revoked immediately before use or storage. Sentry and PostHog
  credentials remain unprovisioned.

## Release gates still requiring an owner or external system

- Add the production Google Play App Signing fingerprint alongside the preview
  signer when production store artifacts are approved. Production/store builds
  and submission remain separate later gates; they do not invalidate the
  completed exact-SHA preview verified-link evidence in
  `docs/evidence/341d67e/`.
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
  Offline-retry implementation and device evidence are complete from exact SHA
  `9acf4fe2a648d4226be028d947ca8d08d7fc7029`. Local iOS simulator build
  `local-ios-9acf4fe-20260822` and ARM64 Android APK build
  `local-android-9acf4fe-20260822` passed exact-SHA, loopback/demo, and
  forbidden-origin inspection. Clean iPhone 17 Pro/iOS 26.5 and API 36 ARM64
  journeys each proved two create attempts yield one plan, known-offline
  constraints yield zero requests until explicit retry, four candidates are
  generated, and two finalization attempts yield one finalized event through
  same-key replay. The root safe-area fix keeps the connectivity alert below the
  system status bar, and the iOS flow uses Maestro's documented stable-header tap
  instead of its flaky `hideKeyboard` gesture. Sanitized evidence is in
  `docs/evidence/9acf4fe/`. Local Android builds use the target ARM64 ABI, bounded
  Gradle/CMake concurrency, sequential simulators, and file-backed temporary logs
  after a four-ABI build and a very long tool transcript caused severe host and
  Codex desktop memory pressure. Expo currently reports the free-plan iOS
  build allowance exhausted until September 1, 2026. Account
  export/deletion controls are deployed,
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
  Maps staging evidence is green from exact SHA
  `4a790b4ee40a12cdba8540fb12da586b3373a895`. The first attempt stopped on a
  city result without `postalAddress.regionCode`; Google aggregate telemetry
  confirmed a populated `200`, and no raw artifact was retained. The corrected
  rerun passed end to end with policy-safe persistence and sanitized evidence,
  and pull request #3 is merged. Three pinned-model Gemini candidates passed
  public CI, and the isolated billed AI project, budget, and final restricted
  authorization key are provisioned. Their Developer API live evaluators
  stopped before inference at zero reported cost: first on generated schema keywords, then on
  unavailable Gemini 2.5 generation, and finally on Gemini 3.1 strict-object
  metadata followed by generic `429 RESOURCE_EXHAUSTED`. The key is restored to
  Railway-only restrictions. Agent Platform candidate `0b7de266` also passed
  public CI but its six-case evaluation stopped at `401`, zero tokens, and `$0`:
  the standard key has no IAM principal, while creating the required bound key
  is blocked by managed organization policy. Staging AI remains deterministic.
  Choosing a narrowly scoped policy allowance, a workload-identity-capable
  runtime, or the standalone Developer API is now an owner architecture gate;
  deployment and sanitized two-user live-AI evidence remain conditional on a
  later passing exact-SHA evaluation.
- Obtain explicit approval before any production migration, deployment, EAS
  build/submission, paid live-AI evaluation, or cohort invitation.
