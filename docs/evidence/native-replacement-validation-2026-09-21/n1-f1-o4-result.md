# F1-O4 result — control passed, host monitor stopped runner setup

Owner [approved O4](n1-f1-o4-approval.json); the exact archived driver ran once
on September 23, 2026. It stopped after **113.791 seconds** when the host
`ps -axo pid=,ppid=,lstart=,comm=` query exceeded its unchanged five-second cap.
One offline runner started, but **zero UI flow invocations or completions are
retained**. O4's operation is consumed; no replay or downstream work is authorized.

The single initial simulator control query completed successfully in **9.465
seconds**, within the approved 30-second cap. It bound SpringBoard PID 50837 to
simulator parent 50831. Fresh artifact/source checks passed for application
`8972865893a3f018a064594457dc9cc664f8a61f`, build
`local-ios-test-8972865-f1-01`, artifact
`98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`.
The same retained iOS 27.0 (24A434) target was booted once; no device was created.
Capacity was 22.85 GiB before boot and 22.84 GiB after boot.

## What ran and where it stopped

The runner PID 51066 started at 06:21:52.697 UTC. Backend readiness returned 200,
local backend/proxy setup ran and eleven YAML flow definitions were generated.
CoreSimulator source line 88744 records the preparatory `com.tableus.app`
uninstall request at 06:22:03 UTC. The retained runner sequence places this
before installation. No installation completion, app launch, Maestro invocation,
flow result or fault-proxy journal establishes later progress. Application
traffic counts therefore remain unknown, rather than recorded as zero.

Twenty-nine regular host observations were healthy before the monitor timeout.
After interruption and owned-process cleanup, a final host observation still
found the original SpringBoard/parent and no TableUs process. The timeout does
not establish an app crash, SpringBoard crash, or a root cause in application
code. The control result applies to this warmed target only; it does not explain
O3's first-boot delay or prove XCTest stability.

## Cleanup and retained evidence

The runner stopped with SIGINT; its remaining process group stopped with SIGTERM.
Owned cleanup finished within 49.141 seconds of runner start. Best-effort app
termination separately timed out after eight seconds; that raw failure remains
recorded. The target's shutdown succeeded. Independent checks at 06:23:52 and
06:27:03 UTC confirm Shutdown, no matching target processes, no known parent,
runner or descendants, and idle ports 7999, 8000 and 8001.

Five delayed target reports name logd, UsageTrackingAgent, featureaccessd,
routined and rapportd. All record SIGKILL / `XPC_EXIT_REASON_SIGTERM_TIMEOUT`
around 06:23:07 during shutdown. None names TableUs or SpringBoard. They are
preserved separately from O1/O2's XCTest accessibility crashes and do not prove
the cause of the earlier host query timeout.

A post-run host snapshot reports 16 GiB physical memory, 20,524 MiB swap used,
load averages 28.27/40.49/25.60, and a subsequent identical `ps` query taking
0.092 seconds. `memory_pressure -Q` reported 33% free. Two older TableUs targets
remained booted. These observations justify assessing host load; they are not
contemporaneous causal proof or a declaration that memory pressure caused O4.

The [structured result](n1-f1-o4-result.json) hashes 33 private run/execution
files and an eleven-file closeout archive. Six synthetic closeout-parser checks,
source associations, root review and an independent Luna audit support this
checkpoint. Reuse the unchanged candidate's 292 JavaScript / 98 Python passes
and three PostgreSQL skips; no application change or full-suite rerun occurred.

## Remaining gate

[H1 host recovery](n1-f1-h1-proposal.md) prepares shutdown of the two exact older
TableUs validation simulators, preserving data/evidence, followed by bounded
host-query observations. It contains no app test or automatic offline retry.
O1/O2, the original refresh failure and historical AppHang remain unresolved.
D2/lifecycle on iOS 26.5 do not transfer to this target. Links, exports, Android,
canonical/auth/physical checks and acceptance remain incomplete. No build,
provider use, deployment, merge or store action occurred.
