# Roadmap

Updated 2026-09-28. Brian confirmed the reconciled direction and targets below;
[decisions](decisions.md#pilot-realignment--adopted-2026-09-26) records the scope.

## Direction

TableUs helps invite-approved US groups of 2–8 decide where to eat together.
Each diner participates through their own account and constraints; the group
compares four grounded options and ranks three, then the organizer finalizes or
reopens. The organizer may finalize before everyone votes; no new quorum rule is
being added. Learned tastes are deferred. The longer-term possibility is a useful
companion for recurring groups, informed by pilot evidence rather than assumed
personalization or social-network requirements.

## Current milestone: staging pilot

Real groups, starting with people Brian knows, complete real dinner decisions on
web, iOS and Android. All three must pass acceptance before pilot invitations;
include actual use of each platform in the pilot roster. Stores, production and
wider recruitment follow this learning milestone.

Confirmed learning targets, not measured results:

- Within three weeks of the first pilot invitation, five distinct real groups
  beyond owner/test-only groups complete a decision.
- At least half of eligible plans complete a decision. Eligible means a pilot
  plan that gains a second real participant during that window. A completed
  decision requires finalization with at least two distinct diners' votes in
  that recommendation run; finalization alone, which the API permits with zero
  votes, does not count. Independent participation does not require unanimity.
- Ask every organizer whether the group went and whether they would use TableUs
  again; record nonresponse and missing participation rather than inferring success.

The Priority 2 candidate adds `distinct_voter_count` for the active run to each
`plan.finalized` audit event and preserves that bounded integer during account
deletion cleanup even if its candidate or recommendation run is removed. The
implemented [read-only report](pilot-measurement.md) counts each eligible plan once
across reopen/re-finalize, and counts success only with at least two voters at a
finalization in the observation window. Confirm its private roster and window
before invitations. Confirm distinct groups through the pilot roster; five plans do not establish
five groups. Short organizer follow-up supplies the two qualitative answers.

Counts are exact only for retained, instrumented plans. Whole-plan deletion
cascades to its events, but the API permits it only for a sole-participant plan:
an eligible plan reaches that state only after every other member has deleted
their account. Old finalizations have no voter count. Brian accepted
disclosing those coverage gaps instead of adding deletion-surviving aggregate
storage. Report unknown outcomes and incomplete coverage, raw counts alongside
percentages, and plans with little time before the cutoff; do not present a
retained-plan rate as complete cohort conversion. This small pilot tests
usefulness, not population-level conversion or retention.

PostHog retains anonymous operational events only. Its process-memory identities
and absence of plan IDs cannot measure a group funnel across accounts/sessions.
Do not add persistent analytics identities or a new analytics service for this pilot.

Stop new invitations and pause affected pilot use on a privacy/data incident,
a hard spend-ceiling hit, or a core journey failure blocking a usable decision.
Brian owns support, stop and rollback decisions; preserve evidence and obtain any
required approval before rollback. A missed learning target prompts a scope/value
review, not automatic feature expansion.

## Now, in order

Priority 1 is complete: [PR #7](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/7)
was approved and merged as `8ae3c94eb3e41b87f0840cd5aa2b0827c0882af4` on
September 27. Its tree matches the passing hosted CI candidate; no deployment
occurred. [Integration evidence](evidence/6dac996/integration.md) retains the
review, test repairs and source binding. The separate native diagnostic branch
was not merged. Priority 2 is complete: Brian approved review and merge, and
[PR #8](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/8) merged as
`462a7dd6b3428d21a8fbccfe20a0003361904761`. Its file tree matches final passing CI
head `1270206`; no deployment occurred ([integration evidence](evidence/f621cf5/integration.md)).
Priority 3 is authorized in a fresh chat. Independent local preparation is
complete on `codex/pilot-staging-readiness`. Brian approved the bounded external
campaign for `e5e7d1`; preflight, hosted CI/review and [PR #9](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/9)
merge are complete (`2eefdc5`, tree identical to tested `d2ccc7e`). The four migrations,
API/web rollout and an empty private-worker startup passed. Brian requested a split
rehearsal and subsequently approved [recovery](p3-rehearsal-recovery.md) after the
external browser handoff failed: 105 cumulative live minutes, five same-image API
configuration restarts, and the exact existing Preview origin temporarily allowed
for B. All other original limits and used counters remain unchanged.

The subsequent [invitation extension](p3-rehearsal-next-attempt.md) was approved:
ten invitations, 150 live minutes, seven same-image restarts and 45 status reads,
with unchanged financial/other attempt limits. Brian confirmed receipt of Auth
email after checking the correct inbox; no email-delivery repair was needed.
Restart 4/7 used the single handoff recovery. A now has confirmed Auth and one
profile/redemption, but the Plans screen incorrectly says to sign in. Both services
were verified stopped/unscheduled at October 1 `00:29:33.040725Z`; admission is off.
**44m52.328s remain**, including the 15-minute final-phase reserve. No B signup or
additional recovery occurred. The local web fix reloads membership after redemption
and passes six deterministic browser checks plus `make ready`. Obtain approval
for the [web fix rollout](p3-signup-fix-rollout.md) before resuming the rehearsal; hosted
CI and live verification of the fix remain outstanding.

Group/deletion and hosted replay/contention acceptance remain open. The separate
natural-expiry fixture elapsed September 29 at 9:48:55 p.m. Central, but its HTTP
rejection is still untested. Local fixes and successful enrollment do not accept
the pilot or authorize Priority 4.

Effort is a rough planning range in focused engineering days, excluding approval,
hosted CI, device/signing and external-access waits; these are not delivery promises.

| Priority | Outcome and reason | Rough effort | Dependencies, risks and completion |
| --- | --- | --- | --- |
| 2 | Show Plans and Account only on web/mobile and record participation at finalization, so the experience and measurement match the pilot. | 1–3 days | Preserve auth/join/legal/help routes, account access, code/data/export fields and deep-link safety. Hidden product routes lead to Plans; add mobile Account access before hiding Profile. Add the audit count and a reviewed numeric allowlist entry in deletion cleanup, with focused tests and a read-only measurement query. Navigation/shared-plan checks, one make ready and hosted CI passed ([evidence](evidence/f621cf5/integration.md)); approved merge is complete, staging/device acceptance remains separate. |

## Next, after the baseline, client and measurement changes

| Priority | Outcome and reason | Rough effort | Dependencies, risks and completion |
| --- | --- | --- | --- |
| 3 | Prepare and accept one staging candidate with self-service deletion and operating arrangements. Reduce rollout and support risk before real invitations. | 3–6 days, plus credential/worker approval and rehearsal waits | Reconcile actual migration head and four expected migrations, restricted grants and invite hook; size quotas and spend for the complete journey. Separately approve the Auth-removal secret and hosted worker, follow the lifecycle operations procedure, enable `TABLEUS_ACCOUNT_DELETION_ENABLED=true`, and rehearse on synthetic accounts only. Include account, controlled-inbox and recipient-bound invite counts in the approval request. Align privacy/retention copy and support escalation. Approved deployment/web acceptance pass with deletion, recipient-bound invites and quotas active; fragment emission stays off. |
| 4 | Accept signed iOS/Android pilot builds using the existing `readiness-ios` and `readiness-android` profiles on physical devices. Establish that all three supported clients work. | 1–3 days if device checks pass | Collect every pilot iPhone's device ID before the iOS build and verify inclusion in its ad hoc profile; keep the roster private. Have physical iPhone/Android installation access. Pass physical checks plus one bounded candidate-source `mobile-offline-e2e` run on a separately identified local test artifact. Preserve/dispose of prior findings explicitly. One accepted signed pilot build per platform is the target, not permission for retries or extra test builds. |
| 5 | Run the pilot and decide the next product priority from observed outcomes. | Three-week observation window | Approved roster/cap, representative web/iOS/Android use, budget, support, measurement and stop rules. Report the targets, unknowns and organizer feedback; no automatic expansion. |

The [active packet](task-packets/active.md) now covers Priority 3. Its
[prepared execution scope](pilot-staging-preparation.md) records fresh staging
inventory, measured quota/attempt sizing, worker configuration, synthetic fixtures
and one combined gated request. Local preparation does not close staging acceptance. The [pilot checklist](release-readiness-checklist.md) owns
acceptance details; the [runbook](release-runbook.md) supplies relevant procedures.

## Deferred

- Learned taste profiles/reviews, discovery and social features, photo analysis,
  mobile maps/3D, new providers/frameworks and broad redesign. Hide existing extra
  surfaces in priority 2; retain their code and data.
- Assisted initiation when a participant loses access to their sign-in email.
  Brian accepts that deletion may remain unavailable until secure recovery or
  assisted verification exists for this bounded pilot of people he knows. Keep
  a working contact/escalation route and truthful copy; an email request alone
  does not complete deletion. Revisit before expanding the cohort or distribution.
- Deletion-surviving aggregate storage and broader analytics. Disclose the accepted
  measurement coverage gaps; do not add persistent analytics identities.
- Production resources/trust configuration, store distribution and cohort
  expansion. Retain the [production](production-release-spec.md) and
  [retention/support](retention-support-spec.md) specifications for their scope.
- Fragment emission until compatible reader adoption; durable idempotency and
  provider coordination until horizontal scaling is justified. Keep one API process.
- Exact cohort cap, quota/spend values and support retention settings are
  pre-invitation decisions. Future monetization and broad-audience positioning do
  not affect this milestone and remain open.

## Stop doing

- Treating the C1–C11 simulator campaign as a prerequisite to the pilot. Preserve
  its findings/tooling; do not resume it or erase failures under this decision.
- Per-command evidence commits, repeated document-set snapshots and separate
  worktrees for sequential work without an isolation need. Keep useful failure
  diagnostics and source-bound release evidence.
- Expanding features before testing the shared decision. No cleanup is authorized
  by a worktree's age; check references, artifacts, processes and consumers first.

## Foundations to preserve and pilot hypotheses

Keep `/api/v1`, shared contracts, platform UI boundaries, deterministic local/CI
providers, explicit mobile recovery and private telemetry. Existing technical
acceptance supports earlier candidates, not the cumulative pilot bytes.

Candidate-bearing plan reads hydrate Places; a logical hydration can make several
billable provider attempts. Test complete journeys against quota/spend limits.
The four-result requirement may block some real searches. Structured cuisines
are intersected only when supplied; current plan forms send free-text notes and
empty cuisine arrays. Neither issue justifies speculative ranking changes before
pilot evidence. The previous roadmap remains in Git at `4a2f9ec`.
