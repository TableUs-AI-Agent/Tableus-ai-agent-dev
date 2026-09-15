# Active packet: explicit plan refresh correction

## Objective

Resolve the reported accidental plan refresh during scrolling, prevent overlapping
manual reads, and distinguish a previous saved vote from a new submission. Use
one primary agent and deterministic local providers. This is the only active
implementation packet; live replacement verification is paused.

Local implementation and focused checks are complete. All readiness targets pass:
216 JavaScript and 98 Python tests, with three local Postgres skips. The first
`make ready` passed lint/types and stopped when the sandbox denied a test's local
listener. The remaining targets passed with local-listener access; the initial
attempt is retained. Corrected application source is frozen at
`2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`. The next bounded step is preparing
deterministic native gesture verification and the required source-review/execution
request. See the [validation record](../evidence/plan-refresh-controls/local-validation.json).

## Source and evidence

- Local branch: `codex/plan-refresh-controls`, isolated worktree of the same name.
- Base operator/evidence commit: `25e0397d7803651d39968f53868a2b73845817c3`.
- Corrected application source: `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`.
- Frozen installed/deployed application: `6b9719b4e63e34803f2e7c2598e45851790df661`.
- The [local investigation](../reviews/2026-09-15-explicit-plan-refresh.md) records
  the reproductions, candidate change, validation and remaining native checks.
- [Replacement execution](../evidence/replacement-6b9719b/README.md) retains all
  six accepted artifacts, hosted evidence and the accepted source-review report.
  Those records establish only their actual source, not a later correction.

The owner says Android showed a vote from the previous session, with no deliberate
new submission. Withdraw intentional owner confirmation from Android voting
acceptance, while retaining the recorded server vote write. The owner reports a
persistent spinner and unintended refresh during scrolling. Per-request gesture
attribution remains unknown; do not ask the owner to reconstruct it again.

## Bounded implementation

1. Establish focused failures for overlapping refresh callbacks during a slow
   request and the ambiguous previous-vote message.
2. Replace the plan-detail pull gesture with an accessible `Refresh plan` button
   on iOS and Android. Reuse an in-flight query and track manual loading separately
   from automatic query activity. Keep refresh available after an initial error.
3. Clearly label previous saved votes, unsent ranking edits and successful new
   submissions. Preserve the existing recoverable mutation/idempotency flow.
4. Verify offline behavior, request coalescing, loading completion, error recovery,
   mutation response reuse, hidden-route inactivity and visible foreground/return
   refresh. Run focused checks, then one `make ready` before handoff.
5. Correct Android evidence and all four current documents. Freeze a reviewable
   source commit; record its exact identity separately from subsequent evidence.

No backend/provider/contract/dependency changes or other screens' refresh controls
are in scope. A component request-count reproduction is not proof of a native
endless loop; report that distinction and keep device acceptance incomplete.

## Paused live execution

The approved 6b9719b run remains at **60/80 Places attempts**, **3/4 sign-in
messages**, zero new Gemini generation and three of five canaries per provider.
The rolling Places backstop remains 349. Twenty attempts are available while the
old remaining allocation requires thirty-six; no higher allowance is approved.
Android and the saved iOS simulator are stopped with data intact. The owner has
closed TableUs on the physical iPhone. Preserve all sessions, artifacts, receipts,
private helper state and partial readiness evidence. Do not feed completion
answers to paused runners or accept a new sign-in as proof of session survival.

The first iOS-sign-out-to-Android-refresh isolation direction already passes for
6b9719b. Reverse-direction survival, remaining native readiness, Android/API
telemetry and cumulative acceptance remain incomplete. Do not repeat completed
observations merely to fill gaps on a different application SHA.

## Exit and next boundary

Exit with the local correction, failing-before/passing-after evidence, one full
local readiness result, exact source SHA and a bounded plan for native gesture
verification. Prepare a source-impact review and concrete execution scope before
requesting any further native builds or deployment. A source/report change needs
matching review acceptance; a Security Scan is never automatic. The owner's
accepted 6b9719b report remains valid for its unchanged source.

Production privacy/retention, broader cohorts, scaling, store signing/submission,
OTA authority and native tab polish remain queued. No merge, deployment, paid
operation, secret/resource creation or destructive cleanup is part of this local
correction.
