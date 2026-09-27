# Proposed F1 diagnostic amendment D2

**Prepared only; not approved or executed.** The [resumption result](n1-f1-native-result.md)
records a passed F1 build and an unsuccessful single diagnostic attempt. The
45-second LLDB startup-command limit expired before an observed breakpoint hit
or sampler setup. Its cause is unresolved. This proposal needs no rebuild and
does not change application bytes.

## Exact scope requested

- One additional capture of application
  `8972865893a3f018a064594457dc9cc664f8a61f`, build
  `local-ios-test-8972865-f1-01`, artifact SHA-256
  `98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`.
- Reuse the installed disposable iOS 26.5 target
  `CBB4FAB4-734C-413C-9F10-850329AC9A01`; recheck installed bundle/Hermes hashes,
  source, dSYM and existing artifact proof first. No accepted device is touched.
- New exclusive private output `js-runtime-trace-f1-03` under the existing
  `native-validation-f1` root. Retain all previous setup failures, captures,
  logs, artifacts and crash reports. No prewarming app launch or retry loop.
- Keep the successful D1 capture method, explicit Hermes byte/UUID/address
  guards, 1,000 Hz request and 12-second scheduled disable. Preserve the
  16-second detached observation hold; the actual sampled span remains measured
  separately rather than assumed to equal exactly 12 seconds.
- Increase the LLDB startup-command allowance from 45 to **at most 65 seconds**.
  Record operator wall/monotonic timestamps around attach, symbol loading,
  breakpoint setup, continue, sampler operations and termination. These logs do
  not instrument the app. The longer allowance is not a claim about the cause.
- Enforce **120 seconds overall**, reserving up to 10 seconds for cleanup.
  Startup also reserves the 16-second hold and at least 10 seconds of readout
  capacity; every command is limited by the remaining deadline. Stop on a
  timeout, crash, missing trace or invalid proof, with no automatic retry.

The prepared-script manifest and hashes are recorded in
[the amendment specification](n1-f1-diagnostic-amendment.json). Preparation checks
are offline only; no additional app launch or debugger invocation was used to
prepare this proposal. Approval would authorize exactly this extra capture.

## Completion and unchanged limits

Require actual app-frame resolution with matching native symbols, the new raw
profile, fresh bundle/composed-map provenance and sampled app/route-frame
symbolication. A breakpoint address or successful attach alone cannot pass.
If the capture passes, resume the already-authorized local lifecycle,
offline/refresh, custom-scheme link and two export cycles under their original
limits; those actions do not require a separate repeat approval. Stop again on
their first native failure. Preserve canonical HTTPS/auth presentation and
physical association gaps, Android's iOS/capacity prerequisites, and the original
AppHang/debugger-crash risks. No new provider/OTP/telemetry budget, build,
deployment, N2 or external action is included.

An additional approval is required because the [accepted resumption scope](n1-f1-resumption-approval.json)
specified one diagnostic capture, `stop_on_first_native_failure: true` and
`automatic_retry: false`. The [engineering guide](../../../AGENTS.md) also states:
“Native stop-on-first-failure and recorded attempt, disk and budget limits remain
in force.” The current authorization has reached that explicit boundary.
