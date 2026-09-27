# F1 candidate impact and native revalidation proposal

**Prepared only; no native build or replay is authorized by F1.** The approved
local fix is complete. Frozen application: `8972865893a3f018a064594457dc9cc664f8a61f`; build operator:
`16603dd0cf36d27b492e57a02d3c6c438a2563c4`. The evidence-only commit containing
this proposal is a third identity. [Freeze and capacity](n1-f1-freeze.json) and
[local verification](n1-f1-result.md) bind the exact sources and passing checks.

## Impact

Only `mobile/src/lib/links.ts`, `mobile/app/join/[id].tsx` and their two test files
change application/test content relative to ed8330a. Backend, web, shared packages,
lockfiles, profiles, native config and dependency versions match the prior app.
Executable scripts match operator 16603dd. F1 changes join processing on both
native platforms and the Expo web join screen. The Next.js client is unchanged.
The full local checks cover this impact, including Expo web export; native and OS
observations are still required.

| Evidence | Treatment for the new SHA |
| --- | --- |
| F1 focused regressions, complete make-ready targets and contract drift | Fresh and bound to this candidate's exact executable/test files |
| Existing operator implementation and retention procedure | Reusable after clean-source, dependency and toolchain checks; no operator code change needed |
| ed8330a artifact/receipt/inspection, dSYM/maps and D1 frame resolution | Historical only; new artifact and embedded SHA need fresh inspection, hashes and matching symbols/maps |
| ed8330a lifecycle/offline passes and stopped link attempts | Retain all; rerun once on each new platform artifact after authorization, never relabel |
| Accepted f94a1d9 staging evidence and deployed ed8330a web | Unchanged component evidence; no mixed-SHA cumulative acceptance |
| Original AppHang and debugger-run crash | Unresolved; preserve original artifacts and reports; successful new cycles do not clear them |

## Next bounded native scope, after a separate approval

1. **Capacity and exact inputs.** Require at least 40 GiB free before each build
   and stop below 20 GiB during it; current `21.02` GiB fails. No deletion is
   included. Recheck existing toolchain, clean operator 16603dd, candidate tree,
   pinned dependency graph, collision-free output paths and no concurrent native
   job. Use already installed SDKs/runtimes. Any alternative storage target needs
   a recorded amendment first. No output root has been created by this proposal.
2. **One replacement iOS attempt.** Request one `test-ios` attempt for this SHA,
   maximum 90 minutes, including the same frozen dependency fetch/existing Expo
   configuration reads described in the original N1 proposal. Stop on any failure;
   the prior iOS attempt remains consumed. Use new build ID
   `local-ios-test-8972865-f1-01` and private root:
   `/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1`. Invoke the unchanged retained operator, which creates a clean
   detached candidate workspace. File-backed diagnostics and mode 0700 apply.
   Artifact `test-ios.app`, `test-ios.inspection.json`, `test-ios.receipt.json`
   and `test-ios.diagnostics` must be new. Run the helper's no-build preflight
   first; the actual compile is a distinct, approved step.
3. **Fresh proof before replay.** Match retained source/dependencies, embedded SHA,
   native transport, signer, receipt and artifact hash. Require complete retained
   diagnostics, matching native UUIDs and actual app-frame source resolution,
   plus exact executed-bundle/composed-map provenance and app/route-frame
   symbolication. Do not repeat the five failed debugger-launch recipe; prepare
   and hash a bounded capture based on the successful D1 method before execution.
   One capture, D1's prior bounds, stop on crash or missing proof. No deliberate
   crash or application instrumentation.
4. **Isolated deterministic runtime.** Create one new disposable iOS 26.5 target
   using the installed runtime; record its ID before installation. Preserve all
   accepted devices and the earlier R2 simulator. Telemetry off, stripped live
   credentials, loopback-only backend/proxy, private logs. Run lifecycle once and
   offline/refresh once (all five refresh phases), at most 30 minutes each.
5. **Corrected link matrix once cold and once warm.** Before replay, hash a new
   harness against this SHA. Keep the observed encoded-plus case and add the
   literal-percent regression. Cover current URL-safe capability, encoded
   delimiters, Unicode, plus/space, literal escaped bytes/percent, empty/missing,
   duplicate/encoded duplicate key, invalid/incomplete UTF-8, malformed percent,
   invalid UUID/separators/extra path, rotated token and current token. Duplicates
   and malformed input must show invalid and make **zero POSTs**, replacing the
   old unexecuted legacy-parser assumptions. Valid synthetic probes must preserve
   exact bodies at the local proxy; reject synthetic probes before upstream.
   Only the intended current-token fixture may join; snapshot other plans and
   assert identity/count/status. No link auto-submission. At most 2 KiB per URL,
   five seconds per observation, no stress loops or retry-to-green.
6. **Exports only after prior gates pass.** Exactly two local Account export /
   share-dismissal / background / foreground / terminate / relaunch / Account-read
   cycles, one cold and one warm. Observe the real dismissal control before
   canceling; never send externally. Retain timestamped passive main-thread
   samples. Any >=2-second stall, crash, blocked valid action, invalid session,
   unexpected write/provider request or failed runner stops the sequence.
   Five seconds is only an observation cutoff. Retain every failed output.

The build command, from the exact retained operator checkout and only after the
future approval/preflight, is:

```bash
make local-mobile-build PLATFORM=ios PROFILE=test-ios \
  SHA=8972865893a3f018a064594457dc9cc664f8a61f BUILD_ID=local-ios-test-8972865-f1-01 \
  APP=/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios.app \
  INSPECTION_REPORT=/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios.inspection.json \
  RECEIPT=/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios.receipt.json \
  DIAGNOSTICS=/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios.diagnostics
```

## Canonical HTTPS and auth presentation: distinct remaining gates

The test-ios artifact has no associated-domain entitlement and its demo actor is
always approved. Custom-scheme success cannot demonstrate canonical OS delivery,
and a Plans redirect cannot demonstrate the sign-in presentation.

A concrete local-dispatch candidate is an external XCTest harness using
`XCUIApplication(bundleIdentifier: "com.tableus.app").open(URL(...))`.
The installed XCUIAutomation header declares `openURL:` available on iOS 16.4+
([Apple API reference](https://developer.apple.com/documentation/xcuiautomation/xcuiapplication/open(_:))).
This is **availability evidence only**. Prepare the harness in a separate operator
checkout and obtain explicit harness-compilation/device-probe approval. First
probe only one benign canonical URL with a bundle-bound target and hosted network
blocked; record foreground target, URL arrival and PID before/after. Stop if it
opens a browser, cannot deliver the URL, or restarts a claimed warm launch. No
private debugger invocation or changed application bytes. Passing this probe can
support local parser coverage; it cannot establish physical universal-link trust.

For auth-mode presentation, use the existing `auth-test-ios` profile on a separate
new disposable simulator, with the same application SHA, demo disabled, existing
approved staging public configuration, telemetry off and no stored session. This
requires **its own additional build/configuration/probe approval**, not the one
test-ios attempt above. Enforce no hosted product/auth request during presentation;
stop on any unexpected request. Observe canonical sign-in versus join forms via
the verified dispatch harness, with no email/code submission. A failed feasibility
probe stays blocked; no auth guard bypass or new profile is authorized.

Wrong-origin and web-only auth-confirm association controls require actual OS
link selection on a correctly signed associated-domain artifact. Bundle-forcing
a URL bypasses that selection and cannot prove origin rejection. Keep this
separate from local parser results: prepare a signed physical `links-test-ios`
or later N2 readiness scope, with entitlement/association checks, safe negative
links and separately budgeted valid-link hydration, before execution. This is
not current F1 authority. Unreachable cases remain blocked, not passed; N1's
original exit criteria are not silently weakened or moved to N2.

Android's old single attempt remains unused but was bound to ed8330a. Explicitly
rebind a future `test-android` attempt to 8972865893a3f018a064594457dc9cc664f8a61f only after iOS gates and capacity
pass; use `local-android-test-8972865-f1-01` and separate outputs under this root.
Run the same fresh artifact/symbol/local-behavior requirements sequentially. No
Android compilation starts automatically from this proposal.

N2 readiness builds/accepted-device updates, live reads, telemetry, OTP, providers,
CI, deploys, merges, symbol uploads and stores remain separate. Preserve Places
92/100 (baseline 329; 8 unused and closed), emails 2/4, canaries 6/6 per provider,
fresh Gemini 0/0 and backstop 429. No budget reset or September 30 extension.
