# F1 runtime result — stopped during offline refresh

Recorded September 22, 2026 local time (September 23 UTC). The approved D2 capture
passed, then the authorized lifecycle ran once and passed all seven flows in
526.029 seconds. The offline/refresh runner ran once and stopped at its first
failure after 483.490 seconds. No F1 links or Account export cycles ran.
[Machine evidence and 147 private file hashes](n1-f1-runtime-result.json).

## Exact identities

- Application/runtime-runner source: `8972865893a3f018a064594457dc9cc664f8a61f`.
- Build operator: `16603dd0cf36d27b492e57a02d3c6c438a2563c4`.
- Build: `local-ios-test-8972865-f1-01`.
- Artifact: `98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`.
- Disposable iOS 26.5 simulator: `CBB4FAB4-734C-413C-9F10-850329AC9A01`.
- Evidence base: `19f4f8b271f0e8deb44a746db1ec7a13f97e460d`; the commit containing
  this record is an evidence checkpoint, not a changed application candidate.
- Private root: `/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1`.

## Passed evidence

[D2 proof](n1-f1-d2-result.md) retains 8,661 runtime samples, 1,644 frames, actual
native frame resolution and exact source-map matching. Its extra allowance is
consumed; earlier diagnostic failures remain unresolved.

The complete lifecycle summary binds the exact artifact, build and simulator.
It records two participants, four candidates, Sakura Table as winner, organizer
reopen, rotated-link rejection and stale-run clearing. All seven flow results
are retained under `test-ios-lifecycle`.

Nine offline flow command records passed: create failure/retry, constraints
failure/retry, finalize failure/retry, refresh open, scroll and delayed refresh.
The refresh journal records both immediate and settled observations for three
phases: initial read one request, scrolling zero requests, delayed refresh one
request. All three record zero writes; delayed refresh records one delayed
response. The full offline summary was never produced, so these partial results
do not constitute a passed offline gate.

## Stop and uncertainty

The tenth flow, `refresh-failure`, completed its enabled Refresh plan tap in
2,008 ms, then failed after 30,679 ms waiting for `Fixture refresh unavailable.`.
These are automation-command durations, not measurements of a native main-thread
stall. The retained screenshot and hierarchy show the cached plan with the enabled
Refresh plan control and no expected error. The final refresh-recovery flow did
not run. Runner exit 1 is retained, with no automatic retry.

The failing phase's request counters were not persisted: the native runner's
`runFlow` throws before `observe("failed_refresh")`, and the proxy holds counters
in memory before cleanup. Therefore this attempt cannot establish how many
requests consumed the three configured synthetic errors, whether the tap sent
a read, or whether application error presentation failed. A tap command marked
completed does not prove a request occurred. Neither a product regression nor a
harmless harness failure is established.

Root terminated only the disposable app (exit 0); no matching process remained.
Initial and delayed checks found no new TableUs crash report. Loopback ports
7999/8000/8001 were free at 03:19:59 UTC. All failure logs, commands, hierarchy,
screenshot and partial refresh counters remain in private storage. 26.19 GiB
was free; no further cleanup was performed.

## Remaining work

The approved [first-failure stop](n1-f1-native-revalidation.md) is in force.
The [prepared F1-O1 amendment](n1-f1-offline-amendment.md) adds durable
request/control and failure counters before one proposed additional native attempt. Keep the same artifact,
flow assertions, fault counts and time limits; do not retry merely to obtain a
pass. Links and the two exports retain their ordered prerequisites. Android,
canonical/auth/physical checks and N2 remain gated. Existing live budgets,
accepted installations and deployments are unchanged. No cumulative replacement
acceptance or historical AppHang/crash clearance is claimed.
