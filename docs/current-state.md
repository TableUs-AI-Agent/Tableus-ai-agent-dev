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
- Generated OpenAPI TypeScript contract, GitHub CI, EAS workflows, browser/API
  smoke journeys, privacy controls, telemetry hooks, and deployment templates.
- Separate migration/runtime database credentials, a private application schema,
  an invite-only Supabase pre-signup hook, email-bound invite redemption, and a
  hashed invite administration CLI.
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
- Railway service and deploy credentials.
- Vercel staging environment values and first exact-SHA preview deployment. The
  `tableus-staging` project is provisioned, linked locally, and configured for
  Node 22 and the root npm workspace build.
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
  journeys. Maps staging and the budgeted pinned-model Gemini evaluation follow
  only after deterministic staging is green.
- Obtain explicit approval before any production migration, deployment, EAS
  build/submission, paid live-AI evaluation, or cohort invitation.
