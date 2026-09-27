# F1-O1 — stopped on simulator platform crash

The [approved](n1-f1-o1-approval.json) additional offline attempt stopped after
182.790 seconds. `create-failure` passed; `create-retry` failed its first assertion
before a retry tap. Nine later flows and all refresh phases were not reached.
The single extra attempt is consumed. Links, Account exports and Android did not
run. The [machine-readable record](n1-f1-o1-result.json) binds the private evidence.

Application remains `8972865893a3f018a064594457dc9cc664f8a61f`; build operator remains
`16603dd0cf36d27b492e57a02d3c6c438a2563c4`. Build `local-ios-test-8972865-f1-01`
retains artifact SHA-256 `98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`.
The unchanged, approved O1 driver/runner/proxy hashes are in the approval and
execution record. Evidence base is `838e6f5e0d42c548acd620a8e4f219dcf901dfa9`;
the checkpoint commit is separate from application and operator identities.

## Observed failure

Times below are UTC on September 23 (September 22 in Chicago).

| Time | Observation |
| --- | --- |
| 03:56:44.463 | One plan create reached the local deterministic backend with status 200; the configured proxy dropped its response. |
| 03:56:55.589 | First flow's screenshot completed, showing the ambiguity message and **Retry creating plan** button. |
| 03:56:56.8628 | SpringBoard PID 94309 crashed: `EXC_BAD_ACCESS` / `SIGSEGV`, invalid address `0x20`, faulting frame in `XCTAutomationSupport`. |
| 03:57:02.160 | Replacement SpringBoard PID 17600 observed the surviving TableUs PID 17298 in background. |
| 03:57:42.964 | The second flow started its first assertion. Failure screenshot shows the iOS home screen. No retry tap ran. |
| 03:58:06.790 | Driver cleanup terminated the surviving TableUs process. |

The faulting frame is
`__66-[XCTAutomationSession initWithAccessibilityFramework:dataSource:]_block_invoke`.
The retained SpringBoard report SHA-256 is
`323b12e29c459c53cc2c55acbe596f9ff4eebb7eb5350c24d4ab68c06efa49ba`.
The journal contains ten events, including one create POST and no retry POST.
The driver's empty crash list is **TableUs-specific**; it does not mean the
simulator platform remained healthy. The post-stop check confirms TableUs stopped
and ports 7999, 8000 and 8001 free.

This establishes a platform disruption during the flow transition. It does not
establish an application retry defect or identify the precise triggering XCTest
action. A [Maestro issue](https://github.com/mobile-dev-inc/maestro/issues/3494)
reports the same SpringBoard signature after serial flows on iOS 26.5. That is
corroboration, not proof of an identical cause or a verified fix for this host.
The first F1 refresh-error assertion failure remains separately unresolved: O1
did not reach it. Historical AppHang and debugger failures also remain unresolved.

## Evidence and verification

Private evidence lives under
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios-offline-f1-o1`.
It includes both command records, screenshots/hierarchies, Maestro/XCTest/device
logs, proxy journal, driver result, SpringBoard report, a passive unified-log
capture and post-stop check. Fresh preflight rechecked all 42 diagnostic hashes,
native UUIDs and 50 mapped source contents, installed bundle, target, free ports
and 23.23 GiB free capacity. No new compilation occurred.

Prepared downstream adapters passed synthetic prerequisite checks and reject the
actual failed O1 result. They were not run against the device. They remain bound
to O1 and cannot be reused for a different attempt without explicit review.
Application verification is reused for exact 8972865 bytes: 292 JavaScript and
98 Python tests, three PostgreSQL skips. This evidence-only checkpoint does not
repeat the full suite or confer cumulative native acceptance.

The next prepared action is the [F1-P1 platform probe](n1-f1-platform-probe.md).
No further native run is authorized by the exhausted O1 allowance. Do not add a
foreground/relaunch workaround that conceals a SpringBoard restart or discards
the pending ambiguous-write state.
