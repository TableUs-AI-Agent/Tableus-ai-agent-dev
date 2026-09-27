# F1-P1 — proposed Settings-only platform diagnostic

**Historical proposal: subsequently approved and executed; see [P1 result](n1-f1-p1-result.md).** This follows the platform failure
recorded in [F1-O1](n1-f1-o1-result.md). The exhausted O1 allowance and its
first-failure stop do not authorize this additional native probe.

Authorize one run on existing disposable simulator
`CBB4FAB4-734C-413C-9F10-850329AC9A01` (iOS 26.5, 23F77), limited to 300 seconds
including cleanup and at most three serial Maestro 2.8.0 invocations. Each opens
the installed system Settings application (`com.apple.Preferences`, 1353.5.5),
asserts the Settings title and captures a screenshot. It changes no setting and
does not launch TableUs. Maestro's existing XCTest driver provides automation.
No TableUs build/install, simulator erase, runtime/toolchain update, backend start,
network product request, link test or Account export is included.

The driver observes the target's SpringBoard PID, TableUs process absence and new
crash reports before/during/after flows. It immediately stops on a SpringBoard
restart, new relevant crash, unexpected TableUs process, assertion/command failure
or time limit. The active Maestro process group is stopped on failure; Settings
is terminated during cleanup. Logs, command results, screenshots, PID observations
and crash reports are retained. There is a five-second observation window after
each successful flow. No retry or automatic TableUs continuation is permitted.

The fixed fresh output is
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios-settings-platform-probe-01`.
The [machine-readable proposal](n1-f1-platform-probe.json) pins the reviewed
operator bundle and its offline checks. Execution requires the explicit
`TABLEUS_F1_PLATFORM_PROBE_APPROVED=1` gate. Pre-proposal inventory confirmed
Settings is installed and the target's launchd label is `com.apple.SpringBoard`.
The subsequent approved execution is recorded separately in the P1 result.

This isolates basic serial automation from the TableUs application. A reproduced
crash would establish failure with a system app too. Three healthy flows would
be inconclusive about the prior crash and provide no application acceptance or
offline replay allowance. Review the result before selecting a verified toolchain
remediation or preparing a separate TableUs continuation. Existing app/runtime
artifacts, prior failures, closed live budgets and all later gates remain intact.
