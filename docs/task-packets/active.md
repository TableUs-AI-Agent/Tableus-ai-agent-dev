# Active packet: native replacement validation (2d)

N1 approved. **iOS built; validation incomplete.** One primary Astra agent;
no delegation or canceled scans. Keep this objective in this task.

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

[Execution details and limits](../evidence/native-replacement-validation-2026-09-21/n1-checkpoint.md).
Approved named storage cleanup completed; after the additional approved Cursor
cache deletion, 41.31 GiB passed the build start floor. iOS compiled, passed
inspection/receipt export, retained diagnostics without missing families/errors.
Executable/dSYM UUIDs match; a captured app frame resolves independently to
AppDelegate.swift:18. Map retains 46 matching app/decoder sources; runtime JS-frame
resolution is not yet demonstrated. One debugger option error was corrected;
both logs retained. No lifecycle/offline/link/export journey has run.

A new disposable iOS 26.5 simulator was booted and received the inspected app for
native frame capture. App terminated afterward; simulator retained. Original
accepted apps/sessions untouched. One iOS build attempt consumed; Android's single
attempt unused. Current free disk 29.56 GiB is below Android's 40 GiB start gate.

## Next actions and stop conditions

N1 approval persists; do not request it again. Establish a bounded local method
to capture an app-owned JS frame without changing application bytes or enabling
telemetry, then verify its composed map resolution. The existing explicit error
emitter is a gated telemetry canary, not a local diagnostic outlet. If application
instrumentation is needed, prepare a concrete candidate/scope amendment first;
no automatic rebuild. Do not weaken the symbol gate or claim synthetic frames
prove runtime usability. Then run the approved bounded iOS behavioral checks.

Android waits for the iOS gates and capacity. No additional cleanup is authorized.
Keep all attempts/artifacts/private logs. N2 remains a separate future approval
for two readiness builds and in-place staging updates; live-read/passive telemetry
scope must be explicit. No fresh provider/OTP/canary allowance exists.

## Verification and boundaries

Fresh artifact/source/receipt/symbol/map checks are linked above. No application
or executable operator changes; reuse 2c's 24 fixtures, make ready 244 JS / 98 Python
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
