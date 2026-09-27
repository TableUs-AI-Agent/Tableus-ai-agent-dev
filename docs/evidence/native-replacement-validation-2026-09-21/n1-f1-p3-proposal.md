# F1-P3 — one Settings-only iOS 27 startup baseline

**Historical proposal: subsequently approved and invoked once; stopped at the
capacity preflight.** See the [execution result](n1-f1-p3-result.md). The original
proposal JSON remains immutable. [O5](n1-f1-o5-result.md)
never reached UI commands. [T1](n1-f1-t1-result.md) now provides startup
observation and bounded cleanup but does not fix the initialization stall.
This proposal asks whether the retained iOS 27 target can bootstrap the pinned
Maestro driver and complete one unchanged Settings flow without the offline
suite's TableUs reinstall, backend and fault-proxy setup.

## Evidence and hypothesis

Read-only correlation of retained logs establishes a narrower milestone gap:
O5 connected to testmanagerd, received capability/session replies, installed and
launched XCTest PID 58071, and printed `Running tests`. It then died before the
recorded driver HTTP-server/connection milestones. The control log's
`(result:error)` is a pair label followed by a capability object and `(null)`;
the companion session log explicitly reports `error: (null)` and continues
launching. Neither is evidence of a failed control-session reply.

The retained successful [P2](n1-f1-p2-result.md) first-flow log progresses from
`Running tests` at 23:36:04.909 on September 22 to its HTTP server listening at
23:36:07.333 and completed Settings launch at 23:36:09.439 (UTC−05:00). Its Settings
assertion completed at 23:36:17.494. Those startup logs are retained, although
there is no matching detailed testmanagerd reply in the inspected baseline logs.
P2 ran on iOS 26.5, a different target/time/workload; it supplies milestones,
not causal or iOS 27 acceptance evidence. Raw `BUILD INTERRUPTED` at persistent
runner teardown does not replace the recorded passing Maestro/UI/platform result.

O5's immediate termination remains the RunningBoard `XCTRunner Initialization`
assertion timeout, code `0x2182BAAD`. No retained runner stack establishes the
underlying stall. The proposed hypothesis is limited: **the same retained iOS 27
simulator can progress through XCTest bootstrap under a minimal Settings-only
workload.** T1's new diagnostic output layout/supervision also remains unverified natively.
This is a baseline experiment, not a claimed fix or a controlled
single-variable proof of the earlier failure's cause.

## Proposed operation

Use only retained iPhone 17 Pro target
`0EFFA766-DCDD-49E5-84B0-D3593B68709A`, iOS 27.0 build `24A434`, initially Shutdown.
Both older H1 targets must remain Shutdown. Require exact operator hashes, the
installed Maestro 2.8.0 launcher, newly pinned iOS-driver JAR and Xcode 27.0
(`27A266a`) version metadata, fresh private
output, idle test ports, no TableUs process and at least 20 GiB free before boot
and before the flow. Existing app/data and historical archives are preserved.
The new JAR pin does not establish historical JAR identity for P2/O5.

Boot at most once; perform one capped 30-second control bind and verify the host
SpringBoard/parent identity. Run **one** byte-identical P2 `settings-1.yml`:
launch Settings, assert its title and retain a screenshot. Do not install or
launch TableUs, start its backend/proxy, change Settings values, create/erase a
device, upgrade tools, repeat the flow or continue to another suite.

Maximum **420 seconds total including 60 seconds reserved for cleanup**. Require
a full **240-second flow window including 30 seconds for owned-process cleanup**
before starting Maestro. Work stops at 210 seconds; the final 30 are for cleanup.
The host process-query cap stays five seconds, with five seconds of post-flow
observation. These are proposed P3 limits: the old P2 host wrapper allowed only
85 seconds per flow. That wrapper cap is explicitly increased for this comparison
because O5's startup death was about 161 seconds after Maestro invocation; an
85-second cap would stop before that observed milestone. Built-in XCTest/Maestro
and flow assertion timeouts are unchanged. This proposal grants no execution.

Retain T1's per-flow registration, temp/debug output, stdout/stderr and failure
snapshots. The host monitor covers the bound SpringBoard/parent and unexpected TableUs;
it is not an all-service crash census. Observe XCTest before host monitoring; snapshot on failure before
stopping the child. Stop on the first startup, platform, UI, identity, capacity,
evidence or deadline failure/interruption. Cleanup targets only the owned
process group and freshly proven diagnostic collectors, then terminates Settings
if started and shuts down only the verified retained target. Preserve raw cleanup
outcomes; missing proof is incomplete cleanup, not success. All cleanup stays
inside the recorded deadlines; do not hide a timeout by continuing work.

## Interpretation and approval boundary

- **Same startup failure before UI:** the failure can occur under this minimal
  workload; TableUs execution and the offline services are not required for this
  recurrence. It still does not prove the OS, driver or host is the root cause.
- **Passing startup, flow and cleanup:** one minimal iOS 27 baseline succeeds.
  Intermittent platform behavior, device state and the omitted workload remain
  confounded. This neither clears O5 nor authorizes TableUs continuation.
- **Earlier preflight/host failure, different failure or missing evidence:**
  inconclusive for the bootstrap hypothesis. Stop and retain it; no retry.

The completed preparation receipt and exact executable/input hashes are recorded
in the [structured proposal](n1-f1-p3-proposal.json). Nine mocked tests and six
in-memory Python syntax checks pass under an audit hook forbidding real
subprocess/spawn/signal calls. A separate replay accepts the actual P2 command
record and screenshot under a synthetic registration; it is parser evidence only.
All 18 private archive files (447,462 bytes) were verified. The manifest SHA-256 is
`ea3ce98fb06d3fbcc5db8178691d0939a92a9ea0eac1b39820c7b7ecb199ec2e`;
archive-index SHA-256 is
`eb43139cd048081f485c4549b44c238446fb48ffb8db9786729942ee18a87aa3`.
Tracked application/tooling bytes and generated contracts are unchanged. A fresh
`make ready` passed once in 47.128 seconds: 293 JavaScript / 98 backend Python
tests, three PostgreSQL skips, lint/type checks, builds, smoke and report-only
bundle budget. `contract:check` passed without drift. Its separately retained
verification-index SHA-256 is
`6db57c0fbeed83fb801b5c967ff9d823c103c103372575b1f22343feff4fe8dc`.
No native command, signal or live provider call occurred during preparation. Future execution requires
explicit approval for this exact one-operation scope. O5 and all earlier attempts
remain consumed; no allowance, disk threshold or live-provider budget resets.
Application `8972865893a3f018a064594457dc9cc664f8a61f` and build operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4` remain frozen. Original refresh/O1/O2/
AppHang failures, iOS 27 application acceptance, links/exports, canonical/auth,
Android and N2 remain unresolved or gated.

The owner explicitly chose to keep native validation in this task on September
23. This is a preparation checkpoint, not completion of the native objective.
Start a fresh task with a compact exact-commit handoff once the objective is
complete or the owner explicitly requests an earlier move; do not copy the full
conversation. Existing authorizations, consumed attempts and unresolved failures
must travel with that handoff.
