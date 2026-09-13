# c5b041c native verification

Application source: `c5b041c85f4f7b959436c13bef48c959622c624f`.
Operator source: `211ff1c7876694a4b2db677ec26fe5741a6770cb`.
This evidence checkpoint is local; publishing the branch would trigger another
Vercel Preview. The deployed application remains the frozen source above.

| Profile | Artifact and receipt | Device evidence |
| --- | --- | --- |
| `test-ios` | Accepted; simulator bundle contains arm64 and x86_64 | iOS 26.5 lifecycle and offline mutation journeys passed |
| `test-android` | Accepted; APK contains arm64-v8a only | API 36 lifecycle and offline mutation journeys passed |
| `readiness-ios`, `readiness-android` | Inputs/configuration passed; iOS building | Pending |
| `telemetry-test-ios`, `telemetry-test-android` | Inputs/configuration passed | Pending |

## Observed deterministic results

- [Lifecycle](ios/lifecycle/ios-summary.json): two participants, four candidates,
  ranked votes, finalization, reopening, rotated-link rejection and stale-result
  clearing. Synthetic screenshots show the finalized plan and rejected link.
- [Offline mutations](ios/offline/ios-offline-summary.json): one created plan,
  zero constraint requests while offline, one explicit online constraint write,
  and one finalization event. Both interrupted mutations reused the same
  idempotency key for their explicit retry. Synthetic screenshots show the
  recoverable failure and successful final state.
- [Inspection](artifacts/test-ios-inspection.json) and
  [receipt](artifacts/test-ios-receipt.json) bind the same artifact digest:
  `61d4d12a25d2857942402095a9fea24e97e7b0e8d0ddca1d586b4c945c5735f2`.
  The compiled configuration uses loopback, demo/local E2E and telemetry off.

Android's [lifecycle](android/lifecycle/android-summary.json) and
[offline mutations](android/offline/android-offline-summary.json) passed the same
assertions. Its [inspection](artifacts/test-android-inspection.json) and
[receipt](artifacts/test-android-receipt.json) bind APK digest
`716370574aa91aed4834c37a9866011c9a114b11d3162007a903840c18d7b860`.
The configured AVD's system image was already installed in the Homebrew SDK;
an explicit system-image path resolved startup without downloading an image.

The first iOS lifecycle attempt timed out while starting the local backend, before
app installation. A measured clean restart became ready in 4.499 seconds;
the unchanged journey then passed. The original delay was not conclusively
isolated, and no deadline or application behavior was changed to obtain a pass.

[Input preflight](input-preflight.json) records all six resolved configurations,
toolchain versions and private launcher hashes. The hosted launcher supplies the
existing staging origins for Expo's initial config read. All artifacts are
built from fresh detached exact-source checkouts with locked dependencies,
then inspected by that source's own tooling before issuing a receipt.

## Storage and limits

Accepted artifact bytes, receipts and raw logs are private under the original
checkout's ignored `.artifacts/mobile/<full-source-sha>/`, outside OS temp and
disposable worktrees. Tracked summaries replace device identifiers with their
platform/runtime; screenshots contain deterministic synthetic fixtures only.
The reports' source hashes, artifact hashes, counts and results are unchanged.

Visual review also observed the framework's default tab glyphs on both clients.
Text labels and navigation work; explicit icons or text-only styling remain
polish for the next client candidate before store distribution. The screenshots
are retained unchanged, including this observation.

These simulator/demo results do not establish physical-iPhone link behavior,
real Supabase session recovery, cross-client live-provider acceptance or
telemetry delivery. The existing exact-candidate security-evidence requirement
also remains unresolved; no canceled scan was restarted. See
[execution status](execution-summary.json) and the active packet for next steps.
