# f94a1d9 closeout

Updated 2026-09-21. **Cumulative acceptance is incomplete.** This is the current
index; the earlier [execution journal](README.md) retains dated observations,
including superseded pending statuses. Application source remains
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`.

## Acceptance matrix

| Area | Result | Evidence and provenance |
| --- | --- | --- |
| Candidate local/CI checks | Passed | [Original local checks](../ios27-scene-repair/local-validation.json); [CI/hosted record](hosted-preflight.json); fresh [recovery checks](closeout-local-validation.json) |
| Hosted source and associations | Passed; public health/manifests rechecked September 21 | [Fresh recheck](closeout-public-recheck.json); hosted Preview result is retained, not a new browser run |
| Six native builds | Passed; existing bytes/receipts rehashed September 21 | [Artifact validation](closeout-artifact-validation.json); no rebuild or new signing inspection |
| Deterministic native lifecycle/offline/refresh | Passed | [iOS](ios-deterministic/status.json), [Android attempt 2](android-deterministic/attempt-2-status.json); failed startup attempt retained |
| Physical iOS 27 launch/relaunch | Passed, owner-observed | [Pilot](../ios27-pilot-f94a1d9/README.md) |
| Voting, organizer lifecycle and account/export | Passed, attributed owner/UI/server observations | [Votes](live-vote-submissions.json), [organizer](live-organizer-lifecycle.json), [accounts](owner-reopen-account-checks.json) |
| Canonical/private cold/warm links and rotation | Passed, owner-observed with server rotation corroboration | [Private links](owner-private-link-checks.json), [rotation](live-link-rotation.json), [final owner observations](owner-rotated-canonical-links.json) |
| Four-platform telemetry | Passed and allowance exhausted | [Provider delivery](telemetry-delivery-complete.json); six shared events per provider includes the prior event |
| Same-account local sign-out | Partial | [Session isolation](session-isolation.json): simulator removed, Android retained; owner confirms relaunch/account-read success; server renewal still unproven |
| Exact-source staging review | Accepted and validator passes | [Accepted review](../source-review-f94a1d9/README.md); prior source-risk approval is preserved |
| Final provider reconciliation | Blocked on connector access | [Recovery record](task-recovery.json); last verified counts are September 17 |
| Simulator AppHang disposition | Open | [Observed event](ios-simulator-hang.json); assessment below |
| Cumulative validator | Correctly rejects incomplete input | [Pending input](cumulative-readiness-input.pending.json), [validation](closeout-validation.json); Android passed flag stays false until the outstanding check is proven |

## Residual AppHang assessment

One non-canary two-second AppHang was observed on the iOS 26.5 simulator in Apple
UI-library frames; native app symbols were missing. One controlled export/relaunch
repeat passed. The last provider recheck (September 16, 22:49 UTC) still showed
one matching event. There is no established cause or demonstrated fix. Physical
iOS 27 checks passed separately; that does not prove the hang cannot occur there.

Proposed disposition: retain it as an explicit unresolved risk for isolated
staging, with no claim of production acceptance. Before distribution, restore
usable native symbols and repeat the affected account/export/relaunch journey on
the distributed candidate. Recurrence, a physical-device occurrence, or a blocked
user action triggers a bounded reproduction/fix objective. No repeated live
canaries or new native builds are needed merely to document this risk. Final
staging disposition remains open; the source-review approval predates the event.

## Budget and recovery

[Run ledger](run-ledger.json): last verified aggregate 421 Places attempts,
baseline 329, approved additional limit 100: **92 used / 8 remaining**. Emails
**2/4**, canaries **6/6 per provider**, new Gemini generations **0/0**.
The approved same-source backstop is 429. Historical nested baseline fields are
retained as recovered; current limits come from the top-level ledger and linked
[amendment](places-cap-100-approval.json). Reconcile before any consuming action.

Four uncommitted files were copied from the prior worktree with hashes recorded
in [task recovery](task-recovery.json); the originals remain unchanged. The owner
confirmed the previously unanswered Android check on September 21. This is a
retrospective report, not a new device run. Two read-only Supabase calls were
rejected by connector permissions; no privileged alternative was attempted.

The pending cumulative input uses the latest recorded Railway deployment
`d929fba2-9c1e-4428-8379-ffaae6a3c4d2`, retained Preview
`dpl_5iF8xTCbfuJghn2bRuUSGdKoRiJb`, canonical receipt hashes and accepted source
review. Legal/contact/template/rollback attestations carry their original
August 26 provenance; a new signature is not inferred. Fresh readiness alone
does not confirm current dashboard deployment IDs or authorize final acceptance.

## Resume

Use [the active packet](../../task-packets/active.md). Restore read-only provider
access, prove the same preexisting Android session renewed after the simulator
sign-out, reconcile usage, settle the AppHang disposition, then validate the
completed source-bound report. Preserve the physical iPhone session. Do not
repeat completed builds, votes, links or canaries. No merge/deployment/store/cohort
approval is included in this closeout checkpoint.
