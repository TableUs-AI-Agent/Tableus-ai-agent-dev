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
approved cap remains five; one additional event per provider awaits owner approval.
