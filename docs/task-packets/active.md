# Active packet: resolve the iOS 27 launch blocker

## Status

The frozen `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd` staging verification
is paused after a confirmed physical-iPhone launch crash. Use one primary agent.
This is the only active packet. The [bounded local repair proposal](../reviews/2026-09-15-ios27-scene-lifecycle.md)
was approved by the owner on 2026-09-15. The local dependency/configuration
repair is implemented; freeze/review follows deterministic validation.

The signed app installed after the owner resolved Screen Time, but iOS 27 traps
because the Xcode 27 build lacks scene-lifecycle adoption. Two crash reports
match the installed executable. No iPhone readiness phase passed. The earlier
iOS 26.5 deterministic result does not certify this SDK/OS combination.

Both explicitly approved cleanup stages completed: five obsolete npm caches and
the two finished disposable deterministic devices. All saved staging devices,
account data, accepted artifacts/receipts and evidence remain. The Android
readiness build started with 23.25 GiB free, then was deliberately stopped once
the required native dependency change was identified; no APK was exported.
The two telemetry profiles remain unstarted. Preserve the raw build logs.

## Next bounded objective

Complete local validation and freeze/review the minimum SDK 57 scene repair in
`codex/ios27-scene-lifecycle`. Expo is pinned to 57.0.23; the official plugin was
still unpublished, so the approved attributed local adaptation is used. Actual
prebuild comparison now passes before/after/repeated generation. Keep React
Native 0.86.2 and application providers unchanged. Run `make ready` once.

Prepare exact-source review acceptance and the smallest separate execution
request: first an inspected signed iOS build and iOS 27 launch/relaunch proof,
then cold/warm canonical and private links plus lifecycle/refresh regressions.
Do not start compilation, installation, CI push, deployment or live calls under
the local repair approval. Do not restart old-candidate builds or ask the owner
to keep reopening the crashing app.

Local validation passes: 226 JavaScript tests, 98 Python tests with three local
Postgres skips, actual before/after/repeated prebuild and all `make ready` targets.
[Evidence](../evidence/ios27-scene-repair/local-validation.json) records limits and retained
harness failures. No new native build, installation, live call or deployment ran.

## Preserved acceptance and boundaries

Hosted staging/Preview and CI pass for 2ad48a8. Both deterministic artifacts
passed on their recorded OS/toolchain. The iPhone readiness artifact passed
source/config/signing inspection but fails launch on iOS 27. Web organizer
sign-in, reload restoration, export/read-only deletion readiness and one canary
in each provider pass. Current ledger: zero observed new Places/generations,
one of four sign-in messages conservatively counted. Latest verified provider
aggregate is 329; two later connector reads failed, so reconcile before any new
live phase. The staging backstop remains 409.

No app-data deletion, Security Scan, production/store/cohort change, new
resources/secrets or migration is authorized. The old source-review acceptance
and native receipts remain bound to their exact source. Do not turn a canceled
build or a reported launch crash into successful readiness evidence.
