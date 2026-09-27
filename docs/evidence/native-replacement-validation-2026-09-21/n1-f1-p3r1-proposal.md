# F1-P3-R1 — one Settings-only resumption

**Historical proposal: approved and executed once.** See the [reviewed result](n1-f1-p3r1-result.md);
original proposal JSON and invoked operator remain unchanged. [P3](n1-f1-p3-result.md) stopped at capacity
before boot or UI execution. [S2](f1-storage-s2-result.md) left 26.245 GiB
free at independent postcheck. Request one new invocation of the unchanged frozen
[P3 operator](n1-f1-p3-proposal.md) to test Settings bootstrap on the retained
iOS 27 target. This does not reset P3's consumed operation or test TableUs.

- One operation, one boot, one control query and at most one Maestro flow.
- **420 seconds total**, including 60 seconds final cleanup reserve; **240-second
  flow window**, including 30 seconds owned-process cleanup. Control query 30s,
  host query 5s and post-flow observation 5s. Fresh **20 GiB minimum** before boot
  and flow, unchanged. Stop at first failure, missing evidence, interrupt or cap.
- Exact retained device `0EFFA766-DCDD-49E5-84B0-D3593B68709A`, iOS27.0/24A434;
  it and both older targets must pass shutdown/identity checks. No device creation.
- Launch Settings without clearing state, assert its title with the unchanged
  5000ms timeout, retain one screenshot and exact five-command evidence.
- No TableUs install/launch, backend/proxy, tool upgrade, deletion, repeat or
  downstream action. Cleanup is restricted to proven owned processes, Settings
  termination if started, and exact-target shutdown with retained verification.

Frozen operator manifest:
`ea3ce98fb06d3fbcc5db8178691d0939a92a9ea0eac1b39820c7b7ecb199ec2e`; driver:
`f57a2135a1fd0870137b4edd3b14672d97d1e1bae153b2becd330f0b5573d80f`.
Application `8972865893a3f018a064594457dc9cc664f8a61f` and build operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4` remain unchanged. Original preparation's
nine mocks, retained parser replay and full readiness pass are reused; all 18
archive hashes were freshly verified. No source changes or new native proof.

The [machine-readable proposal](n1-f1-p3r1-proposal.json) binds command, approval
environment, tool pins, paths, limits and original proposal hash. The still-unused
`test-ios-settings-platform-probe-03` output must be absent at invocation. A new
`runtime-execution-p3r1` approval/launch record distinguishes this operation;
the unchanged driver internally labels results `F1-P3`. Preserve all original
preflight receipts and archives; bind any new output to this invocation explicitly.

A pass would establish only one Settings startup baseline; a failure remains a
diagnostic result, not a proven application cause. Existing O5/O1/O2/refresh/
AppHang failures, downstream gates and all provider budgets remain unchanged.
The [active packet](../../task-packets/active.md) requires approval for a new
bounded operation after a first-failure stop. No automatic retry follows.
