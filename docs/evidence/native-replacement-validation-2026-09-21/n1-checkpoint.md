# N1 iOS checkpoint — incomplete validation

Subsequent status: [JS runtime diagnostic stopped after a debugger-run crash](n1-js-runtime-diagnostic.md).
The observations below retain their original checkpoint meaning; current next
actions are in the active packet and the proposed D1 amendment.

Owner-approved Cursor compiled-cache cleanup completed. Free space passed the
40 GiB start gate at 41.31 GiB. One `test-ios` attempt then ran from application
`ed8330a766b3c4b80a505e075535678394e275e9`, using the clean committed operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4`. No second native build ran.

[Machine-readable checkpoint](n1-ios-checkpoint.json) binds the artifact,
receipt, inspection, driver, inventory, maps and private capture logs. The
[source packaging check](n1-ios-source-check.json) matches extracted EAS source
against the requested application. The [cleanup receipt](storage-cleanup.json)
records the additional explicit cache deletion approval.

## Passed in this attempt

- Frozen install, SDK/scene preflight, EAS 23.2.0, nested prebuild minimatch 9.0.9,
  upstream decoder 0.5.0 and Hermes configuration.
- Actual native compilation, exact-source artifact inspection and version-two
  receipt export. Rehash before installation matched artifact/inspection receipt
  fields. Embedded source is ed8330a, API is loopback, demo enabled, telemetry off.
- Diagnostic inventory succeeded with no missing families or scan errors;
  actual app dSYM and composed JS map retained. This is compiler-output evidence,
  unlike the preceding fixture-only verification.
- Executable/dSYM UUIDs match for arm64 and x86_64. A new disposable iOS 26.5
  simulator was created and booted from the installed runtime; accepted devices
  and their sessions were not operated or overwritten.
- LLDB stopped at the app-owned launch function. Independent `atos` resolution
  of its captured PC with the observed image load address and matching dSYM
  yields `AppDelegate.application` at `AppDelegate.swift:18`.
- All 46 app/decoder map `sourcesContent` entries match the retained build source.

The first debugger capture used an unsupported `image list -l` option after
successfully capturing the frame. The corrected command uses `--header`; both
logs remain private. This was diagnostic-command correction, not a second build
or failed app journey. Debugger pauses are intentional and are not responsiveness
or AppHang observations. The new app was terminated after capture; the disposable
simulator and all build files are retained.

## Remaining gates and next bounded work

This is **not N1 completion or replacement acceptance**. Source-content matching
and a composed map's presence do not establish runtime JS symbolication. No
captured app-owned JavaScript frame has been resolved yet. Source inspection
found no local stack-output control in the candidate's deterministic routes;
the explicit Sentry error emitter belongs to the gated telemetry-canary route.
The installed Hermes framework exports no matching captureStackTrace/getDebugger/
getStackTrace symbols in the local `nm` check. That is a bounded inspection, not
a claim that all debugger techniques are impossible. No supported local capture
method has been established for this release artifact.
Do not enable it, change application bytes, or substitute a synthetic stack and
claim the approved runtime proof passed. Determine a bounded non-instrumenting
local stack capture method; if application instrumentation is necessary, present
the exact candidate/scope amendment before another build, as the proposal requires.

The symbol gate precedes the remaining lifecycle/offline/refresh/link/export
checks, so those have not run. The historical AppHang risk is neither reproduced
nor cleared by a debugger breakpoint. Native source locations now resolve for
this artifact; that does not retroactively symbolicate f94a1d9.

Free disk after retained build/device setup is **29.56 GiB**, below the approved
40 GiB start floor for Android. Preserve evidence; no more cleanup is authorized.
Android's one attempt remains unused but may start only after the full iOS gate
and capacity pass. iOS's one build attempt is consumed; no automatic retry.
N2 remains unapproved. Keep this incomplete objective in the current task.

No lifecycle runner, offline runner, synthetic link matrix, focused export/relaunch
AppHang cycle, Android build, readiness build/update, upload, CI, deployment,
provider request, OTP email or canary was performed. Limited existing Expo and
dependency access occurred within N1. Application source and build operator are
unchanged; documentation/evidence checks reuse prior local suites without a new
`make ready`. Closed provider ledger and September 30 boundary remain unchanged.
