# F1-T1 — local XCTest supervision preparation

The local operator now recognizes XCTest bootstrap failure from registered
Session/scheduling logs, retains private log snapshots, and identifies separately
grouped diagnostic collectors through exact executable, target, output path and
start-time evidence. This addresses the observation and cleanup gaps exposed by
[O5](n1-f1-o5-result.md). It does not fix the underlying initialization stall.
No native attempt, app launch, native build, tool upgrade or live-provider call occurred.

## Implementation

The reusable [Python helper](../../../scripts/maestro_xctest_diagnostics.py) has
no native command or signal implementation. Its caller supplies bounded process
reads and per-PID signals. The [regressions](../../../scripts/maestro_xctest_diagnostics_test.py)
run through the normal [Node test bridge](../../../scripts/maestro-xctest-diagnostics.test.mjs),
using synthetic files, process snapshots and signal callbacks.

A private derivative of the immutable O5 operator integrates the helper into the
existing observation loop and cleanup path. Its wrapper registers each new flow
and redirects Maestro results/debug logs, stdout/stderr and native/JVM temporary
files to that private directory. Installed Maestro 2.8.0 help confirms the debug
output flags. No flow, fault injection, request assertion or timeout is weakened.
Both derivative CLI entry points refuse native execution. This is a reviewable
preparation package; a future authorized native proposal must freeze a runnable
operator and its exact inputs separately.

Observation never equates a missing failure marker with a pass. Recognized failure
is latched, with retained bytes surviving producer deletion/truncation and a new
helper instance. Unsafe paths, conflicting registration, unreadable/oversized
evidence and failed persistence stop observation. Bounded snapshots limit disk
use. Collector selection requires the exact CoreSimulator simctl executable,
`diagnose`, exact UUID, an output under the registered invocation's XCTest tree,
and a matching start time. Cleanup rechecks identity and deadline before each
signal; PID reuse or ambiguity leaves cleanup explicitly incomplete.

The existing five-second host-query, thirty-minute runner and thirty-five-minute
total caps remain. The original process-group cleanup and the new per-PID cleanup
share that deadline. Frozen application
`8972865893a3f018a064594457dc9cc664f8a61f`, artifact, build operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4`, device and prior acceptance are unchanged.
The new helper is operator tooling; its commit does not replace the application
SHA or relabel earlier native evidence. Base is
`c043a3ae00baf1a4f18d083b74c2d43cb62962e6` on the existing active branch/worktree.

## Verification and boundary

[Structured result](n1-f1-t1-result.json) records 13 helper regressions, 25 mocked
operator checks (19 inherited guards and six integration cases), five setup-journal
cases and a passing replay of two actual retained O5 logs. The replay maps old
paths into the new registration layout; it makes zero process queries/signals.
It is not a native compatibility result. Astra reviewed integration and evidence;
Luna's read-only check confirmed observation precedes the host query and exit
capture precedes child termination.

All `make ready` targets pass: lint/type checking, 293 JavaScript and 98 backend
Python tests (three PostgreSQL skips), contracts, builds, deterministic smoke and
the report-only bundle budget. The 13 helper cases also run inside one of the
JavaScript tests. One initial `make ready` stopped at four backend config failures
because the launcher overrode split provider modes. The first backend resume
then reused its SQLite fixture and failed on duplicate data. Removing those two
overrides and selecting a fresh database yielded 98 passes; remaining targets
and `npm run contract:check` passed. Application/test source needed no repair.
Both failed attempts and the successful continuation are retained; passing
lint/type/JavaScript checks were not unnecessarily repeated.

The durable private archive is `native-validation-f1/runtime-preparation-t1`
under the existing application-specific artifact root. Its 44 files (455,389
bytes) include the derivative operator, replay files and complete verification
logs. Index SHA-256 is
`111da732db070c94fcb199467438a74880e6378bf35571b87b38a301d496249c`;
operator-manifest SHA-256 is
`75e9272a5e4b620f2e870630f897d9d57fdf604a7aabf076aa4dbee8730b41e9`.
All indexed bytes and the immutable O5 source manifest were verified. Application
Git objects and generated contracts remain unchanged. Exact archive/source
paths and hashes are in the structured result.

The initialization stall remains unresolved. The changed diagnostic paths and
supervision require an independently bounded native comparison before runtime
acceptance. O5 and earlier attempts remain consumed; no O6 replay is granted.
Original refresh, link/export, iOS 27 runtime/lifecycle, canonical/auth, Android
and N2 gates remain. Keep the incomplete native objective in this task. Any
subsequent native experiment needs a concrete hypothesis and exact approval,
with the same first-failure, capacity and evidence requirements.
