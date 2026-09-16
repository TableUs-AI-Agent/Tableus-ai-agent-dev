# Closed-beta roadmap

The iOS 27 pilot passed for `f94a1d9d1125e6c9111aa08eda496f014f20d0c0`.
The signed replacement installs and the owner confirms first launch, relaunch
with session persistence, and the canonical auth link. [Pilot evidence](evidence/ios27-pilot-f94a1d9/README.md)
records zero added Places/Gemini usage or emails. The owner approved the
remaining verification. Exact-source CI now passes 226 JavaScript, 101 Python
and four browser tests; API and protected Preview both serve f94a1d9.
[Hosted evidence](evidence/ios27-staging-f94a1d9/README.md) verifies source,
readiness, origins and unchanged associations/protection. Both deterministic native artifacts, `test-android`
and `test-ios`, built and passed independent source/lock/receipt/configuration
inspection. Android took about 23 minutes and iOS about 37 minutes. Three
hosted profiles remain; next is `readiness-android`. Disk recovered to 24.37 GiB.
Deterministic device suites and cumulative live verification are still pending.

Reassessed 2026-09-15. The goal remains an invite-only US beta across web, iOS
and Android. Preserve the implemented architecture and validate the complete
shared-plan journey before adding features or replacing application providers.

## Completed foundations

The versioned backend, persistent data, invite-approved authentication, shared
client contracts, Next.js/Expo clients, deterministic tests, live Places/Gemini
staging and privacy-safe observability are implemented. Historical milestone
evidence is retained. Implementation completion does not imply current-candidate
device or production release acceptance.

## Ordered objectives

| Order | Bounded objective | Exit evidence | External boundary |
| --- | --- | --- | --- |
| 0 | Astra development migration and plan recovery — complete locally | Project model default, concise current documents, recovered candidate/CI/live-smoke record, early native preflight, local checks | Local work; no deployment or inference-provider change |
| 1 | Bound auth restoration and freeze the replacement — complete; `c5b041c` pushed, CI passed and approved staging deployment verified | Shared deadline and mobile recovery tests; local full verification; attributable delta record; [exact-source deployment evidence](evidence/c5b041c/README.md) | Owner approval covers this push/CI and existing staging targets; no new paid-call or native-build allowance |
| 2 | Complete cumulative staging readiness — c5b041c component evidence complete; replacement 6b9719b verification remains | Canonical domains/associations; same-SHA web + physical iPhone + ARM64 Android lifecycle; signed artifact pairs; isolated telemetry; truthful cumulative report | Completed run used 80/100 Places attempts, $0.00056825/$0.25 estimated Gemini and six conservatively counted messages; security review accepted for 6b9719b only; no new scan authorized |
| 2a | Correct device sign-out and redundant client detail refreshes — `6b9719b` frozen locally; checks and source review complete | Local scope/error recovery; hidden-query and foreground request-count regressions; focused checks and one `make ready`; ordinary source review, then freeze | No live calls/builds/deployment here. Security review accepted; affected native/hosted evidence still required for the replacement |
| 2b | Staging source-review acceptance — complete; exact report and two medium risks accepted | Strict version-two evidence; seven review areas and verified Git file hashes; fourteen gate tests and full local readiness pass; [report and risks](evidence/source-review-6b9719b/README.md) | Owner acceptance for 6b9719b is recorded and validates. Replacement hosted/native verification follows under its own approved scope |
| 2c | Verify the replacement on hosted staging and native devices — hosted CI/deployment pass; native execution paused | Exact-candidate CI, inspected sequential builds, real same-account session isolation and plan focus/foreground observations; new source-bound receipts and cumulative input | [Approved execution](evidence/replacement-6b9719b/README.md): 60/80 Places attempts and 3/4 emails consumed; zero fresh generation; retained artifacts bind only 6b9719b |
| 2d | Correct unintended plan refresh and ambiguous vote feedback — complete locally at `2ad48a8` | Slow-request reproduction, explicit refresh control, request coalescing, distinct previous-vote/unsent/success messages; all readiness targets pass with 216 JavaScript/98 Python tests and three local Postgres skips | Deterministic local work only; new source requires matching review and native evidence before live verification resumes |
| 2e | Verify the frozen refresh correction on isolated devices — complete | Both artifacts inspected; iOS and Android lifecycle/offline/refresh pass; zero scroll reads/writes, one delayed read, successful explicit recovery; fourteen reviewed screenshots and all failed attempts retained | No live allowance used; both disposable devices stopped and retained |
| 2f | Verify refresh correction on hosted staging and saved devices — paused on iOS 27 launch crash | Hosted CI/deployment, deterministic suites and web controls pass; physical startup fails; Android build canceled, telemetry builds unstarted | Evidence remains bound to 2ad48a8; cleanup complete; no further old-candidate execution |
| 2g | Repair iOS 27 scene lifecycle — local repair and physical pilot pass at f94a1d9 | [Bounded repair](reviews/2026-09-15-ios27-scene-lifecycle.md), actual prebuild/compatibility tests and `make ready` pass (226 JavaScript/98 Python; three skips); exact-source review prepared | Source review and single signed iOS pilot approved and passed; remaining execution approved; exact-source CI and hosted checks pass; five native builds await the disk guard |
| 3 | Prepare production privacy and operating boundaries | Account export/deletion including Auth ownership; retention; capability-link decision; one-use invite policy; explicit cohort/spend/quota limits; rollback owner | Significant policy/architecture choices require owner decision before production |
| 4 | Prepare production release configuration | Source-controlled production origins, isolated credentials, signed-update/OTA policy, store signing associations, source maps and rollback rehearsal | Resource/secret creation, migrations, deployment and builds need explicit applicable approval |
| 5 | Validate TestFlight and Play closed-testing distribution | Signed install/update, auth and universal links, core journey, explicit native tab presentation, privacy declarations, observed symbolication | Separate store-submission approval |
| 6 | Activate a bounded invite-only cohort | Named owner, exact participant cap, spend/health thresholds, support coverage and stop/rollback procedure | Explicit cohort invitation/activation approval |

The owner accepted the
[staging source-review pathway](reviews/2026-09-14-staging-source-review-policy.md)
and exact 6b9719b report. Replacement hosted/native preflight is complete;
the owner approved its bounded execution request and execution is in progress.
No production, store or cohort approval follows. No scan has started.
The existing Expo Doctor patch-version warning is recorded during native
execution; dependency patch/advisory review remains a later release requirement.
Both replacement test artifacts are inspected and lifecycle/offline verification
passes. Android's accepted offline run records a navigation-only scroll before
the original retry-button assertion, with earlier failures retained. The owner
approved cleanup of the two completed disposable test devices; cleanup is complete
and all six artifacts now pass inspection with sequential build timing verified.
The saved iOS session restored and its iOS/API canaries reached both providers
for the exact release. Its local sign-out removed only its provider session;
Android original-session refresh survival now passes; the reverse direction
remains unverified. The
correct iOS account is restored after a mismatched first attempt was signed out
locally. Android readiness is installed, and returning Plans plus relaunch are confirmed. The exact-release web canary also
reached both providers, and the
repaired local helper accepted the copied private link. The physical iPhone build is installed after the owner resolved a Screen Time
restriction. Its session restoration, relaunch and canonical auth link pass. Android links pass and the server records a vote write, but the owner later
clarified that they did not deliberately submit; the old vote was already shown.
Intentional Android voting is not accepted. Its phase used twenty-eight
Places attempts against the expected twelve. Four extra successful detail reads
are traced to Android. The owner reports a persistent loader and unintended
refresh during scrolling. A local component reproduction establishes overlapping
refreshes can duplicate requests; it does not attribute every live read. Live checks are paused at
60/80 attempts with both native devices stopped. Thirty-six attempts remain
allocated against only twenty available; do not resume the remaining live phase
until the client correction and source-bound verification plan are ready and
the remaining budget is resolved. Three of four emails are confirmed. No new
allowance or native build is requested during the local correction.

Only `docs/task-packets/active.md` is active. The current priority is the confirmed
iOS 27 launch blocker. Both approved cleanup stages are complete. The physical
app installed but fails UIKit's scene-lifecycle requirement for iOS 27 SDK builds.
Earlier iOS 26.5 evidence remains historical, and the Android build was stopped
without exporting an APK. The targeted SDK 57 runtime patch is published; its
experimental opt-in plugin requires review and was unavailable from npm at the
latest check. Prepare the linked local repair after the scope exception is
approved, then freeze/review the replacement before another native build or
deployment. Do not run the remaining old-candidate telemetry builds.

## Validation order and reuse

1. Run inexpensive reproductions and focused checks before full verification.
   Distinguish product failures from test navigation and host setup failures.
2. Run `make ready` once for the completed change; verify public CI for the
   exact release candidate when the external step is authorized.
3. Validate domain/CORS/configuration and operator inputs before paid smoke or
   native compilation. Verify SDK, signing identifiers, output storage and disk.
4. Reuse an accepted artifact only when its bytes, receipt, source SHA, profile,
   signer and inspection still match. Verify existing files before scheduling a
   replacement. Keep copies in durable private storage outside OS temp.
5. For any necessary fresh candidate, build `test-ios` and prove its
   deterministic lifecycle/offline flows; then do the same for `test-android`.
   Only after both pass build the production-shaped and telemetry pairs.
   All native work stays sequential. This catches known fault-flow failures
   before spending time on the other four artifacts.
6. Complete the shared web/native journey and true physical-iPhone link
   observations. A simulator cannot supply physical association evidence.
   Current progress: iPhone restoration/relaunch and the physical auth link pass;
   Android returning sign-in, persistence and canonical link opening pass.
   The iPhone picked up the web-created plan after foreground refresh. Android
   initially used the same organizer account; its existing second approved
   account has now joined. The owner subsequently used a third account; SQL
   confirms three participants and two saved sets of constraints in the same
   plan. The owner confirms the physical QR opened TableUs and consumed a new
   code. One generation produced four distinct recommendations, and one complete
   ranked vote is saved and UI-confirmed for each native-associated account.
   Both native ten-phase checklists and web finalize/reopen/rotation pass. Usage is 80/100
   Places attempts and $0.00056825/$0.25 estimated Gemini; six returning
   messages are conservatively consumed. Android's telemetry replacement
   preserved its session, and all four platforms' canaries delivered. Both
   simulators are stopped without wiping data. Canonical manifests/fallbacks
   and API readiness were rechecked with retained hashes. The assembled
   cumulative input is blocked on its explicitly missing security evidence.
   The frozen local 6b9719b correction addresses device-only sign-out and reproduced
   hidden-query/duplicate-active refreshes. Preserve frozen artifacts; do not
   claim these triggers explain every historical call. Later candidate-bound
   device checks must verify cross-device session preservation and navigation;
   see the [live findings](reviews/2026-09-13-live-readiness-findings.md).
7. Bind final evidence to its real source. Planning or operator-tool changes do
   not silently relabel the application candidate. A changed app source,
   dependency lockfile, compiled config or generated contract requires impact
   review and a new candidate where applicable.

## Development efficiency

Use one primary agent. Keep current status short and archive historical
narrative. Do not start another security-plugin scan without explicit user
authorization; the prior scan's cost and cancellation are recorded. Existing
tests and focused source review provide the normal development feedback loop.
Do not claim `make ready` includes Playwright, native builds, live provider
evaluation, or hosted checks: those have separate evidence.

No speed or billing reduction is assumed merely from changing to Astra.
Measure work by completed acceptance steps, avoid duplicate scans/builds, and
carry unresolved questions in the active packet.

## Intentionally deferred

A broad UI redesign, additional social features, new AI providers, the Agents
API, multi-agent application orchestration, and horizontal scaling have no
demonstrated need for this beta. Durable idempotency/budget coordination becomes
mandatory before scaling beyond one process. Reconsider other additions using
beta observations and a bounded acceptance criterion.
