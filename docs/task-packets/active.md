# Active packet: complete f94a1d9 cross-platform staging verification

## Status

The bounded iOS 27 startup pilot is complete for
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`. The signed update builds, passes
independent artifact/receipt/signing/scene inspection, installs and reaches Plans.
The owner confirms relaunch preserves the session and the canonical auth link
opens TableUs. [Pilot evidence](../evidence/ios27-pilot-f94a1d9/README.md) is recorded.
Use one primary agent; no Security Scan or new application-provider migration.

## Next bounded objective and gate

The owner approved the [remaining execution plan](../evidence/ios27-pilot-f94a1d9/remaining-verification-plan.md).
Complete exact-source CI, existing staging/Preview deployment, five remaining
native artifacts and the required deterministic/live lifecycle, links, refresh,
account and telemetry evidence. Reuse the accepted f94a1d9 signed readiness-ios
artifact. Its checksum is `9d569309e437b3212a827305e1e119d4424d65c40f1c5fd464a120ad9bcf1798`.
The subsequent owner approval now covers those steps; preserve all stated limits.
The exact-source review is already accepted; do not request acceptance again
while the source and report remain unchanged.

## Preserved evidence and boundaries

- Local f94a1d9 checks: 226 JavaScript and 98 Python passes, three local PostgreSQL
  skips, actual before/after/repeated prebuild and all `make ready` targets.
- Native build operator: `d0447b8711109f43fb7a1572cb2b0a275f9901ab`. Xcode 27.0,
  iPhoneOS 27.0 SDK, physical iOS 27.0 / 24A437. New executable UUID:
  `5E8ED08A-6282-3483-90E7-53442A4511A8`. Prior crash evidence remains intact.
- Exact-source CI passes 226 JavaScript, 101 Python and four browser tests.
  API and protected Preview now serve f94a1d9; readiness, served JavaScript,
  CORS and canonical associations pass. See the hosted evidence record.
- Both additional cache cleanups completed and `test-android` passed in about
  23 minutes. Independent receipt/source/lock/signing inspection passes;
  artifact SHA-256 is `5ca6c184d0dd716ea80802c3b3d7cd40db6b3b830be7cf5df6249cb7aed4bae7`.
  `test-ios` also passed build and independent verification in about 37 minutes.
  Its checksum is `66f17d41fd32cb3664de1c9da747c35a789c8c0d39a6db24cd6aab13320ab5d9`.
  `readiness-android` also built and passed independent inspection in 12 minutes.
  Checksum: `d06a893df1cfc5e1ffd91a3bb6f8e9c309b80bfcb7389a82974fccd2ad061000`.
  `telemetry-test-ios` also passed build and independent inspection in 19 minutes.
  Checksum: `81075451eb36d6c5d583df8322f48eea98ec7d9eda3fdb932ecf37e2716af5eb`.
  `telemetry-test-android` passed build and independent inspection in 11 minutes.
  Checksum: `e751a178d92aff237b2a357a8c512a7bdfde24d4fc289249d3f19624a65f8f1b`.
  All five new artifacts plus the reused iPhone pilot are accepted.
  Android lifecycle/offline and all five refresh phases pass on attempt 2;
  scrolling caused zero requests and prior votes stayed unchanged. Preserve the
  first local-backend startup timeout and later successful 1.57-second probe;
  its original cause is unestablished. Screenshots retain a placeholder tab-icon
  issue. iOS lifecycle/offline and all five refresh phases now pass on iOS 26.5;
  scrolling causes zero requests and prior votes stay unchanged. Both isolated
  devices are stopped and retained. Bounded live checks remain pending.
  Telemetry requires six shared events per provider (each mobile sends an API
  companion); the owner approved six total events per provider. New web/iOS/API
  canaries are delivered in both providers; Android remains. iOS saved-session,
  account export, deletion-readiness and relaunch pass. Android readiness is
  installed with verified app links; the owner confirms first open and relaunch
  preserve Plans without a code. Physical iPhone scrolling and one explicit
  refresh pass with cards and the saved vote preserved. New Places usage is
  8/80 at 22:31 UTC on September 16; no new Gemini generation. Preserve
  the one simulator AppHang: Apple UI-library frames, no reproduced hang in one
  controlled repeat, cause still unestablished. Do not label cumulative readiness
  passed while physical/Android lifecycle and complete telemetry remain pending.
  Pilot and hosted success do not establish cumulative device acceptance.
- Both exact cleanup requests completed. Saved devices/account data, source,
  evidence and signed artifacts are preserved; no further cleanup is authorized.
- Read-only reconciliation at 22:31 UTC: 329 Places attempts, nine Gemini rows,
  $0.0050015 historical estimated Gemini cost. Pilot adds zero attempts, emails,
  generations and explicit canaries. Prior shared ledger conservatively counts
  one of four emails and one of five canaries per provider; 80 new Places attempts
  remain against baseline 329 and existing backstop 409, subject to reconciliation
  and the next plan's approval. No new generation is permitted.
- No production/store/cohort action, new resource/secret, migration, scan or
  dependency change is included. Any future application change requires a new
  frozen source review and correctly bound execution evidence.

The owner completed deliberate vote submissions on both readiness devices; the
server recorded exactly two new vote events from two distinct participants.
Android scrolling and participant-only controls also pass by owner report. The
web organizer finalized once, and both devices show the chosen winner with
participant voting/reopen controls absent. The organizer then reopened once;
web and database both show voting with the two saved votes preserved. Both devices
now confirm reopened voting, preserved selections, JSON export share sheets and
deletion-readiness with empty confirmation fields. Latest Places aggregate is
397 (68/80 new attempts); pause restaurant-page checks pending the remaining
link-check allowance reconciliation. No new generation or email was needed.

The accepted f94a1d9 Android telemetry artifact is installed over the readiness
app with saved data preserved. Its telemetry route launched successfully; one
owner button press is pending. Two events per provider are reserved within the
approved six-event shared cap. No Android canary has been confirmed sent yet.
Readiness link checks remain incomplete; this telemetry install does not supply
those missing observations.

Telemetry is now complete for exact source f94a1d9: PostHog has web 1, iOS 1,
Android 1 and API 2 events; release/environment-filtered Sentry has web 1, mobile
2 and API 2 canaries. Including one carried-forward event, both providers used
6/6 approved events. No more canary sends are authorized. The simulator AppHang
remains at one matching event; its cause remains unestablished. Places stayed
at 397 (68/80 new) through telemetry. Remaining live links/session isolation and
final evidence acceptance are not implied by telemetry completion.
