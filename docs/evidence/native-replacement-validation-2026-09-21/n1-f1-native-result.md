# F1 native resumption: build passed, diagnostic stopped

The owner [authorized bounded resumption](n1-f1-resumption-approval.json) on
September 22. [Disposable-cache cleanup](f1-storage-cleanup.md) recovered about
26.85 GiB at its measured endpoints, reaching 42.20 GiB free. One protected
DevTools cache remains intact. Accepted artifacts, sessions, sources and personal
files were preserved. Subsequent build and simulator storage are separate costs.

## Fresh build and artifact proof

Application `8972865893a3f018a064594457dc9cc664f8a61f`, unchanged operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4`, build
`local-ios-test-8972865-f1-01`. The one new build passed in 2,298.859 seconds,
within its 90-minute limit, starting with 42.18 GiB and ending with 29.56 GiB free.
The 20 GiB guard did not fire. Receipt, inspection, artifact and source/lock
bindings passed independently; the detached candidate checkout was clean.

All 42 inventoried diagnostic files match their hashes, with no missing family
or scan error. Executable and dSYM UUIDs match for arm64 and x86_64. The fresh
executed bundle and composed map are retained; all 50 app/shared/decoder map
contents match candidate files, including both F1 application changes. This is
artifact provenance, not sampled runtime-frame or behavioral evidence.
[Structured result](n1-f1-native-result.json) records hashes and exact identities.

A new iPhone 17 Pro simulator, iOS 26.5 build 23F77, was recorded before install:
`CBB4FAB4-734C-413C-9F10-850329AC9A01`. Installation passed. The older disposable
simulator and accepted installations remain untouched. After simulator creation,
the September 23 02:17 UTC readout recorded 25.59 GiB free.

## Diagnostic stop and retained setup failure

The first wrapper invocation selected system Python 3.9.6 and failed its local
`hashlib.file_digest` check before app launch or debugger attachment (1.690 s).
That setup output is retained in `js-runtime-trace-f1-01`. Selecting the verified
absolute Python 3.14.6 interpreter corrected the operator error without spending
an application launch/capture attempt there.

The one actual capture attempt, `js-runtime-trace-f1-02`, launched PID 95078.
LLDB attached, loaded the matching dSYM and resolved the startup breakpoint to
AppDelegate.swift:18. Its transcript then ends at `continue`; the 45-second
startup-command cap expired before an observed breakpoint hit, profiler setup,
dump or trace. Total driver elapsed was 54.406 seconds. App termination returned
zero; the process readout found no remaining TableUs/debugger process. Initial
and delayed checks found no matching crash report. No native retry ran.

The selected unified-log window first records app activity at 21:11:35.313 CDT,
near the timeout, versus the launch receipt at 21:10:47.503. There are no
per-command LLDB timestamps, so the delay cannot be assigned to attach, symbol
loading, resume, app startup or scheduling. A resolved breakpoint address is not
an observed app frame. This result neither establishes an app regression nor
clears the earlier debugger crash or historical AppHang.

## Remaining work

The recorded native stop rule applies. Runtime symbolication, lifecycle,
offline/all five refresh phases, the cold/warm link matrix and both export cycles
remain unrun for F1. No `runtime-proof.json` exists. Android remains unused and
still requires all iOS gates plus fresh 40 GiB capacity. N1 is incomplete; N2,
canonical/auth/physical-link probes and all external gates remain separate.

The [proposed diagnostic amendment](n1-f1-diagnostic-amendment.md) reuses this
artifact and installed disposable target. It requests one additional bounded
capture with operator phase timing and a revised startup allowance; it is
prepared only. If approved and successful, already-authorized local runtime work
can continue subject to its original limits. No rebuild or app-code change is
needed for that proposed step. Preserve all prior failures and closed budgets.
