# F1-P3-R1 — startup verified; visual Settings result unresolved

The [approved](n1-f1-p3r1-approval.json) [P3-R1 probe](n1-f1-p3r1-proposal.md)
ran once and reached the XCTest HTTP server. It completed in **104.414 seconds**
(104.556 seconds including launcher overhead), with successful cleanup. However,
the retained screenshot is blank apart from system bars, despite Maestro marking
the Settings-title assertion complete. **A fully visible Settings baseline is not
accepted.** No TableUs launch or application acceptance occurred.

## Exact run and evidence

- Proposal/launch base: `732189919f06315ffa2165dfa9b97488837d0e4a`.
- Application: `8972865893a3f018a064594457dc9cc664f8a61f`; build operator:
  `16603dd0cf36d27b492e57a02d3c6c438a2563c4`, unchanged.
- Invoked diagnostic manifest: `ea3ce98fb06d3fbcc5db8178691d0939a92a9ea0eac1b39820c7b7ecb199ec2e`.
- One boot, one control query (8.076s), one Maestro invocation. Five command
  records are `COMPLETED`; flow including owned cleanup took 77.161s.
- Capacity 26.233 GiB before boot and 26.248 GiB before flow; seven-minute total,
  240-second flow and 20 GiB gates remained intact.
- The raw XCTest log records `Running tests`, HTTP listening on 127.0.0.1:62624,
  then `/status` and `/deviceInfo`. These retained observations prove driver
  startup reached the milestone missing in O5; they do not prove O5's cause or fix.

The unchanged driver reports `passed_settings_bootstrap_only`; that raw result is
preserved. Root review qualifies it because the screenshot does not corroborate
the visible-title assertion. The [retained screenshot](/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios-settings-platform-probe-03/maestro-results/settings-1-a0to81d0/debug-output/settings-1/takeScreenshot/settings-probe-1.png) SHA-256 is
`eec3686eee7425d433241a398016a9b52778fe5fb0775aaa3077a9bcda90b6ed`. The assertion completed at 23:22:52.424
local time, and screenshot capture started about 19ms later. The image shows white
content with status/home bars, no Settings title/content. The discrepancy's cause
is unproved; it is not silently converted into a UI pass or a claimed app failure.

## Diagnostic limitation and cleanup

The live observer's final state was `pending_no_recognized_logs` with zero recognized
logs and `acceptance:false`. Actual transcripts exist as `xctest_runner_*.log` and
`debug-output/settings-1/logs/device-xctest.log`; the frozen discovery filter only
included `scheduling.log` and `Session*.log`. Read-only review, not live observation,
establishes HTTP startup here. [T2 local repair](n1-f1-t2-result.md) addresses that
discovery gap for future operators; the invoked frozen operator remains immutable.

All 63 host observations and final health found no monitored SpringBoard/TableUs
crash, no SpringBoard replacement and no TableUs process. This is not an all-service
crash census. Settings termination and target shutdown succeeded; no owned process
or collector required a signal. Independent post-stop verification confirmed all
three targets Shutdown, no matching processes and idle ports 7999/8000/8001.
Free space then measured 26.238 GiB.

The [machine-readable result](n1-f1-p3r1-result.json) binds actual output to the
separate P3-R1 approval/launch record; the frozen operator internally labels it
`F1-P3`. Retention index `04315d494d461cf569065c7e6cfe41fefbd636732709a0a2f80717a55b701cec` covers 45 files,
2,748,300 bytes and the declared `results` symlink to this run's Maestro directory.
Old P3/S2 and native evidence remain intact. Astra inspected command hashes and
screenshot; Luna independently verified binding, raw startup logs and the discovery
gap. No native result is transferred to the repaired helper.

The one-operation allowance is consumed. No automatic retry or downstream run is
authorized. Resolve the visual evidence discrepancy and prepare stronger visual
acceptance before proposing another bounded native operation. Original refresh,
O1/O2/O5/AppHang and downstream application gates remain unresolved.
