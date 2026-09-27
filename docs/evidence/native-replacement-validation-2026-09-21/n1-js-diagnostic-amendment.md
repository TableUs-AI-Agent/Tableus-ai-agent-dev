# Proposed D1: one local diagnostic capture

**Prepared, not approved or executed.** The [diagnostic crash](n1-js-runtime-diagnostic.md)
stopped N1. The original N1 approval is retained; this amendment requests one
specific follow-up diagnostic launch after that stop, not another build or risk
acceptance.

Use the same disposable simulator `2408A54F-A1C5-4388-8B46-6A987FE3B578` and
unchanged `local-ios-test-ed8330a-2d-01` app. Check installed/exported bundle and
Hermes hashes before launch, and the loaded Hermes UUID before any call. Keep
telemetry off and loopback/demo configuration. No backend, hosted product call,
OTP, canary, dependency fetch, installation or accepted-device operation is needed.

## Exact change to the diagnostic method

1. Start one cold app launch paused at the existing AppDelegate breakpoint.
2. Schedule the framework's existing profiler-disable function on the system
   dispatch queue at a 12-second deadline, enable local sampling at 1,000 Hz,
   then detach and exit the setup debugger. No debugger pause during sampling.
3. After 16 seconds, use a **fresh LLDB process** for readout. Dump through the
   existing Hermes stream API to retained local stderr. This avoids the stale
   nested debugger context observed in launch five and C++ string construction.
4. Retain any raw trace, stderr, debugger logs and new crash report; terminate
   only this disposable app. No automatic repeat. Any command failure, app exit
   or new crash stops the attempt. Execution has a 120-second deadline plus at
   most 10 seconds for termination cleanup.
5. If an actual trace exists, copy it before candidate-installed Metro
   symbolication (the CLI modifies its input), and verify captured app/route
   frames against the exact composed map and retained sources. No synthetic
   frame may stand in for a runtime sample.

This remains an experimental debugger technique. Scheduling shutdown and using
fresh debugger processes address observed harness problems; neither establishes
the cause of the earlier crash or guarantees safety from recurrence. Success
would establish only the observed trace/map relationship. Review that evidence
and the crash before proposing resumption of N1 behavioral checks.

## Prepared files and execution guard

Private directory:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/ed8330a766b3c4b80a505e075535678394e275e9/native-validation-2d/js-runtime-trace-06-proposed`.

- `capture.py`: `ebc3d31524516ab4a5a2cd7c7480a1957978baed22b30d9bd435ce815cdb4a2f`.
- `driver.py`: `9a8b58400a355dc6cd9aebedd6c82ef3ee6e6bae0dbdedef240aa8fa3e622048`.

Both passed `py_compile`; the driver refuses to run without an explicit D1
approval marker. Record the user's approval against this proposal and these
hashes before setting that marker. The intended exclusive output directory is
`js-runtime-trace-06`; it does not yet exist and must not be overwritten.

No build allowance, live budget, storage cleanup or N2 approval changes. If this
single diagnostic cannot produce a trustworthy frame, stop and prepare the next
scope decision rather than iterating more launches automatically.
