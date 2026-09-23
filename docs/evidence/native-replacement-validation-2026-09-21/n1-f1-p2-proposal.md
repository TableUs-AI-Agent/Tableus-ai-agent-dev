# F1-P2 — Settings probe with host process monitoring

**Prepared only; unapproved and unexecuted.** The [P1 result](n1-f1-p1-result.md)
is inconclusive because a monitor subprocess timed out while the second flow's
Settings commands completed. The revised monitor removes repeated simulator
control calls during automation. This is an operator amendment, not a demonstrated
fix for the earlier SpringBoard crash.

Proposed authority: **one additional run, at most three serial Settings flows,
300 seconds including cleanup**, on the existing disposable simulator
`CBB4FAB4-734C-413C-9F10-850329AC9A01`, iOS 26.5 (23F77), Maestro 2.8.0. Use the
same Settings launch/title/screenshot YAMLs byte-for-byte, 85-second per-flow cap,
five-second post-flow observation and 20-second cleanup reserve. No Settings
values change. No TableUs launch/build/install, backend, link/export run, cleanup
of stored artifacts or caches, runtime/toolchain change or automatic continuation.

Bind the target's SpringBoard PID through one simulator query before starting
Maestro. During the flows, read host process snapshots and compare SpringBoard
and its `launchd_sim` parent by PID, parent PID, start time and executable. Detect
replacement, disappearance, PID reuse, unexpected TableUs or a new crash. Other
simulators' processes are excluded by parent identity. No simulator-control call
is used by the active health observer. Keep the existing failure, interruption,
deadline and cleanup behavior. Stop on the first failure; do not retry.

The [structured proposal](n1-f1-p2-proposal.json) pins the archive, driver and
unchanged flows. The output must be fresh:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios-settings-platform-probe-02`.
Execution requires `TABLEUS_F1_P2_APPROVED=1`, exact operator/target preflight,
stopped TableUs/local services and at least 20 GiB free. Capacity fluctuated
during read-only checks; the latest observation was 21.95 GiB. No cleanup was
performed or is included in this proposal; recheck capacity before execution.

Synthetic checks cover the observed process format, PID reuse/replacement,
parent loss, another simulator, unexpected TableUs, deadline and refusal without
approval. Root reviewed the operator diff, matching YAML bytes, archive hashes
and syntax. No P2 native operation has run. A healthy result would mean these
three flows did not reproduce the crash; it would not explain O1, resolve the
original refresh failure/historical AppHang or authorize a TableUs replay.
