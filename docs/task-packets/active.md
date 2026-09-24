# Active packet: native replacement validation — P3 preflight stopped

Native validation remains **incomplete**. T1 operator preparation is complete;
P3 was approved and invoked once, then stopped before native actions because
17.70 GiB free was below its 20 GiB gate. No retry is authorized. The owner explicitly chose on 2026-09-23 to keep native validation
in this task. Start the next task with a compact exact-commit handoff after this
objective completes, or move earlier only at the owner's explicit request.
[Prior phase narrative](../history/2026-09-23/native-validation-before-p3.md) is
historical context; retrieve only evidence needed for a concrete question.

## Exact identities

- Branch/worktree: `codex/native-replacement-validation` /
  `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev`.
- P3 preparation base / completed T1 tooling:
  `3505c301ebfc4f1354b9b83a88ebc6f6e7feafd7`.
- Frozen application: `8972865893a3f018a064594457dc9cc664f8a61f`.
- Invoked build operator: `16603dd0cf36d27b492e57a02d3c6c438a2563c4`.
- Build: `local-ios-test-8972865-f1-01`; artifact SHA-256:
  `98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`.
- Retained target: `0EFFA766-DCDD-49E5-84B0-D3593B68709A`, iPhone 17 Pro,
  iOS 27.0 / `24A434`; confirmed Shutdown by P3 post-stop check at 2026-09-24 04:04:44 UTC.
- Durable private root:
  `/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1`.
- Application, build operator, diagnostic operator and evidence commits are
  distinct. The saved root checkout is stale; do not use it as implementation base.

## Current evidence

- [F1](../evidence/native-replacement-validation-2026-09-21/n1-f1-native-result.md)
  built and passed artifact/symbol/source inspection. iOS 26.5 D2 runtime proof
  and seven lifecycle flows passed. The original offline run passed nine flows
  then failed a refresh-error assertion; its cause remains unresolved.
- O1/O2 reproduced SpringBoard/XCTest accessibility crashes on iOS 26.5. P2
  passed three Settings flows on that OS only. O3/O4 stopped on setup/control
  failures; H1 shut down both older targets without deleting their data.
- [O5](../evidence/native-replacement-validation-2026-09-21/n1-f1-o5-result.md)
  installed the app but failed before UI commands or recorded TableUs traffic.
  RunningBoard killed XCTest for an expired initialization assertion
  (`0x2182BAAD`). The underlying stall is unproved. Root verified owned-collector
  cleanup, target Shutdown and idle ports; all diagnostics remain retained.
- [T1](../evidence/native-replacement-validation-2026-09-21/n1-f1-t1-result.md)
  adds startup-failure detection, durable snapshots and exact-owner cleanup.
  Its private CLI entry points are disabled. All readiness targets passed:
  293 JavaScript / 98 backend Python tests, three PostgreSQL skips; 13 helper
  cases, 25 operator mocks, five journal cases and an O5 file replay also pass.
  Reuse these for unchanged bytes; no new native compatibility is established.

## Bounded next action

The [P3 result](../evidence/native-replacement-validation-2026-09-21/n1-f1-p3-result.md)
records one 0.350-second driver invocation at preparation commit
`c3b62c34be3b316d867afefa5a276117835cd4ea`; zero boots, control queries or Maestro
attempts. Its capacity gate failed before output creation. Independent read-only
verification confirmed all three targets Shutdown, no matching processes and
idle test ports. Later capacity was 19.164 GiB, still below the 20 GiB gate.

Next prepare a concrete storage recovery scope through read-only assessment.
Do not delete retained evidence, simulator data or source worktrees. Destructive
cleanup and a new bounded native operation need explicit approval; no retry or
downstream continuation follows from the unused boot/flow counts. The frozen
P3 operator and original proposal JSON remain immutable. Startup hypothesis and
previous native failures remain unresolved. Reuse unchanged preparation checks;
this execution/evidence checkpoint needs no full-suite rerun.

Astra owns orchestration, review and final acceptance; Sol handles bounded
implementation and Luna read-only support. Preserve application bytes, existing
archives, stored sessions, old worktrees and private logs. Canceled security
scans remain canceled. Validate according to impact in the development workflow.

## Preserved gates and budgets

All earlier native allowances, including O5 and the P3 preflight operation, are consumed at their first-failure
stops. **No native retry remains.** A new task or delegate resets nothing. Any
new operation needs its exact approved attempt/time/disk/cleanup limits; do not
silently increase limits, weaken assertions or relabel older evidence.

Original refresh/O1/O2/AppHang failures remain unresolved. iOS 26.5 acceptance
does not transfer to iOS 27. Remaining iOS application checks, links and two
exports, canonical HTTPS/auth-mode/physical association probes, and N2 remain
gated. Android requires all preceding iOS gates and fresh 40 GiB capacity.
N2 requires separate approval for two readiness builds and in-place staging
updates with explicit live-read/passive-telemetry scope.

Web `ed8330a`; API/accepted native `f94a1d9`; production `e1184ec` unchanged.
Closed ledger: Places **92/100** (baseline 329; eight unused, not reopened), emails
**2/4**, canaries **6/6 per provider**, fresh Gemini **0/0**, backstop 429.
September 30 is unextended; AppHang acceptance is isolated-staging-only.
No merge, CI/upload/deployment, cloud/secret changes, paid evaluation, live product
requests, OTP/canary, migration, store/cohort activation or further destructive
cleanup is granted. Retain 63bd native evidence, 90bd Phase W evidence and all
current attempt artifacts. No cumulative replacement acceptance is claimed.
