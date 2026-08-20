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
  `api` are provisioned. Deployment `9a1e1f92-424d-4156-82ce-01ff995e3b3c`
  serves `https://api-staging-3795.up.railway.app` from exact SHA
  `90e8dc86bb77ff432f967ccca0918933e0fec550`; liveness, readiness,
  deterministic-provider mode, Supabase Auth mode, and Vercel CORS passed.
  Railway holds only the runtime database credential and application secret.
- Vercel staging client variables and the returning-sign-in deployment are live.
  Deployment `dpl_3QK4Tq2drGx25RFotVcXCq7D8d23` is `READY` at
  `https://tableus-staging.vercel.app` from the same clean SHA. An authenticated
  Browser session showed the active `Jung` profile after the Supabase session
  changed, verifying the deployed identity-refresh fix. Public invite and privacy
  routes return 200; Apple and Android association manifests correctly return
  503 until real signing identifiers are supplied.
- Expo/EAS project, Apple, and Google Play credentials.
- Google Maps, Gemini, Sentry, and PostHog credentials.

## Release gates still requiring an owner or external system

- Supply the Apple Team ID, final bundle/package identifiers, and SHA-256
  fingerprints for every Android signing certificate; then verify the HTTPS
  association files against real builds.
- Confirm the final domain and support/privacy contact, obtain legal review of
  the beta notices, and validate Google Maps attribution against the production
  presentation and current brand requirements.
- Run exact-SHA authenticated staging browser evidence and iOS/Android Maestro
  journeys. Exact-SHA returning-user OTP and authenticated-identity evidence is
  green. A second invite-approved account redeemed successfully, bringing
  sanitized staging evidence to two profiles, two redemptions, and two invite
  uses. The stale global identity cache exposed by that session change is fixed
  and verified on staging. The full two-user planning journey, link
  rotation/expiry, privacy operations, and failure-state checks remain.
  Maps staging and the budgeted pinned-model Gemini evaluation follow only after
  deterministic staging is green.
- Obtain explicit approval before any production migration, deployment, EAS
  build/submission, paid live-AI evaluation, or cohort invitation.
