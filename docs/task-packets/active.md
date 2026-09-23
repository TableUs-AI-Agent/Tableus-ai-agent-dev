# Active packet: native replacement validation (2d)

N1-F1 approved; **candidate 8972865 built; D2/lifecycle and P2 Settings probe passed; O1/refresh failures unresolved; O2 approved, blocked before execution by disk capacity.**
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
including conditional cold/warm links and exactly two exports. The read-only
preflight stopped at 19.37 GiB, below 20 GiB, before any native operation; the
single O2 allowance remains unused. The separately approved two-cache cleanup
completed with 1.444 GiB observed gain, but free space had fallen before deletion;
repeated preflight measured 18.77 GiB (19.78 GiB later), still below 20 GiB. The
[storage follow-up](../evidence/native-replacement-validation-2026-09-21/n1-f1-o2-storage-followup.md)
prepares removal of one idle older iOS 26.6.1 system-support cache (5.685 GiB)
for separate approval. Preserve current support, app symbols and retained evidence.
After approved cleanup, repeat fresh preflight and complete O2 and successful
downstream phases under the existing authorization, with root review and
first-failure stops. No native/link/export operation has run in this continuation.
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
