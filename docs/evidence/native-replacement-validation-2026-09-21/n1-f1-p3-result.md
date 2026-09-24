# F1-P3 — capacity preflight stopped execution

The [approved](n1-f1-p3-approval.json) frozen [P3 proposal](n1-f1-p3-proposal.md)
was invoked once on September 24, 2026, at 04:00:52 UTC (September 23 local).
It exited code 1 after **0.350 seconds**: **17.70 GiB** free was below the required
**20 GiB**. This is a storage preflight failure, not an XCTest or Settings result.

## Scope and accounting

- Proposal commit: `c3b62c34be3b316d867afefa5a276117835cd4ea`.
- Application: `8972865893a3f018a064594457dc9cc664f8a61f`;
  build operator: `16603dd0cf36d27b492e57a02d3c6c438a2563c4`, both unchanged.
- Frozen diagnostic manifest:
  `ea3ce98fb06d3fbcc5db8178691d0939a92a9ea0eac1b39820c7b7ecb199ec2e`.
- One operation invocation; **zero boots, control queries, Maestro attempts or UI
  flows**. No app install/launch, backend/proxy, deletion or cleanup mutation ran.
- The traceback and source place the failure before output-directory and result
  creation, before native actions. The proposed output remains absent. The retained
  launcher stderr and receipt are the failure record; no driver result is invented.

## Independent verification and retention

At 04:04:44 UTC, a separate read-only check confirmed target
`0EFFA766-DCDD-49E5-84B0-D3593B68709A` and both older TableUs targets Shutdown,
no matching probe processes, and ports 7999/8000/8001 idle. Capacity then measured
19.164 GiB, still below the gate. The fluctuation's cause is unknown; this later
reading does not replace the execution-time measurement.

Nine private files, including approval, launcher receipt, stdout/stderr, post-stop
verification and review/scripts, are hashed under `runtime-execution-p3` in the
existing durable F1 root. Index SHA-256:
`4951a403c56ecb4577e8c9d185944a8526fdfd1c2d22e5155b0c132e42e7eb5f`.
[Machine-readable result](n1-f1-p3-result.json) gives the absolute archive path,
exact identities, commands and counts. Astra reviewed source/traceback/accounting;
Luna independently confirmed them. Original proposal JSON and frozen archives
remain immutable.

Fresh checks cover evidence hashes, JSON, local links, unchanged source and the
post-stop observation. Preparation's nine mocked checks, parser replay and full
readiness pass (293 JavaScript / 98 backend Python; three skips) are reused for
unchanged executable bytes. No full suite or native test was repeated.

## Remaining work

P3 stopped at its first required failure; no automatic retry remains authorized.
The Settings startup hypothesis remains untested, and O5's initialization stall,
original refresh failure, O1/O2 crashes and AppHang remain unresolved. No new iOS
or TableUs acceptance follows. Existing downstream gates and budgets remain.

Next, prepare a storage recovery scope from read-only measurements. A limited
inventory found approximately 0.883 GiB in Xcode DerivedData, 0.435 GiB in this
worktree's frontend build output and 0.057 GiB in npm cache. These are allocated
sizes, not guaranteed reclaimed bytes or an approved deletion list; no files were
deleted. Cleanup needs a concrete reviewed scope and approval, followed by fresh
capacity verification and authorization for a new bounded native operation.
Native validation stays in this task as the owner requested.
