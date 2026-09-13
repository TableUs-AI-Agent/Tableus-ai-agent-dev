# Closed-beta roadmap

Reassessed 2026-09-12. The goal remains an invite-only US beta across web, iOS
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
| 2 | Complete cumulative staging readiness — hosted, native, shared journey and all four telemetry platforms verified; security acceptance remains | Canonical domains/associations; same-SHA web + physical iPhone + ARM64 Android lifecycle; signed artifact pairs; isolated telemetry; truthful cumulative report | Completed run used 80/100 Places attempts, $0.00056825/$0.25 estimated Gemini and six conservatively counted messages; cumulative security-evidence policy remains unresolved |
| 3 | Prepare production privacy and operating boundaries | Account export/deletion including Auth ownership; retention; capability-link decision; one-use invite policy; explicit cohort/spend/quota limits; rollback owner | Significant policy/architecture choices require owner decision before production |
| 4 | Prepare production release configuration | Source-controlled production origins, isolated credentials, signed-update/OTA policy, store signing associations, source maps and rollback rehearsal | Resource/secret creation, migrations, deployment and builds need explicit applicable approval |
| 5 | Validate TestFlight and Play closed-testing distribution | Signed install/update, auth and universal links, core journey, explicit native tab presentation, privacy declarations, observed symbolication | Separate store-submission approval |
| 6 | Activate a bounded invite-only cohort | Named owner, exact participant cap, spend/health thresholds, support coverage and stop/rollback procedure | Explicit cohort invitation/activation approval |

Only `docs/task-packets/active.md` is active. Later rows are queued outcomes,
not instructions to start concurrent agents, scans or cloud work.

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
   Investigate avoidable detail refreshes before the next client candidate;
   do not change the frozen artifacts or claim an established UI trigger.
   Align device-only sign-out copy with its currently global behavior and
   verify preservation of another device's session; see the
   [live findings](reviews/2026-09-13-live-readiness-findings.md).
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
