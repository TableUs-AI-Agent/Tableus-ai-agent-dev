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
- Web and Expo account settings expose application-data export and typed-
  confirmation deletion controls. Export stays user-initiated, deletion explains
  the organized-plan prerequisite, and neither client silently deletes the
  Supabase Auth record.
- Generated OpenAPI TypeScript contract, GitHub CI, EAS workflows, browser/API
  smoke journeys, privacy controls, telemetry hooks, and deployment templates.
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
  sending domain. Confirm signup and Magic Link now present the six-digit
  `Token`. A real invite-approved OTP completed the Auth hook, email delivery,
  code verification, invite redemption, profile creation, and authenticated
  redirect to `/plans`. Sanitized staging evidence showed exactly one profile,
  one redemption, one consumed pending validation, and one used invite. Alembic
  revision `57a2a71fa443` is applied and verified against staging. Its owner
  credential has been rotated, the least-privilege `tableus_runtime` role is
  active, and the Before User Created hook is enabled against
  `app.hook_restrict_signup_to_validated_invite`. Owner and runtime credentials
  are stored separately in macOS Keychain. One superseded unused invite remains
  active until 2026-08-27; its plaintext is unavailable and it should be revoked
  or allowed to expire before external beta access.
- Railway staging project `tableus-staging`, environment `staging`, and service
  `api` are provisioned. Deployment `e438677b-548e-4dce-ae8e-7f05f086bc29`
  serves `https://api-staging-3795.up.railway.app` from exact SHA
  `bc0d2f3615bf9a07ec08a857e5e1d8980bdd7d28`; liveness, readiness,
  deterministic-provider mode, Supabase Auth mode, and Vercel CORS passed.
  Railway holds only the runtime database credential and application secret.
- Vercel staging client variables and the returning-sign-in deployment are live.
  Deployment `dpl_vpVRmbpHXhQPb5AUScD8yJaPHJFD` is `READY` at
  `https://tableus-staging.vercel.app` from the same clean SHA. An authenticated
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
  jobs with build-artifact jobs for local Maestro execution. Exact-SHA EAS build
  `1bf458de-c223-4301-9e5f-f161a0f54917` produced the iOS simulator app and build
  `f1b0a632-0587-4d17-8405-b534bff13989` produced the Android APK from
  `bc0d2f3615bf9a07ec08a857e5e1d8980bdd7d28`. Both downloaded archives passed
  structural checks and contain the expected `com.tableus.app` identifier,
  Railway staging endpoint, and deterministic test identity. Local device
  execution then proved that combination is invalid: the Supabase-authenticated
  staging API correctly rejects the demo identity, and the original Maestro
  assertion falsely matched text left in the title input. The tightened flow now
  fails both artifacts on the visible `Authentication required` state. The local
  correction points test profiles at an in-memory localhost demo API, keeps
  cleartext/local-network access test-only, navigates into the created workspace,
  adds the missing Expo Updates integration, and declares exempt standard
  encryption. It requires new exact-SHA EAS test builds before it can be marked
  device-green. The supplied `@tableus/brian` project remains untouched and
  unused. Apple and Google Play store credentials remain unprovisioned.
- Google Maps, Gemini, Sentry, and PostHog credentials.

## Release gates still requiring an owner or external system

- Supply the Apple Team ID, final bundle/package identifiers, and SHA-256
  fingerprints for every Android signing certificate; then verify the HTTPS
  association files against real builds.
- Confirm the final domain and support/privacy contact, obtain legal review of
  the beta notices, and validate Google Maps attribution against the production
  presentation and current brand requirements.
- Complete exact-SHA account-control browser evidence and iOS/Android Maestro
  journeys. Exact-SHA returning-user OTP and authenticated-identity evidence is
  green. A second invite-approved account redeemed successfully, bringing
  sanitized staging evidence to two profiles, two redemptions, and two invite
  uses. The stale global identity cache exposed by that session change is fixed
  and verified on staging. The full two-user deterministic planning journey is
  green. Share-token rotation invalidated the prior private link with an explicit
  failure state. Xcode 26.6 with iOS 26.5 simulators, Android platform tools
  37.0.1 with an API 36 ARM64 emulator, and Maestro 2.8.0 are installed locally.
  Device execution invalidated the prior mobile evidence because both existing
  artifacts call the Supabase staging API with a demo identity. A safe local-only
  correction is implemented and focused checks pass; produce and run new
  exact-SHA iOS/Android test artifacts next. Account export/deletion controls are
  implemented locally but still require exact-SHA hosted/device evidence;
  privacy deletion itself remains intentionally unexecuted. Other failure-state
  checks remain.
  Maps staging and the budgeted pinned-model Gemini evaluation follow only after
  deterministic staging is green.
- Obtain explicit approval before any production migration, deployment, EAS
  build/submission, paid live-AI evaluation, or cohort invitation.
