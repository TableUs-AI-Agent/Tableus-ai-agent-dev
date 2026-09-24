# C1 — version preflight timed out before boot

The owner approved the complete campaign at
`e3b0dbaf25cd480d262b693fef953499ddbd8699`. Its one Settings-stage invocation
stopped after **23.818 seconds** (launcher 25.282s):
`/opt/homebrew/bin/maestro --version` exceeded its 20-second preflight cap.
There were **zero simulator boots, Settings launches or Maestro UI tests**.
The conditional offline stage did not run; no TableUs reset/install, backend,
proxy or application/provider request occurred. C1 is closed by its first-failure
rule. Unused second-stage capacity is not permission to skip the failed stage.

The [approval](n1-f1-c1-approval.json) and [structured result](n1-f1-c1-result.json)
preserve exact identities and counters. Application source
`8972865893a3f018a064594457dc9cc664f8a61f`, build operator 16603dd and the
approved C1 operator archive remain unchanged. This is neither an app failure
nor evidence that the new target-binding/visual design works: those steps were
not reached. No screenshot, command records or XCTest evidence exists.

## Cleanup and evidence

Independent bounded checks confirmed all three retained simulators Shutdown,
no matching target/runner processes and idle ports 7999/8000/8001. A separate host
snapshot found no Maestro-version process or remaining process in the C1 driver's
group. Initial free capacity was 23.697 GiB; post-stop capacity 22.690 GiB is a
historical observation, not a future preflight. No device data or general storage
was deleted. Crash monitoring was not reached; an empty crash list does not prove
a crash-free interval.

Eighteen private files (276,241 bytes; no symlinks) are retained under
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/runtime-execution-c1`.
Retention-index SHA-256:
`86fa10822a71c4bc5a9c8a6af37ae89d113779f0b2e8a20fc8ce32d42c6ec4ce`.
All 56 frozen C1 preparation files still match their recorded hashes.

## Supported follow-through

The post-stop host had load averages 16.15/13.29/12.12 and 15,381.81 MiB of swap
used. Those observations do not locate or explain this command's stall.
The frozen exception handler did not retain partial command stdout/stderr, so
there is no evidence identifying the stalled initialization step.

Read-only inspection of the pinned launcher and CLI JAR did identify unnecessary
preflight work. The launcher first starts a Java-version helper, then the CLI.
In `AppKt.main`, analytics initialization, dependency unpacking and asynchronous
update-fetch scheduling precede version-help detection. `printVersion` ultimately
reads the local `version.properties` resource. The update-disable flag is checked
by the later update-display path; it does not guard the observed earlier fetch
scheduling call. This describes static call ordering, not proof a network request
completed during C1 or that it caused the timeout.

The supported local change is to verify that resource directly in the exact
hash-pinned JAR, avoiding an extra CLI initialization solely to identify its
version. Actual Maestro startup remains inside the instrumented UI flow with
retained logs. This is being prepared as C2 with unchanged assertions and native
limits; it is not a proven stall fix and does not authorize another invocation.
All original refresh, platform, AppHang and downstream acceptance gates remain.
