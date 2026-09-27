# f94a1d9 closeout

Updated 2026-09-21. **Cumulative isolated-staging acceptance is complete**, with the owner-accepted
unresolved simulator AppHang risk. This is the current
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
| Same-account local sign-out | Passed | [Session isolation](session-isolation.json): original Android session renewed after simulator sign-out; owner confirms relaunch/account read; no reverse-direction claim |
| Exact-source staging review | Accepted and validator passes | [Accepted review](../source-review-f94a1d9/README.md); prior source-risk approval is preserved |
| Final provider reconciliation | Passed September 21 | [Final counts](final-provider-reconciliation.json): Places 92/100, no new Gemini generation; carried email/canary counts and provenance recorded |
| Simulator AppHang disposition | Owner accepted isolated-staging risk | [Acceptance](apphang-staging-acceptance.json); cause remains unknown; assessment below |
| Cumulative validator | Passed | [Accepted input](cumulative-readiness-input.accepted.json), [final report](final/closed-beta-readiness-summary.json); original [pending rejection](closeout-validation.json) retained |

## Residual AppHang assessment

One non-canary two-second AppHang was observed on the iOS 26.5 simulator in Apple
UI-library frames; native app symbols were missing. One controlled export/relaunch
repeat passed. The last provider recheck (September 16, 22:49 UTC) still showed
one matching event. There is no established cause or demonstrated fix. Physical
iOS 27 checks passed separately; that does not prove the hang cannot occur there.

Owner-accepted disposition on September 21: retain it as an explicit unresolved risk for isolated
staging, with no claim of production acceptance. Before distribution, restore
usable native symbols and repeat the affected account/export/relaunch journey on
the distributed candidate. Recurrence, a physical-device occurrence, or a blocked
user action triggers a bounded reproduction/fix objective. No repeated live
canaries or new native builds are needed merely to document this risk. The separate [owner acceptance](apphang-staging-acceptance.json) records this
disposition; the source-review approval itself remains unchanged.

## Budget and recovery

[Run ledger](run-ledger.json): September 21 reconciliation confirms 421 Places attempts,
baseline 329, approved additional limit 100: **92 used / 8 remaining**. Emails
**2/4**, canaries **6/6 per provider**, new Gemini generations **0/0**.
The approved same-source backstop is 429. Historical nested baseline fields are
retained as recovered; current limits come from the top-level ledger and linked
[amendment](places-cap-100-approval.json). Reconcile before any consuming action.

Four uncommitted files were copied from the prior worktree with hashes recorded
in [task recovery](task-recovery.json); the originals remain unchanged. The owner
confirmed the previously unanswered Android check on September 21. This is a
retrospective report, not a new device run. Two read-only Supabase calls were
initially rejected by connector permissions. The owner restored access; direct
read-only queries then verified exact-session renewal and unchanged provider totals.

The accepted cumulative input uses the Railway deployment
`d929fba2-9c1e-4428-8379-ffaae6a3c4d2`, retained Preview
`dpl_5iF8xTCbfuJghn2bRuUSGdKoRiJb`, canonical receipt hashes and accepted source
review. Legal/contact/template/rollback attestations carry their original
August 26 provenance; a new signature is not inferred. [Authenticated CLI checks](closeout-deployment-recheck.json) confirm Railway is
active at the exact source and the immutable Preview ID is READY. The Vercel
connector returned not-found; its existing authenticated CLI provided the result.
The CLI omitted Vercel source metadata, so the unchanged deployment ID retains
its original exact-source served-bundle evidence. No new deployment occurred.

## Completion and handoff

The cumulative validator and fresh health request passed. [Final validation](final-validation.json)
binds the acceptance input, final summary and closure evidence. This checkpoint
reuses the earlier passing `make ready` because all executable files are unchanged.
No new device action, sign-in, provider operation, canary or build was needed.

[Next-task handoff](../../handoffs/2026-09-21-staging-closeout.md) scopes the
dependency/toolchain exception assessment. Preserve the physical iPhone session,
all accepted artifacts and original worktrees. Merge, deployment, stores and
cohort activation remain separately gated.
