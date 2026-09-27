# F1-H1 — recover host capacity before considering another native test

**Executed once after [owner approval](n1-f1-h1-approval.json); [H1 result](n1-f1-h1-result.md) completed resource recovery in 28.499 seconds.** The original proposal JSON remains unchanged.

[O4](n1-f1-o4-result.md) passed its
initial simulator control query, then stopped on a five-second host process-query
timeout during runner setup. A later snapshot recorded about 20 GiB swap used on
a 16 GiB host and two older booted TableUs simulators. This supports a bounded
resource-recovery step, without establishing the cause of the timeout.

## Exact proposed action

Shut down only these existing iPhone 17 Pro / iOS 26.5 (23F77) targets:

| Target | UUID |
| --- | --- |
| TableUs-N1-ed8330a | `2408A54F-A1C5-4388-8B46-6A987FE3B578` |
| TableUs-N1-F1-8972865 | `CBB4FAB4-734C-413C-9F10-850329AC9A01` |

Verify both exact on-disk identities and live inventory before any shutdown.
Require idle test ports and record current memory, swap, load and the same host
process-query timing used by O4. If a target is already Shutdown, skip it.
Otherwise attempt its exact-UUID shutdown once, capped at 30 seconds, then
verify Shutdown. Stop at the first failed command, identity/state mismatch,
occupied test port, interruption or deadline; preserve partial results.

Afterward, take three bounded host process-query observations, ten seconds apart,
each capped at five seconds. Record final device states, target UUID process
matches, ports and memory/load/swap. A missing UUID match is limited process
visibility; confirmed device Shutdown is separate evidence. Report observations
without claiming causality, reliable XCTest behavior or native acceptance.

Maximum **five minutes total**, including all preflight, shutdown and observation
work. Fresh private output only, with commands, timestamps, exit/timeout and
before/after measurements retained. Both devices and their saved data, installed
apps, prior sessions and all artifacts/evidence remain on disk. Shutdown ends
their running processes and changes in-memory state.

## Boundary and approval

No simulator creation, erasure, deletion or boot; no other-device action, global
CoreSimulator restart, host reboot, app termination outside these two targets,
cache deletion, build, upgrade, UI test, provider call, deployment or replay.
The O4 target remains shut down. H1 grants **zero offline test attempts**; its
result informs any later concrete validation proposal.

The [structured proposal](n1-f1-h1-proposal.json) binds the reviewed private
operator archive. Twelve mocked/static checks and three Python syntax checks
passed before execution; root review independently confirmed the on-disk identities. Manifest SHA-256:
`2e1da294a40b99de4988a2ef360461516188ee77042bb6756dad4e8f2adf35b6`.
Driver SHA-256:
`5ae06515e935adfa43bb24c6fd295634fff8eaefd3524e41e78c9e726d053ec7`.

Separate approval was required because the approved [O4 scope](n1-f1-o4-proposal.md)
explicitly excludes “other-device operation” and ends at its first failure.
H1 would operate the two older devices outside that scope. It is not a request
to reconfirm any part of O4 or to restart a failed test.
