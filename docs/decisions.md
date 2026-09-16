# Decision log

The iOS 27 pilot passed for `f94a1d9d1125e6c9111aa08eda496f014f20d0c0`.
The signed replacement installs and the owner confirms first launch, relaunch
with session persistence, and the canonical auth link. [Pilot evidence](evidence/ios27-pilot-f94a1d9/README.md)
records zero added Places/Gemini usage or emails. The owner approved the
remaining verification. Exact-source CI now passes 226 JavaScript, 101 Python
and four browser tests; API and protected Preview both serve f94a1d9.
[Hosted evidence](evidence/ios27-staging-f94a1d9/README.md) verifies source,
readiness, origins and unchanged associations/protection. Both deterministic native artifacts, `test-android`
and `test-ios`, built and passed independent source/lock/receipt/configuration
inspection. The signed `readiness-android` staging artifact also passes
independent source/lock/receipt/signing/transport checks after a 12-minute build.
Both telemetry profiles also passed build and independent inspection.
All five new artifacts are accepted, and the signed iPhone pilot is reused: six
artifacts total at f94a1d9. Android deterministic lifecycle, offline recovery and
all five refresh phases pass on attempt 2: scrolling causes zero reads or writes
and the prior vote is unchanged. Attempt 1 timed out starting the local backend;
a subsequent probe passed in 1.57 seconds, with the original cause unestablished.
[Android evidence](evidence/ios27-staging-f94a1d9/android-deterministic/attempt-2-status.json)
is retained alongside the failed attempt. Placeholder tab icons remain a visual
issue (the current tab layout defines labels without custom icons). iOS 26.5
deterministic lifecycle/offline and all five refresh phases also pass; scrolling
caused zero requests and prior votes stayed unchanged. Both isolated devices are
stopped and retained. Bounded live checks remain pending. Telemetry needs six
shared events per provider because each mobile check sends an API companion;
the approved cap remains five while the one-event increase awaits owner approval.

## Same-source hosted verification — 2026-09-15

- Require both Git metadata and the source embedded in served JavaScript. The
  first f94a1d9 Preview failed this check because shared Preview environment
  values still named 2ad48a8. Preserve the failed attempt; two nonsecret
  branch-scoped overrides and a fresh deployment now pass.
- The existing staging API serves f94a1d9 with the replacement Preview origin.
  Production target, protection and canonical association hashes are unchanged.
- Keep the approved 20 GiB native start guard and 9 GiB stop guard. No build
  starts while disk is below the start threshold; additional cache removal
  requires the exact cleanup permission already requested. No budget is reset.

## iOS 27 pilot accepted by observed checks — 2026-09-15

- The owner approved both cleanup scopes. The second removed only four generated
  directories and preserved old source status and untracked evidence hashes;
  disk reached 21.575 GiB. One signed readiness-ios build ran from exact f94a1d9.
- Native build and independent artifact/receipt/signing/source/scene checks pass.
  The verified update installed on iOS 27 without deleting app data. Owner
  confirms first launch to Plans, relaunch with the session preserved, and the
  canonical auth link opening TableUs. The prior immediate crash did not recur.
- Post-pilot provider aggregate is unchanged at 329 Places attempts and nine
  Gemini rows. No new email or canary was requested. Reuse this signed artifact
  for later f94a1d9 verification; do not rebuild it without a demonstrated need.
- Keep pilot evidence separate from cumulative readiness: the hosted API is still
  2ad48a8, and five f94a1d9 native profiles plus remaining hosted/device checks
  are outstanding. The prepared remaining execution plan requires approval.

## Approved pilot cleanup — 2026-09-15

- Owner approved the six exact temporary/generated targets from the pilot's
  cleanup request. Verified the canceled scratch's tracked source unchanged,
  retained and hash-checked its raw build log outside scratch, removed only
  that detached worktree and the listed generated directories. All six targets
  are removed; artifacts, receipts, source and saved devices are preserved.
- Actual free space rose from 15.795 to 18.992 GiB, less than reported directory
  usage implied. Keep the approved 20 GiB start guard. No build started.
- Propose only four additional generated directories in closed-beta-readiness:
  root/mobile/frontend node_modules and frontend/.next. Preserve the untracked
  docs/evidence/daa89a0 directory. Do not expand cleanup without the owner's reply.

## Approved local scene repair — 2026-09-15

- The owner approved the bounded proposal recorded at 83420fb. Pin Expo to
  57.0.23 and retain React Native 0.86.2. The official scene plugin remains
  unpublished; adapt the approved immutable source with MIT provenance. Expo
  owns the native scene runtime; TableUs only changes generated configuration.
- Validate the installed patch version, preserve existing link handlers, reject
  custom/partial startup shapes, and support Expo's null-prototype plist maps.
  Before native compilation check SDK/runtime/plugin compatibility; before
  accepting SDK 27 artifacts require the exact single-scene manifest.
- Actual prebuild comparisons may normalize only Sentry's randomly generated
  symbol-upload phase UUID; every other project setting and unrelated plist
  value must match. No Pods installation or native compilation is part of this
  check. Keep failed harness attempts alongside the successful evidence.
- The approval covers local code and deterministic checks. Freeze and review
  the replacement before requesting separate native/hosted execution. Existing
  source acceptance, artifacts and provider caps do not transfer implicitly.

## iOS 27 launch failure and repair scope — 2026-09-15

- Owner reported immediate launch crashes after successful installation. Two
  TableUs-only device reports match the installed executable UUID and identify
  UIKit's no-scene-lifecycle trap. Confirm the actual iPhoneOS 27 SDK and absent
  scene manifest in the signed artifact. The existing simulator pass was on
  iOS 26.5; do not generalize it to iOS 27 or blame the owner's account.
- Pause live checks and both unstarted telemetry builds. Stop the identified
  Android build gracefully after confirming that native dependency/config
  changes are required; preserve cancellation status and raw logs. Do not report
  an application compilation failure or fabricate any readiness confirmation.
- Prepare a separate local SDK 57 repair scope: published Expo 57.0.23 runtime,
  reviewed official opt-in plugin integration, actual installed-version checks,
  generated-project validation and a fail-fast scene compatibility gate. The
  official plugin is experimental and npm returned E404. Do not blindly copy
  its normalized-sdkVersion patch comparison or move to SDK 58. The previously
  approved packet explicitly excluded dependency upgrades, so obtain the local
  scope exception before implementation. Later execution needs a new exact
  candidate and matching source review; no old evidence is relabeled.
- Account data and saved staging devices remain intact. Both separately approved
  cleanup stages completed. Latest successful aggregate is 329 Places attempts;
  post-crash connector reads failed twice. Reconcile before another live phase.

## Approved refresh staging verification — 2026-09-15

- Owner approved deleting exactly the two completed disposable deterministic
  devices. Both removals completed; disk measured 20.967 GiB immediately after.
  Preserve all saved staging devices and all artifacts/evidence. The owner also
  removed the Screen Time restriction. The same re-inspected iPhone artifact
  installed on the second attempt. Collect owner session observations and
  continue sequential native builds only while resource guards pass.
- The owner subsequently approved exactly the five obsolete npm caches. All five
  removals completed, with current versions/devices/artifacts/evidence preserved.
  About 19.5 GiB remains below the 20 GiB guard. Prepare a separate request for
  only the two completed disposable deterministic test devices (about 4.9 GiB);
  do not remove them before explicit approval. The original cache denial is
  resolved for its exact approved scope and retained as historical evidence.
- The physical iPhone is connected, but the source-verified installation failed
  with ManagedConfiguration's installation prohibition. Preserve the failure,
  ask the owner to resolve the previously encountered Screen Time restriction,
  and reuse the same artifact. Do not rebuild or modify device restrictions.
  The new Preview session is provider-confirmed as the organizer; conservatively
  count one approved sign-in message. Web export and read-only deletion
  readiness pass; leave the deletion confirmation empty.
- Owner completed Xcode setup. Build and inspect `readiness-ios` with existing
  signing material under Xcode 27.0; retain its actual receipt and artifact
  checksum. It passes, but has not been installed. Reuse the existing validated
  private link. Send the web canary once and verify exact-release delivery in
  both providers. Retain the additional observation that Sentry displays coarse
  geography even though the application omits user fields; do not infer its
  enrichment source or silently change provider settings. Address that operating
  privacy boundary during production preparation.
- Honor the 20 GiB build-start guard. At about 19.8 GiB, do not start the next
  profile. Automatic approval review classed removal of five obsolete npm EAS
  caches (750 MiB, current versions excluded) as cleanup requiring explicit
  owner approval under AGENTS.md. No deletion occurred. Preserve the concrete
  proposal and await that approval or owner-provided disk space; do not use a
  workaround. All saved devices, signing material, artifacts and logs remain.
- Hosted deployment of exact source 2ad48a8 passes readiness, served Preview
  bundle/source, CORS and canonical association checks. Production pointers,
  protection and existing credentials are preserved. CI passes 216 JavaScript,
  101 Python and four browser tests. Configure the approved 409 Places backstop;
  the aggregate remains 329 and the new live allowance is untouched. Xcode's
  license/setup prompt blocks native tools. Ask the owner to complete those
  prompts; do not accept the license on their behalf or start native compilation
  before the host preflight succeeds. The four-build approval remains valid.
- The owner replied “approve” to the exact 2ad48a8 source-review and execution
  request. Record the immutable report digest and original plan commit, preserve
  their pending records, and execute existing staging/Preview plus saved-device
  verification. Approved caps are 80 additional Places attempts, four sign-in
  messages, zero generations, five events per provider and four native builds.
- The read-only Places baseline remains 329 in both all-time and 30-day totals;
  the approved new backstop is 409. Maintain a separate new-run ledger and retain
  the old 60/80 and 3/4 run unchanged. No Security Scan, production change, new
  resources/secrets, migration, store submission or destructive cleanup is approved.

## Deterministic refresh verification continuation — 2026-09-15

- Complete the local objective with both platform results bound to application
  `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`. Android attempt four passed under
  `ec909733c0242b7a10737dc0dda0402f5d5aa87e`, reusing lifecycle operator
  `62bef563373e64de144c1998c73d87dc3d18c7b3`; iOS retains
  `cced1728628d594c1e957f9efc48a03428fa8f4a`. Both platforms show zero scrolling
  reads/writes, one delayed read and one recovery read, with unchanged votes.
  Keep all three failed Android attempts. Fourteen screenshots are reviewed;
  both new devices are stopped/retained and local services are closed.
- Prepare the next staging request with exact review acceptance, four remaining
  native profiles, 80 additional Places attempts, four new sign-in messages and
  zero generation. These are proposed limits, not granted authority. Reuse the
  two inspected test artifacts, preserve the paused 6b9719b ledger and do not
  start a Security Scan. Production/stores/cohorts remain later objectives.
- Preserve attempt three's finalization-navigation failure. Maestro repeatedly
  reported visibility 1.0 for the retry label at the same bottom-of-page bounds,
  yet kept scrolling with centering enabled until timeout. The screenshot shows
  the full control. Disable centering and explicitly retain 100% visibility plus
  the original assertion. Repeat the affected Android suite once on the same APK;
  no application, JavaScript or existing successful evidence changes.
- Preserve Android attempt two, which stopped before refresh checks: its visible
  title field contained `OOffline resilience dinner`. Screenshot and hierarchy
  establish the mismatch; the exact input-duplication mechanism is unknown.
  Add an exact pre-submission title assertion with at most one clear/retype
  correction. Never retry the create request in that input block or weaken the
  retained-input assertion after failure. Reuse the same inspected APK and
  completed lifecycle for one investigated offline/refresh retry. This YAML-only
  change needs parsing and the affected native execution; the latest full
  220-JavaScript/98-Python readiness result remains applicable.
- Preserve Android's first failed attempt: the UI displayed the injected error,
  cached plan and enabled refresh button, but the probe observed two HTTP
  requests instead of the three required by its initial expectation. Its exact
  lower-count cause remains unestablished. Enforce an observable bound of one to
  three injected HTTP errors, zero upstream requests and zero writes; keep
  success/scroll counts exact. A query attempt need not reach the HTTP proxy.
  Retain counter snapshots before assertions. Four focused tests and a new
  `make ready` pass 220 JavaScript/98 Python tests with three Postgres skips.
  Prepare one investigated offline/refresh retry with the same APK and retained
  test AVD; reuse the completed lifecycle and preserve all first-attempt evidence.
- Accept the inspected iOS test artifact and its completed deterministic
  lifecycle/offline/refresh observations separately from hosted acceptance.
  Operator `cced1728628d594c1e957f9efc48a03428fa8f4a` recorded zero scroll
  reads/writes, one delayed coalesced read, three injected failures and one
  successful recovery read; the prior vote remained unchanged. Seven screenshots
  were reviewed. Stop and retain the new test simulator before Android begins.
- Include the previously verified finalization-retry scroll in the source-owned
  operator flow before Android execution. It brings the retry control fully into
  view while preserving the existing assertion and all request-count checks.
  This changes neither the frozen application nor the already accepted iOS run;
  Android records its actual operator identity separately.
- Continue the identified local device-verification step under the owner's
  request. Bound execution to two sequential local test profiles with fixture
  providers, demo identities and telemetry off. This does not accept a staging
  review, increase live limits, deploy or install on a signed-in device.
- Keep application source `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd` frozen. New
  proxy faults, flows and evidence checks belong to the operator branch. Require
  zero app writes throughout scrolling/refresh, exact read counts, actual fault
  delivery and unchanged fixture voting state. Retain failed flow diagnostics.
- The new review reuses eleven byte-identical control files transparently and
  assesses the one-screen change. Its fourteen file hashes and seven areas pass
  validation. The same two medium risks remain; matching acceptance of the new
  report is still pending for hosted staging. No scanner was started.
- Both profile input preflights and one operator `make ready` pass: 219 JavaScript
  and 98 Python tests, with three local Postgres skips. Native device observations
  are a separate next phase. Create only new named test targets, run one at a
  time, stop/retain them afterward, and preserve all existing devices and receipts.

## Explicit plan refresh and evidence correction — 2026-09-15

- Freeze the corrected application at `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`.
  Subsequent documentation/evidence commits record this identity without
  replacing it. The branch remains local and no installed build has changed.

- The owner clarified that they saw their previous saved vote and did not
  deliberately submit another vote. Preserve the observed server write, while
  withdrawing intentional owner confirmation for the Android voting check.
  The owner reports a persistent loading indicator and unintended repeated
  refresh during scrolling. Do not require another reconstruction of gestures.
- Prepare a bounded local correction on `codex/plan-refresh-controls`: replace
  the plan-detail pull gesture with an explicit `Refresh plan` button on both
  native platforms; coalesce pending reads instead of canceling and restarting
  them; bind the button's spinner to manual activity. Retain automatic visible
  return/foreground/reconnect behavior and hidden-route inactivity. Other list
  screens and shared provider architecture are outside this correction.
- Distinguish previous saved votes, unsubmitted edits and a successful current
  submission. UI success alone is still insufficient live evidence of a new vote;
  require deliberate owner action and a matching server event.
- Two local regression failures establish duplicate overlapping requests and
  ambiguous old-vote feedback. They do not establish that every observed Android
  read came from scrolling, or reproduce the native persistent spinner. Record
  native gesture verification as pending for the new application source.
- Keep live execution paused at 60/80 Places attempts and 3/4 sign-in messages;
  the rolling backstop remains 349. Prepare code, focused tests and one local
  `make ready` before any execution request. Preserve the six 6b9719b artifacts,
  source-review acceptance and saved device sessions at their actual identities.
  No additional paid allowance, rebuild, deployment or Security Scan is implied.
- Local readiness targets all pass after granting the deterministic proxy test
  loopback-listener access. Retain the initial sandbox failure and resumed-target
  results; do not rerun the already passing lint/type stages. There are 216
  JavaScript and 98 Python passes, with three Postgres-only checks skipped locally.

## Replacement execution approval — 2026-09-14

- Pause live verification after Android join/vote used 28 Places attempts
  against its expected 12. Server metadata confirms one join, one new vote and
  five successful detail reads for the same plan, all from Android. Preserve
  these facts without attributing the four extra reads to a particular UI trigger.
  The later owner clarification and local correction are recorded above.
  Android was stopped without resetting data and the owner
  closed the physical app. The run is at 60/80 with 36 attempts still allocated;
  resolve the cause and allowance before continuing the remaining live phase.
- Accept the first isolation direction from the unchanged Android provider
  session refreshing at 06:28:43Z after the iOS local sign-out and replacement
  Android installation. The owner confirms Plans before and after relaunch.
  Reverse-direction survival remains a separate, incomplete check.
- The corrected iOS restoration now matches the preserved Android account.
  Retain its new session for the reverse-direction check; iOS is stopped and
  the inspected Android readiness build is installed without resetting data.
  Combine native finalized/reopened-state witnesses with the planned hidden-route
  return and active-plan foreground observations. Reserve the final four Places
  attempts for manual refresh instead of duplicating an already witnessed return.
- Provider metadata identified a different-account iOS restoration before it
  could be counted as session-isolation evidence. Sign that account out locally
  and use the approved contingency message to restore the matching account.
  Three messages are now reserved, with the fourth retained for Android.
  This does not invalidate the earlier iOS sign-out or delivered canaries.
- **2026-09-15 live checkpoint:** Accept the iOS/API canary delivery separately
  from session isolation. The original iOS session refreshed after replacement
  installation; local sign-out removed it and retained the original Android
  session. Require an actual Android refresh after that sign-out and a later
  iOS refresh after Android sign-out. Restore iOS first using one reserved
  approved message so the natural refresh wait can overlap Android verification.
  Do not change expiry settings or use a new sign-in as survival evidence.
- All six artifacts now pass source, lock, checksum, receipt and signer checks;
  recorded build times prove sequential execution. Accept that artifact gate
  and continue the saved-session and live-device gates separately. A Preview
  network error recovered with one Retry and retained its organizer session.
- Five artifacts now pass inspection, including iOS telemetry. Its build took
  4,082 seconds and compiled both Intel and Apple silicon simulator binaries.
  Keep the current accepted bytes. Evaluate an ARM-only local simulator profile
  before the next build cycle to reduce compilation work. The verified idle
  Gradle daemon from the completed readiness build was stopped through Gradle;
  no files or app data were removed. Android telemetry is the final build.
- A pre-existing saved-vote label does not prove a new submission. The first
  iPhone observation had no new server event; the subsequent explicit submission
  produced one `vote.updated` event. Accept that attributable result. The run
  now uses 32/80 Places attempts and one of four emails, with zero generations.
  Allocate the remaining 48 attempts before further plan operations.
- Both readiness artifacts pass source, receipt, checksum and signer inspection.
  Preserve that acceptance separately from live-device verification. The iPhone
  rejected the first install through ManagedConfiguration; the owner identified
  and resolved a Screen Time restriction. Installation of the same inspected
  artifact then succeeded without changing application bytes or resetting app data.
  The owner confirms restored Plans before and after relaunch, and the canonical
  auth link opens TableUs.
- Repair only the private local helper's form policy and validation feedback.
  Keep exact-origin checking; an unrelated origin remains rejected. The owner
  reused the copied link successfully. Two web rotations and sixteen Places
  attempts are now observed, leaving 64 attempts, three emails and zero new
  generations within the approved run. No additional link rotation is needed.
- The owner explicitly approved the two-device cleanup in task turn
  `01a0a31f-3572-7852-b2b1-ab0c4a86adba`. [Execution](evidence/replacement-6b9719b/disk-cleanup-execution.json)
  removed only the completed iOS/Android deterministic devices through their
  platform managers. Artifacts, diagnostics and saved live-account devices were
  preserved. The four remaining builds resumed sequentially; `readiness-ios`
  started with 30.0 GiB free. This resolves the earlier cleanup approval gate.
- Accept Android lifecycle from the four-core retry and offline verification
  from the subsequent bounded run. Preserve the startup System UI failure and
  the clipped retry-button failure. The [operator navigation patch](evidence/replacement-6b9719b/android-offline-navigation.patch)
  scrolls before the existing assertion and retains before/after screenshots;
  it changes neither application bytes nor the frozen checkout. Request counts
  prove one created plan and one finalization event after same-key retries.
- Both deterministic platform gates are complete. Keep the 20 GiB build-start
  minimum: observed free space is 15.8 GiB. Automatic review rejected deletion
  of the newly created iOS test device because destructive cleanup requires
  explicit approval. The concrete pending request covers only the two completed
  disposable test devices (about 4.7 GiB), preserving saved live sessions and all
  artifacts/evidence. That request was subsequently approved and executed as
  recorded above; no additional cleanup authority is implied.
- The first inspected iOS artifact and delivered web canary do not imply native
  or cumulative acceptance. Retain separate artifact, deterministic, live-device
  and telemetry gates; subsequent native phases stop on any failed prerequisite.
- Both iOS deterministic suites passed before starting Android. Count the web
  plan's two four-detail responses against the 80-attempt allowance; the second
  followed private-link rotation and is consistent with the existing revision
  poll. Keep 72 attempts available and distinguish this from native refresh proof.
- Exact-source CI and existing staging/Preview deployments now pass. The
  [deployment record](evidence/replacement-6b9719b/deployment.json) preserves
  the actual IDs, source stamps, CORS and unchanged Production pointers.
- Run deterministic native harnesses on isolated local test devices: their
  app-reset behavior must not erase the retained staging sessions required for
  cross-device verification. Native workloads remain sequential.
- Record the existing EAS Expo Doctor warning accurately: 20/21 checks pass,
  with eleven patch recommendations identical in both the old and replacement
  test-ios logs. Keep the approved candidate's locked bytes for this staging run;
  patch/advisory review remains required before production/store acceptance.
  This is a corrected toolchain observation, not a new advisory result or scan.
- The owner's direct “approve” reply accepts the prepared plan at `9ee4a80`;
  [the record](evidence/replacement-6b9719b/execution-approval.json) binds the
  exact candidate, plan and actual task turn. Execute existing staging/Preview
  deployment, exact-SHA CI, six sequential native builds and bounded verification.
- Limits are 80 additional Places attempts, four sign-in emails, no new Gemini
  generation, and one web/iOS/Android telemetry flow (at most five analytics and
  five error events including API companions). The read-only starting aggregate
  confirms 269 Places attempts; lower the rolling backstop to 349 and retain it.
- Preserve existing credentials, data, artifacts and Production aliases. The
  approved rollback covers newly changed staging/Preview source and CORS only;
  retain the reduced provider backstop. No scan, merge, new resource/secret,
  production change, store submission or cohort expansion is authorized.

## Replacement verification preflight — 2026-09-14

- Prepare the exact application ref `codex/replacement-6b9719b` and the bounded
  [execution request](evidence/replacement-6b9719b/README.md). Source/report
  acceptance remains valid; no new security decision or scan is requested.
- Six retained c5b041c artifacts/receipts verify and six replacement build-input
  checks pass. Existing tools and Expo/Vercel CLI access work. Preserve the
  previously working Java/build SDK configuration; emulator SDK files use a
  different installed root. No replacement native artifacts or CI run exist.
- Proposed, not yet approved: exact-source existing staging/Preview deployment,
  six sequential native profiles, at most 80 additional Places attempts, four
  new sign-in emails, zero new Gemini generation and bounded telemetry canaries.
  Current project-wide rolling Places usage is 269/500; lower its backstop to
  349 for this scope and retain the reduced value after handoff. Reconcile any
  baseline drift before executing; do not automatically replenish the run.
- Require evidence of a successful other-client session refresh after local
  sign-out. Cached UI or a still-valid access token alone is insufficient.
  Reuse the existing plan and recommendation run, while recording fresh
  source-bound device and hosted observations. Preserve old artifacts and data.
- This packet changes documentation/evidence only. Reuse prior full-suite
  validation for matching bytes, plus the actual artifact/configuration/input
  preflights. No deployment, native build, message, paid journey or scan follows
  until the concrete execution scope receives approval.

## Staging source-review acceptance — 2026-09-14

- The owner's direct “accept” reply adopts `staging-source-review-v1` and the
  report for `6b9719b4e63e34803f2e7c2598e45851790df661`, parsed-report SHA-256
  `046bba5a771112ef1e49888b6a09235f9c6d259b757b81f90f85607785795122`.
  The actual Codex turn and validation are recorded in
  [owner acceptance](evidence/source-review-6b9719b/owner-acceptance.json).
- Shared provider quotas and URL capabilities remain open medium risks,
  accepted for existing isolated staging only. The accepted security record
  passes validation; application/report bytes and historical evidence are unchanged.
- The completed review packet is archived. The active packet now scopes
  replacement hosted/native verification, with real cross-device session and
  focus/foreground observations. This acceptance does not approve its deployment,
  builds or live operations, and does not complete cumulative staging, production,
  store or cohort acceptance. No scan is authorized or started.
- This change records evidence and documentation only. Reuse the full local
  checks for unchanged application/tooling/test bytes and validate the new
  acceptance data directly; no duplicate full-suite run is needed.

## Staging source-review preparation — 2026-09-14

- Following the owner's request to avoid another usage-heavy scan, prepare the
  documented staging source-review pathway. This supersedes the earlier proposed
  scanner execution. No scan is started; the installed plugin and canceled scans
  are unchanged. Preparation does not claim owner acceptance of an unseen report.
- Keep legacy scan records intact. Use version-two cumulative staging input with
  a separate `source_review` report, required coverage and immutable Git file
  verification. Bind explicit owner acceptance to policy, candidate and report
  hash; incomplete evidence or unresolved critical/high runtime findings fails.
  Production/store/cohort gates and application/native provenance are unchanged.
- This is targeted primary-agent review plus deterministic tests, not independent
  auditing or scan certification. Mechanical validation establishes consistency
  and source identity, not the truth of a human approval or reviewer assertion.
- The concrete report for 6b9719b records two open medium staging risks: shared
  provider quotas and URL capabilities. Eleven file hashes and seven review
  areas are verified; owner acceptance remains false. Fourteen focused gate
  tests and full local readiness pass. No application source or hosted state
  changes in this objective.


## Device-session and refresh correction — 2026-09-14

The scan proposal and scan-only next-step choice below are historical and
superseded by the staging source-review preparation decision above.

- The owner approved installing Codex Security and inspecting scan controls,
  not scan execution. Version 0.1.24 is installed. Prepare one Standard scan
  proposal with a maximum of two active reviewers and a 20-minute checkpoint,
  explicitly distinguishing that effort bound from an unavailable desktop hard
  usage cap. No new scan or persistent concurrency setting is authorized.

- The owner accepted the recommended order: prepare known client fixes locally,
  freeze/review the replacement, and obtain explicit scope/usage approval before
  a new exact-candidate scan. Retain the current scan gate; the proposed staging
  review-only alternative is not adopted. Prior canceled scans stay canceled.
- “Sign out on this device” explicitly uses Supabase local scope. Clear session
  UI/query state after successful sign-out; provider failures show a sanitized
  retry message and must not be presented as success. Deterministic SDK-boundary
  tests do not establish a real second device's session status.
- AppProviders alone handles foreground query refresh. Auth still manages token
  refresh and pending approval, without a second blanket query invalidation on
  foreground. Hidden plan routes unsubscribe; returning to the plan fetches
  current votes/state immediately. Use existing session-memory query data only,
  with no new persistence or backend provider cache. Full visible plan reads
  and mutation responses retain existing provider hydration.
- The correction creates a new application candidate. c5b041c's accepted native,
  live and telemetry evidence stays bound to c5b041c. No new push, deployment,
  build, paid journey, sign-in message, resource, secret or scan is implied.


## Current development and release decisions — 2026-09-12

- Native, shared-journey and four-platform telemetry verification are complete
  for `c5b041c`. The Android telemetry replacement preserved its approved session;
  its canary delivered to PostHog and the existing Sentry issue, whose count
  increased with the Android bundle observed. Stop the completed simulators
  without wiping data. Record the final 80 Places attempts, one generation,
  $0.00056825 estimated Gemini and six conservatively consumed message slots.
  Preserve the validator's rejection of missing security evidence; assembling
  component hashes does not grant cumulative, production, store or cohort approval.

- The owner's final Android confirmation completes its ten-phase checklist:
  current three-person voting state and updated score, saved vote, absent guest
  finalize control, rotated-link rejection, JSON share sheet and deletion status.
  Record that the current-state observation followed emulator restart; do not
  turn it into a claim about an unobserved warm-resume sequence. Preserve the
  assembled checklist and the original installation evidence before replacing
  the readiness APK with the accepted telemetry APK. The replacement passed
  reinspection and installed without a data wipe; no additional sign-in message
  is authorized or requested. Android's subsequent canary completed the device checks.

- Accept the iOS/API canary delivery from the owner's passed simulator UI,
  matching native accessibility, exact-release/platform PostHog counts, and
  exact-release/staging Sentry events. The local-page link succeeded with the
  same installed artifact after the first custom-scheme attempt returned to
  Plans. Do not rebuild or resend a passed canary to explain that initial
  navigation. Shut down iOS and resume Android's preserved readiness session
  before replacing its APK with the already accepted telemetry artifact.

- Keep the existing shared plan after the owner joined with a third account.
  SQL confirms three participants and two saved sets of constraints; no new
  plan, invite or removal is needed. The owner confirms the QR opened the native
  iPhone app and used a new code. All four messages are conservatively consumed.
  A later web tab requires sign-in, so the single generation ran on Android's existing session while
  retaining the earlier web observations and leaving the session-loss cause
  unproven. Do not repeat generation to improve evidence.

- Paid steps paused after 36 of the initially approved 50 Places attempts. One
  generation and seven subsequent detail reads explain the recorded usage;
  each detail batch succeeded with four attempts. The remaining journey cannot
  fit reliably within 14 attempts. The owner approved 100 attempts and six returning
  messages total, preserving the existing Gemini ceiling and single generation.
  The two extra messages cover the web organizer and iOS telemetry simulator
  only if needed. The backend re-fetches restaurant
  details for plan reads and mutation responses; foreground refresh can also
  fetch an active plan. Record avoidable reads as a next-candidate efficiency
  concern without claiming the trigger of every observed call is proven.

- The original interactive readiness processes ended without final summaries.
  Consolidate their verified installation/preflight evidence with durable owner
  observations and web/SQL corroboration, labeling the result as an assembled
  checklist rather than a completed runner execution. The physical iPhone's
  ten phases now pass through this method. Do not repeat live calls merely to
  reproduce a terminal transcript; Android and telemetry remain separately open.

- The live review found device-only sign-out copy paired with Supabase's global
  default. Align this scope and verify cross-device session behavior in the
  next client candidate. It plausibly explains the later organizer web sign-in
  requirement, without proving the specific revocation. Preserve the frozen
  candidate's evidence and the [attributed findings](reviews/2026-09-13-live-readiness-findings.md).

- After Android's organizer controls and the server's single-participant count
  established that both devices used the organizer account, the owner confirmed
  an existing second approved account and explicitly approved one extra Android
  sign-in email. The total ceiling is now four, preserving the original iOS
  simulator/web allowance. The switch and two-participant join subsequently
  passed. No new account or invite is authorized. Keep native
  devices sequential after Android's observed unresponsiveness recovered when
  the idle iOS simulator was shut down; do not claim a proven root cause.

- The owner's latest “approve” (2026-09-13 UTC) authorizes at most three
  returning sign-in messages across Android, the iOS telemetry simulator and web;
  one two-person live journey using existing approved accounts, capped at $0.25
  additional estimated Gemini spend and 50 Places outbound attempts; and
  sanitized web/API/iOS/Android canaries. Record a provider-usage baseline and
  check deltas between paid steps. Failed attempts count; passed assertions do
  not justify regeneration. No new invite, credential, resource, deployment,
  scan, production/store action or change to the cumulative security gate follows.

- All six `c5b041c` native artifacts are now accepted and durably retained.
  Reuse these exact bytes for the remaining physical, live-auth and telemetry
  observations. The owner restored TableUs PostHog and Sentry access; empty
  current-release baselines establish access, not successful canary delivery.
  Preserve the separate paid-provider/OTP and cumulative security-evidence gates.
  Physical iPhone session restoration, relaunch persistence and the canonical
  auth-link observation now pass. Android installation/domain verification pass,
  and its returning sign-in now passes after one approved message. Retain these partial results
  without labeling the complete live journey or dedicated canaries as passed.

- Both frozen-candidate deterministic native suites passed. Keep `c5b041c`
  for the authorized readiness/telemetry artifact sequence. Record the observed
  default tab glyphs as presentation polish for the next client candidate before
  store distribution; do not alter artifact bytes or hide the screenshots.

- After the staging handoff, the owner requested the next steps. Execute the
  native reliability sequence against frozen `c5b041c`: iOS test artifact and
  fault journeys, then ARM64 Android, before readiness/telemetry artifacts.
  Keep accepted bytes, inspections and receipts under the original checkout's
  private `.artifacts/mobile/<full-source-sha>/`. The canceled scan and explicit
  paid-provider/OTP/production/store gates remain in force.

- The owner approved pushing `c5b041c85f4f7b959436c13bef48c959622c624f`,
  running CI, and deploying to existing Railway staging and Vercel Preview.
  The completed deployment preserves the application SHA, updates only existing
  noncredential source stamps and the exact Preview CORS origins, and retains
  production aliases and deployment protection. This approval does not renew
  native, paid-provider, OTP, security-scan or production/store/cohort scope.
  [Evidence](evidence/c5b041c/README.md) records the completed operations.
- Keep this deployment's evidence descendant local: pushing the application
  branch automatically creates another Vercel Preview. The remote application
  candidate remains the verified `c5b041c`; future evidence publication must
  account for that trigger instead of silently deploying documentation commits.
- The owner confirmed GPT-6 Astra for **development only**. Pin
  `gpt-6-astra` in project Codex configuration; preserve compatible existing
  reasoning settings and global configuration. Gemini/Places application
  inference is unchanged. Official sources and migration scope are in
  `docs/reviews/2026-09-12-astra-reassessment.md`.
- Use one primary agent and focused deterministic checks by default. Prior
  security-scan cancellation remains binding; no new plugin scan is implied by
  a model change, stale checklist or broad project review.
- Separate application candidate, operator tooling, and evidence provenance.
  Existing `daa89a0` evidence retains that SHA. Operator preflight may inspect
  or build an explicitly selected clean detached candidate, whose own locked
  build configuration, inspectors and receipt generator remain authoritative.
  Any changed runtime source/lockfile/config requires an explicit candidate
  decision; never relabel existing evidence or claim a new scan occurred.
- Recover durable artifact/receipt pairs before scheduling rebuilds. Validate
  identifiers, output paths and Android SDK roots before expensive native work.
  For a fresh candidate, finish each deterministic platform's fault journeys
  before compiling the other production-shaped/telemetry artifact families.
  The owner did not manually save the prior native artifacts; no durable set
  is currently available for reuse.
- The reproduced credential/session wait gap is fixed in the `c5b041c` candidate.
  Use one end-to-end API deadline, preserve a write's idempotency key across
  the single authorized token refresh, and never send a late credential result.
  SDK timeout/rejection is recoverable, not proof of revoked authorization.
  Startup has a 15-second deadline and mobile has an explicit restoration retry.
  This runtime change requires a new application candidate; `daa89a0` evidence
  remains historical. No claim of a currently broken hosted login is made.
- Preserve the existing web/Expo/FastAPI architecture and prioritize the complete
  shared-plan journey. Production privacy/operating decisions, source-controlled
  production trust/signing, store distribution and cohort activation are separate
  objectives. Durable shared coordination remains required before horizontal
  scaling.

Older dated decisions below retain their historical context. Current status and
execution order live in `docs/current-state.md` and `docs/roadmap.md`; earlier
candidate narratives are not additional active gates.

- **2026-08-15:** Closed beta is invite-only and US-only.
- **2026-08-15:** Retain Next.js for web and add one Expo Router app for iOS and
  Android. Platform UI is not shared.
- **2026-08-15:** Deploy web to Vercel, API to Railway, and use Supabase Auth and
  Postgres.
- **2026-08-15:** Email OTP is preceded by invite validation. Supabase is used
  directly by clients only for authentication.
- **2026-08-15:** Shared plans are asynchronous, support 2–8 people, use top-three
  Borda voting (3/2/1), and require organizer finalization.
- **2026-08-15:** Deterministic Maps/AI fixtures are the default. Live AI gates
  are explicit, model-pinned, budgeted, and sanitized.
- **2026-08-15:** Mobile beta is native 2D. Mobile maps and 3D are deferred.
- **2026-08-15:** Legacy endpoints exist only for local demo compatibility while
  clients migrate to `/api/v1`.
- **2026-08-17:** Alembic uses a separately configurable migration credential;
  the API runtime role receives only schema usage and application-table CRUD.
- **2026-08-17:** Invite validation tokens are bound to a normalized email when
  Supabase OTP is used. Backend redemption remains the product-access authority;
  Supabase Auth hooks and rate limits are an additional staging control.
- **2026-08-17:** Verified HTTPS links cover `/join/*` and exact `/auth` only;
  the Supabase `/auth/confirm` callback remains web-only while email verification
  is code-based. Association manifests fail closed until real Apple and Android
  signing identifiers exist.
- **2026-08-17:** Pre-production web evidence uses the dedicated Vercel project
  `tableus-staging`; production remains a separate approval and configuration
  gate.
- **2026-08-17:** Supabase staging uses the isolated `TableUs Staging` project in
  East US. Its owner credential is stored outside the repository in macOS
  Keychain; runtime credentials and migrations remain separate gates.
- **2026-08-17:** The invite-only Before User Created hook is security-invoker.
  `supabase_auth_admin` receives only private-schema usage, hook execution, and
  read access to pending validation hashes; no client Data API role receives
  access to the application schema.
- **2026-08-19:** Routine, reversible implementation and staging configuration
  within an approved objective proceeds without repeated owner approval. The
  existing explicit gates remain for merges, cloud-resource creation, secret
  addition or rotation, paid live-AI evaluation, production migrations,
  deployments, store submissions, destructive cleanup, and significant product
  or architecture decisions.
- **2026-08-19:** Railway receives only the least-privilege runtime database
  credential. The privileged migration credential remains in the trusted
  operator environment; approved migrations run separately before deployment
  rather than through Railway's pre-deploy container.
- **2026-08-19:** Invite validation is required only when joining the beta.
  Returning users authenticate by email OTP and must prove an existing
  invite-approved application profile through `/api/v1/me`; signing in never
  consumes another invite.
- **2026-08-20:** Deterministic native E2E builds use a localhost-only demo API
  and never send demo identities to, or enable demo authentication on, the
  Supabase-authenticated staging service. Android reaches the operator's local
  API through `adb reverse`; local-network and cleartext allowances are compiled
  only into the dedicated test profiles.
- **2026-08-21:** One deterministic mobile artifact switches between the seeded
  organizer and guest through SecureStore only when the Expo test flag, demo
  mode, and loopback API URL are all active. The hidden deep link accepts no
  arbitrary subject, clears query caches on change, and is inert in preview and
  production builds.
- **2026-08-21:** Mobile Supabase authentication is owned by one app-level
  coordinator. Pending signup state may retain only an expiring redemption
  transaction in SecureStore; invite codes and OTPs are never persisted. Product
  navigation is authorized by the FastAPI approved profile, not merely by the
  presence of a Supabase session.
- **2026-08-21:** Real mobile auth evidence uses separate auth-test artifacts
  pointed at HTTPS staging with deterministic providers. Demo identities,
  loopback defaults, local networking exceptions, and local identity controls
  remain exclusive to deterministic test profiles.
- **2026-08-21:** Account export is a versioned application-data contract and
  excludes credential, invite, share-token, and provider secrets. Application
  profile deletion requires exact server-side confirmation and remains blocked
  while the user organizes a plan. Eligible deletion nulls the actor on retained
  plan audit events. Supabase Auth removal remains a separate trusted-operator
  action, and hosted evidence never exercises deletion against retained accounts.
- **2026-08-22:** Mobile private query data is session-only and is never written
  to a disk persister. Product mutations are not queued, optimistically applied,
  or automatically replayed after reconnection. Known-offline and ambiguous
  failures require an explicit user retry using the original in-memory payload
  and idempotency key; editing or dismissal abandons that operation. If a read
  refresh observes the committed server state before an ambiguous retry, the
  retry/dismiss control remains available until the user resolves that attempt.
- **2026-08-27:** Android disables OkHttp's transparent connection retry at
  application startup so one logical mobile write produces one transport
  attempt until the user explicitly retries. The deterministic fault proxy
  models an ambiguous committed response by delivering response headers and
  truncating its body; incomplete successful envelopes are normalized to a
  retryable network error. The policy lives in an Android-only local Expo module
  and preserves CNG without committing generated native projects.
- **2026-08-22:** The closed-beta idempotency ledger remains a 24-hour,
  process-local response cache. It is limited to an explicit product-route
  allowlist, keyed by verified subject plus a hash of a validated key, stores
  only bounded successful responses, and rechecks current approval and plan
  authorization before replay. Public invite validation and ephemeral photos are
  excluded. Account deletion revalidates identity but not the removed profile so
  an ambiguous committed deletion can return its completion receipt. Request
  fingerprints prevent changed-body reuse, but restart and horizontal-scaling
  safety still require a persistent-ledger migration.
- **2026-08-22:** Global mobile status banners render inside an explicit root
  safe-area provider and consume the top inset. Semantic alert labels do not
  substitute for visible bounds outside the system status bar.
- **2026-08-22:** Deterministic iOS Maestro flows dismiss keyboards by tapping a
  stable non-interactive heading when the next action remains visible. The
  platform driver's flaky `hideKeyboard` gesture is not an acceptance signal.
- **2026-08-22:** Resource-intensive local mobile evidence runs are sequential.
  Android test artifacts target ARM64 only and cap Gradle/CMake workers; verbose
  build and Maestro output is written to temporary files and summarized only at
  phase boundaries. This bounds native-worker memory and avoids retaining large
  tool streams in the Codex desktop task.
- **2026-08-23:** `https://links.table-us.com` is the single canonical host for
  invite, auth, and private-plan links. The dedicated host avoids same-origin
  browser navigation behavior and serves the same Next.js fallback when the app
  is unavailable. Share tokens stay in the current join URL and navigation
  process; auth UI receives no token and evidence retains no private URL. Native
  cold starts normalize the canonical host through Expo Router's
  `+native-intent`, retaining only the allowlisted auth mode or join token.
- **2026-08-24:** Local EAS builds require CLI 22.4.0 or newer so credential
  payloads use the redacted environment transport. Preview Android association
  trusts only the current signing certificate after rotation; superseded APKs
  require uninstall/reinstall. Expo SDK 57 iOS inspection reads
  `EXConstants.bundle/app.config` while retaining the legacy path and otherwise
  failing closed. Tahoe's exact trust-only `codesign` diagnostic is accepted only
  alongside independently validated signed entitlements and Apple provisioning
  profile authorization. Both CMS checks bind the actual `SignerInfo`
  certificate rather than accepting an unused certificate from the CMS bag.
- **2026-08-24:** Verified-link evidence on Android is automated against a signed
  ARM64 artifact. Until Maestro officially supports physical iOS devices, iOS
  association evidence uses exact-artifact inspection, Apple Associated Domains
  Diagnostics, and user-observed taps from Notes or Messages through returning
  code authentication and rotated-link rejection. A simulator does not replace
  association verification, and the result must not be labeled automated.
- **2026-08-24:** Places and AI provider modes are independently configured;
  their combined readiness may be `mixed` in staging, while production requires
  both live. Google Places staging persists long-lived Place IDs plus the user's
  own normalized plan label, never Google coordinates or display fields. Live
  location and restaurant fields are refreshed on demand, query data stays in
  client memory, and Maps paid-operation limits/usage accounting remain
  process-local for the closed beta.
- **2026-08-25:** US location validation prefers
  `postalAddress.regionCode`. Because live Text Search city results can omit the
  entire postal address, the adapter requests the transient country address
  component and accepts its `US` short code only when the postal region is
  absent. Any missing, conflicting, or non-US country remains fail-closed, and
  address components are never persisted or emitted to evidence or telemetry.
- **2026-08-25 (superseded):** Closed-beta Gemini uses only pinned
  `gemini-2.5-flash-lite` through `google-genai==1.75.0`. Restaurant identities
  are replaced with request-local aliases before inference, every AI output is
  schema- and privacy-validated, and there is no silent fallback. Live staging
  is bounded by per-user/global limits, a database-backed rolling `$4` estimated
  spend ceiling, and a one-process reservation lock; a future horizontally
  scaled service requires a durable reservation ledger. Paid evaluation is a
  separate explicit gate with an exact-SHA/fixture checkpoint and `$0.25` cap.
- **2026-08-25:** Gemini wire schemas contain only the provider's documented
  JSON Schema subset. Generated string `minLength`, `maxLength`, `pattern`,
  `additionalProperties`, and non-semantic `title` metadata are removed before
  transmission because live endpoints reject those generated forms with `400`;
  the original strict Pydantic models still validate every parsed response
  locally, so wire compatibility does not weaken domain, privacy, or safety
  enforcement.
- **2026-08-25:** Closed-beta Gemini is pinned to
  `gemini-3.1-flash-lite` through `google-genai==1.75.0`. Google lists it as the
  stable replacement for Gemini 2.5 Flash-Lite, which returned `404` for the
  newly created staging project despite successful authorization and catalog
  discovery. Cost accounting uses `$0.25` per million input tokens and `$1.50`
  per million output/thinking tokens. Gemini 3 thinking cannot be fully
  disabled, so TableUs requests the documented `minimal` level and continues to
  include thinking tokens in spend limits. This model change requires a new
  exact-SHA checkpoint namespace and live evaluation before staging activation.
- **2026-08-25:** A public-CI-green Gemini 3.1 candidate may not deploy merely
  because request validation succeeds. Paid activation remains fail-closed when
  Google returns generic `429 RESOURCE_EXHAUSTED`, even with active linked
  billing and no reported client rate-limit or overload signal. Keep staging AI
  deterministic, preserve the Railway-only credential restriction, and require
  a new exact-SHA evaluation after provider capacity becomes usable.
- **2026-08-25:** TableUs staging uses Gemini Enterprise Agent Platform, Google's
  evolution of Vertex AI, instead of the standalone Gemini Developer API. Keep
  `google-genai`, `gemini-3.1-flash-lite`, the global endpoint, strict schemas,
  and existing spend ceilings; select the SDK's explicit `enterprise=True`
  transport. Railway authenticates with the existing service-account-bound
  authorization key restricted to `aiplatform.googleapis.com` and its static
  egress addresses. The bound identity receives only
  `roles/aiplatform.expressUser`. This permits eligible Google Cloud credits and
  avoids depending on AI Studio prepaid billing without adding Agent Runtime,
  Agent Studio, grounding, tools, or persistent agent state.
- **2026-08-25:** A standard API key restricted to
  `aiplatform.googleapis.com` is not an acceptable Agent Platform runtime
  credential. Exact-SHA evidence returned `401` with zero tokens because the key
  has no bound IAM principal, matching Google's current authentication
  documentation. The required service-account-bound authorization key cannot be
  created while the managed `disableServiceAccountApiKeyCreation` policy omits
  Agent Platform. The unused standard key was revoked and the prior Developer
  API credential restored without deployment. Staging remains deterministic
  until the owner approves either a narrowly scoped policy allowance, a
  workload-identity-capable runtime, or continued standalone Developer API
  billing.
- **2026-08-25:** For staging validation only, the project-level managed policy
  allowlist preserves `generativelanguage.googleapis.com` and adds only
  `aiplatform.googleapis.com`. The Agent Platform key is bound to the existing
  service account whose sole project role is `roles/aiplatform.expressUser`, and
  is restricted to Agent Platform plus Railway's three static IPs. Production
  credential architecture remains a later gate. Live contract failures do not
  weaken local validation: recommendation outcomes and request-local candidate
  keys are represented as provider enums, while Pydantic remains authoritative;
  multimodal content explicitly declares the user role.
- **2026-08-25:** Exact candidate
  `2eb428a05913c60dd1af1ae59fdd79fb233c5ede` is the validated live-Gemini
  staging baseline. It passed public CI, the frozen six-case paid evaluation,
  and sanitized two-user evidence with live Places and live Agent Platform.
  The active service-account-bound key remains restricted to
  `aiplatform.googleapis.com` and Railway's three static IPs; the superseded
  Developer API key is revoked. The Vercel staging alias uses an exact-SHA
  Preview deployment because the project's Production target also controls
  production-facing TableUs domains. Moving those domains or using a Production
  deployment requires a separate production gate; a dedicated staging Vercel
  project should be considered before beta release.
- **2026-08-26:** Closed-beta analytics are default-on but anonymous and
  aggregate-only. Each web page/app process creates a random memory-only session
  UUID; TableUs does not persist it, associate it with an account, call PostHog
  `identify`, create person profiles, use GeoIP, autocapture, surveys, feature
  flags, or replay. Sentry is error-only: stacks and safe release/component/
  request identifiers remain while messages, users, request contents, query
  strings, private URL segments, contexts, breadcrumbs, profiling, tracing,
  replay, and attachments are excluded. Staging uses three isolated Sentry
  projects and one isolated US PostHog project; production remains a later gate.
  PostHog's required `distinct_id` is the same random process-memory UUID, not
  an SDK device identifier or application user ID; the sanitizer rejects any
  non-UUID replacement and removes all other automatic identity properties.
  PostHog JS's validated public `phc_` project token is retained solely as the
  required ingestion transport field; it is not a secret or an analytics
  identity. Backend-generated events explicitly report platform `api` rather
  than inheriting the requesting web or mobile platform.
- **2026-08-26:** Keep PostHog's browser bot filtering enabled. Its browser SDK
  drops Playwright's default headless identity before the application
  `before_send` sanitizer, so an automated web canary must use a normal Chrome
  identity or a headed browser and must verify both a successful ingestion
  response and the aggregate exact-release event. Disabling bot filtering or
  injecting a provider event directly is not acceptable product evidence.
- **2026-08-26:** Closed-beta public support and privacy contacts are
  `support@table-us.com` and `privacy@table-us.com`, exported from the shared
  platform-neutral domain package. Google provider content uses Google's
  unmodified Maps attribution asset in the same visual container. The exact
  normal-weight `Google Maps` fallback is reserved for genuinely constrained
  layouts and web fallback text must use `translate="no"`.
- **2026-08-26:** The cumulative readiness candidate stays on Expo SDK 57 and
  React Native 0.86.2. Patch releases are resolved with Expo tooling (currently
  Expo 57.0.18, Constants 57.0.16, Updates 57.0.19, and Router 57.0.17), while the
  monorepo pins React/React DOM 19.2.3 at the root so native tests and Expo Doctor
  see one native-compatible copy; the web workspace retains 19.2.4 locally.
  Unsupported Expo downgrades, forced audit rewrites, and SDK upgrades are not
  acceptable security remediations inside this packet.
- **2026-08-26:** Readiness mobile profiles are production-shaped but staging-
  only. They use Supabase auth, HTTPS staging, canonical verified links, staging
  telemetry, and live server-side providers; they compile no demo, loopback,
  cleartext, service-role, or E2E controls. Production/store configuration and
  signing remain separate gates.
- **2026-08-26:** Brian Chei, as repository and cloud account owner, is the
  accountable rollback owner. Codex may execute only explicitly approved
  rollback actions. Because this packet has no migration, rollback restores the
  prior validated Railway/Vercel deployments, deterministic provider modes,
  disabled telemetry when necessary, and prior signed internal artifacts rather
  than applying a database rollback.
- **2026-08-27:** Mobile request deadlines cover both the initial fetch and
  response-body consumption. This is necessary because a transport can deliver
  headers and then leave a truncated body pending after the server committed a
  write. Local-E2E uses 10 seconds for deterministic fault evidence; ordinary
  mobile builds use 45 seconds to accommodate bounded live-provider work. A
  deadline failure is status `0`, remains explicit and retryable, and preserves
  the logical write's idempotency key; it is never replayed automatically.
- **2026-08-28:** Cumulative device automation treats a surfaced recoverable
  mutation as an expected explicit-retry branch, never as authorization for an
  automatic replay. Maestro waits for either success or the operation-specific
  Retry control, presses Retry only when visible, and then requires the normal
  success state. Production-shaped readiness artifacts keep telemetry E2E
  controls disabled. Exact-release mobile Sentry/PostHog canaries come from the
  existing isolated telemetry-test profiles, and their sanitized aggregate
  report is a required cumulative evidence source.
- **2026-08-29:** A mobile request deadline must be enforced independently of
  transport abort behavior. `expo/fetch` may resolve response headers and then
  leave truncated-body parsing pending after an abort, so the shared client
  races one logical deadline against both fetch and JSON consumption. Expiry
  remains a status-`0` ambiguous failure and never triggers automatic replay.
  Reopen lifecycle automation must also scroll to the restored vote action
  before asserting it; preserved ranking state alone does not guarantee that a
  below-fold action is visible.
- **2026-08-29:** Rotated-link device evidence may encounter the same explicit
  status-zero recoverable state as any other write. The lifecycle flow must tap
  `Retry joining plan` once when surfaced and then require the terminal
  invalid/expired/rotated state. This remains user-driven replay with the same
  in-memory idempotency key; it is not an automatic retry or a relaxed token
  assertion.
- **2026-08-29:** Ranked-vote success and bounded retry controls may render
  below the Android viewport after the submit action. Lifecycle automation must
  scroll to either `Ranked vote saved.` or `Retry ranked vote` before branching,
  then require the saved state. A completed submit tap or changed score alone
  is not accepted as device evidence.
- **2026-08-29:** Mobile release tooling uses Expo's live workflow-schema
  validator as an operator gate and a shared local-device preflight before
  deterministic evidence. The preflight may boot the explicitly requested iOS
  simulator, but Android must already be an online, fully booted API 36+ ARM64
  emulator. Sanitized preflight output retains no device identifier. Xcode
  runtime snapshots and Android UI-tree/log/performance tooling are diagnostic
  evidence tools; memgraphs, heap dumps, and broad performance traces remain
  opt-in for a focused investigation and are never retained by routine release
  runs.
- **2026-08-29:** Pre-authentication rate identity never derives from raw bearer
  or demo headers. A bounded transport-source bucket and bounded global ceiling
  run before authentication/body/provider work, while Railway health probes
  bypass the product bucket. Supabase reuses one cached JWKS client per endpoint.
  A trusted edge limiter remains defense in depth rather than correctness.
- **2026-08-30:** Request admission is an outer pure-ASGI boundary. It assigns a
  validated request ID, rejects disabled legacy/shared-plan paths, consumes the
  bounded transport/global rate bucket, and enforces declared and streamed body
  limits before FastAPI routing, dependency resolution, or multipart parsing.
  Ordinary bodies are capped at 1 MiB; photo multipart envelopes are capped at
  9 MiB so the existing 8 MiB image contract plus form overhead remains valid.
- **2026-08-30:** Staging and production share fail-closed hosted-runtime
  invariants: Supabase authentication, demo disabled, a non-default 32-byte
  application secret, matching least-privilege PostgreSQL runtime role, public
  HTTPS Supabase/CORS origins, and no legacy demo routes. Staging may still use
  deterministic or mixed providers; production continues to require both live.
- **2026-08-30:** A live invite validation is a short-lived reservation against
  the invite's remaining uses. Repeating the normalized email extends the same
  reservation; a different email waits until capacity is released by expiry or
  redemption. Expired unredeemed rows are pruned without a schema migration.
- **2026-08-30:** Web private query keys include the Supabase subject and the
  root provider clears query and mutation state on subject transition, sign-out,
  deletion, or terminal authorization. Live authenticated evidence retains
  summary assertions only; screenshots are allowed only for deterministic
  synthetic journeys or an explicit reviewed/redacted promotion. Sensitive
  evidence prompts require no-echo TTY input.
- **2026-08-30:** Exact-SHA provenance includes content-pinned GitHub Actions and
  multi-platform OCI digests. Readable version tags remain beside the immutable
  hashes, and updates require a reviewed source change. Expo 57 source-scans the
  local Android lifecycle `Package`; executable resolver evidence, not a false
  `android.modules` entry, guards its autolinking.
- **2026-08-30:** Release-shaped native transport policy is verified from signed
  artifacts, not inferred from embedded Expo configuration. iOS explicitly sets
  `NSAllowsLocalNetworking=false` outside local test/development builds, Android
  sets `usesCleartextTraffic=false`, and the common signed-link inspector rejects
  a true allowance in the native plist or manifest.
- **2026-08-30:** Codex Expo actions are local and foreground-owned. The mobile
  app provides Run/iOS/Android/Web/Dev Client/Doctor actions through a single
  npm-aware Expo launcher, with Expo Doctor exactly locked and resolved offline
  from the workspace dependency. Authenticated EAS builds, submissions, and store
  operations are intentionally excluded from action buttons and retain their
  explicit release gates.
- **2026-08-30:** CORS is inside the universal request-admission boundary so
  browser preflights cannot bypass feature, transport/global rate, or body
  gates. Gate rejections add credentials-compatible CORS headers only for an
  explicitly configured origin. Web subject transitions also remount
  subject-keyed plan pages, and live mobile evidence deletes both temporary and
  newly created user-level Maestro test/log entries.
- **2026-08-31:** Hosted client trust anchors are source-owned, exact staging
  values. Web and mobile builds reject alternate API, Supabase, link, telemetry,
  and EAS project origins; production profiles fail closed until separately
  approved production anchors exist. Expo Updates are disabled for this release
  line because no app-owned signed-update authority has been approved. Native
  dependency/configuration changes continue to require new signed artifacts.
- **2026-08-31:** Same-key state-changing requests are serialized within the
  single API process, and every plan mutation row-locks its current plan state.
  JWKS refreshes use bounded timeouts, one coalesced refresh, and a short negative
  cache. These are closed-beta single-process controls; durable coordination is
  required before horizontal API scaling.
- **2026-08-31:** Mobile plan detail does not poll provider-backed hydration.
  Paid Places usage has both per-minute admission and a database-backed rolling
  30-day ceiling of 150 outbound attempts. Review storage is capped at 100 rows
  per account. These bounds protect the isolated cohort without adding a schema
  migration.
- **2026-08-31:** EAS CLI is repository-locked exactly at `23.2.0`, and the
  configured version, installed executable, source SHA, dependency-lock checksum,
  artifact checksum, and inspection result are bound in local build receipts.
  The shipped dependency graph must have zero critical/high advisories. The
  remaining developer-only EAS/Expo toolchain exception expires before
  production or 2026-09-30, whichever is earlier.
- **2026-09-01:** Local mobile evidence is accepted only from the repository's
  isolated build orchestrator. It builds one profile from a fresh detached
  exact-SHA worktree with frozen dependencies and bounded memory, then requires
  one canonical active Expo configuration, effective native transport state,
  the expected signer, and a digest-bound inspection report before issuing a
  version-two receipt or exporting bytes. Device runners privately copy,
  re-inspect, and re-hash the receipted bytes immediately before installation;
  credential prompts occur only afterward. Direct post-hoc receipts and
  caller-supplied inspection booleans are invalid.
- **2026-09-01:** Supabase signing keys have one authoritative bounded cache:
  PyJWT's five-minute JWK-set cache. Its optional per-key LRU is explicitly
  disabled because that tier has no time-based expiration. TableUs retains
  unknown-key throttling and refresh coalescing but no longer keeps any second
  unexpired known-key cache, so removed keys and same-`kid` material replacement
  take effect at the bounded provider cache lifetime.
- **2026-09-01:** Release security closure uses the prior sealed repository
  baselines, focused source review of saved candidates, deterministic regression
  tests, and one exact-candidate diff review. Deep scan
  `2482f6f3-b05c-4c40-bc9f-e5d5a0ec41a0` was canceled because its marginal
  value did not justify its weekly-usage cost; it must not be resumed or replaced
  by another deep scan without separate owner confirmation.
- **2026-09-01:** Finalized plans reject joins by new participants, constraint
  changes, and recommendation regeneration until the organizer explicitly
  reopens voting. Approved profiles may retry their original invite redemption
  but cannot consume another invite. Live photo analysis performs per-user
  admission before reading or sanitizing bytes, and bounded image work runs off
  the event loop before shared provider budget admission.
- **2026-09-01:** Hosted runtime-role validation recognizes Supabase's documented
  IPv4 session-pooler identity without weakening least privilege. Direct
  connections require the exact configured role; pooler connections require
  `role.project-ref`, the exact project from `SUPABASE_URL`, an official
  `*.pooler.supabase.com` host, and session port `5432`. Arbitrary suffixes,
  hosts, and transaction-pooler URLs fail closed.
- **2026-09-01:** The paid Places rolling-attempt default remains 150. An
  explicitly configured staging environment may raise that ceiling to at most
  500 because prior exact-SHA evidence had already accumulated 151 attempts;
  values of 501 or more fail configuration validation. Per-user and global
  minute limits, Google request quotas, and the $10 alert budget remain
  unchanged.
- **2026-09-02:** The canonical `links.table-us.com` URL is both a native-link
  association host and a supported browser fallback, so staging CORS must allow
  that exact origin alongside `tableus-staging.vercel.app`. The production-facing
  `table-us.com` origin remains outside staging until a separately approved
  production deployment. Cumulative web evidence must name the exact staging
  alias; opening the production site on a phone is mobile web, not evidence for
  the installed Expo app. Web session bootstrap must expose bounded error and
  signed-out states rather than representing every failure as indefinite
  loading.
- **2026-09-02:** Repository-owned local EAS artifacts disable Sentry's
  build-time automatic source-map and native-symbol upload. The local uploader
  does not reliably receive Sentry's build-only organization context and can
  terminate before Expo finishes its bundle; runtime Sentry/PostHog configuration
  and exact-release canaries remain mandatory and are validated separately.
  Hosted production/store builds must restore source-map and native-symbol upload
  with build-only credentials before approval; this exception is local-only and
  must never be added to a production EAS profile.
