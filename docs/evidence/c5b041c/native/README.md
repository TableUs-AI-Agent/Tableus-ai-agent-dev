# c5b041c native verification

Application source: `c5b041c85f4f7b959436c13bef48c959622c624f`.
Operator tooling reference: `211ff1c7876694a4b2db677ec26fe5741a6770cb`.
The operator files are unchanged across local evidence descendants; the
[dispatch ledger](operator-provenance.json) records their actual checkout SHAs.
This evidence checkpoint is local; publishing the branch would trigger another
Vercel Preview. The deployed application remains the frozen source above.

| Profile | Artifact and receipt | Device evidence |
| --- | --- | --- |
| `test-ios` | Accepted; simulator bundle contains arm64 and x86_64 | iOS 26.5 lifecycle and offline mutation journeys passed |
| `test-android` | Accepted; APK contains arm64-v8a only | API 36 lifecycle and offline mutation journeys passed |
| `readiness-ios` | Signed IPA installed on the provisioned physical iPhone | Session restoration/relaunch and physical auth link pass; remaining journey pending |
| `readiness-android` | Signed APK installed; package manager verifies the canonical domain | Owner sees returning sign-in; live journey pending |
| `telemetry-test-ios` | Simulator bundle, inspection and receipt accepted | Delivery pending |
| `telemetry-test-android` | Signed APK, inspection and receipt accepted | Delivery pending |

The [final artifact matrix](artifact-matrix.json) validates all six preserved
artifacts against their actual checksums, inspection reports, receipts, expected
signers, exact source tree and dependency lockfile. Build timestamps confirm
sequential execution. This check does not claim physical or live acceptance.

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

Both readiness and telemetry pairs passed inspection and receipt validation. Their
[compiled bundles](compiled-source-checks.json) contain the expected `c5b041c`
source literal and exclude the inherited `daa89a0` source literal. This checks
build input resolution; telemetry delivery still needs an actual canary.
The [iOS provisioning check](readiness-ios-provisioning.json) confirms the paired
iPhone is covered and the profile remains valid until 2027-08-24. The owner
connected the phone after all builds finished. The candidate's readiness runner
re-inspected, privately copied and re-hashed the signed bytes before installation
on each platform. It reached the first manual confirmation on both.

The [physical iPhone progress](ios/readiness/ios-readiness-progress.json) records
the owner's observed approved-session restoration, persistence after full close
and relaunch, and the canonical `/auth` link opening TableUs from Notes. The
[Android progress](android/readiness/android-readiness-progress.json) records
installation, the package manager's verified domain and the owner's sign-in
screen observation. These are explicitly incomplete progress reports; the
candidate's full readiness runner has not passed either complete live journey.
The session check follows [Supabase's session model](https://supabase.com/docs/guides/auth/sessions);
the result above is the owner's actual observation on the installed build.

The owner restored access to the existing TableUs PostHog project and Sentry
staging organization. The [PostHog baseline](posthog-canary-baseline.json) uses
the verified event schema and an exact release filter, following the official
[filtering guidance](https://posthog.com/docs/product-analytics/trends/filters).
The [Sentry baseline](sentry-canary-baseline.json) confirms the three staging
projects and an empty exact-release/environment search. Neither is delivery
evidence; actual authenticated canaries remain outstanding. A subsequent
[aggregate iOS app-open query](ios/readiness/ios-app-opened-telemetry.json)
observed one event for this exact release after physical installation, confirming
basic analytics delivery. This does not replace the dedicated canaries.

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
