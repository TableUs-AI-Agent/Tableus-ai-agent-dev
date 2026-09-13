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
| `readiness-ios` | Signed IPA installed on the provisioned physical iPhone | Restoration, relaunch, physical auth link and changed-plan foreground refresh pass |
| `readiness-android` | Signed APK installed; package manager verifies the canonical domain | Sign-in, relaunch and canonical links pass; distinct second account joined |
| `telemetry-test-ios` | Simulator bundle re-inspected and installed | Simulator shut down while Android continues; delivery pending |
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
and relaunch, the canonical `/auth` link opening TableUs from Notes, and the new
web-created plan appearing after foreground refresh. The
[Android progress](android/readiness/android-readiness-progress.json) records
installation, the package manager's verified domain, returning sign-in, relaunch
and canonical auth/private-join opening. The owner initially used the organizer's
account on Android; both UI controls and the database's one-participant count
agree. The extra message to use the existing second approved account is now
authorized and used; the owner and database subsequently confirmed two
participants. These are explicitly incomplete progress reports; the
candidate's full readiness runner has not passed either complete live journey.
The session check follows [Supabase's session model](https://supabase.com/docs/guides/auth/sessions);
the result above is the owner's actual observation on the installed build.

The owner restored access to the existing TableUs PostHog project and Sentry
staging organization. The [PostHog baseline](posthog-canary-baseline.json) uses
the verified event schema and an exact release filter, following the official
[filtering guidance](https://posthog.com/docs/product-analytics/trends/filters).
The [Sentry baseline](sentry-canary-baseline.json) confirms the three staging
projects and an empty exact-release/environment search. Neither baseline is
delivery evidence. The subsequent [web canary](web-telemetry-canary.json)
reached PostHog and Sentry with exact-release filters; its Sentry message is
redacted. Evidence comes from the typed PostHog connector and authenticated
Sentry UI, not the standalone read-token collector. Native/API canaries remain
outstanding. A subsequent
[aggregate iOS app-open query](ios/readiness/ios-app-opened-telemetry.json)
observed one event for this exact release after physical installation, confirming
basic analytics delivery. This does not replace the dedicated canaries.

[Web progress](web-readiness-progress.json) records sign-in, one plan, organizer
constraints and read-only account controls. The exported JSON file was verified
in the owner's Downloads after the browser's download-event observation timed
out; no second export was requested and no raw account export is in Git.
[Approval and baseline](live-approval-and-baseline.json) records four messages
at most, one live journey, $0.25 estimated Gemini and 50 Places attempts. So far
creation used two Places attempts and no Gemini call. Existing staging quotas
were read without changing configuration.

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

The deterministic simulator/demo results alone do not establish physical or
live acceptance. The separately observed partial real-session results above
still leave the two-person journey and native/API canaries incomplete.
The existing exact-candidate security-evidence requirement
also remains unresolved; no canceled scan was restarted. See
[execution status](execution-summary.json) and the active packet for next steps.
