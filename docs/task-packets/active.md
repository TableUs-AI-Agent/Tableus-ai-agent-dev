# Active packet: account lifecycle clients

Owner: Brian, sole developer for the current stage. The owner requested the next
recommended development objective, parallel to native validation. This packet
applies only to this branch/worktree; historical two-developer contributions
remain shared work, not reassigned to Brian.

## Identity and isolation

- Branch: `codex/account-lifecycle-clients`.
- Worktree: `/Users/brianchei/.codex/worktrees/account-lifecycle-clients/Tableus-ai-agent-dev`.
- Exact base: `6ed12793253a285b0890d6358ab5f60c551b3615`.
- [Backend handoff](../handoffs/2026-09-24-account-lifecycle-backend.md) binds the inherited implementation and its checks.
- Native validation remains in task `01a0c678-55c8-7cc0-a3cb-e3200776906a`,
  `Prepare native replacement validation`, and its original worktree.
- Native application remains `8972865893a3f018a064594457dc9cc664f8a61f`.

## Outcome and scope

Web and mobile users can resolve organized plans, request full deletion when
available, and see truthful pending/completed/attention or unconfirmed recovery
states after their application profile disappears. Other product routes are
blocked during deletion. Preserve export and device-local sign-out.

Implement platform screens/auth gates, shared domain types and a provider-free
account-management read/transfer response. Existing legacy DELETE /me stays
available to old clients but new screens must not silently fall back to it.
Explicit transfer preserves shared plans; exact DELETE confirmation removes
sole-participant plans. Exclude concurrent destructive mutations, preserve retry
payloads/keys and reconcile ambiguous responses before another write.

## Acceptance

Focused deterministic backend authorization/provider-isolation tests and
platform component/mock-browser checks cover feature unavailable, plan
resolution, unknown writes, pending/completed/attention, session changes, cold
restore and stale response exclusion. Review account route gates and private
cache clearing. Run one make ready and generated contract drift check after
integration; retain exact source/evidence identities in the final handoff.
Native/device acceptance is separate and not inferred from Expo web export.

## Gates and exclusions

No native build/run, simulator/emulator use, live provider/Auth calls, real account
deletion, paid call, secrets, cloud resources, deployment, merge, production
migration, store submission, cohort activation or shared Notion edit. No native
retry/budget is reopened. Canceled security scans remain canceled. Keep the full
feature disabled until PostgreSQL locking/role checks, trusted recovery runner,
server credential, policy review and affected release acceptance are complete.

## Status

Implementation, root review and local deterministic verification are complete.
One passing make-ready after correcting obsolete legacy test expectations: 314
JavaScript / 121 Python, four PostgreSQL-only skips. Seven mocked Chrome checks
cover account management and hosted-mode session restoration. The final handoff
binds exact source and evidence; no native or hosted acceptance is claimed.
Next bounded objective: PostgreSQL lifecycle/role verification and concrete
trusted-runner readiness, preserving disabled feature and all external gates.
