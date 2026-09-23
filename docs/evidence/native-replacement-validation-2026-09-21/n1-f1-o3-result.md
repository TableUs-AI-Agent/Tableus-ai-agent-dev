# F1-O3 — simulator setup stopped before any app test

**The approved O3 operation failed after 143.997 seconds. No offline runner,
app installation or app launch occurred.** The [approval](n1-f1-o3-approval.json)
retained the first-failed-command stop. One device-create request was used; zero
offline flows or refresh phases ran. The unused runner portion does not authorize
continuing the failed operation. The [structured result](n1-f1-o3-result.json)
pins the raw driver, invocation, logs, reports and independent cleanup checks.

The exact approved archive ran once. Fresh artifact/receipt/source/UUID/map proof
passed for application `8972865893a3f018a064594457dc9cc664f8a61f`, build
`local-ios-test-8972865-f1-01`, artifact
`98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`,
using unchanged build operator `16603dd0cf36d27b492e57a02d3c6c438a2563c4`.
Maestro 2.8.0's version check passed; Maestro automation never started.

The new iPhone 17 Pro target is `0EFFA766-DCDD-49E5-84B0-D3593B68709A`, named
`TableUs-N1-F1-O3-iOS27-8972865`, on installed iOS 27.0 (24A434). Capacity passed
at 24.84 GiB before creation and 23.58 GiB after boot. Its first boot-status record
finished after 116 seconds, including 99.33 seconds of successful data migration.

## What stopped

The initial `simctl spawn <target> launchctl list` exceeded its eight-second cap
before SpringBoard/parent identity could be bound. No host health observation or
offline-runner PID was recorded. The retained CoreSimulator excerpt shows:

| September 23, local UTC−05 | Observation |
| --- | --- |
| 00:52:21 | The simulator client requested the `launchctl list` process |
| 00:52:29 | It acknowledged spawn of PID 46040 at the timeout boundary, then disconnected |
| 00:52:30–38 | Best-effort app termination also exceeded its eight-second cap |
| 00:52:38 | Shutdown requested |
| 00:52:43 | Shutdown confirmed; driver finished failed |

Process creation does not establish query completion: no successful exit or
query output was retained. The evidence localizes this failure to simulator
control after first boot, before any TableUs operation. It does not prove that a
larger cap fixes the delay or identify its underlying cause.

Five delayed reports concern `logd`, `logd_helper`, `contactsd`, `nsurlsessiond`
and `assistantd`, with SIGKILL / `LIBXPC XPC_EXIT_REASON_SIGTERM_TIMEOUT` during
shutdown. They differ from O1/O2's SpringBoard XCTest crash signature. Their timing
does not establish a cause for the preceding query timeout. No target TableUs or
SpringBoard report was found in the post-stop inventory.

## Cleanup and next boundary

Independent checks confirm the retained target is Shutdown, its recorded parent
and query processes are absent, and ports 7999/8000/8001 are idle. The raw driver
still records the failed terminate check; shutdown evidence establishes cleanup
without relabeling that command as successful. Device data and all evidence remain.

This run provides no comparison of TableUs behavior across iOS versions. O1/O2,
the original refresh failure and historical AppHang remain unresolved. Links,
exports, Android, live providers, builds, upgrades and deployments did not run.
The [O4 proposal](n1-f1-o4-proposal.md) prepares a conditional continuation on the
retained target: first require one measured, completed control query, then permit
the unchanged offline run only if all gates pass. It requires a new allowance;
no O4 native action has occurred.

Fresh checks cover archive/provenance, 17 retained result-file hashes, the eight
closeout files, log/crash/process reconciliation and four synthetic parser checks.
The independent read-only audit confirms operation-used/runner-unused accounting.
Reuse the unchanged application's 292 JavaScript and 98 Python passes, with three
PostgreSQL skips. Application and tracked executable tooling are unchanged; no
full-suite rerun is needed for this evidence checkpoint.
