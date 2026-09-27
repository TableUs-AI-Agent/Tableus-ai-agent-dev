# F1-O5 — XCTest initialization failed before application testing

The [approved](n1-f1-o5-approval.json) operation ran once on September 23,
06:58:02–07:05:34 UTC, and failed after **452.002 seconds**. App installation
succeeded. The single Maestro invocation produced no UI command results and
accepted **0/11 flows** and **0/5 refresh phases**. No TableUs process or
application request was recorded. O5 is consumed; no native replay or downstream
continuation is authorized. [Machine-readable result](n1-f1-o5-result.json).

## Observed failure

The control query passed in 10.390 seconds. The setup journal confirms device
preflight, uninstall and installation returned exit 0; installation took 17.835
seconds. Maestro then spent 321.260 seconds starting `create-failure.yml` and
returned exit 1 before any retained UI command result. The proxy journal contains
only reset/configure events; the runner's failure counters report zero app proxy
requests, upstream requests and dropped committed responses. Backend readiness
passed.

The retained XCTest session records runner PID **58071** launching at 07:01:29
UTC, printing “Running tests” at 07:01:57, and dying with signal 9 at 07:02:36.
Xcode reports an early exit before bootstrap/connection and no restart. Maestro
continued connection checks until its subprocess returned nonzero; no later flow
was dispatched.

Read-only extraction of the existing simulator log establishes the immediate
kill reason. At 07:02:36.258, `runningboardd` terminated PID 58071 with code
**0x2182BAAD** because its **“XCTRunner Initialization”** assertion was not
invalidated before timeout. The log also records successful termination and the
matching launchd exit reason. This identifies why iOS killed the test runner;
the underlying initialization stall is still unproved. It does not establish an
application defect or a remedy involving longer timeouts or a tool upgrade.

Private evidence root:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios-offline-f1-o5`.
Key files are `setup-commands.ndjson`, `runner.log`, `fault-proxy-events.ndjson`,
`xctest-unified-log-review.txt` (lines 664–691), and the retained XCTest session
and scheduling logs under `xctest-startup-retained`. The latter contains 340
hash-bound files (158,722,310 bytes). Its interrupted result bundle is diagnostic
evidence, not a completed successful xcresult.

## Platform observation and cleanup

All 269 host samples retained SpringBoard **57242** and parent **57238**;
TableUs was never observed. The monitor only collects SpringBoard/TableUs crash
reports. Its empty report field does not cover all simulator services or XCTest
startup health. The broader post-stop inventory retains nine target service
reports: two AppIntents SIGTRAPs, two EmojiPoster watchdog terminations and five
service SIGTERM timeouts during shutdown. None names TableUs or SpringBoard;
their causal relationship to the initialization stall is unproved.

The driver stopped its process group and shut down the retained target. Its app
termination command returned exit 3, explicitly reporting “found nothing to
terminate”; this raw outcome is preserved. The initial independent check found
one automatic diagnostic collector, PID/PGID **58201**, with the exact O5 XCTest
output path and target UUID. It had its own process group and was reparented.
Root verified its identity, stopped it with SIGTERM at 07:09:21 and retained its
existing output. The final independent check at **07:09:43 UTC** confirms target
Shutdown, no matching target/runner/known-child processes, and idle ports
7999/8000/8001. Data and artifacts remain retained; free space was **22.80 GiB**.
This supplemental cleanup remained inside the approved 35-minute total window.

## Identity, checks and remaining work

Application **8972865893a3f018a064594457dc9cc664f8a61f**, build operator
**16603dd0cf36d27b492e57a02d3c6c438a2563c4**, and build
`local-ios-test-8972865-f1-01` are unchanged. The retained iPhone 17 Pro target
`0EFFA766-DCDD-49E5-84B0-D3593B68709A` used iOS 27.0 **24A434**, Maestro 2.8.0,
and the exact approved O5 archive. Fresh free space was 25.58 GiB before boot and
24.58 GiB before the runner. One boot, one control query and one offline runner
occurred; no device was created. The driver enforced both older targets Shutdown
before boot/UI, but did not separately retain those inventory snapshots.

Root reverified provenance, archive hashes, setup/flow/traffic records, cleanup
and diagnostic hashes. Sol corrected a closeout-parser default path that still
pointed to O4; all nine parser regression checks passed again under root review.
The corrected parser validates the O5 manifest and still rejects diagnostic
acceptance. Luna supplied a bounded read-only outcome audit; root supplemented
it with the later unified-log termination and final cleanup evidence. These
closeout changes do not alter the approved operator. The exact application's
292 JavaScript and 98 Python tests, three PostgreSQL skips, and prior complete
readiness checks are reused; this evidence-only checkpoint does not rerun them.
Changed-file scope, two JSON files, 89 local links and 497 private evidence hashes
pass verification; application and tracked executable tooling are unchanged.

The next bounded objective is **local-only test-operator preparation**: detect
XCTest startup failure, retain its child diagnostics as they are produced, and
clean up proven owned diagnostic collectors. Validate against O5's retained
failure and mocked fixtures. This can be prepared without a native attempt;
it would improve observability, not claim to fix the initialization stall.
Any subsequent native comparison needs a concrete hypothesis and separately
bounded authorization. No automatic O6 retry or timeout increase is proposed.

The original refresh failure, O1/O2 accessibility crashes and historical AppHang
remain unresolved. iOS 26.5 D2/lifecycle acceptance does not transfer to this
iOS 27 target. Links, exports, canonical/auth probes, Android and N2 remain gated.
Web/API/accepted native/production identities and all closed provider, OTP and
canary budgets remain unchanged. The native replacement objective remains in
this task; the evidence commit is distinct from application and build-operator
SHAs.
