# C1 retained-evidence review

Offline review on 2026-09-24; no native operation. Application remains
`8972865893a3f018a064594457dc9cc664f8a61f`.

## Control and host queries

The old control command was `xcrun simctl spawn <UUID> launchctl list`.
It required an exit-zero response with one SpringBoard service PID. A separate
host `ps -axo pid=,ppid=,lstart=,comm=` bound that PID to its executable,
start time and `launchd_sim` parent. Neither check established overall simulator
health or visible UI readiness.

| Attempt | Runtime | Control result | Subsequent evidence |
| --- | --- | --- | --- |
| [P2](n1-f1-p2-result.md) | iOS 26.5 | Passed; 8s cap, elapsed time not retained | 105 host observations and three Settings flows passed. Flows used Maestro launchApp. |
| [O3](n1-f1-o3-result.md) | iOS 27 | Timed out at 8s | No host binding or UI run. |
| [O4](n1-f1-o4-result.md) | iOS 27 | Passed in 9.465s, 30s cap | 29 host observations, then a 5s host-query timeout during setup. Later responsiveness does not erase that failure. |
| [O5](n1-f1-o5-result.md) | iOS 27 | Passed in 10.39s, 30s cap | 269 host observations; XCTest subsequently killed for an initialization-assertion timeout. Underlying stall unknown. |
| [P3-R1](n1-f1-p3r1-result.md) | iOS 27 | Passed in 8.076s, 30s cap | 63 host observations; command completion but blank Settings screenshot. Visual acceptance failed. |
| [P4](n1-f1-p4-result.md) | iOS 27 | Timed out after 30.169s, 30s cap | No host binding, Settings launch or Maestro test. |

The pattern supports intermittent deadline failures, not a proven cause or a
larger timeout. P4's `late_completion` records an over-cap duration; it does not
mean the command eventually succeeded. Shutdown-time service reports do not
explain the earlier query failure. The monitor's SpringBoard/TableUs crash-name
scope must not be described as a census of all simulator services.

C1 prepares a different binding path: exact-UUID Settings launch returns a PID;
the exact pinned Preferences executable, SpringBoard sibling and launchd_sim
parent must match across two host snapshots. Host rows alone cannot identify a
simulator UUID. This path removes the launchctl response check; it does not prove
launchctl health. Fresh inventory, process, crash, UI and cleanup checks remain.

## Original refresh failure

The original failure PNG visibly contains the cached dinner plan and an enabled
Refresh plan button, without the expected “Fixture refresh unavailable.” message.
Its command receipt records the tap completing and the subsequent message
assertion failing after about 30 seconds. The retained hierarchy agrees. This
differs from the later blank Settings screenshot.

The application enables foreground refetching; the fault fixture supplies three
matching error responses before forwarding normal responses. A foreground read
consuming the finite fault responses is a possible explanation, not an observed
cause: failed-phase traffic counters were not retained. Existing component tests
exercise foreground/manual-read coalescing. There is insufficient evidence to
change application behavior, weaken the assertion or increase fault responses.

The T1-derived C1 runner retains proxy events and failed-phase snapshots so a
future failure can be compared against actual requests. The full eleven flows
and five refresh phases remain required; prior partial passes are not substituted.

## Scope limits

The proposed campaign joins a visually reviewed Settings baseline to one full
offline run. It does not transfer iOS 26.5 runtime/lifecycle acceptance to iOS 27,
clear the historical AppHang, or authorize links, exports, Android or N2. Exact
retained-source hashes and private paths are recorded with the C1 preparation
archive. Native execution needs the new finite campaign approval because the
previous attempt allowances are consumed.
