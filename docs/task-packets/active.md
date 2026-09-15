# Active packet: resolve the iOS 27 launch blocker

## Status

The frozen `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd` staging verification
is paused after a confirmed physical-iPhone launch crash. Use one primary agent.
This is the only active packet. The [bounded local repair proposal](../reviews/2026-09-15-ios27-scene-lifecycle.md)
is prepared; the dependency/lifecycle scope exception awaits owner approval.

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

After owner approval of the linked local scope, prepare the minimum SDK 57
scene-lifecycle repair in a separate worktree. Use the published Expo 57.0.23
runtime and review the official opt-in plugin integration; its npm package is
not yet available at the latest check. Validate actual prebuild output, native
compatibility gates and affected deterministic tests, then run `make ready`
once. Freeze and review a new source before requesting native/hosted execution.
Do not restart old-candidate builds or ask the owner to keep reopening the app.

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
