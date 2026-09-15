# Deterministic native verification of explicit plan refresh

Application source: `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`.
Operator branch: `codex/plan-refresh-verification`. The application is frozen;
new flow/proxy changes run from the operator checkout and have separate identity.

[iOS execution](ios-deterministic.json) passes on the inspected app, under operator
`cced1728628d594c1e957f9efc48a03428fa8f4a`. Its build took approximately twenty
minutes; lifecycle, offline recovery and all five refresh phases pass. Scrolling
caused zero reads/writes, delayed repeated taps made one read, and failure/recovery
preserved the saved vote and cached plan. All seven retained screenshots were
visually reviewed. The new iOS simulator is stopped and retained, and its local
services are stopped. Android execution remains pending.

Before Android, the operator's `finalize-failure.yml` incorporates the navigation
already proven in the 6b9719b Android run: scroll the retry control fully into view,
then execute the unchanged visibility assertion. No assertion or request-count
check is removed, and the frozen application is unchanged. This avoids repeating
the known clipped-control test failure. Android will record its actual operator
SHA; the completed iOS evidence retains the operator above.

Android's inspected APK and full lifecycle pass under operator
`62bef563373e64de144c1998c73d87dc3d18c7b3`. Its first offline/refresh attempt passed
all offline UI flows, initial load, zero-read/zero-write scrolling and the delayed
single read. It then stopped because the failure probe required exactly three
HTTP requests but observed two, after the intended error, enabled refresh control
and cached plan assertions passed. The [retained failure](android-attempt-1.json)
is not relabeled as a pass, and the final recovery phase did not execute.

The revised operator guard requires one to three actual injected error responses,
zero upstream requests and zero writes. A query attempt can fail before reaching
the HTTP proxy; the precise cause of this run's lower count is unestablished.
Successful refresh and scrolling still require their exact counts. The guard
rejects zero evidence, excess requests and mismatched injected-error counts, and
the runner now retains safe counters before each assertion. Four focused tests
and one new `make ready` pass: 220 JavaScript, 98 Python and three local Postgres
skips. This check was rerun because operator JavaScript changed.
One offline/refresh retry is prepared on the retained Android test emulator,
reusing the inspected APK and completed lifecycle evidence. No build is repeated.

The owner's request to continue advances the previously identified local device
verification step. The [execution plan](execution-plan.json) is bounded to two
sequential local profiles, `test-ios` then `test-android`, with deterministic demo
data and telemetry off. No paid Places/Gemini calls, sign-in messages, hosted
deployment or installation on a signed-in device is included. The new staging
[source review](../source-review-2ad48a8/README.md) remains pending acceptance.

Both exact-source build-input preflights pass. The prepared build identifiers are
`local-ios-test-2ad48a8` and `local-android-test-2ad48a8`; artifacts, inspections and
receipts use new private paths under `.artifacts/mobile/<application-sha>/`.
Start with at least 20 GiB free and stop compilation below 9 GiB. Observed free
space at preparation is recorded in the execution plan. Native outputs do not
exist until a build and inspection genuinely complete.

Build and inspect iOS first, then run the existing deterministic lifecycle/offline
checks and the opt-in refresh investigation on a new `TableUsRefresh2ad-iOS`
simulator. Only after that passes, build/inspect Android and use a new private
`TableUsRefresh2ad_Android` emulator with four cores and 2 GiB memory. Stop and
retain both test devices afterward; deletion has not been requested. Preserve
the saved staging devices, physical iPhone, original six artifacts and helper state.

The offline runner's opt-in arguments are `--verify-plan-refresh true --refresh-sha
<application-sha>`. Before touching a device, it validates that the embedded app
configuration has that SHA, local demo controls, loopback API, disabled updates
and telemetry off. The new flows use a separate four-candidate fixture with a
previous vote. Their expected proxy observations are:

| Phase | Detail requests | Upstream detail requests | Additional requirement |
| --- | --- | --- | --- |
| Initial plan open | 1 | 1 | Correct fixture appears |
| Two full scroll cycles and four top overscroll gestures | 0 | 0 | Previous vote label; no organizer finalize control |
| Double tap refresh during a delayed response | 1 | 1 | One deliberately delayed response; button recovers |
| Failed refresh, bounded by the configured query retries | 1–3 | 0 | Every observed request receives a synthetic error; cached plan and usable button |
| Explicit recovery | 1 | 1 | Error disappears and the button is usable |

Every phase requires **zero app writes**, both immediately and after a short
quiescence check. The fixture's vote, candidate count and voting status must remain
unchanged. Three screenshots, phase counts, actual artifact checksum, application
SHA and operator SHA are recorded separately from the existing offline report.
Opt-in flow logs/screenshots are retained privately even on failure. Failures stop
the sequence for investigation; they do not authorize automatic retries or later
profiles. No native outcome is claimed by preparation alone.

[Local tooling validation](local-validation.json) passes all `make ready` targets:
219 JavaScript and 98 Python tests, three local Postgres skips. Four focused proxy
and evidence tests pass, and all five new flow files parse as YAML. These checks
do not execute Maestro on a device. The flow design uses documented
[state selectors](https://docs.maestro.dev/reference/selectors/state-selectors) and
[swipe controls](https://docs.maestro.dev/api-reference/commands/swipe).

Later hosted work, the other four native profiles, real-session verification and
cumulative acceptance require their own source-bound execution scope. The paused
6b9719b live run remains at 60/80 Places attempts and three of four messages; this
local work does not increase or spend that allowance.
