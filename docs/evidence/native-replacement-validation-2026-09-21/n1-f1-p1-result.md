# F1-P1 — inconclusive after monitor timeout

The [approved Settings-only probe](n1-f1-p1-approval.json) stopped after **84.869
seconds**. Its first flow passed. During the second flow, the monitor's
`simctl spawn <target> launchctl list` subprocess exceeded its eight-second bound.
The driver stopped the active Maestro process group; it did not run a third flow.
The one approved P1 run is consumed. No TableUs run or subsequent validation was
started. [Structured evidence](n1-f1-p1-result.json) retains the exact identities,
commands, timings and private-file hashes.

Both attempted Settings flows completed their launch, title assertion and
screenshot commands. The second flow was interrupted before a passing process
exit and the post-flow observation window could establish acceptance. It must
not be counted as a successful probe flow solely because its screenshot exists.

Times below are UTC on September 23 (September 22 in Chicago):

| Time | Observation |
| --- | --- |
| 04:23:02.640 | Flow 1 accepted after its post-flow observation window. |
| 04:23:03.225 | Flow 2 invoked once. |
| 04:23:31.736 | Last successful monitor sample: SpringBoard 17600, TableUs absent, no new crash. |
| 04:23:39.444 | Flow 2 Settings title assertion completed. |
| 04:23:40.597 | Flow 2 screenshot completed; root visually confirmed the Settings screen. |
| 04:23:40.748 | Monitor raised its eight-second subprocess timeout. |
| 04:23:47.639 | Cleanup and final record completed; total 84.869 seconds. |

The monitor stall overlapped active UI work; the evidence does not establish a
teardown cause. Repeated simulator control calls are a possible source of
contention, not a proven cause. All 42 successful observations and final health
retain SpringBoard PID 17600. No new SpringBoard/TableUs crash was observed.
Settings termination returned zero; the active Maestro process group required
SIGKILL after gentler signals. A later host-only process/port/report check found
Settings/TableUs absent, no matching automation process, ports 7999/8000/8001 free and
no late matching crash report. No other simulator was modified.

The exact approved P1 driver hash is
`ac2196d0d0709010abd24f6fabeb34cbe25a980ab31a71a22f73fbcf8b4d37e0`.
The frozen application remains `8972865893a3f018a064594457dc9cc664f8a61f` and the
build operator remains `16603dd0cf36d27b492e57a02d3c6c438a2563c4`; neither was
invoked by this Settings-only probe. Evidence base is
`01cac2b802ce0615d1fdd95694185d522a42384f`. Preflight confirmed the approved
operator/retention-wrapper hashes, simulator/runtime, installed Settings version,
stopped TableUs, free local ports and 20.03 GiB available capacity.

Fresh checks verified private hashes, approval bindings, local documentation
links/JSON, the P2 operator diff and synthetic monitor cases. Application and
tracked tooling bytes are unchanged; reuse [8972865 verification](n1-f1-result.md)
(292 JavaScript tests, 98 Python tests, three PostgreSQL skips) without another
full suite or build for this evidence checkpoint.

All logs, both screenshots, command records, observations, approval/preflight and
post-stop inventory are retained under
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios-settings-platform-probe-01`.
This result does not reproduce or clear the O1 SpringBoard crash, establish an
application regression, resolve the original refresh failure or historical
AppHang, or satisfy an offline/link/export gate.

The prepared [P2 amendment](n1-f1-p2-proposal.md) replaces repeated simulator
control calls with host process observation. It preserves the UI flows, assertions,
stop rules and five-minute limit. It is unexecuted and requires a separate run
allowance; it does not extend P1 or reopen TableUs testing.
