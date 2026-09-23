# F1-O4 — measured simulator control before conditional offline comparison

**Preparation only; no approval or native execution.** [O3](n1-f1-o3-result.md)
stopped before any app operation: its control process was spawned at the
eight-second timeout boundary, but query completion was not established. This
proposal measures that exact control step with a bounded larger allowance before
allowing the offline comparison. It does not claim the simulator problem is fixed.

## One conditional operation

Reuse only the retained, initially Shutdown simulator
`0EFFA766-DCDD-49E5-84B0-D3593B68709A`, named `TableUs-N1-F1-O3-iOS27-8972865`,
iPhone 17 Pro on installed iOS 27.0 (24A434). Verify identity and O3 provenance
before any mutation, boot it once, and retain its data afterward. No device
creation, erasure, deletion, other-device operation, tool upgrade or runtime download.

Require the same application `8972865893a3f018a064594457dc9cc664f8a61f`, build
`local-ios-test-8972865-f1-01`, artifact
`98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`,
build operator `16603dd0cf36d27b492e57a02d3c6c438a2563c4` and Maestro 2.8.0.
Fresh artifact/source/tool checks, idle test ports and at least 20 GiB free before
boot and again before the offline runner remain mandatory.

Run exactly one initial `simctl spawn <target> launchctl list`, capped at
**30 seconds**, retaining command, timing, stdout, stderr and exit/timeout. A pass
requires a successful completed command, a unique SpringBoard PID and matching
host parent identity, plus a healthy host observation. Partial output, process
creation alone or a timeout cannot satisfy that gate. No second query or retry.

Only if that control gate and all prerequisites pass, run the same eleven offline
flows and five refresh phases once. Keep all faults, UI assertions, request limits
and UI/observation timeouts unchanged. The proxy remains byte-identical, using
deterministic/demo services with telemetry and live credentials absent.

Maximum **35 minutes total**, including preflight, boot, control query and cleanup;
offline runner maximum **30 minutes**, with cleanup reserves inside both limits.
Stop on the first failed command, control/platform/app/behavior/evidence check,
unexpected traffic, interruption or deadline. Stop owned processes and app, shut
down only this verified target, and preserve all output. Never overwrite O3.

## Interpretation

Even a pass is diagnostic only. Reusing the already-created device omits its
original first-boot migration and changes its initial state. A completed control
query does not establish XCTest stability; an offline pass would not explain
O1/O2, clear the original refresh failure/AppHang, transfer old D2/lifecycle proof,
or establish replacement acceptance.

There is no automatic replay or downstream continuation. No separate Settings
probe, lifecycle rerun, LLDB/Hermes capture, links, exports, physical-device test,
Android, live evaluation, build, deployment, merge, store action or destructive
cleanup is included. Root reviews the retained result after this one operation.

The [structured proposal](n1-f1-o4-proposal.json) pins twelve component files in
the durable private archive. Manifest SHA-256:
`3a68a084804e0f39db995e3f62e3f22c71df75463e7518d1993fba2579c912cf`.
Driver SHA-256:
`46eeb4ea7d35eaabeb4d05c9cb9b50f71cf260e6401e6eabbfc9416b2d702096`.
Thirteen mocked/static preparation checks and Python/Node syntax pass. They
verify timeout/partial-output retention, rejection of late results, blocked
runner launch after failed control or host binding, exact-target-only cleanup,
unchanged runner assertions/proxy, and reused process-group cleanup. No O4 native
operation has run; the larger query allowance remains an untested measurement.

A new allowance is required because O3's first-failure stop ended its single
operation even though its conditional offline runner never started. The proposed
approval covers both the control gate and its conditional offline run, with no
additional confirmation between them if every prerequisite passes.
