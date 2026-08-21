# Active packet: two-user mobile lifecycle

## Status

In progress as of 2026-08-21. Exact-SHA mobile create/open smoke is green on
iOS and Android. The local implementation now supports a test-profile-only
organizer/guest identity switch, accessible ranking actions, visible constraint
and vote success states, constraint revision during voting, and a host runner
for the complete deterministic lifecycle. The cumulative `make ready` gate and
focused Expo-config/Maestro validation pass. New simulator/APK artifacts and
device execution remain approval-gated.

The deployed staging baseline remains Railway deployment
`e438677b-548e-4dce-ae8e-7f05f086bc29` and Vercel deployment
`dpl_vpVRmbpHXhQPb5AUScD8yJaPHJFD`, both from
`bc0d2f3615bf9a07ec08a857e5e1d8980bdd7d28`. This packet does not redeploy
staging, change Supabase, enable providers, or perform production/store work.

## Objective

Prove the core two-user mobile decision lifecycle on one deterministic test
artifact per platform without weakening preview or production authentication.

## Deliverables

- Resolve `X-Demo-User-ID` per request only when the test profile, demo mode,
  and a loopback API URL are all active.
- Allow only `demo-organizer` and `demo-guest` through a hidden local-E2E deep
  link and clear client caches on every identity change.
- Give candidate ranking explicit accessible controls, restore persisted votes,
  and allow constraint changes during voting with an invalidation warning.
- Provide `make mobile-e2e PLATFORM=<ios|android> DEVICE=<id> APP=<artifact>` to
  install an artifact, run a clean backend, execute Maestro phases, verify API
  invariants, sanitize output, and clean up temporary tokens and processes.
- Cover UI plan creation, private-link joining, both constraint sets, exactly
  four deterministic candidates, two 3/2/1 votes, guest authorization, a 5/5/2
  tie, organizer finalization to Sakura Table, reopening, rotated-link failure,
  and stale-run invalidation.
- Capture exact-SHA EAS metadata, artifact checksums, and sanitized iOS/Android
  screenshots after a separately approved push and test build.

## Acceptance

- Preview and production builds cannot activate or mutate the local E2E
  identity; test builds accept only the two seeded demo profiles on loopback.
- `make ready` passes with deterministic, credential-free providers.
- Both new EAS artifacts report the same approved source SHA and contain no
  Railway hostname.
- The lifecycle runner passes independently on iPhone 17 Pro/iOS 26.5 and the
  API 36 ARM64 Android emulator, retains no full share token, and leaves no
  backend or port reversal running.
- No staging deployment, database migration, paid-provider action, production
  build, store submission, or account deletion occurs.
