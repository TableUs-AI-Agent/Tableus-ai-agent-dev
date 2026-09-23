# F1-H1 result — both older simulators shut down

The owner [approved H1](n1-f1-h1-approval.json), and its exact archived operator
completed once in **28.499 seconds**, within the 300-second limit. Both approved
iPhone 17 Pro / iOS 26.5 (23F77) targets were initially Booted and finished Shutdown:

| Target | UUID | One shutdown, exit 0 |
| --- | --- | --- |
| TableUs-N1-ed8330a | `2408A54F-A1C5-4388-8B46-6A987FE3B578` | 3.315 seconds |
| TableUs-N1-F1-8972865 | `CBB4FAB4-734C-413C-9F10-850329AC9A01` | 3.288 seconds |

All twenty commands exited successfully within their caps. The identical host
process query used by O4 took 0.074 seconds before shutdown. The three subsequent
queries took **0.039, 0.045 and 0.067 seconds**, each below five seconds, with ten
seconds between observations. Separate target-UUID scans returned no matches.

| Host observation | Before | After |
| --- | --- | --- |
| Process rows | 1,215 | 803 |
| Swap used | 20,601.88 MiB | 20,193.88 MiB |
| One-minute load average | 5.86 | 4.47 |

These are measured resource observations, not causal or stability proof. The
pre-shutdown process query was already fast. H1 does not establish that O4's
host timeout is fixed or explain the original refresh failure, O1/O2 crashes,
or historical AppHang.

## Preservation and checks

Independent post-check confirms both device/data directories remain present and
neither device is deleted. Both targets and the separate O4 target are Shutdown.
The two known pre-shutdown process IDs, their direct children and target-UUID
matches are absent; test ports 7999/8000/8001 are idle. No new target crash report
was observed at that check. Available disk space was 25.90 GiB; this is a point-in-time
capacity observation, not a claim that H1 deleted files or reclaimed that amount.

The [structured result](n1-f1-h1-result.json) binds the approved manifest/driver,
raw command outcomes, seven private execution/result files and closeout helper
hashes. Root review and an independent Luna audit agree on the result and its
limits. The twelve preparation tests remain applicable because the driver is
unchanged. The frozen application's earlier 292 JavaScript / 98 Python passes
and three PostgreSQL skips are reused; no full-suite rerun was needed.

No device was created, erased, deleted or booted, and no app test ran. H1 grants
zero offline attempts. The [O5 proposal](n1-f1-o5-proposal.md) prepares one conditional diagnostic on
the retained iOS 27 target with H1 provenance, required setup-command events and
a stricter single-boot guard. Behavioral assertions, faults, timeouts and stop
rules remain. New owner approval is required; no O5 operation has occurred. Earlier
acceptance and live/deployment budgets remain unchanged. Native roadmap 2d is
incomplete and stays in the current task.
