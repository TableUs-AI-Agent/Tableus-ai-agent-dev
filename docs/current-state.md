# Current state

Updated 2026-09-27. GitHub state and deployment-trigger settings were freshly
read for [Priority 2 publication](evidence/f621cf5/implementation.md). Application
serving identities below remain the September 25 record, not fresh health checks.

## Source baseline

| Item | Value |
| --- | --- |
| Integrated source baseline | Application lineage `4a2f9ecc37070f434df7fc75c1054d5875f21ba9`, September 26–27 realignment, publication guard and two test-only CI repairs through `97c3c65` |
| Refreshed `origin/main` | `8ae3c94eb3e41b87f0840cd5aa2b0827c0882af4`, approved merge of [PR #7](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/7) on September 27; GitHub uses `main`, with no branch protection/rulesets at preflight |
| Integration status | Priority 1 complete. Merge tree exactly matches the passing `97c3c65` candidate. No deployment. The separate native diagnostic branch was not merged; do not merge it wholesale. Priority 2 is implemented locally on `codex/pilot-experience-measurement`; application candidate `f621cf5` passes local readiness and hosted CI on `a08e3d0`; [draft PR #8](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/8) awaits review and approved merge. See the [handoff](evidence/f621cf5/implementation.md). |
| Root checkout | Stale at `codex/privacy-safe-observability` (`8e9625e`). Use the baseline, not the root checkout. |

The last full local readiness at the baseline's application source passed 214
Python and 317 JavaScript tests with zero skips, plus lint, types, contract
generation, web and Expo-web builds and deterministic smoke
([handoff](handoffs/2026-09-25-deletion-support.md)). [Integration PR #7](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/7)
is merged as `8ae3c94`. [Hosted CI on `97c3c65`](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36298539456)
passed all 214 Python tests, 317 JavaScript tests and four browser journeys, with
zero skips, plus restricted-role migrations, lint/types, deterministic evaluation,
contracts, builds and smoke. Two test-only repairs removed a Homebrew-specific
Python path and replaced an obsolete account-deletion UI assertion. Local
readiness completed in stages; one mobile component-test timeout passed on focused
and full rechecks and remains a reliability observation. The
[integration review](evidence/6dac996/integration.md) distinguishes reused local
checks from the PR's hosted result.

Priority 2 [hosted CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36301151907)
passed **238 Python tests, 326 JavaScript tests and five browser journeys, zero
skips**, including restricted PostgreSQL roles/migrations, lint/types, deterministic
evaluation, contract checks, web/Expo-web builds and smoke. The tested merge tree
matches the published `a08e3d0` head. Local account/help and private-Join recovery
checks also passed. No application repair was needed in hosted CI; the
[handoff](evidence/f621cf5/implementation.md) preserves local dev-cache timeout
observations and source binding. Documentation closeout does not change app inputs.

Vercel project Git auto-deployment is enabled, but repository configuration now
excludes `codex/pilot-realignment`, `codex/pilot-experience-measurement` and `main`
([Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration)). Other branches still need trigger
review before pushing. Railway currently has no deployment triggers and PR
environments are disabled. No hosting setting or running deployment was changed.

## Deployed staging

| Component | Source | Notes |
| --- | --- | --- |
| API (Railway `tableus-staging`) | `f94a1d9` | Supabase auth, live Places, live Gemini through Agent Platform, anonymous telemetry |
| Web aliases `tableus-staging.vercel.app`, `links.table-us.com` | `ed8330a` | Dependency-patched web; API remains `f94a1d9` |
| Accepted native artifacts | `f94a1d9` | Isolated-staging acceptance with an owner-accepted simulator AppHang risk ([closeout](evidence/ios27-staging-f94a1d9/closeout.md)) |
| Production-facing `table-us.com` | `e1184ec` | Not a pilot target |

On the recorded deployment state, the later features below are not deployed.
Four migrations added after `f94a1d9` are expected to be pending: account deletion queue, shared-content
provenance, cohort counters and recipient-bound invites. After that last
migration, any unused legacy unbound invite code in staging is rejected for new
signups and must be reissued to a named recipient.

## Product

The core journey is implemented on web, iOS and Android: invite-approved email
OTP sign-in, shared plans for 2–8 people, per-participant constraints, four
grounded options from Places and Gemini, top-three ranked voting, organizer
finalize and reopen, private-link rotation, explicit refresh and explicit retry of
ambiguous mobile writes. Clients use `/api/v1`; Supabase is used directly only for
authentication. Earlier candidate evidence is not acceptance of the cumulative
local application. The API allows organizer finalization with zero or partial
votes; the agreed pilot counts success only with at least two independent votes.

The Priority 2 source candidate lands users on Plans and exposes Plans/Account on
web and mobile. Deferred Discover, Friends/People, Review, Taste/Profile and photo
entry routes lead to Plans; their implementations, API endpoints and export fields
remain. Mobile Account has an independent tab plus its existing deletion-recovery
route, privacy, terms and deletion-help links. Auth, invite and private Join behavior
is preserved. These client changes are not deployed.

New `plan.finalized` events record the active run's `distinct_voter_count` (0–8).
Deletion cleanup retains only the validated integer, independent of candidate/run
survival. The bounded read-only [measurement report](pilot-measurement.md) uses
retained join/finalization events, counts each eligible plan once and discloses
unknown history/deletion coverage. This does not add a quorum or change ranking.

## Implemented in the baseline, not deployed

| Capability | Default after deployment | Contract |
| --- | --- | --- |
| Full account deletion with recoverable Auth removal | Off today/default (`TABLEUS_ACCOUNT_DELETION_ENABLED=false`); pilot requires approved activation and rehearsal in Priority 3 | [account lifecycle](account-lifecycle.md), [operations](account-lifecycle-operations.md) |
| Plan transfer, sole-plan removal and legacy application-only deletion | Available subject to authorization/blockers; not disabled by the full-deletion flag | [account lifecycle](account-lifecycle.md) |
| Shared-content removal and organizer repair on deletion | Applies to legacy and full deletion; not gated by the full-deletion flag | [design](deletion-content-design.md) |
| Durable per-account quotas: 5 AI and 20 Places operations per UTC day, 20 plan creations per lifetime; operator-only usage reports | On, configurable | [cohort controls](cohort-controls.md) |
| Recipient-bound, one-use invitations | On after migration | [recipient invites](recipient-invites.md) |
| Private-link capture into bounded client memory; fragment link emission | Capture on; emission off (`*_JOIN_LINK_FORMAT`) | [private links](private-link-handling.md) |
| Public account-deletion help and support procedure | Page present; not published operationally | [procedure](deletion-support-procedure.md) |

## Known gaps and risks for the pilot

- Reads of plans with candidates hydrate Places; empty/summary/revision reads do
  not do that hydration. The default 20 daily logical Places operations per
  account needs complete-journey sizing, separately from billable attempts/spend.
- Structured cuisines are intersected only when supplied. Current web/mobile
  plan forms send free-text notes and empty cuisine arrays. The four-result
  requirement can still produce no result; its effect on real groups is unmeasured.
- Anonymous telemetry cannot measure group completion across accounts/sessions.
  The new [event report](pilot-measurement.md) measures retained plans from an
  owner-reviewed roster. Whole-plan deletion still removes events, and historical
  finalizations may have no voter count. Report unknown outcomes and these accepted
  coverage gaps; the retained-plan rate is not complete cohort conversion.
- Full deletion is implemented but has no hosted activation/worker acceptance.
  Priority 3 must prove the normal self-service path, organizer-blocker resolution,
  recovery and truthful retention/copy before invitations. Brian accepts that a
  known pilot participant who loses sign-in email access may be unable to delete
  until secure recovery/assisted verification exists. A support contact/escalation
  route remains required; the [support procedure](deletion-support-procedure.md)
  cannot initiate deletion from an email request alone.
- Idempotency, provider reservations and spend coordination are process-local, so
  the API must run as one process.
- Ad hoc iOS builds install only on devices included in the provisioning profile;
  collect all pilot iPhone device IDs before building. Production mobile builds
  are deliberately disabled until production origins and update policy exist.
- Integration CI is green on the tree merged as `8ae3c94`; later staging/native
  acceptance remains separate. A local plan-refresh component-test timeout
  did not recur in focused/full rechecks or either subsequent hosted run; its
  cause is unestablished.
- The old frozen dependency graph (`f94a1d9` native artifacts and API image) is
  not covered beyond September 30; a new candidate from the baseline uses the
  remediated graph ([disposition](evidence/dependency-toolchain-2026-09-21/README.md)).

## Native validation

The C1–C11 iOS 27 diagnostic campaign did not establish application acceptance
for `8972865`; several attempts stopped before TableUs ran, including the latest
memory prerequisite failure. Worktree counts do not establish the cause of RAM
pressure. Original refresh failures, accessibility-driver crashes, initialization
stall and AppHang remain unresolved findings, not automatically application defects
or resolved issues. Native history remains in its task at `c680b59`.

Brian replaced that campaign as the pilot gate with candidate-bound physical
device acceptance, including airplane-mode/visible retry and explicit finding
dispositions. One bounded `mobile-offline-e2e` run on a separate local test artifact
from the candidate covers writes whose responses are lost; its selected platform
and test configuration are explicit, not physical or cross-platform proof. A
signed physical-iPhone iOS 27 startup check passed for `f94a1d9`. Pilot native
acceptance uses the [pilot checklist](release-readiness-checklist.md); old device
results do not accept the new bytes. No task was messaged or stopped by this review.
