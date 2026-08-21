# Active packet: two-user mobile lifecycle

## Status

Completed as of 2026-08-21. Exact-SHA mobile create/open smoke is green on
iOS and Android. The local implementation now supports a test-profile-only
organizer/guest identity switch, accessible ranking actions, visible constraint
and vote success states, constraint revision during voting, and a host runner
for the complete deterministic lifecycle. The cumulative `make ready` gate and
focused Expo-config/Maestro validation pass. The first exact-SHA iOS device run
exposed an ambiguous `Join plan` header/button selector before any join request;
the button and flows now use the unique `Join this plan` action. Per the packet,
both first artifacts are invalidated and replacement artifacts are required.
The invalidated builds are iOS `e4082fb9-9cfa-42ae-b241-5839f9bbbdb5` and
Android `17509b90-fd47-425e-96bb-5ee212ca7438`; neither is release evidence.
Replacement iOS build `c46f2577-a404-4e4d-8ae9-5840b7edc124` proved the unique
join action through workspace navigation, then exposed that Maestro cannot use
`hideKeyboard` reliably on the multiline constraints field. The affected flows
now dismiss by tapping the static constraints heading. Replacement Android build
`49d718ff-21fc-4bd8-a196-e2a4df5a5948` and the iOS build are invalidated by this
flow correction and are not release evidence.
The same invalidated artifact then exposed a ghost tap on the third ranking
control: Maestro reported success while the button remained unselected and vote
submission stayed disabled. Ranking taps now use Maestro's supported
`retryTapIfNoChange` option and assert each resulting rank label before moving
on, so a completed command alone cannot count as vote evidence.
A later diagnostic retry timed out while starting Maestro's iOS XCTest driver
before any app command or API request. The runner now sets a bounded five-minute
driver startup timeout while preserving the existing 30-second UI assertions.
Android diagnostic execution showed a cold-start routing race: the identity link
was delivered before Expo Router finished mounting, and the default Plans route
won. The creation phase now waits for Plans readiness before opening the first
identity link; direct adb delivery independently confirmed the route and gating.
The Android diagnostic journey then confirmed the guest vote persisted (including
the expected Noodle score) while the saved-state text rendered just below the
viewport. Both vote phases now scroll to that accessible state after submission
instead of assuming a particular screen height.
The Android diagnostic finalization phase reached the scored voting workspace
but its default-speed scroll did not traverse four large candidate cards before
timeout. The phase now first proves the organizer's restored rank, then uses a
bounded faster scroll accepting partial visibility for the organizer-only action.
An Android cold-start diagnostic also found that targeting the plan-title
placeholder could race text-input focus. The field now has an explicit accessible
label, and the lifecycle targets that stable label before typing.
The Android diagnostic then completed deterministic finalization and reopening;
the reopened vote control was restored below the viewport, so the assertion now
scrolls to that state instead of assuming it remains on screen after rerender.
The first iOS diagnostic also observed a reported identity-continuation tap with
no route change. Every local identity continuation now retries only when the UI
does not change, matching the guarded ranking interactions.
After those corrections, the complete lifecycle passed independently on the API
36 ARM64 Android emulator and iPhone 17 Pro/iOS 26.5 using the invalidated
replacement artifacts as diagnostics. A new exact-SHA candidate and fresh EAS
artifacts were then created from
`a78a6d27229bc464d4998bdf3c3593f4167a831b`: iOS simulator build
`d192d04a-73e8-401c-98ac-b6c7a3a9c551` and Android APK build
`6dba0079-72fe-4c23-aa03-95028a7506c4`. Both passed bundle inspection and the
complete lifecycle independently. Sanitized evidence is recorded in
`docs/evidence/a78a6d2/`.

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
