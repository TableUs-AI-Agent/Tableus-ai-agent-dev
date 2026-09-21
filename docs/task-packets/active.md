# Active packet: close f94a1d9 staging verification

Updated 2026-09-21. Status: local recovery and checks complete; live reconciliation
awaits restored Supabase access, and the AppHang disposition awaits the owner. This is the only active packet.

## Identity and objective

- Task: current conversation, continuing `01a097ad-4b11-7d62-9813-6ae4cf75f3f5`.
- Branch/worktree: `codex/staging-closeout` / `.worktrees/staging-closeout`.
- Base: `33d79b6`; application: `f94a1d9d1125e6c9111aa08eda496f014f20d0c0`.
- Objective: close or explicitly block each remaining acceptance item for this
  existing candidate, with a reviewable evidence set and a small next-task handoff.
- Scope: planning/evidence recovery, authorized read-only reconciliation and
  remaining saved-session observations. Application bytes remain frozen.

## Already complete — reuse

Exact-source CI and hosted checks; six inspected native profiles; deterministic
iOS/Android lifecycle/offline/refresh; physical iOS 27 pilot; deliberate votes,
finalize/reopen, account/export checks; canonical/private cold/warm links and
rotated-link rejection; four-platform telemetry; accepted source review.
The owner also confirmed Android's post-sign-out relaunch/account-read check in
this task. [Evidence index](../evidence/ios27-staging-f94a1d9/closeout.md).

## Remaining steps, in order

1. Local recovery is complete: concise planning, artifact/source binding, link/JSON
   checks and fresh `make ready` pass. Preserve the old worktree and failed attempts.
2. Once the owner reports restored connector access, reconcile aggregate usage
   and prove that the **same preexisting Android session** renewed after the
   simulator's `2026-09-17T00:55:07.292482Z` sign-out observation. Return no account,
   session or token identifiers. Preserve unknowns if that session is unavailable.
3. If renewal is still unproven, prepare one bounded same-account account-screen
   check within existing authority; do not re-sign-in and mistake a new session
   for survival. No dinner-detail read or additional generation is needed.
4. Assess the single unexplained iOS simulator AppHang using retained evidence;
   recheck recurrence read-only if available. Present its precise staging risk
   disposition for the owner's acceptance if needed. Do not claim it is fixed.
5. Assemble source-bound cumulative input, run the existing validator and fresh
   read-only readiness checks, and issue final acceptance only when every required
   observation and risk disposition exists. A structurally valid input alone
   cannot supply missing behavior.
6. Commit the bounded result with checks, risks, source/evidence identities and
   the next objective. A merge/deployment is a separate gate. Once this objective
   is complete, start a fresh task with the compact handoff; keep an incomplete
   closeout in this task.

## Carried approval and budget

The owner approved [remaining verification](../evidence/ios27-pilot-f94a1d9/remaining-verification-plan.md),
then six telemetry events per provider and the [100-attempt Places amendment](../evidence/ios27-staging-f94a1d9/places-cap-100-approval.json).
Last observed September 17: Places 92/100 since baseline 329, emails 2/4,
telemetry 6/6 per provider, new Gemini 0/0. Do not reset these limits in a new
conversation. Reconcile before any action that might consume them.

No source/dependency change, new build, scan, secret/resource, deployment,
migration, cleanup, account deletion, store or cohort action is part of closeout.
All accepted bytes and receipts remain in the root checkout's private
`.artifacts/mobile/<application-sha>/`. The physical iPhone session is preserved.

## Handoff entry point

Read this packet, `docs/current-state.md`, `docs/roadmap.md` and the concise
`docs/decisions.md`; follow only links needed for the next action. The
[workflow](../development-workflow.md) defines the task lifecycle. Retrieve a
referenced prior task through `read_thread` before relying on its contents;
use bounded pages and avoid raw tool streams.
