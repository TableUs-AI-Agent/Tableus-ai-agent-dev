# Active packet: native replacement validation (2d)

N1, N1-R and N1-R2 approved, **stopped on custom-scheme token corruption.**
One primary Astra agent; no delegation or canceled scans. Keep this objective in this task.

## Identities

- Base: `5b39d937b905691798a585b4aced79f91c7e97bf`.
- Branch: `codex/native-replacement-validation`.
- Worktree: `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev`.
- Previous task: `01a0c661-7b3f-7403-906c-0f60f60a3dd4`.
- Application: `ed8330a766b3c4b80a505e075535678394e275e9`.
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
All outputs, including interrupted Maestro logs, are retained; no app patch.

A new disposable iOS 26.5 simulator was booted and received the inspected app for
native/JS diagnostic capture. App terminated afterward; simulator retained. Original
accepted apps/sessions untouched. One iOS build attempt consumed; Android's single
attempt unused. D1's one diagnostic attempt is consumed. Current free disk
20.18 GiB is below Android's 40 GiB start gate.

## Next actions and stop conditions

[N1-R2](../evidence/native-replacement-validation-2026-09-21/n1-r2-resumption.md)
requires stopping at the first failure and excludes an automatic app patch.
That stop is in force. [N1-F1](../evidence/native-replacement-validation-2026-09-21/n1-f1-local-remediation.md)
is prepared, not approved: local custom-scheme token preservation plus regression
coverage through native-intent, extraction, active parser and hook/component
boundary. If approved, implement locally, run focused checks and make ready once,
freeze a new application SHA and prepare its impact/revalidation proposal. F1
includes no native build/retry. Do not rerun the unchanged candidate to green,
start exports, repeat lifecycle/offline/D1 or the consumed auth/join cases.

Canonical HTTPS auth/join, wrong-origin and web-only auth-confirm delivery remain
unverified: signed simulator entitlements are empty and no approved local forced
dispatch was established. The demo guard prevents sign-in-mode presentation.
Even a local fix would not complete N1; prepare a separate bounded solution for
this coverage gap and the changed candidate, without adding a build,
instrumentation or real auth automatically. Retain original crash/AppHang and
all time/stop limits. The failing synthetic plus case does not establish failure
of issued canonical HTTPS/URL-safe links or when the defect was introduced.

Android waits for the iOS gates and capacity. No additional cleanup is authorized.
Keep all attempts/artifacts/private logs. N2 remains a separate future approval
for two readiness builds and in-place staging updates; live-read/passive telemetry
scope must be explicit. No fresh provider/OTP/canary allowance exists.

## Verification and boundaries

Fresh artifact/source/receipt/symbol/map checks and diagnostic logs are linked
above. Auxiliary retention/link harnesses have separate private hashes; the
application and committed executable operators are unchanged. Reuse 2c's
24 fixtures, make ready 244 JS / 98 Python
(three PostgreSQL skips), and contract drift. Documentation links/JSON/diff checked.
Preserve 63bd, 90bd and their private evidence, plus this attempt's durable root:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/ed8330a766b3c4b80a505e075535678394e275e9/native-validation-2d`.

Web ed8330a; API and accepted native f94a1d9; production e1184ec unchanged.
One CI/Preview/API redeploy consumed in Phase W. Closed ledger: Places 92/100
(baseline 329; 8 unused, not reopened), emails 2/4, canaries 6/6 per provider,
fresh Gemini 0/0; backstop 429. September 30 unextended. AppHang acceptance remains
isolated-staging-only; this debugger capture is not a hang diagnostic. N2, uploads,
CI, deployments, merges, live product requests, OTP/canary, resource/secret changes,
migrations, further cleanup, stores and cohort activation remain gated.
