# Approved staging verification of the refresh correction

Status: owner accepted the exact source review and approved this execution on
2026-09-15. [Approval evidence](execution-approval.json) binds the original plan
at commit `73ff83b1105bf06a130d209a67a327eee8e77f74`.
Both isolated native verification phases now pass; see the
[completed evidence](../plan-refresh-verification-2ad48a8/README.md).

Hosted execution now passes: [deployment evidence](deployment.json) binds Railway
`6fcc6835-d22a-4125-b80f-df671a415741`, Preview
`dpl_7WqJNTybVFA425ABS7uB3rWGkPKu` and CI run `35016584574` to the exact source.
Readiness, served Preview bundles, both CORS origins and canonical associations
pass; production pointers/protection are unchanged. CI passes 216 JavaScript,
101 Python and four browser tests. The configured Places backstop is 409 and
the last observed aggregate remains 329. No new-run Places calls/generations have
been made, and no new sign-in message is confirmed. Xcode setup is now complete.
The [signed iPhone readiness build](readiness-ios-artifact.json) passes source,
signer, receipt and configuration reinspection under Xcode 27.0. It is not yet
installed. The [single web canary](web-telemetry-observation.json) reached both
providers with the exact source. Sentry also displays coarse geography despite
the app omitting user fields; no location value is retained and its enrichment
source has not been independently verified. The [existing helper link](helper-preflight.json)
still matches the current four-candidate, three-participant dinner.

Three native builds remain. About 19.8 GiB free fails the 20 GiB start guard.
Automatic approval review rejected deleting five obsolete EAS npm caches because
AGENTS.md requires explicit cleanup approval. No deletion occurred. The
[750 MiB proposal](cache-cleanup-pending.json) is pending owner approval; the
physical iPhone connection and organizer sign-in on the new Preview are also pending.

Application source: `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`.
Focused review digest (SHA-256 of parsed `JSON.stringify` report):
`65f9f2e8e0a48f3431cf15633dfe42bf886a2334969a47381dab04325215be0e`.
Review: [exact source report](../source-review-2ad48a8/review.json).
Policy: `staging-source-review-v1`. The unchanged medium risks are shared
provider-quota fairness and private join capabilities in URLs. The review covers
fourteen source files and seven areas; it is not a Security Scan or independent
audit. Its report was prepared before native execution; native results are separate.

The owner decision accepts that exact report for existing isolated staging
and authorizes the bounded execution below. Cumulative acceptance still requires
the actual hosted/native results.

## Execution

1. Publish only the frozen application source on `codex/refresh-2ad48a8`
   and run its CI; stop if that branch already names a different source. Deploy it to the existing Railway staging service and
   a new Vercel Preview in the existing staging project. Update only the required
   staging source/CORS settings. Verify reported source, readiness, origins and
   canonical association files before any plan interaction. Preserve Production,
   stable-domain pointers and existing signing/account resources.
2. Reuse the completed, inspected `test-ios` and `test-android` artifacts and
   their actual receipts. Build only the remaining four profiles, sequentially:
   `readiness-ios`, `readiness-android`, `telemetry-test-ios`, and
   `telemetry-test-android`. All four prepared inputs pass local preflight.
   Inspect source, signer, effective native configuration, artifact and receipt
   before each installation. Retain all artifacts and raw logs privately.
3. Install the new inspected profiles on the intended existing staging devices,
   preserving sessions and app data. Use only existing approved accounts and the
   existing four-option dinner plan. Verify returning sessions, canonical/private
   links, deliberate ranked voting, organizer finalize/reopen, rotated-link
   rejection and read-only export/deletion readiness. Do not delete an account.
4. Measure plan reads with only one detail view active at a time. Combine current
   state witnesses with the required hidden-route, visible return and foreground
   checks. Test explicit refresh once per platform. Require zero detail reads
   from scrolling; pause immediately if unexpected requests appear. Record
   deliberate voting separately from pre-existing saved votes.
5. Verify both directions of device-local sign-out using matching accounts and
   real surviving-session refresh evidence. Cached Plans or a new login alone
   do not prove session survival. Schedule these observations among the native
   build phases to reuse natural token expiry without changing auth settings.
6. Deliver one web, one iOS and one Android telemetry canary, including at most
   two API companions, then verify both providers with the exact source release.
   Assemble the version-two cumulative report only from genuine source-bound
   evidence and the owner's matching review acceptance.

## Approved limits

| Measure | Maximum for this new run |
| --- | --- |
| Places attempts | 80 additional attempts, including failures and detail hydration |
| Gemini generation | Zero; reuse the existing recommendation run |
| New sign-in messages | Four, only for existing approved accounts, entered directly in the app/browser |
| Telemetry delivery | Five analytics and five error events total across web, iOS, Android and API companions; no blind resends |
| New native builds | Four remaining profiles; do not rebuild either accepted deterministic test artifact |
| Concurrency | One native build or simulator/emulator workload at a time |
| Disk | At least 20 GiB before a build; stop below 9 GiB; no persistent-device deletion |

Initial Places allocation: 24 for the two native join/vote journeys, 16 for the
web organizer journey, 24 for combined native visibility/foreground/manual-refresh
observations, and 16 contingency. These are upper allocations, not targets to spend.
Account/session/telemetry checks should stay on Plans or Account and require no
restaurant detail hydration. Reconcile actual deltas after every bounded phase;
do not start a phase whose maximum exceeds its remaining allowance.

The prior 6b9719b run stays recorded at 60/80 Places attempts and 3/4 messages;
this proposal does not relabel or reset that history. The last project-wide
aggregate was 329 and the configured backstop was 349. Recheck the aggregate
read-only before executing. The fresh read-only count remains 329; the approved backstop is 409 (329+80).
If it changed, reconcile the difference before proceeding; never exceed the
existing supported maximum of 500. A separate new-run ledger must enforce 80
even if older attempts expire from the rolling window. Leave the reduced
backstop in place at handoff.

## Preservation and stop conditions

Preserve the old six 6b9719b artifacts, their evidence and the two newly completed
local test artifacts. Keep the local helper's private link out of chat and logs.
Stop and retain test devices after use. Supersede partial old-source checklists
explicitly; do not feed them answers from a newer installed source.

Stop on failed CI, failed inspection, unexpected source/configuration, a need for
new signing material or accounts, unexplained request growth, exhausted message
allowance, failed device evidence or a resource guard. Reuse existing credentials;
do not create/rotate secrets, add cloud resources or perform migrations.

If newly deployed staging/Preview validation fails, the requested rollback scope
is limited to those changed targets and their source/CORS settings, returning to
the recorded 6b9719b baseline. Preserve the provider backstop. Do not change
Production, stores, cohort membership or unrelated resources. No Security Scan,
dependency upgrade or production release is included.

Approval is required by [AGENTS.md](../../../AGENTS.md) for deployment and by
the [accepted staging source-review policy](../../reviews/2026-09-14-staging-source-review-policy.md): “Any report/source change requires new matching acceptance.”
