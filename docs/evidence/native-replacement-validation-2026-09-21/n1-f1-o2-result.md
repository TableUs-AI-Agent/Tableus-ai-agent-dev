# F1-O2 — stopped on a repeated SpringBoard crash

**O2 failed after 88.308 seconds. Its one extra offline attempt is consumed.**
The [owner's approval](n1-f1-o2-approval.json) allowed one run, with links and
exports conditional on success. They did not run. The
[structured result](n1-f1-o2-result.json) binds all retained logs, command records,
screenshot, proxy journal, crash report and cleanup checks.

The separately [approved older support-cache cleanup](n1-f1-o2-old-support-approval.json)
completed, recovering 5.689 GiB while retaining current support and native evidence.
[Fresh preflight](n1-f1-o2-old-support-result.json) passed with 25.34 GiB free,
matching source/artifact/receipt/operator and target checks. Application
`8972865893a3f018a064594457dc9cc664f8a61f`, build
`local-ios-test-8972865-f1-01`, artifact `98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`,
build operator `16603dd0cf36d27b492e57a02d3c6c438a2563c4`, and iOS 26.5 target
`CBB4FAB4-734C-413C-9F10-850329AC9A01` were unchanged.

## Observed result

The first `create-failure` flow has 25 completed commands and one legitimate
skipped conditional Open-in-TableUs prompt. Its screenshot shows the expected
ambiguous-write message and Retry creating plan button. One create POST reached
the deterministic backend with a 200 response, which the configured proxy dropped
after commit. There was no retry POST. This is UI-command evidence, not a passing
flow or run: the platform-health gate failed before successful runner completion.
The other ten flows, all five refresh phases, 44 link cases and two exports never
started. The original refresh failure remains unresolved.

| UTC event on September 23 | Evidence |
| --- | --- |
| 05:18:42.874 | Backend returned the committed create response; proxy dropped it |
| 05:18:53.688 | Final screenshot command completed |
| 05:18:55.3224 | SpringBoard PID 17600 crashed in XCTest accessibility support |
| 05:18:55.556384 | Host monitor detected the missing bound PID and replacement 37381 under unchanged simulator parent 94306; TableUs PID 37176 was still present |
| 05:19:04.339203 | Driver finished failed after SIGINT stopped its runner group and TableUs termination returned zero |

The delayed `.ips` reports `EXC_BAD_ACCESS`/`SIGSEGV` at address `0x20`, with top
frame `__66-[XCTAutomationSession initWithAccessibilityFramework:dataSource:]_block_invoke`
in `XCTAutomationSupport`. This is a separate recurrence of O1's signature, with
its own timestamp and PID. It does not prove the exact trigger, assign app fault,
or clear any historical crash/AppHang. The report arrived after the driver had
stopped; its empty immediate crash-report list does not mean no platform crash.

The host observer made 70 observations and stopped on process identity before
that report appeared. Root's delayed check retained the report. Cleanup confirms
TableUs, driver, Maestro/XCTest and local services stopped; ports 7999/8000/8001
are idle. The actual failed result is rejected by the unchanged downstream gate.
A narrow host log query contained no events; no causal claim is based on it.

## Assessment and remaining gate

[Upstream issue #3494](https://github.com/mobile-dev-inc/Maestro/issues/3494)
reports the matching iOS 26.5 signature and has no verified fix. The
[2.8.0–2.10.0 source comparison](https://github.com/mobile-dev-inc/Maestro/compare/cli-2.8.0...cli-2.10.0)
contains iOS appearance APIs rather than a reviewed XCTest-session fix. Root and
Sol inspected the comparison; this is source-review evidence, not proof that all
versions behave identically. A blind Maestro upgrade is not a demonstrated remedy.

An already installed iOS 27.0 (24A434) runtime provides a different, controlled
diagnostic variable. The [O3 comparison proposal](n1-f1-o3-proposal.md) defines that bounded next
experiment; no further native execution is authorized by this result. Any future result must
keep runtime/device identity explicit and cannot inherit 26.5 D2/lifecycle
acceptance for a new target. Export sampling preparation remains unexecuted, with
attachment/readiness/schema and actual main-thread stall detection unverified.

Fresh checks covered cleanup, artifact/source bindings, command states, request
journal, process/crash identity, downstream rejection and evidence hashes. Reuse
the exact unchanged application result: 292 JavaScript and 98 Python tests,
three PostgreSQL skips. No full-suite rerun, application edit, build, SDK/tool
upgrade, provider call, deployment, merge, store action or historical hang
clearance. Keep this incomplete native objective in its current task.
