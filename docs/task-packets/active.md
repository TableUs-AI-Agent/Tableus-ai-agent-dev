# Active packet: native replacement validation (2d)

N1-F1 approved; **candidate 8972865 built; D2/lifecycle and P2 Settings probe passed on iOS 26.5; O1/O2 platform crashes and refresh failure unresolved. O5 installed the app on iOS 27 but failed on XCTest initialization before UI commands; cleanup verified. Local T1 startup detection, durable diagnostics and owned-collector cleanup preparation is complete; no further native test is authorized.**
The owner authorized F1 native resumption and safe regenerable-cache cleanup on
2026-09-22; exact scope is recorded in the [amendment](../evidence/native-replacement-validation-2026-09-21/n1-f1-resumption-approval.json).
Capacity and fresh-input checks still govern execution; prior attempts remain consumed.
Astra owns orchestration and final technical acceptance; Sol implements and Luna
provides bounded read-only support under the owner's 2026-09-22 standing authority.
Keep this incomplete native objective here; canceled scans remain canceled.

## Identities

- Base: `5b39d937b905691798a585b4aced79f91c7e97bf`.
- Branch: `codex/native-replacement-validation`.
- Worktree: `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev`.
- Previous task: `01a0c661-7b3f-7403-906c-0f60f60a3dd4`.
- Prior native application: `ed8330a766b3c4b80a505e075535678394e275e9`.
- Frozen F1 application: `8972865893a3f018a064594457dc9cc664f8a61f`.
- Actually invoked build operator: `16603dd0cf36d27b492e57a02d3c6c438a2563c4`.
- Prior build: `local-ios-test-ed8330a-2d-01`; artifact/receipt/source/symbol hashes in
  [checkpoint](../evidence/native-replacement-validation-2026-09-21/n1-ios-checkpoint.json).
- New F1 build: `local-ios-test-8972865-f1-01`; fresh proof and diagnostic stop in
  [resumption result](../evidence/native-replacement-validation-2026-09-21/n1-f1-native-result.json).
- Evidence commit is the commit containing this checkpoint, not app/operator SHA.
- Local XCTest operator preparation (T1) base: `c043a3ae00baf1a4f18d083b74c2d43cb62962e6`; same active branch/worktree and frozen application.

## Current result

[Original build checkpoint](../evidence/native-replacement-validation-2026-09-21/n1-checkpoint.md).
Approved named storage cleanup completed; after the additional approved Cursor
cache deletion, 41.31 GiB passed the build start floor. iOS compiled, passed
inspection/receipt export, retained diagnostics without missing families/errors.
Executable/dSYM UUIDs match; a captured app frame resolves independently to
AppDelegate.swift:18. Five initial debugger launches yielded no trace and one
unresolved crash. The owner approved D1 after that stop. [D1 result](../evidence/native-replacement-validation-2026-09-21/d1-result.md):
one capture completed in 33.331 seconds, 9,339 samples/841 frames, no observed
new crash. Metro 0.84.5 resolves captured app/route frames to exact source;
50 app/shared/decoder map contents and 57 sampled app/Router source files match.
No direct decoder frame or malformed-link behavior is claimed. The earlier
crash is not dismissed as harmless and the historical AppHang remains unresolved.
[N1-R result](../evidence/native-replacement-validation-2026-09-21/n1-r-result.md):
lifecycle passed once in 378.973 seconds (seven flows), offline/refresh passed
once in 308.743 seconds (eleven flows, all five refresh phases). Its first link
attempt stopped on an incorrect auth-screen assertion for an approved demo actor;
that failure remains retained. The owner approved the exact N1-R2 correction.

[N1-R2 result](../evidence/native-replacement-validation-2026-09-21/n1-r2-result.md):
the first cold join screen appeared, then one tap sent `a b/c=` instead of
`a+b/c=` from raw `a%2Bb%2Fc%3D`. The proxy blocked before upstream and stopped
the run. One GET and one blocked POST; no backend join. Twelve other cold cases,
the warm matrix and both export cycles did not run. An offline reproduction with
three exact composed-map module matches traces the defect to custom-scheme
extraction rebuilding a decoded query before another URLSearchParams parse.
Current tests skipped that extraction and used a different parser entry point.
It also found unexecuted malformed-input oracle assumptions based on the legacy
parser; define those expectations through the actual route/hook boundary.
No new target crash was found. The backend/proxy and disposable app are stopped.
All outputs, including interrupted Maestro logs, are retained. The subsequent
owner-approved [F1 local fix](../evidence/native-replacement-validation-2026-09-21/n1-f1-result.md)
corrects extraction and a second hook decode, with duplicate/malformed input
rejected before writes. Its 48 route regressions and complete make-ready target
set pass: 292 JavaScript, 98 Python, three PostgreSQL skips; no contract drift.
The local F1 fix phase included no native build or replay.

The approved [F1 resumption](../evidence/native-replacement-validation-2026-09-21/n1-f1-native-result.md)
recovered about 26.85 GiB of disposable caches, then built and verified
`local-ios-test-8972865-f1-01` in 38.31 minutes. All 42 diagnostic hashes,
both executable/dSYM UUIDs and 50 app/shared/decoder map contents match. The new
iOS 26.5 simulator `CBB4FAB4-734C-413C-9F10-850329AC9A01` received the artifact.
A Python-version setup failure before launch was retained and corrected. The
one actual diagnostic attempt then hit its 45-second LLDB startup-command cap
at `continue`, before an observed app breakpoint or sampled trace. App terminated;
initial/delayed checks found no matching crash report and no target/debugger
process remains. The cause is unresolved. At that checkpoint no F1 behavioral runner had executed. After build and
simulator creation, the 02:17 UTC readout recorded 25.59 GiB free.

The new private root is
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1`.
The owner [approved D2](../evidence/native-replacement-validation-2026-09-21/n1-f1-d2-approval.json).
Its one additional capture [passed](../evidence/native-replacement-validation-2026-09-21/n1-f1-d2-result.md)
in 39.147 seconds: 8,661 samples/1,644 frames, an actual app frame independently
resolved to AppDelegate.swift:18, and 55 matching sampled app/Router source files.
No new crash was found; earlier failures remain unresolved and retained. The
lifecycle suite passed all seven flows once in 526.029 seconds. The
[F1 runtime run](../evidence/native-replacement-validation-2026-09-21/n1-f1-runtime-result.md)
stopped in offline refresh after 483.490 seconds: nine flows passed, then the
expected error-message assertion failed. Three refresh phases have passed
counters; failed-phase counters were not retained, leaving the cause unproved.
The disposable app and local services are stopped; no new crash was found.
Links and exports have not run. D2's additional capture is consumed.
The subsequently approved [F1-O1 run](../evidence/native-replacement-validation-2026-09-21/n1-f1-o1-result.md)
stopped after 182.790 seconds. The first create-failure flow passed, then
SpringBoard crashed in XCTest accessibility support; create-retry's first
assertion saw the iOS home screen. TableUs survived until cleanup; the journal
contains one create POST and no retry POST. No refresh phase was reached. The
original refresh failure remains unresolved. O1's additional offline attempt is
consumed, and the post-stop check confirms app/services stopped.

The subsequently approved [F1-P1 Settings-only probe](../evidence/native-replacement-validation-2026-09-21/n1-f1-p1-result.md)
stopped after 84.869 seconds on an eight-second simulator-monitor timeout. The
first flow passed. Both attempted flows completed their UI commands, but the
second lacked a passing process exit/post-flow observation. No third flow ran.
SpringBoard remained PID 17600 and no new crash or TableUs launch was observed.
Cleanup is confirmed; P1's one run is consumed. The subsequent
[approved P2 probe](../evidence/native-replacement-validation-2026-09-21/n1-f1-p2-result.md)
passed all three Settings flows in 130.308 seconds with 105 healthy host samples,
stable SpringBoard/parent identity and no new crash. Settings cleanup and later
process/port checks pass. P2's one run is consumed; it validates only the bounded
Settings probe, not TableUs or the causes of earlier failures.

## Development workflow prerequisite

The owner requested the GPT-6 workflow refresh before resuming native work.
Base for this governance amendment is `8f6c34bd682923539f9edf23ae1db4437ab58d49`;
branch/worktree and frozen application above are retained. Root Astra, default
Sol implementation and read-only Luna roles are configured; approval persistence,
completion criteria, relevant context loading and focused verification are explicit.
[Migration evidence](../evidence/gpt6-development-workflow-2026-09-22/README.md)
records source review, actual Sol/Luna work and configuration checks. No app code,
native profile, signing, installed session or closed budget changes.

## Next actions and stop conditions

F1 local implementation, verification, exact candidate freeze and
[impact/revalidation proposal](../evidence/native-replacement-validation-2026-09-21/n1-f1-native-revalidation.md)
are complete. The owner has now authorized the proposed bounded F1 native scope
and cache cleanup. The new iOS build passed; its one diagnostic attempt stopped
on the startup-command timeout. The separately approved D2 capture now passes;
the subsequent offline run has now triggered the first-new-native-failure stop.
The [F1-O1 amendment](../evidence/native-replacement-validation-2026-09-21/n1-f1-offline-amendment.md)
was [approved](../evidence/native-replacement-validation-2026-09-21/n1-f1-o1-approval.json)
for one additional offline run with durable failed-phase request/control events.
Fresh artifact/source/UUID/map and target/port checks passed; that exact archived
operator ran once and failed as recorded above. No extra offline attempt remains.
The owner [approved P1](../evidence/native-replacement-validation-2026-09-21/n1-f1-p1-approval.json);
its exact archived driver ran once and stopped as recorded above. Read-only
assessment places the monitor stall during active UI work; repeated simulator
polling is only a possible contributor. The prepared
[P2 amendment](../evidence/native-replacement-validation-2026-09-21/n1-f1-p2-proposal.md)
observes SpringBoard and its simulator parent from the host during flows, without
repeated simulator control calls. Same Settings UI flows, 300-second limit and
first-failure stop. The owner [approved P2](../evidence/native-replacement-validation-2026-09-21/n1-f1-p2-approval.json),
and its exact archived driver passed as recorded above. The prepared
[O2 offline amendment](../evidence/native-replacement-validation-2026-09-21/n1-f1-o2-proposal.md)
adds host platform observation to the retained diagnostic offline operator,
preserving app bytes and behavioral checks. The owner [approved O2](../evidence/native-replacement-validation-2026-09-21/n1-f1-o2-approval.json),
including conditional links/exports. Its initial capacity stops consumed no native
attempt. Subsequent approved cache removals completed; the older iOS support-cache
removal recovered 5.689 GiB and fresh preflight passed with 25.34 GiB free. The
[actual O2 attempt](../evidence/native-replacement-validation-2026-09-21/n1-f1-o2-result.md)
then failed after 88.308 seconds: first-flow UI commands completed, followed by a
separate SpringBoard crash matching O1's XCTest accessibility signature. Host
monitoring detected identity replacement and stopped the runner before the crash
report appeared. App, automation and services are stopped. No retry POST, refresh,
link or export ran; O2's additional attempt is consumed with no automatic retry.

Read-only upstream review found no targeted source-level fix in Maestro 2.10.
The owner [approved O3](../evidence/native-replacement-validation-2026-09-21/n1-f1-o3-approval.json)
for one diagnostic iOS 27 comparison. Its [result](../evidence/native-replacement-validation-2026-09-21/n1-f1-o3-result.md)
stopped after 143.997 seconds: target `0EFFA766-DCDD-49E5-84B0-D3593B68709A`
was created and booted, but the initial process query exceeded its eight-second
cap. No app install/launch or offline runner occurred. Shutdown and independent
process/port checks confirm cleanup. Five system-service shutdown reports remain
retained, distinct from O1/O2; the cause of the control delay is unproved.
The one O3 operation is consumed at its first failure. Its uninvoked offline
portion grants no continuation. The owner [approved O4](../evidence/native-replacement-validation-2026-09-21/n1-f1-o4-approval.json).
Its [one operation](../evidence/native-replacement-validation-2026-09-21/n1-f1-o4-result.md)
passed the control query in 9.465 seconds, then stopped after 113.791 seconds when
the host process query exceeded five seconds during runner setup. No UI execution
is retained; install/launch and traffic remain unproved. Owned processes are gone,
ports idle and retained target Shutdown. Five system-service shutdown reports
are preserved. The 35-minute total/30-minute runner caps were respected; no retry
is authorized and no iOS 26.5 acceptance transfers. The owner then [approved H1](../evidence/native-replacement-validation-2026-09-21/n1-f1-h1-approval.json).
Its [resource recovery](../evidence/native-replacement-validation-2026-09-21/n1-f1-h1-result.md)
completed in 28.499 seconds: both older targets shut down once each, data retained,
three host queries below 0.07 seconds and idle test ports. Process rows fell from
1,215 to 803 and swap use fell by 408 MiB during the window. Pre-shutdown queries
were already fast; no causal or stability acceptance follows. No app tests ran.
The owner [approved O5](../evidence/native-replacement-validation-2026-09-21/n1-f1-o5-approval.json).
Its [single diagnostic](../evidence/native-replacement-validation-2026-09-21/n1-f1-o5-result.md)
failed after 452.002 seconds. Control, preflight, uninstall and installation
passed. The first Maestro invocation returned exit 1 without UI command results;
zero flows/phases were accepted and no app requests were recorded. Retained
system logs establish iOS killed XCTest PID 58071 for an expired “XCTRunner
Initialization” assertion (`0x2182BAAD`); the underlying stall is unproved.
The narrow monitor kept stable SpringBoard identity but did not detect XCTest
startup death. Root retained the child diagnostics, stopped the separately
grouped owned collector and independently confirmed cleanup at 07:09:43 UTC.
Nine other system-service reports remain retained. All total/runner limits were
respected. No iOS 26.5 acceptance transfers and no native retry remains.

[T1 local operator preparation](../evidence/native-replacement-validation-2026-09-21/n1-f1-t1-result.md)
is complete: startup failures latch from retained logs before the host query,
exit capture preserves diagnostics, and collector cleanup requires fresh exact
ownership proof inside the original deadline. Synthetic checks, mocked integration
and a structural replay of O5 files pass. Both derivative CLI entry points refuse
native execution. Application bytes, assertions and timeouts are unchanged; the
initialization stall and runtime compatibility remain unproved.
Next bounded objective: use the retained startup evidence to define one native
comparison hypothesis and prepare its exact operator/inputs and stop conditions
for separately bounded approval. Do not execute it under T1. Keep the incomplete
native objective in this task.
Do not change app bytes, fault counts, assertions or timeouts to
obtain a pass. Links and the two exports wait for passing preceding gates; no
automatic replay. Never use ed8330a evidence as proof for changed bytes.

Canonical HTTPS auth/join, wrong-origin and web-only auth-confirm delivery remain
unverified: signed simulator entitlements are empty and no approved local forced
dispatch has executed. The proposal identifies an iOS-available XCTest API for a
separate feasibility probe, plus an existing auth profile for signed-out
presentation; neither has been compiled or operated. The demo guard prevents
sign-in-mode presentation.
The local fix does not complete N1; the linked proposal separates
local dispatch/auth probes from signed physical association checks, without
adding a build, instrumentation or real auth automatically. Retain original
crash/AppHang and
all time/stop limits. The failing synthetic plus case does not establish failure
of issued canonical HTTPS/URL-safe links or when the defect was introduced.

Android’s unused attempt is conditionally rebound to 8972865 and still waits for
all iOS gates and fresh capacity. Cleanup is limited to inspected disposable
caches; all retained native artifacts, sessions and personal files remain protected.
Keep all attempts/artifacts/private logs. N2 remains a separate future approval
for two readiness builds and in-place staging updates; live-read/passive telemetry
scope must be explicit. No fresh provider/OTP/canary allowance exists.

## Verification and boundaries

Fresh artifact/source/receipt/symbol/map checks and diagnostic logs are linked
above. Auxiliary retention/link harnesses have separate private hashes; the
build operator remains unchanged, while F1 changes mobile application bytes.
F1 has fresh local verification above; earlier 2c checks remain historical.
Documentation links/JSON/diff and evidence hashes are checked at the freeze.
Preserve 63bd, 90bd and their private evidence, plus this attempt's durable root:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/ed8330a766b3c4b80a505e075535678394e275e9/native-validation-2d`.

Web ed8330a; API and accepted native f94a1d9; production e1184ec unchanged.
One CI/Preview/API redeploy consumed in Phase W. Closed ledger: Places 92/100
(baseline 329; 8 unused, not reopened), emails 2/4, canaries 6/6 per provider,
fresh Gemini 0/0; backstop 429. September 30 unextended. AppHang acceptance remains
isolated-staging-only; these local results provide no historical hang clearance. N2, uploads,
CI, deployments, merges, live product requests, OTP/canary, resource/secret changes,
migrations, cleanup beyond the approved disposable caches, stores and cohort
activation remain gated.
