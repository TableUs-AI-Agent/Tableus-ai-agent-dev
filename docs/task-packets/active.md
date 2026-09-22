# Active packet: native replacement validation (2d)

N1-F1 approved; **local token remediation complete; candidate 8972865 frozen.**
N1 native execution remains stopped after the R2 token-corruption failure.
One primary Astra agent; no delegation or canceled scans. Keep this objective in this task.

## Identities

- Base: `5b39d937b905691798a585b4aced79f91c7e97bf`.
- Branch: `codex/native-replacement-validation`.
- Worktree: `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev`.
- Previous task: `01a0c661-7b3f-7403-906c-0f60f60a3dd4`.
- Prior native application: `ed8330a766b3c4b80a505e075535678394e275e9`.
- Frozen F1 application: `8972865893a3f018a064594457dc9cc664f8a61f`.
- Actually invoked build operator: `16603dd0cf36d27b492e57a02d3c6c438a2563c4`.
- Build: `local-ios-test-ed8330a-2d-01`; artifact/receipt/source/symbol hashes in
  [checkpoint](../evidence/native-replacement-validation-2026-09-21/n1-ios-checkpoint.json).
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
No native build/replay occurred during F1.

A new disposable iOS 26.5 simulator was booted and received the inspected app for
native/JS diagnostic capture. App terminated afterward; simulator retained. Original
accepted apps/sessions untouched. One iOS build attempt consumed; Android's single
attempt unused. D1's one diagnostic attempt is consumed. Current free disk
roughly 21 GiB is below the 40 GiB native build start gate.

## Next actions and stop conditions

F1 local implementation, verification, exact candidate freeze and
[impact/revalidation proposal](../evidence/native-replacement-validation-2026-09-21/n1-f1-native-revalidation.md)
are complete. Next bounded action is resolving the 40 GiB capacity gate and
approving an exact-candidate native scope; F1 includes no native build/retry.
Keep the native stop in force:
do not start exports, replay ed8330a or reuse its passing checks for new bytes.

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

Android waits for the iOS gates and capacity. No additional cleanup is authorized.
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
isolated-staging-only; this debugger capture is not a hang diagnostic. N2, uploads,
CI, deployments, merges, live product requests, OTP/canary, resource/secret changes,
migrations, further cleanup, stores and cohort activation remain gated.
