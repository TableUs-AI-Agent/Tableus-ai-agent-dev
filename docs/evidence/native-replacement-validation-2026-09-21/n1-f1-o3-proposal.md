# F1-O3 — controlled iOS 27 offline diagnostic

**Executed once; setup stopped before the offline runner.** See the [approval](n1-f1-o3-approval.json)
and [O3 result](n1-f1-o3-result.md).
The structured proposal remains the immutable pre-approval snapshot; the scope below is unchanged.
[O2](n1-f1-o2-result.md) reproduced O1's SpringBoard/XCTest accessibility crash
on iOS 26.5 after the first flow's UI commands. The prior original refresh failure
remains unresolved. Upstream review found no demonstrated targeted fix in newer
Maestro releases. This proposal changes the simulator runtime as a controlled
diagnostic variable; it does not claim iOS 27 fixes the issue.

## One bounded comparison

Authorize exactly one new disposable iPhone 17 Pro on the **already installed
iOS 27.0 runtime, build 24A434**, with name `TableUs-N1-F1-O3-iOS27-8972865`.
Record its newly created UUID before any install or launch. Preserve existing
devices and their data. Use application `8972865893a3f018a064594457dc9cc664f8a61f`,
build `local-ios-test-8972865-f1-01`, artifact
`98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`,
unchanged build operator `16603dd0cf36d27b492e57a02d3c6c438a2563c4`, and
**Maestro 2.8.0**. No application build, SDK/runtime download or tool upgrade.

Run the same eleven offline flows and five refresh phases at most once, retaining
all faults, UI assertions, request limits and observation timeouts. Only device,
approval/provenance bindings and durable-output paths change. Keep the exact proxy
bytes and deterministic/demo services, with live credentials and telemetry absent.
Maximum **35 minutes total**, including new-device setup and cleanup; the offline
runner remains capped at **30 minutes**, with cleanup time reserved inside the
limits. Require at least 20 GiB free before creation and again after boot/before
the runner, plus fresh artifact/receipt/source/operator checks, idle ports and
new output. Any failed preflight or command stops the operation.

Bind SpringBoard and its simulator parent once before the runner, then observe
host process identity and target crash reports without simulator polling during
flows. Stop at the first app/platform/behavior failure, unexpected traffic,
identity change, missing required evidence, interruption or deadline. No restart,
foreground workaround or automatic replay after failure. Preserve proxy counters
and the append-only journal before cleanup when possible. Stop owned services and
app; shut down only the newly created device, keeping its data and all evidence.

## Interpretation and continuation boundary

A pass is **diagnostic only**. It would establish that this one offline run
completed under the changed runtime. It would not explain the precise crash
cause, clear the 26.5 failures/AppHang, or transfer acceptance between OS versions.
Because the target also starts with fresh device state, this comparison alone
cannot attribute any changed outcome specifically to the OS version.
The existing D2/lifecycle results retain their original 26.5 device identity and
are not prerequisite proof for the new runtime. Artifact/source proof remains
reusable only for the same bytes; actual runtime behavior must remain distinct.

Stop for root evidence review after this attempt, even if it passes. No Settings
probe, LLDB/Hermes capture, lifecycle rerun, links, exports, physical-device check,
Android run, live evaluation, cleanup, deployment, merge or store action is added.
Existing downstream adapters must continue rejecting failed O2 and cannot accept
this diagnostic result. Any later native resumption needs an explicit proposal
covering the new target's remaining gates, rather than relabeling old reports.

The extra allowance is necessary because the owner-approved O2 scope retained the
first-failure stop and authorized only one run, which is now consumed. The
[structured proposal](n1-f1-o3-proposal.json) now pins the reviewed private
archive, all twelve component files, and its preparation receipt. The manifest
SHA-256 is `bf7532aa0502b694d7d0f5e2ee2d67806ceed21a3fa26f30d08c5863b9d15f25`;
driver SHA-256 is `b22976c7fa041ecf4ccba3b6529686aa5dbdd9c320a9e9ff83ee53d7222864ff`.

Sol prepared the operator; Astra reviewed and integrated it. Eleven mocked/static
checks pass, including pre-existing UUID protection, first-failure cleanup,
cancellation, deadlines and cleanup of the owned process group after its leader
exits. Python/Node syntax passes; the offline runner differs only in the approved
binding/provenance locations and the fault proxy is byte-identical. The bundled
artifact verifier and its original dependencies are also byte-identical. Luna's
read-only audit found no result/proposal boundary inconsistency. These are
preparation checks, not native observations. No new device or run exists; runtime
feasibility, disk growth and actual automation remain unverified.
