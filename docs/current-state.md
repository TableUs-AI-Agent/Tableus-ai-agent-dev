# Current state

## Implemented

- Hackathon-era Next.js discovery, friends, review, and profile experiences.
- Legacy FastAPI demo endpoints backed by in-memory fixtures.
- Local environment templates for Node 22 and Python 3.12.

## Closed-beta foundation implemented

- Versioned `/api/v1`, persistence models, migrations, deterministic/live provider
  adapters, invite access, connections, reviews, and ranked shared plans.
- Next.js plan/invite surfaces and an Expo Router iOS/Android application.
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

- Supabase project, Postgres URL, and Auth keys.
- Railway service and deploy credentials.
- Vercel staging environment values and first exact-SHA preview deployment. The
  `tableus-staging` project is provisioned, linked locally, and configured for
  Node 22 and the root npm workspace build.
- Expo/EAS project, Apple, and Google Play credentials.
- Google Maps, Gemini, Sentry, and PostHog credentials.

## Release gates still requiring an owner or external system

- Create staging resources and roles, configure Supabase custom SMTP, enable the
  `app.hook_restrict_signup_to_validated_invite` Before User Created hook, and
  apply Alembic migrations with the privileged migration credential.
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
