# N1 JavaScript runtime diagnostic — stopped

The existing ed8330a iOS artifact remains byte-identical. JavaScript runtime
symbolication is **not established**. Five local debugger launches on the same
disposable iOS simulator produced no usable sampled JS trace. A crash report from
launch four was discovered after launch five. Further simulator execution and N1
behavioral validation stopped when that report was found.

[Recorded results and private hashes](n1-js-runtime-diagnostic.json) retain every
harness, log, the crash report and the unexecuted follow-up proposal. This follows
the [original iOS checkpoint](n1-ios-checkpoint.json); it does not replace its
historical measurements. The build remains `local-ios-test-ed8330a-2d-01`, application
`ed8330a766b3c4b80a505e075535678394e275e9`, build operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4`. These ad hoc diagnostic harnesses have
their own hashes; they are not attributed to the committed build operator.

## What the investigation established

The earlier exported-symbol probe was incomplete for this purpose. The packaged
Hermes framework has local sampling-profiler symbols. Its arm64 UUID is
`75872184-F738-3E5C-B47A-FD4BCE09605A`; the loaded module matched it. Local symbol
table/disassembly identified enable, disable and trace-dump functions. React
Native's retained `HermesInstance.cpp` enables runtime sampling support. LLDB
successfully invoked the native enable function without replacing app bytes or
enabling Sentry/PostHog.

| Launch | Observation |
| --- | --- |
| 1 | Exact-name LLDB function lookup returned no addresses; stopped before enabling profiling. |
| 2 | UUID-checked file addresses resolved, but the expression context lacked `std::string`; stopped before enabling profiling. |
| 3 | SBValue reported an unknown error for a declaration with no result; command-based evaluation later established that this was an unsuitable result check. Profiling was not enabled. |
| 4 | Enabled profiling; debugger-controlled stop/disable expressions were interrupted around SIGPROF. A native crash report subsequently appeared for this PID. No trace was dumped. |
| 5 | Scheduled profiler shutdown, detached during the collection interval and reattached successfully. Nested debugger command evaluation then referred to an exited process context despite the fresh attachment reporting stopped. No trace was dumped. |

The app was terminated after each harness. No lifecycle/offline runner, link
matrix or export/relaunch cycle ran. These were debugger experiments, not measured
responsiveness checks. No application-source or packaged-byte changes, dependency
changes, new build, telemetry event or hosted product request was introduced.

## Crash and limits

Launch four, PID 28631, generated `EXC_BREAKPOINT / SIGTRAP` on the main thread in
`__CFRunLoopServiceMachPort.cold.1`. The same report shows the Hermes sampling
thread waiting for a stack sample and the JS thread waiting on the sampler mutex
during GC. This is evidence of the state during the profiler/debugger experiment;
it does **not** establish the crash's cause. In particular, do not label it a
harmless harness failure, an ordinary user-journey regression, or recurrence of
the earlier f94a1d9 AppHang without further evidence.

The [approved proposal](README.md) says that a crash stops N1 and reopens
investigation. That stop condition is being applied conservatively to this
diagnostic crash. [D1](n1-js-diagnostic-amendment.md) is a concrete proposed next
diagnostic step, not permission to resume behavioral validation or accept risk.

## Fresh verification and remaining boundaries

- Recomputed full artifact checksum still matches the original receipt:
  `fda161a75d1d895ef88e3530847d9b7dde5dad3a5f1f01680c9ea0c06c9db0b9`.
- Installed executable, embedded bundle and Hermes binary hashes match the
  inspected exported app. Embedded source is ed8330a, API is loopback, demo is
  enabled and telemetry is off. The composed map hash is unchanged.
- Native AppDelegate frame resolution and 46 source-content matches remain the
  earlier passing observations. They do not substitute for a runtime JS frame.
- D1 harness/driver passed Python syntax compilation. Its approval guard refused
  execution as expected. No D1 simulator launch occurred.
- Current free disk is 27.62 GiB, below Android's 40 GiB build floor. This is a
  fresh filesystem reading, not an attribution of all intervening disk growth.

One iOS build attempt remains consumed; Android's attempt is unused. Accepted
devices, prior artifacts, 63bd/90bd evidence and application/operator code remain
unchanged. No further cleanup, build retry, upload, live provider/OTP/canary,
deployment, merge or N2 work is authorized. The closed ledger and September 30
boundary persist. Prior 2c suites are reused for unchanged executable source;
this checkpoint adds evidence/hash/JSON/link/diff checks only. N1 is incomplete.

Checkpoint validation passed: 37 private file hashes, 36 local document links,
evidence JSON parsing, proposed Python syntax, unchanged artifact/map association
and absence of the unexecuted D1 output directory. `git diff --check` passed.
