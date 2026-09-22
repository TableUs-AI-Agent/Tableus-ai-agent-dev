# Native replacement validation — approval proposal

Prepared 2026-09-21. **N1 approval requested; no execution has occurred.**
Roadmap 2d remains pending. Preparation is a documentation-only checkpoint.

## Identities and fresh preparation

- Base/evidence completion: `5b39d937b905691798a585b4aced79f91c7e97bf`.
- Application: `ed8330a766b3c4b80a505e075535678394e275e9`.
- Retention implementation and proposed build operator: `16603dd0cf36d27b492e57a02d3c6c438a2563c4`.
- Proposal branch: `codex/native-replacement-validation`; worktree:
  `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev`.
- Proposal/evidence commit: resolve with `git log -1 --format=%H -- docs/evidence/native-replacement-validation-2026-09-21/README.md`.
  This commit is not the application or the proposed build operator.
- Prior task `01a0c661-7b3f-7403-906c-0f60f60a3dd4`: one recent turn read;
  confirms preparation only. No older retrieval needed.

[Source associations](source-association.json) freshly match all seven recorded
operator/test hashes to 16603dd and all four retained private validation logs in
63bd. Application mobile/shared/backend/vendor trees and root lock match ed8330a.
Reuse the [2c verification manifest](../native-diagnostic-retention-2026-09-21/verification.json):
24 focused fixtures, `make ready` (244 JS, 98 Python, three PostgreSQL skips),
contract drift. These validate operator tooling, not new native artifacts.
[Planning validation](planning-validation.json) records four passing no-build input
preflights and 26 checked local document links; no output root was created.
No tests, compilers, device operations, cloud checks or live requests ran here.

Local observations (read-only; recheck before execution):

| Item | Observed |
| --- | --- |
| Node/npm | `/Users/brianchei/.local/bin/node`, v22.23.1; npm 10.9.8 |
| Xcode | `/Applications/Xcode.app/Contents/Developer`, 27.0 / 27A266a |
| iPhoneOS/simulator SDK | 27.0 / 27.0; SDK queries emitted sandbox cache/FSEvents warnings, returned success |
| CocoaPods | `/opt/homebrew/bin/pod`, 1.17.0 |
| Java | `/Users/brianchei/Library/Java/JavaVirtualMachines/openjdk-18.0.2.1/Contents/Home`, OpenJDK 18.0.2.1; same path as previous accepted build |
| Android SDK | `/Users/brianchei/Library/Android/sdk`; android-36; build tools 35.0.0 and 36.0.0; NDK 27.0.12077973 and 27.1.12297006 |
| adb | SDK `platform-tools/adb`, 1.0.41 / 37.0.1-15733141; version only, no server/device operation |
| Maestro | `/opt/homebrew/bin/maestro` symlink to Cellar 2.8.0; metadata only, not invoked |
| Runtime/device files | iOS volume `iOS_23F77`; ARM64 `TableUs_API_36.avd` and `medium_phone.avd` exist; no device selected or operated |
| Disk | 22,280,000 KiB available (21.25 GiB), 95% used on durable target volume |
| Build concurrency | process-name read found no xcodebuild, Gradle, EAS or emulator job; no process arguments captured |

EAS 23.2.0 is selected by the candidate lock/profile and matches the retained 63bd
installed package metadata. Dependency verification
must recheck the actually installed CLI and nested minimatch 9.0.9 after frozen
install; no fresh dependency installation happened here. No cloud credential
validity, provisioning expiry, device availability or sufficient retention capacity
is asserted by these host observations.

## Concrete constraints found in source

1. The retention helper does not force native debug information generation or
   Android unstripped output. It requests the iOS composed map, preserves EAS work,
   and scans files. Missing diagnostics only print a warning after a successful
   artifact/receipt export. **Helper exit zero is not phase acceptance.** Require
   matching usable symbols/maps below; stop rather than building Android after an
   iOS diagnostic failure. No proven compiler-output defect can be established
   without compilation; do not preemptively change application build settings.
2. `ios-scene-build-preflight.mjs` imports `@expo/config` from the operator checkout.
   Installing only the detached application's dependencies is insufficient in a
   fresh operator checkout. Install the operator's frozen dependencies first, then
   invoke its helper; do not copy helpers into ed8330a. Its scene plugin/preflight
   bytes match the candidate (recorded source association).
3. Both platforms use `com.tableus.app` for all profiles. `mobile-e2e` installs;
   `mobile-offline-e2e` uninstalls before installing. Neither may touch an accepted
   staging device. N1 requires two new disposable local targets, one iOS 26.5
   simulator and one API 36 ARM64 AVD using already installed runtimes/images.
   Record IDs before install; reject all prior accepted IDs and do not boot or
   inspect accepted sessions as preflight. No runtime/SDK download is included.
4. About 21.25 GiB barely exceeds the historical 20 GiB start floor and does not
   establish capacity for preserved worktrees/EAS output and disposable devices.
   Proposed conservative gate: **40 GiB free before each build**, stop below
   20 GiB during a build, retain partial output. This is a planning floor, not a
   measured peak estimate. Currently blocked on capacity; no cleanup authorized.
   Recheck after device provisioning, operator install and each attempt. A new
   durable volume/path requires a recorded proposal amendment, not silent rerouting.
5. Build CLI `--api-url`, `--supabase-url`, `--apple-team-id` and fingerprint are
   inspection expectations, not credential configuration. Existing EAS Preview
   environment/signing must supply matching build inputs. No new credentials,
   version mutation, resource creation or signing repair is included. EAS local
   execution can contact Expo for existing project/credentials/environment checks;
   N1 approval must explicitly include that limited contact and dependency downloads.

## N1 — requested scope and commands

Approve at most **two local native build attempts**, sequentially: test-ios then
ARM64 test-android, one attempt each. No automatic retries. Includes frozen npm/
CocoaPods/Gradle dependency fetches, existing Expo project/signing reads, creation
and use of one disposable simulator and one disposable emulator, loopback backend,
one lifecycle runner and one offline/refresh runner per OS, the bounded link
matrix and diagnostic cycles below. Telemetry off; no hosted product requests,
Places, Gemini, OTP, canaries, symbol uploads, CI, deployment or credential changes.
Creating these local test devices is included; deleting old devices/files is not.
The disk and isolated-device gates must pass before starting any attempt.

All following commands are **proposed, not executed**. Run each step manually
only after its predecessor passes; do not paste the whole sequence as a batch.
Use private file-backed logs, umask 077, and no concurrent native jobs.

```bash
export APP_SHA=ed8330a766b3c4b80a505e075535678394e275e9
export TOOL_SHA=16603dd0cf36d27b492e57a02d3c6c438a2563c4
export RUN_ROOT=/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/$APP_SHA/native-validation-2d
export TOOL_ROOT=$RUN_ROOT/operator
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
export JAVA_HOME=/Users/brianchei/Library/Java/JavaVirtualMachines/openjdk-18.0.2.1/Contents/Home
export ANDROID_HOME=/Users/brianchei/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
export ORG_GRADLE_PROJECT_reactNativeArchitectures=arm64-v8a
export EXPO_PUBLIC_TELEMETRY_MODE=off
export ANDROID_FINGERPRINT=02:FC:F9:A8:5F:EF:26:D4:61:43:F4:D8:28:7A:32:5B:05:21:1B:B6:77:23:91:32:4C:12:AA:78:60:C6:65:68
umask 077
# Only after capacity, collision and approval checks:
mkdir -m 700 "$RUN_ROOT"
git worktree add --detach "$TOOL_ROOT" "$TOOL_SHA"
cd "$TOOL_ROOT"
npm ci --offline > "$RUN_ROOT/operator-install.log" 2>&1
# Offline cache miss: stop; a normal frozen npm ci is allowed only within N1's
# approved dependency-fetch scope, recorded as operator setup, not a build retry.
git status --porcelain=v1 --untracked-files=all
git rev-parse HEAD
```

Require clean status and TOOL_SHA; inventory must record that actually invoked SHA.
Each helper creates its own clean detached ed8330a application workspace. Check
existing ancestor canonical paths, new outputs, root mode 0700 and Git ignore
before writing. The existing `.artifacts/mobile` parent is 0755; the new private
root is 0700. Preserve the root permanently until separate cleanup approval.
Do not reuse an existing `native-validation-2d` attempt path.

Use this single command template for the rows below. First add
`PREFLIGHT_ONLY=true` for a no-build input check; remove only after all gates pass.
For every actual attempt redirect stdout/stderr to a new private driver log beside
its outputs; the helper retains its own complete `build.log`.

```bash
make local-mobile-build PLATFORM="$PLATFORM" PROFILE="$PROFILE" SHA="$APP_SHA" \
  BUILD_ID="$BUILD_ID" APP="$RUN_ROOT/$PROFILE.$EXT" \
  INSPECTION_REPORT="$RUN_ROOT/$PROFILE.inspection.json" \
  RECEIPT="$RUN_ROOT/$PROFILE.receipt.json" \
  DIAGNOSTICS="$RUN_ROOT/$PROFILE.diagnostics" \
  ANDROID_FINGERPRINT="$ANDROID_FINGERPRINT"
```

| Order | PLATFORM / PROFILE / EXT | BUILD_ID |
| --- | --- | --- |
| N1.1 | ios / test-ios / app | local-ios-test-ed8330a-2d-01 |
| N1.2 | android / test-android / apk | local-android-test-ed8330a-2d-01 |
| N2.1, later | ios / readiness-ios / ipa | local-ios-readiness-ed8330a-2d-01 |
| N2.2, later | android / readiness-android / apk | local-android-readiness-ed8330a-2d-01 |

A build attempt starts at helper execution without PREFLIGHT_ONLY, including
install/credential/inspection failures; it consumes that row's attempt. Bound each
attempt to 90 minutes wall time, stop its operator with SIGTERM on timeout and
wait for inventory finalization. No blind retry, overlap or destructive recovery.

Inspect retained EAS archive/extracted source for root lock/manifests, both shared
packages, vendor adapter and upstream decoder alias. Match hashes to the candidate,
verify EAS/scoped dependency resolutions, generated scene config and native
transport, embedded SHA, actual signer, inspection and v2 receipt. Bind artifact,
raw output, receipt/report and diagnostics inventory hashes. Any missing source or
unexpected graph/config/signer halts before installation.

After symbols/maps pass, provision and record **new** disposable IDs using the
installed runtime/image (resolve exact available identifiers at that time):
`xcrun simctl create TableUs-N1-ed8330a <installed-iPhone-type> <installed-iOS-26.5-runtime>`;
`avdmanager create avd --name TableUs_N1_ed8330a --package <installed-API36-arm64-image>`.
No `--force`, cloning accepted data, wipe, or download. If either cannot be created
within this scope, stop. Boot only these IDs, sequentially; retain them afterward.

From the exact application workspace retained for that platform, after dependency
and local Python environment preflight, run (DEVICE is the new recorded ID):

```bash
make mobile-device-preflight PLATFORM="$PLATFORM" DEVICE="$DEVICE" \
  APP="$RUN_ROOT/$PROFILE.$EXT" BOOT=true EVIDENCE="$RUN_ROOT/$PROFILE-device"
make mobile-e2e PLATFORM="$PLATFORM" DEVICE="$DEVICE" \
  APP="$RUN_ROOT/$PROFILE.$EXT" BUILD_ID="$BUILD_ID" EVIDENCE="$RUN_ROOT/$PROFILE-lifecycle"
node scripts/mobile-offline-e2e.mjs --platform "$PLATFORM" --device "$DEVICE" \
  --app "$RUN_ROOT/$PROFILE.$EXT" --build-id "$BUILD_ID" \
  --evidence "$RUN_ROOT/$PROFILE-offline" --verify-plan-refresh true --refresh-sha "$APP_SHA"
```

The Make offline target omits refresh flags; the direct command deliberately
includes all five refresh phases and durable evidence. Record runner operator SHA
as ed8330a separately from the build operator 16603dd. Stop after the first failed
runner; one invocation each, 30-minute cap each, no repeat-to-green. Before starting,
confirm backend ports are free and deterministic/demo configuration, private
file-backed runner logs, no hosted auth credentials/provider keys in the runner
environment. Local fixtures may create/delete their own SQLite/test data only.

## Symbol and behavioral acceptance

Before the next build, require inventory status `succeeded`, no scan errors and
no missing required families. Generic `.so` discovery is not usable debug proof.
Retain generated archives, dSYM, embedded JS/Hermes bundle, composed source map,
Android unstripped objects and mapping when R8 is enabled. Record R8 disabled as
not applicable only from actual generated settings. Hash all files used manually
for symbolication even when outside the inventory's discovery filters.

- iOS: `xcrun dwarfdump --uuid <app-executable>` and each candidate dSYM DWARF
  executable must match UUID and architecture. Keep the exact Mach-O/dSYM pair.
  Obtain a local app-owned stack/sample on the disposable simulator; record image
  load address and PC. Use `xcrun atos -arch <arch> -o <matching-DWARF> -l <load-address> <PC>`
  and verify expected app function/source line. System-only frames or names without
  source resolution do not pass. Do not use new symbols on the old f94a1d9 hang.
- Android: use the installed NDK's `llvm-readelf -n` on APK-extracted and unstripped
  objects; match build IDs and ABI for each app-owned module used by the diagnostic.
  `llvm-readelf -S` must show usable debug sections in the symbol object.
  Resolve an app frame's module-relative PC with `llvm-addr2line -f -C -e <unstripped-object> <relative-PC>`;
  verify function/source. Stripped packaged `.so` files alone fail.
- JavaScript: retain exact embedded bundle and composed map hashes plus bundler/
  Hermes provenance. With the candidate-installed Metro symbolicator, resolve a
  captured local app JS frame to its expected original module and source line
  (including decoder/route handling). Validate `sources`/`sourcesContent` against
  retained source; a JSON-parsable map or an arbitrary original-position lookup
  does not prove its relationship to the executed bundle. No deliberate crash or
  remote telemetry event required. If no suitable frame is observable without
  application instrumentation, stop and propose that code change separately.

On each disposable target, execute one cold and one warm synthetic link matrix:
canonical auth `mode=sign-in`, valid plan UUID plus encoded token `a+b/c=`, Unicode,
plus/space, empty/missing/duplicate parameters, `%FF%41`, trailing `%`, incomplete
UTF-8, invalid UUID/encoded separators, wrong origin, web-only auth-confirm and
rotated old-link rejection. Limit native URLs to 2 KiB, five seconds per observation;
retain synthetic tokens only. Check decoded local boundary values and unauthorized
writes absent. Existing long-query five-second process regression is reused;
no native stress loop. Record OS refusal separately from parser rejection. Local
forced/custom-scheme delivery is parser evidence only, not physical universal-link
association acceptance. If a local case cannot reach the parser with this profile,
record blocked; do not substitute hosted reads or relabel a links-test receipt.

After symbols are usable, iOS gets exactly one cold and one warm export cycle:
restore demo session → Account → export → open/cancel share sheet → background/
foreground → terminate/relaunch → Account read. Capture private timestamped
main-thread samples around export/share dismissal, responsiveness and session
continuity. Android gets the same two bounded export/relaunch cycles. Local export
fixtures only. A >=2-second stall, crash, blocked action, invalid session or any
unexpected provider request stops N1 and reopens investigation. Five seconds is
an observation cutoff, not a relaxed hang threshold. A nonrecurrence proves only
these cycles; the historical isolated-staging AppHang acceptance is not a fix.

## N2 — separate later approval, not requested for execution now

Only after N1 passes, present actual N1 hashes/findings and request two attempts
(readiness-ios then readiness-android), existing signing/environment only, plus
explicit in-place update authorization for the retained physical iPhone/iOS 27
and staging Android target. Verify version/signer/provisioning and preserved data
before installation; never uninstall/clear storage to repair an update. Owner must
acknowledge these updates replace installed f94a1d9. Keep old artifacts/receipts;
rollback is a separate decision, not automatic. Stop at OTP prompts.

Use the same build template and N2 rows, additionally supplying:
`API_URL=https://api-staging-3795.up.railway.app`,
`SUPABASE_URL=https://mrwdhdeubdiiydmmvlda.supabase.co`,
`LINK_HOST=links.table-us.com`, `APPLE_TEAM_ID=6MHJN5V9UJ`.
Unset the N1 telemetry override; readiness requires existing staging telemetry
configuration and no E2E controls. These expected signers come from hashed retained
inspections, not a fresh assertion that credentials are valid. Existing credential
expiry/device provisioning failures stop without creation or rotation.

Proposed N2 product scope: saved-session Account reads, one physical iOS export/
share/relaunch cycle, Android Account/relaunch, actual cold/warm canonical auth and
invalid/expired link taps when source review confirms no provider hydration. Limit
account/export actions to this sequence, stop at unexpected requests. Record exact
release telemetry configuration; no deliberate canaries. Runtime passive error/
analytics delivery needs an explicit N2 decision because builds are telemetry-on;
no delivery acceptance is inferred from f94a1d9.

**Valid plan-link taps remain a further live-read gate.** Four cold/warm hydrations
on a four-option plan may require 16 Places attempts before retries, greater than
the eight unused closed-run attempts. Present a new bounded read/backstop proposal
before those taps; do not reopen the closed ledger. N2 without that approval is
partial link validation. Zero Gemini/OTP/canaries. Full readiness and cumulative
runners require API/app SHA equality and broader live scope; do not weaken them
or redeploy API to make this mixed component release appear cumulative.

## Stop, preserve and hand off

Stop on capacity/concurrency/identity/profile/archive/signing mismatch, missing
usable diagnostics, failed build/check, unexpected hosted request, privacy leak,
hang recurrence or required source/SDK/credential change. Preserve failures and
partial `running` inventories; SIGKILL is never a pass. Retain all working trees,
raw artifacts, driver/build logs, symbol commands/output and receipts privately.
Publish only sanitized summaries/hashes, with application, actual build/runner
operator and evidence SHAs separate. A fix or additional attempt needs a revised
bounded scope; no implicit fifth build. No symbol upload/store/distribution/cohort
approval follows from local matching.

Both staging aliases remain ed8330a / Preview `dpl_3ec5bdvridE1meArFaYWAp8yabKM`;
API deployment `24eefe75-9583-4a90-8d3e-48450818dec0` remains f94a1d9 with its own
rebuilt-image provenance; native f94a1d9; production e1184ec. These are carried
forward observations, not re-probed deployments. Preserve 63bd and 90bd and all
private evidence/sessions. One CI, one Preview and one API redeploy consumed.
Closed ledger: Places 92/100 from baseline 329 (8 unused, not reopened), emails
2/4, canaries 6/6 per provider, fresh Gemini 0/0; backstop 429. September 30 remains
unextended. No scan, merge, deployment, secret/resource change, migration,
destructive cleanup or store action is included.

Explicit approval is required by the originating task's native-execution boundary
and [AGENTS.md](../../../AGENTS.md) approval gates. Preparation is reviewable;
execution stays in this task pending approval and disk resolution, not a completed
roadmap 2d or a reason to create another task.
