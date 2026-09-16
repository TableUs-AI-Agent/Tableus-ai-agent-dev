# Approved f94a1d9 remaining staging verification

The owner approved the [exact execution scope](execution-approval.json), including
CI/push, deployment to existing staging targets, five sequential native builds
and bounded device/live checks. Reuse the signed iOS pilot artifact. The shared
usage ledger is carried forward; no allowance is reset or increased. No scan,
production/store/cohort action, secrets, migrations or additional cleanup.

Status: exact-source CI and hosted checks pass. Candidate branch:
`codex/ios27-f94a1d9`; application SHA
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`.

- [CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/35031840606):
  226 JavaScript, 101 Python, four browser tests and seven deterministic AI cases.
- [Protected Preview](https://tableus-staging-i6b1exrb3-briancheis-projects.vercel.app)
  and Railway staging serve this source. [Hosted checks](hosted-preflight.json)
  confirm served JavaScript, API readiness, exact origins, canonical association
  hashes and unchanged production target/protection.
- [Execution record](hosted-execution.json) preserves the initial rejected
  Preview and the branch-scoped metadata correction. No live provider operation,
  new email, generation or canary was requested in this phase.
- `test-android` built successfully in about 23 minutes. Its
  [build status](test-android-build-status.json) and
  [independent verification](test-android-verification.json) prove the expected
  signer, exact source and lock, matching receipt/inspection, ARM64 native code,
  local-demo configuration, telemetry off and bundled refresh correction.
  Artifact SHA-256: `5ca6c184d0dd716ea80802c3b3d7cd40db6b3b830be7cf5df6249cb7aed4bae7`.
- The first cache cleanups completed under owner approval: [active web cache](web-cache-cleanup.json)
  and [inactive Astra caches](inactive-astra-cache-cleanup.json). Source status
  remained unchanged. The build started at 21.47 GiB and finished at 18.20 GiB
  after its temporary workspace cleanup; the 9 GiB stop guard did not trigger.
- `test-ios` built successfully in about 37 minutes and passed
  [independent verification](test-ios-verification.json); its
  [build status](test-ios-build-status.json) records a clean export and receipt.
  Artifact SHA-256: `66f17d41fd32cb3664de1c9da747c35a789c8c0d39a6db24cd6aab13320ab5d9`.
  Exact source/lock, matching receipts/inspections, simulator platform,
  deterministic configuration, telemetry off and the refresh correction pass.
- The two older root caches were [approved and removed](older-root-cache-cleanup.json),
  preserving source status. The iOS build finished with 24.37 GiB free.
  `readiness-android` subsequently passed its 12-minute build and
  [independent inspection](readiness-android-verification.json); the
  [build status](readiness-android-build-status.json) records 24.09 GiB free.
  Exact source, lock, receipt, signer, staging configuration and transport pass.
  Its checksum is `d06a893df1cfc5e1ffd91a3bb6f8e9c309b80bfcb7389a82974fccd2ad061000`.
  `telemetry-test-ios` subsequently built in about 19 minutes and passed
  [independent inspection](telemetry-test-ios-verification.json); its
  [build status](telemetry-test-ios-build-status.json) records 21.72 GiB free.
  Checksum: `81075451eb36d6c5d583df8322f48eea98ec7d9eda3fdb932ecf37e2716af5eb`.
  `telemetry-test-android` passed its 11-minute build and
  [independent inspection](telemetry-test-android-verification.json). Checksum:
  `e751a178d92aff237b2a357a8c512a7bdfde24d4fc289249d3f19624a65f8f1b`.
  The [six-artifact summary](native-builds-summary.json) records all five new
  inspected artifacts and the reused signed iPhone pilot.
  Disk is 23.51 GiB. [Available test runtimes](deterministic-device-preflight.json)
  are iOS Simulator 26.5/23F77 and Android API 36 ARM64; iOS 27 physical evidence
  remains separate. Cumulative live checks remain pending.
  Reuse the accepted signed iOS pilot. No live allowance was consumed by these builds.

Android deterministic attempt 2 passed lifecycle, offline recovery and all five
refresh phases. [Results](android-deterministic/attempt-2-status.json) bind the
accepted APK to operator `cf26de100e68e4f0ea8a448ba2f9ec433ee2f2f8`. Scrolling
made zero reads/writes; failed refresh preserved cached content and prior votes.
The first attempt timed out starting the local backend before app tests; its
cause remains unestablished after a subsequent 1.57-second successful probe.
Both attempts are retained. The isolated Android device is stopped and retained.
[Visual review](android-deterministic/visual-review.json) confirms the refresh
states and records placeholder bottom-tab icons as a residual visual issue.
No live provider calls, emails, generation or explicit canaries were used.

iOS 26.5 deterministic lifecycle/offline suites and all five refresh phases
passed in about 19 minutes on operator `fecefa9d51f1e1901495ac304978caec6eb88a1d`.
[Status](ios-deterministic/status.json), [refresh results](ios-deterministic/ios-plan-refresh-summary.json)
and [visual review](ios-deterministic/visual-review.json) preserve the actual
observations. Scrolling produced zero requests; slow refresh coalesced to one;
three synthetic failed reads made no upstream requests; recovery needed one read.
Prior votes stayed unchanged. Both isolated devices are stopped and retained.

[Live preflight](helper-preflight.json) confirms the existing private link still
matches the dinner plan with four candidates, three participants and two saved
votes. [Provider totals](provider-before-live.json) remain 329 Places attempts
and nine Gemini records. No new explicit canaries have been sent. Each mobile
canary also sends an API companion, so the complete remaining telemetry sequence
requires six shared events per provider including the prior web event. The
owner subsequently approved six total events per provider; see the approval below.

## Partial live checks

The owner [approved six shared telemetry events per provider](telemetry-cap-approval.json).
The new organizer Preview sign-in used one email; cumulative email usage is two
of four. [Web](web-session-telemetry.json) and [iOS](ios-saved-session.json) sent
one explicit client canary each, with one API companion from iOS. [Delivery](telemetry-delivery-partial.json)
is confirmed in PostHog and all three Sentry projects at exact release f94a1d9.
Android remains pending; the prior web event still counts in the shared allowance.

The saved iOS simulator retained the expected approved second account after the
[update](ios-live-installation.json) and controlled relaunch. JSON export opened
and was dismissed; deletion readiness displayed with an empty confirmation.
Sentry also reported [one non-canary AppHang](ios-simulator-hang.json) on the
iOS 26.5 simulator, with Apple UI-library frames and missing native app symbols.
A single controlled account/export repeat completed normally; the matching event
count remained one. Cause is unestablished, so this remains an unresolved finding.

[Android readiness](readiness-android-installation.json) is installed on the
preserved staging emulator and its canonical domain verifies. Owner session and
physical iPhone refresh observations remain pending. Provider reconciliation at
02:10:56 UTC still showed 329 Places attempts and nine Gemini records.

The organizer [session survives web reload](web-account-persistence.json). Its
account page displays export and deletion-readiness controls; deletion remains
disabled with an empty confirmation. No web export file was downloaded. The
[shared ledger](run-ledger.json) counts two of four emails and four of six
canaries per provider (including the prior web event); Android reserves the two
remaining canaries. No new Places or Gemini usage was observed at reconciliation.

## Owner refresh and session check, September 16

The owner confirms physical iPhone scrolling and one explicit refresh finish
with four cards and the prior vote preserved. Android Plans returns both on
opening and after closing/reopening, without a code. This proves neither a new
vote submission nor zero live scrolling requests. Aggregate provider usage is
337 Places attempts (8/80 new), nine historical Gemini rows and $0.0050015.
See `owner-refresh-session-checks.json`. The local private-link helper is no
longer listening; restore it before requesting another QR/link check.

## Deliberate voting and organizer finalization

The owner completed deliberate vote submissions on both readiness devices; the
server recorded exactly two new vote events from two distinct participants.
Android scrolling and participant-only controls also pass by owner report. The
web organizer finalized once, with matching UI and database evidence; device
finalization observations and reopening remain pending. Latest Places aggregate
is 365 (36/80 new attempts). No new generation or email was needed.

See `live-vote-submissions.json` and `live-organizer-lifecycle.json`.

## Finalized device confirmation and organizer reopen

The owner confirms both devices show finalized state and the chosen winner,
with no participant vote/reopen action. One organizer reopen is verified in the
web UI and database; the finalized winner is cleared and both votes preserved.
Device reopen/account observations remain pending. Usage is 385 Places attempts
(56/80 new) at 22:41:27 UTC. See `live-organizer-lifecycle.json`.

## Reopened devices and account controls

Both devices pass the owner-observed reopened voting, preserved selections,
export share-sheet and deletion-readiness checks. No deletion was performed.
Usage is 397 Places attempts (68/80 new). Restaurant-page checks are paused;
telemetry can continue without Places requests. Canonical/private-link phases,
rotation rejection, local sign-out isolation, Android telemetry delivery and
final cumulative acceptance remain outstanding. See `owner-reopen-account-checks.json`.

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

The owner approved 20 additional Places attempts: 100 new attempts relative to
baseline 329, staging backstop 429. Emails remain 4, canaries remain 6/provider
(exhausted), and new generations remain zero. The same-source staging redeploy passed; readiness and the 429 backstop
are verified. Android readiness was restored without clearing data. Correction:
the previous sandboxed helper connection failure did not establish it stopped;
host-network access confirms the original helper and retained capability remain.
No private URL was saved in tracked evidence. See `places-cap-100-approval.json`.

The existing helper capability matches the current plan. Reuse avoids an
unnecessary link rotation. Both devices now await cold/warm private-link
observations with exactly one existing-member join per platform. The old helper
header is not used as artifact evidence. See `helper-reuse-verification.json`.
