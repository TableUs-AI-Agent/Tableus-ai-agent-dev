# F1-P4 — control query timed out before Settings launch

The approved [P4 operation](n1-f1-p4-proposal.md) stopped after **90.817 seconds**.
Its one `launchctl list` control query timed out at the configured 30-second cap
(measured 30.169 seconds including timeout handling), with no retained stdout,
stderr or exit code. The cause is unproved. **No Settings launch or Maestro test
ran**, so no screenshot exists and the revised visual hypothesis remains untested.

The owner approved the concrete proposal at commit
`80d16853691ffa0d029636dc842462d59493b142`.
[Approval receipt](n1-f1-p4-approval.json) and
[machine-readable result](n1-f1-p4-result.json) bind the invocation to the frozen
manifest `e229f29e108f508ae7bb2e7cbf1f4a25941bed5a7dcf0a6f4d2490471e1131b8`.
The application remains `8972865893a3f018a064594457dc9cc664f8a61f` and its build
operator remains `16603dd0cf36d27b492e57a02d3c6c438a2563c4`.

| Measure | Result |
| --- | --- |
| Boot / control-query attempts | 1 / 1 |
| Explicit Settings launch / Maestro test attempts | 0 / 0 |
| Free space before / after boot | 25.118 / 25.121 GiB |
| Driver / launcher elapsed time | 90.817 / 91.081 seconds |
| Independent cleanup verification | All three retained targets Shutdown; no matching processes; ports 7999/8000/8001 idle |
| Post-stop free space | 25.098 GiB, historical observation only |

The driver stopped at the first failure and shut down the verified target.
Independent read-only checks confirmed cleanup. No permission reset, data cleanup,
TableUs flow or downstream operation occurred. Host binding and the ongoing crash
monitor were never reached; empty crash arrays do not establish crash-free behavior.
No new hierarchy, image or permission-state conclusion is available.

All 10 retained files (13,447 bytes) were hashed; no symlinks were present.
Private execution archive: `/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/runtime-execution-p4`.
Retention-index SHA-256: `1642c026070685dfdcead5540211efc9e5249b2307bfff19d126a1fe6a71d56f`.
The original frozen P4 bundle and earlier evidence remain unchanged. Its passing
preparation tests are reused; this evidence-only change needs no full-suite rerun.

**The one-operation allowance is consumed; no retry is authorized.** Zero Settings
or test invocations do not leave a reusable allowance. Next compare the retained
control-query successes and failures offline before proposing another native
operation. Original refresh/platform/visual failures and downstream gates remain
unresolved. Keep native validation in this task as requested.
