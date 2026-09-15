# Deterministic native verification of explicit plan refresh

Complete for application `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`.
Both inspected test artifacts pass lifecycle, offline recovery and all five
refresh phases. [iOS evidence](ios-deterministic.json) and
[Android evidence](android-deterministic.json) bind actual artifact bytes,
receipts, source, operator identities, reports and fourteen reviewed screenshots.
Both new test devices are stopped and retained; local test services are closed.
No live provider calls, sign-in messages or telemetry delivery occurred.

## Observed refresh behavior

| Phase | iOS detail requests | Android detail requests | Additional observation |
| --- | --- | --- | --- |
| Initial plan open | 1 | 1 | Correct fixture and enabled refresh button |
| Two full scroll cycles and four top overscroll gestures | 0 | 0 | Previous-vote label; no organizer finalization control |
| Repeated refresh taps during delayed response | 1 | 1 | One delayed response; button becomes usable |
| Injected refresh failure | 3 | 2 | Every observed request failed at the proxy; zero upstream reads; cached plan retained |
| Explicit recovery | 1 | 1 | Error disappears; refresh remains usable |

Every phase produced **zero app writes**, immediately and after the quiescence
check. The prior vote, four candidates and voting status remained unchanged.
Failure evidence requires one to three observed HTTP errors, matching injected
error counts and zero upstream requests. All successful/scroll counts are exact.
The reason Android observed two rather than three HTTP attempts is unestablished;
the record does not treat unobserved transport attempts as proxy evidence.

Both offline suites also prove two create attempts with the same key create one
plan; a known-offline constraint write makes no request before explicit recovery;
and two finalization attempts with the same key create one finalization event.
Lifecycle covers two participants, four candidates, votes, finalization/reopening,
rotated-link rejection and stale-run clearing.

## Source, reuse and retained failures

- iOS build `local-ios-test-2ad48a8` and all device phases use operator
  `cced1728628d594c1e957f9efc48a03428fa8f4a`.
- Android build `local-android-test-2ad48a8` and lifecycle use
  `62bef563373e64de144c1998c73d87dc3d18c7b3`. Accepted offline/refresh attempt four
  uses `ec909733c0242b7a10737dc0dda0402f5d5aa87e`. The same APK was re-inspected
  and reused throughout; neither accepted artifact was rebuilt for test repairs.
- [Attempt one](android-attempt-1.json) stopped after its error UI passed because
  the initial guard demanded three arriving HTTP requests and observed two. The
  corrected bound retains zero upstream reads/writes, validates every injected
  response, and rejects zero or excess requests. The runner journals counters
  before assertions. Final recovery did not execute in that failed attempt.
- [Attempt two](android-attempt-2.json) failed the exact retained-title assertion:
  the visible field contained `OOffline resilience dinner`. Its input duplication
  mechanism is unknown. The flow now verifies exact input before submission and
  permits one clear/retype correction. Original post-failure assertions remain;
  no request action is wrapped in the input retry. See Maestro's
  [retry](https://docs.maestro.dev/reference/commands-available/retry) and
  [eraseText](https://docs.maestro.dev/api-reference/commands/erasetext) references.
- [Attempt three](android-attempt-3.json) stopped because forced centering kept
  scrolling a fully visible finalization retry control at the bottom of the page.
  Repeated visibility measurements were 100%; the screenshot confirms the
  control. The correction keeps 100% visibility and the original assertion while
  disabling the extra [centering requirement](https://docs.maestro.dev/reference/commands-available/scrolluntilvisible).

All original failed logs/screenshots/statuses remain separate from the accepted
fourth attempt. The application stayed frozen through every operator change.

## Checks and remaining boundary

The [initial operator checks](local-validation.json) passed 219 JavaScript and
98 Python tests, with three Postgres skips. After the counter/journal change,
[full readiness](retry-local-validation.json) passed 220 JavaScript and 98 Python
tests, three Postgres skips. Four focused guard tests passed. Later YAML-only
input/navigation changes passed parsing and the actual affected Android suite;
no redundant full-suite run or native rebuild was needed.

The iOS build's Expo Doctor result remains 20/21 with an existing dependency
patch warning; Android uses the same locked dependencies. Dependency/advisory
review and native tab presentation remain later release work. These fixture
results do not supply hosted, physical-iPhone association or production evidence.
Saved staging devices and hosted targets still use 6b9719b.

The [next staging request](../plan-refresh-staging-2ad48a8/README.md) and exact
[source review](../source-review-2ad48a8/README.md) are now approved separately
from this completed local objective. All four remaining input preflights passed;
actual hosted and saved-device results remain pending. No Security Scan is included.
