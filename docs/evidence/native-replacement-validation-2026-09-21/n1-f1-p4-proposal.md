# F1-P4 — explicit Settings launch and visual evidence proposal

Preparation only; **no native execution is authorized or recorded by this
proposal**. P3-R1's allowance is consumed. Native validation remains in this task
as requested, and the application's SHA remains
`8972865893a3f018a064594457dc9cc664f8a61f`.

## Purpose and changed behavior

[V1](n1-f1-v1-result.md) found that P3-R1 brought Preferences to the foreground,
but retained a SpringBoard hierarchy and a blank screenshot. It also found that
Maestro's `launchApp` command issued default permission grants. The rendering
cause and individual permission-state changes remain unknown.

P4 proposes one explicit `simctl launch` of `com.apple.Preferences` on the retained
iOS 27 target, followed by an assertion/screenshot-only Maestro flow. It omits
Maestro launch, permission, state-clearing and keychain commands. There is no
permission reset or attempt to reconstruct an unknown prior state.

The new operator binds command records, XCTest logs and PNG hashes to the one
registered invocation. It uses T2's repaired log discovery and V1's hierarchy
review check. A completed Settings assertion must have a completed Preferences
hierarchy snapshot inside its time window. Observed permission-operation markers
fail the evidence check. Matching metadata can yield only **pending visual
review**, with `acceptance:false`.

Astra must inspect the bound PNG and confirm the Settings title plus substantive
content such as General and Accessibility before accepting this limited visual
baseline. Blank or transitional output is inconclusive. This review is part of
the operation and needs no additional user confirmation.

## Proposed limits and cleanup

- One retained target: `0EFFA766-DCDD-49E5-84B0-D3593B68709A`, iPhone 17 Pro,
  iOS 27.0 / `24A434`; initially Shutdown. Both older targets must remain Shutdown.
- One boot, one control query, one explicit Settings launch, one Maestro flow.
  No retry or downstream continuation; stop at the first required failure.
- Preserve 420 seconds total including 60 seconds reserved for final cleanup,
  and 240 seconds for the flow including 30 seconds for owned-process cleanup.
  The external launch uses the existing work budget, not an extension.
- Preserve 30-second control and 5-second host-query caps and at least 20 GiB
  free before boot and flow. Fresh checks occur only within an approved operation;
  historical free-space or device-state observations are not current preflight.
- Retain diagnostics before stopping owned processes. Terminate the requested
  Settings launch, shut down only the verified retained target, and verify
  Shutdown, idle ports and absence of owned target/runner processes. Unknown
  cleanup state fails the result. Device data and prior artifacts remain retained.

No TableUs launch/install/build, backend/proxy, device creation/deletion, data
cleanup, live-provider request, deployment or later native stage is included.
Maestro's auxiliary XCTest setup remains part of the diagnostic operation.
This is a changed diagnostic design, not a proven rendering fix or TableUs
acceptance. The monitor is not an all-service crash census.

## Review and freeze

The [structured proposal](n1-f1-p4-proposal.json) records exact inputs and the
30-second external-launch cap. 15 mocked tests and 7
in-memory syntax checks passed under a process/signal audit hook. Seven additional
synthetic file-integration checks pass through the real wrapper, registration,
log discovery and review gate; these are not native or visual evidence. One fresh
`make ready` passed: 294 JavaScript and 98 backend tests, three PostgreSQL skips;
contract checks showed no drift. The first readiness invocation stopped because
the sandbox denied a loopback test listener (`EPERM`); its log is retained. The
permitted rerun passed without a source change. No native command or permission
operation ran.

Static review of five pinned Maestro JARs found no implicit target-app launch or
permission/clear operation in the inspected CLI/flow/driver setup path. Setup can
start/restart the auxiliary XCTest runner. Its hierarchy request has no appId,
so the assertion depends on displayed UI; native hierarchy selection is unverified.
The expected-app and visual gates are therefore required.

All 27 durable private archive files were verified. Manifest SHA-256:
`e229f29e108f508ae7bb2e7cbf1f4a25941bed5a7dcf0a6f4d2490471e1131b8`. Archive-index SHA-256:
`101bbf410c13d1c81976174d9c8c705b1ed49193675a4286854cfb2dd7fb0468`. The archive is at
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/runtime-preparation-p4`. Earlier P3, P3-R1 and V1 archive hashes remain unchanged.
All original application, native operator and evidence identities remain distinct.
The next approval, if granted, applies only to the frozen P4 operation and its
recorded limits; no prior allowance is reopened.
