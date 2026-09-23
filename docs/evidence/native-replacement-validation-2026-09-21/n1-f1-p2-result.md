# F1-P2 — Settings-only probe passed

The [approved P2 probe](n1-f1-p2-approval.json) completed all **three Settings
flows in 130.308 seconds**. Each flow exited zero, retained its completed command
record and screenshot, and passed the five-second post-flow observation window.
Root visually checked the final Settings screenshot. There was no observed
SpringBoard restart, new SpringBoard/TableUs crash, or TableUs launch.

The host observer recorded 105 successful samples. SpringBoard PID 17600 and
its `launchd_sim` parent PID 94306 retained their PID, parent, start-time and
executable identities. Host process queries took a median 0.185 seconds and
maximum 1.203 seconds in this run. These are monitoring measurements, not app UI
performance or proof that polling caused P1's timeout.

Settings cleanup returned zero. Final health and a later host-only inventory
confirm the same simulator process identities, Settings/TableUs stopped, no
matching automation process, free ports 7999/8000/8001 and no late matching
crash-file appearance. No additional app, simulator, cache or toolchain action
was taken. P2's single run allowance is consumed.

The [structured result](n1-f1-p2-result.json) binds all private evidence. Exact
P2 driver SHA-256:
`25dac7bf07a2892ab9e079d345b975491c28eadc276f714e176ba28da286219c`.
Evidence base: `64d4e18e4b0d13ab4002de08997085593e8e604a`.
Frozen application `8972865893a3f018a064594457dc9cc664f8a61f` and build operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4` are unchanged; this Settings-only probe
did not run TableUs or a build. Fresh preflight verified the pinned operator
archive/wrapper, intended booted iOS 26.5 (23F77) target, Settings 1353.5.5,
stopped TableUs/services, absent output and 20.82 GiB free capacity.

Private output:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios-settings-platform-probe-02`.
All three Maestro command records and screenshots, stdout/XCTest/device logs,
incremental host observations, cleanup and approval/preflight are retained.
Fresh checks cover hashes, approval/source associations, JSON/links and operator
preparation. Application/tracked tooling bytes are unchanged, so reuse exact
[8972865 verification](n1-f1-result.md): 292 JavaScript and 98 Python tests, three
PostgreSQL skips; no full-suite rerun or compilation for this evidence checkpoint.

This establishes only that these three Settings flows completed with the revised
observer. It does not explain or clear O1's SpringBoard crash, P1's monitor timeout,
the original TableUs refresh failure or historical AppHang. TableUs offline,
custom links, exports and cumulative N1 acceptance remain incomplete.

The prepared [O2 amendment](n1-f1-o2-proposal.md) returns to the original offline
diagnostic with durable request counters and host platform monitoring. Its one
additional offline run requires approval. Conditional link/export continuation
retains the original limits and first-failure stop; P2 itself authorizes none.
