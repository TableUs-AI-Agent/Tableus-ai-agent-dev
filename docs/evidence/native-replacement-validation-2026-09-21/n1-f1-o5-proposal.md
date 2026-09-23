# F1-O5 — offline diagnostic after the two older simulators were shut down

**Preparation only; no approval or execution.** [H1](n1-f1-h1-result.md) completed
the two exact older-target shutdowns and three host queries. It supplies resource
observations, not proof that O4's host timeout is fixed. [O4](n1-f1-o4-result.md)
remains a failed attempt with no retained UI execution.

## One proposed conditional operation

Use only the retained, initially Shutdown iPhone 17 Pro / iOS 27.0 (24A434) target
`0EFFA766-DCDD-49E5-84B0-D3593B68709A`, named `TableUs-N1-F1-O3-iOS27-8972865`.
No device creation, erasure, deletion, other-device operation or runtime download.
Require both older H1 targets to be verified Shutdown before boot and again
before the offline runner. Bind the actual H1 and previous O3/O4 evidence by hash.

Recheck the clean detached application `8972865893a3f018a064594457dc9cc664f8a61f`,
build `local-ios-test-8972865-f1-01`, artifact
`98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`,
build operator `16603dd0cf36d27b492e57a02d3c6c438a2563c4`, pinned local tools
and Maestro 2.8.0. Require fresh 20 GiB free before boot and before the runner,
idle ports 7999/8000/8001, and a capped preboot host process query.

Boot the retained target at most once. The runner's existing device preflight
will require an already-booted device (`--boot false`), closing a possible second
boot path if the device stops between driver and runner checks. No automatic reboot.
Run at most one measured 30-second control query; require actual exit 0, a unique
SpringBoard PID, matching host parent and healthy observation before UI work.

Only if every prerequisite passes, run the same eleven offline flows and five
refresh phases once. Preserve all behavioral assertions, fault counts, request
limits and UI timeouts. The host monitor retains its five-second cap. The only
runner changes are O5 bindings, the stricter single-boot preflight and a private
journal of setup/flow command starts and outcomes. Journal failure stops work;
partial starts remain failure evidence. The existing best-effort preparatory
uninstall remains best effort, with its outcome now recorded. No new retry or
ignored failure is introduced.

Maximum **35 minutes total**, including preflight, boot, control, runner and
cleanup. The runner remains capped at **30 minutes**, including its 30-second
cleanup reserve; the total reserves 60 seconds for cleanup. Stop on the first
failed required command or platform/app/behavior/traffic/identity/evidence gate,
interruption or deadline. Stop owned processes, terminate the app if its runner
started, shut down only the verified O5 target and preserve all evidence/data.

## Result and boundary

A pass requires all eleven flow records, all five refresh phases, completed
setup-command evidence, unchanged vote checks, required request observations and
successful platform/cleanup gates. It would be diagnostic evidence on this target
only. H1, O3/O4 and iOS 26.5 D2/lifecycle results do not substitute for those checks.
The original refresh error, O1/O2 XCTest crashes and historical AppHang remain
unresolved unless separately established evidence addresses them.

No downstream continuation, lifecycle replay, Settings probe, LLDB/Hermes
capture, links, exports, Android, physical-device work, app build, upgrade,
provider use, deployment, merge, store action or destructive cleanup is included.
Deterministic/demo services and telemetry-off configuration remain required.

The [structured proposal](n1-f1-o5-proposal.json) pins the reviewed archive and
focused preparation checks: nineteen Python mocked tests, five Node journal
cases, six Python and three Node syntax checks pass. These checks do not execute
the proposed operation. Manifest SHA-256:
`cd72d3a6815f746581775a2c9b6a18a43d135105bab8a39b5ff0bb4ea35a643f`.
Driver SHA-256:
`6a7a70b45aca3a2735162fe73da81359067c7cff83c69b17e886551c5ca3a296`.

New approval is required because O4's first-failure stop consumed its one
operation and H1 explicitly authorizes zero offline attempts. Approval would
cover the complete conditional O5 operation without another confirmation between
its passing prerequisite checks and the offline runner.
