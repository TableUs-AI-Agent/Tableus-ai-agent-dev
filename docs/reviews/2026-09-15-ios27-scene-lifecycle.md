# Proposed local repair: iOS 27 scene lifecycle

## Problem and evidence

Physical iPhone launch fails for frozen application
`2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`. Two independently captured
crash reports match the installed executable UUID and trap on UIKit's
`UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption` path. The signed
artifact was built with Xcode 27.0 / iPhoneOS 27.0 and lacks a scene manifest.
The physical phone runs iOS 27.0. Earlier deterministic iOS verification ran on
iOS 26.5 and remains valid only for that tested combination.

[Source-bound crash evidence](../evidence/plan-refresh-staging-2ad48a8/iphone-launch-failure.json).
[Apple requires the scene lifecycle for this SDK/OS combination](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle).

The approved five-cache and two disposable-device cleanups are complete. Saved
staging devices, account data, signed artifacts, receipts and logs remain. The
Android readiness build was deliberately stopped after diagnosis, with no APK
exported; this is not an Android application compilation failure. Both telemetry
builds are unstarted. No successful iPhone session/readiness claim is made.

## Proposed implementation scope

1. Create a separate `codex/ios27-scene-lifecycle` worktree from the operator
   branch. Preserve the old application, deployment, receipts and evidence at
   their actual identities; do not amend or relabel them.
2. Update only the necessary SDK 57 runtime dependency: Expo 57.0.18 to exact
   57.0.23, with its required transitive lockfile changes. Keep React Native
   0.86.2 and unrelated direct dependencies fixed unless a demonstrated conflict
   requires an explicit scope update. No SDK 58 migration.
3. Integrate the official opt-in scene lifecycle at prebuild/config level.
   Prefer the published package once available. The registry returned E404 for
   `@config-plugins/expo-uiscene-lifecycle` at 21:27 UTC on 2026-09-15.
   If still unpublished, review and adapt a small local config plugin against
   immutable official revision `9d8dccc6fc7c3c529c1d9ab9f2d2df63a7ae61d4`,
   preserving applicable license/provenance. Do not patch generated `ios/` or
   copy Expo's native lifecycle runtime into TableUs.
4. Validate the *installed Expo package version*, not merely the normalized
   `sdkVersion`. Current resolved config reports `57.0.0` for installed
   `57.0.18`; upstream's source compares this normalized field to `57.0.23`.
   Resolve that integration issue in deterministic checks before native builds.
   Reject unsupported/custom AppDelegate shapes and conflicting scene manifests.
5. Add a build/inspection compatibility guard for SDK 27 scene adoption so this
   combination fails early rather than compiling an app that cannot launch.
   Preserve native transport, signing, link allowlists and runtime-config gates.

The runtime patch is published and contains the scene runtime; the plugin is
explicitly experimental. Updating Expo alone does not opt into the lifecycle.
References: [runtime backport](https://github.com/expo/expo/pull/50191),
[plugin and its review](https://github.com/expo/config-plugins/pull/326),
[Expo changelog](https://github.com/expo/expo/blob/sdk-57/packages/expo/CHANGELOG.md).
Only Xcode 27 is currently installed. An Xcode 26.6 rebuild is an alternative,
but requires another large toolchain installation and does not adopt the new
lifecycle. A broad SDK 58 migration is unnecessary for this bounded repair.

## Local validation and exit criteria

- Fail-before/pass-after checks against generated SDK 57 AppDelegate and plist:
  runtime compatibility, single-scene manifest, one React Native startup path,
  factory-provider conformance, preserved existing URL/AppDelegate integration,
  rejection of incompatible manifests/templates, and repeated-prebuild safety.
- Exercise the actual Expo config/prebuild pipeline with the installed runtime,
  not just a hand-written mutation fixture. Compare generated native output;
  do not commit it.
- Focus auth restoration, foreground/hidden-route/manual refresh and link tests;
  run `make ready` once after the local change stabilizes. Record dependency
  deltas and relevant native compatibility risks. No Security Scan.
- Freeze a new candidate and prepare its exact source review and acceptance
  request. Nothing from the old native or hosted candidate becomes proof for
  the new source merely because the JavaScript screen change is unchanged.
- Before additional live acceptance, require a fresh budget reconciliation:
  latest successful provider aggregate is 329, but two post-crash connector
  queries failed. HTTP metadata showed no detail reads or app writes in that
  interval. Current ledger is zero observed new Places/generations, one of four
  sign-in messages conservatively counted, one delivered web canary per provider.

## Separate execution boundary

This request permits local dependency/config/operator changes and deterministic
checks only. It does not authorize further native builds, installation, CI push,
deployment, production/store/cohort changes or expanded provider/message caps.
After the patch is concrete and checks pass, prepare the smallest new-candidate
execution plan: prove iOS 27 startup first, then cold/warm auth and private links,
foreground/manual-refresh behavior and source-bound remaining platform evidence.
Do not run the remaining old-candidate telemetry profiles.

A new dependency exception is needed because the currently approved execution
plan explicitly says: “No Security Scan, dependency upgrade or production release
is included.” Native lifecycle behavior is also an architecture boundary under
AGENTS.md. The new source will need matching review acceptance before deployment.
