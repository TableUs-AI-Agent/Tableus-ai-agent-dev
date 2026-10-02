# Current state

## Closeout window stopped; Account page unavailable, October 2

The Account page cannot load its API-backed data while the staging API is stopped.
The automatic cutoff verified API and worker stopped and unscheduled at
**2026-10-01 23:52:18.364374Z** (6:52:18 p.m. Chicago). Current service/config
readback at **2026-10-02 05:18:41Z** confirms both remain stopped and unscheduled,
on the unchanged approved images. Future API deletion admission and inline Auth
attempts are disabled. No service was restarted to diagnose this loading report.

The owner approved the account-flow closeout at
`f518c1bcc5eadf7f676c014dc22ffde8f9d1fefc`. Restart 10/12 passed readiness and both
D/B CORS checks at 23:44:10Z October 1; D's existing session recovered normally
without a new OTP. On October 2 the owner confirmed the final deletion button
was not clicked. D deletion remains to be performed and verified;
last trusted roster/queue readback at 23:35:29Z had A/C pending with zero attempts
and intact B/D profiles and Auth records. No new database read or worker invocation
was performed for the loading diagnosis. B's prior tab had closed and D's old tab was unresponsive. Fresh responsive tabs
were opened on their original origins; normal session recovery is still unverified.
Two possible initialization refreshes are conservatively reserved, making 6/12
refresh/revoke uses or reservations. No OTP was requested.

First closeout window `fb428981-5783-41d5-9b15-32fde9267a33` ran from
23:43:16.900721Z through verified containment at 23:52:18.364374Z. Its immutable
23:54:07.815547Z deadline was preserved. Exact charge: **541.463653 seconds**;
cumulative **223m10.548827s / 240m**; remaining **1009.451173 seconds**. The final
900-second reserve remains untouched, leaving only 109.451173 seconds outside it,
which cannot fit the prior first-phase work and containment margin. No automatic
recovery start or extension is authorized by the stop. Restart slots 11/12 remain
allocated to pause/drain and final B resume; do not repurpose them silently.

Next: approve the prepared [final account resume](p3-final-account-resume.md). It proposes two
15-minute windows, cumulative time ceiling 255 minutes and status reads 50, with
unchanged financial limits and API restart ceiling. Both services remain stopped. The previous sequence's active D handoff has expired; do not instruct the
owner to delete or request a fresh code against a stopped API. The existing private
ledger, trusted identity bindings and cutoff receipt remain authoritative.

Web remains PR #11 merge `bffa2845f268ea8b1906b8de155aa130f199856e`, READY Preview
`dpl_8tmFppeucwSv23uuj71qYF7mpthW` on the two staging aliases. Production aliases
remain unchanged. Hosted CI at the same merge tree passed 242 Python, 334 JavaScript
and 13 browser checks, zero skips. No application source or deployment changed
for this diagnosis. Latest hosting usage upper bound is $1.2498076379774683;
operator reads remain 37/45, support messages 13/17, Auth DELETE attempts 0/12.

D's support case remains `verification_required`: the owner saw no forwarded copy
in Inbox or Spam despite Gmail SMTP acceptance in ImprovMX at 22:24:27Z October 1.
The earlier three external route probes remain passing. The four remaining support
messages and their acceptance checks remain deferred. Final B cleanup, returning
sign-in/deletion, worker completion, hosted replay/contention and server-side
refusal checks remain incomplete. Full P3 acceptance stays open. See [account-flow closeout](p3-post-mail-closeout.md)
for the prior approved scope and unchanged limits.

## Verified rehearsal and mail results

A/B completed one four-option recommendation and two voting/finalization rounds.
B refreshed both results and took ownership after the organizer-deletion blocker
was observed. Reopen reused the same candidates. Natural invitation expiry
rejected signup without an OTP. A returning application sign-in subsequently
passed, and its owner-confirmed deletion is now pending Auth removal. D deletion/support,
worker removal and final B cleanup remain incomplete.

ImprovMX Free is Active with three exact aliases, no catch-all and verified
MX/SPF/DKIM retention. The owner confirmed all three SUPPORT, PRIVACY and A-route
test messages received. Public `brian@table-us.com` and `privacy@table-us.com`
remain unchanged; personal destinations and synthetic identity bindings stay
private. Mail recovery is complete; this does not prove the remaining support-case
workflow. See [routing and case scope](p3-mail-routing-and-remaining-cases.md).

## Source baseline

| Item | Value |
| --- | --- |
| Integrated source baseline | Priority 1 merge `8ae3c94`, Priority 2 merge `462a7dd`, and Priority 3 merge `2eefdc5` (approved app candidate `e5e7d1`) |
| Refreshed `origin/main` | `bffa2845f268ea8b1906b8de155aa130f199856e`, approved signup-completion recovery in PR #11 |
| Integration status | Priorities 1 and 2 complete. Priority 3 merge tree matches passing CI head `d2ccc7e`; the signup recovery above is deployed as `bffa284`. Initial rollout is complete; synthetic acceptance remains open. The separate native diagnostic branch remains excluded. |
| Root checkout | Stale at `codex/privacy-safe-observability` (`8e9625e`). Use the baseline, not the root checkout. |

Priority 1 local readiness at its earlier application source passed 214
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

Priority 2 [final hosted CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36302260485)
passed **238 Python tests, 326 JavaScript tests and five browser journeys, zero
skips**, including restricted PostgreSQL roles/migrations, lint/types, deterministic
evaluation, contract checks, web/Expo-web builds and smoke. The approved merge
`462a7dd` and tested `1270206` head have the same file tree. Local account/help and private-Join recovery
checks also passed. No application repair was needed in hosted CI; the
[handoff](evidence/f621cf5/implementation.md) preserves local dev-cache timeout
observations and source binding. Documentation closeout does not change app inputs.

Vercel project Git auto-deployment is enabled, but repository configuration now
excludes `codex/pilot-realignment`, `codex/pilot-experience-measurement`,
`codex/pilot-staging-readiness` and `main`
([Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration)). Other branches still need trigger
review before pushing. Railway currently has no deployment triggers and PR
environments are disabled. The approved manual rollout below consumed the API/web allowances without an automatic deployment.

## Deployed staging

| Component | Source | Notes |
| --- | --- | --- |
| API (Railway `tableus-staging`) | `2eefdc5` | Same-image restart 10/12, deployment `aae2e714-81b4-4aea-896d-58187ec6517f`, verified stopped at 23:52:18Z October 1. Future admission off, inline attempts off. |
| Web aliases `tableus-staging.vercel.app`, `links.table-us.com` | `bffa284` | READY Preview `dpl_8tmFppeucwSv23uuj71qYF7mpthW`; C signup recovery verified. |
| Private deletion worker | `2eefdc5` | Deployment `18a8f3f8-886e-4dac-ba7e-9804bb584f75` stopped/unscheduled. One empty processing invocation consumed; A/C pending jobs have no Auth DELETE attempts. |
| Accepted native artifacts | `f94a1d9` | Earlier isolated-staging acceptance with owner-accepted simulator AppHang risk; not pilot acceptance of current source. |
| Production-facing `table-us.com` | `e1184ec` | Not a pilot target; unchanged. |

Hosted Alembic head remains `9a1f2e7c4b80`; all four migrations passed with separate
migration credentials, restricted grants, private app schema and invoker Auth hook.
No schema change is part of the recovery fix. Counters and exact remaining bounds
are in the [active packet](task-packets/active.md). Preserve legacy records,
tombstones, invite-use history and all private evidence.

## Product

The core journey is implemented on web, iOS and Android: invite-approved email
OTP sign-in, shared plans for 2–8 people, per-participant constraints, four
grounded options from Places and Gemini, top-three ranked voting, organizer
finalize and reopen, private-link rotation, explicit refresh and explicit retry of
ambiguous mobile writes. Clients use `/api/v1`; Supabase is used directly only for
authentication. Earlier candidate evidence is not acceptance of the cumulative
local application. The API allows organizer finalization with zero or partial
votes; the agreed pilot counts success only with at least two independent votes.

The merged Priority 2 source lands users on Plans and exposes Plans/Account on
web and mobile. Deferred Discover, Friends/People, Review, Taste/Profile and photo
entry routes lead to Plans; their implementations, API endpoints and export fields
remain. Mobile Account has an independent tab plus its existing deletion-recovery
route, privacy, terms and deletion-help links. Auth, invite and private Join behavior
is preserved. These changes are deployed to staging web; new native builds remain deferred.

New `plan.finalized` events record the active run's `distinct_voter_count` (0–8).
Deletion cleanup retains only the validated integer, independent of candidate/run
survival. The bounded read-only [measurement report](pilot-measurement.md) uses
retained join/finalization events, counts each eligible plan once and discloses
unknown history/deletion coverage. This does not add a quorum or change ranking.

## Implemented and deployed to staging API/web

| Capability | Default after deployment | Contract |
| --- | --- | --- |
| Full account deletion with recoverable Auth removal | Default off; API currently enabled only under the supervised P3 cutoff, with inline attempts off | [account lifecycle](account-lifecycle.md), [operations](account-lifecycle-operations.md) |
| Plan transfer, sole-plan removal and legacy application-only deletion | Available subject to authorization/blockers; not disabled by the full-deletion flag | [account lifecycle](account-lifecycle.md) |
| Shared-content removal and organizer repair on deletion | Applies to legacy and full deletion; not gated by the full-deletion flag | [design](deletion-content-design.md) |
| Durable per-account quotas and operator-only usage reports | Staging configured to 3 AI/40 Places per day and 20 lifetime plans; code defaults remain 5/20/20. | [cohort controls](cohort-controls.md) |
| Recipient-bound, one-use invitations | On after migration | [recipient invites](recipient-invites.md) |
| Private-link capture into bounded client memory; fragment link emission | Capture on; emission off (`*_JOIN_LINK_FORMAT`) | [private links](private-link-handling.md) |
| Public account-deletion help and support procedure | Staging page published; controlled support-mail rehearsal remains pending. | [procedure](deletion-support-procedure.md) |

## Known gaps and risks for the pilot

- Reads of plans with candidates hydrate Places; empty/summary/revision reads do
  not do that hydration. Deterministic two-round journey sizing now measures 18/22/30 organizer
  operations for 2/4/8 diners (90/226/690 nominal group HTTP attempts).
  Staging is configured to 40/day for the approved synthetic exercise only;
  real-pilot capacity still needs its own scope and budget.
- Structured cuisines are intersected only when supplied. Current web/mobile
  plan forms send free-text notes and empty cuisine arrays. The four-result
  requirement can still produce no result; its effect on real groups is unmeasured.
- Anonymous telemetry cannot measure group completion across accounts/sessions.
  The new [event report](pilot-measurement.md) measures retained plans from an
  owner-reviewed roster. Whole-plan deletion still removes events, and historical
  finalizations may have no voter count. Report unknown outcomes and these accepted
  coverage gaps; the retained-plan rate is not complete cohort conversion.
- Full deletion is deployed and admission is enabled only for the supervised rehearsal. The worker passed empty
  startup; actual Auth removal and the bounded manual drain still need acceptance.
  Priority 3 has prepared queue-only API admission, a separate five-minute Railway
  worker and four-account rehearsal; external execution must prove the normal
  self-service path, organizer-blocker resolution,
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
- Integration CI is green on the tree merged as `2eefdc5`; synthetic staging/native
  acceptance remains separate. A local plan-refresh component-test timeout
  did not recur in focused/full rechecks or either subsequent hosted run; its
  cause is unestablished.
- The old frozen dependency graph in `f94a1d9` native artifacts is
  not covered beyond September 30; a new candidate from the baseline uses the
  remediated graph ([disposition](evidence/dependency-toolchain-2026-09-21/README.md)).

## Priority 3 local preparation

The candidate adds optional worker-only Auth processing via
`TABLEUS_ACCOUNT_DELETION_INLINE_ATTEMPT=false`; default inline behavior remains
true, full-deletion admission remains off. Repeated requests in worker-only mode
return durable status without consuming an attempt. Queue-only/pause/drain checks
pass against SQLite and restricted PostgreSQL. A separate prepared Railway cron
uses five-minute ticks, batch three and a 70/75-second TERM/KILL watchdog.

Shared privacy/help copy now explains pending Auth removal, authored-content
cleanup, retained pseudonymous records without automatic purge, and the accepted
email-access-loss limitation. Brian confirmed `brian@table-us.com` for support,
with `privacy@table-us.com` forwarding to him, plus four controlled test aliases.
Staging copy is published; all three required incoming mail routes now pass by owner receipt. Brian approved the
[prepared scope](pilot-staging-preparation.md) against `e5e7d1`: six invites, four
accounts, worker/Auth/email limits, $15 provider/$5 hosting ceilings, rollback
compatibility and required Auth/retention readback. Supabase dashboard checks now
confirm the hook, custom SMTP, OTP/session settings and app-schema isolation.
There are no scheduled backups/PITR on this Free-plan project. A private logical
backup and isolated local app/public restore/migration check passed; the
[execution record](evidence/e5e7d13/execution.md) records scope and limitations.
TableUs Sentry Developer and PostHog Free plan/retention readback is complete;
event windows are not universal erasure deadlines. The hosted signup email template now says
“verification code” instead of “six-digit code,” matching the configured eight-digit
OTP without changing security settings. The approved migration and rollout completed; current rehearsal progress and consumed OTPs are recorded above and in the active packet.
The global Places configuration maximum is now 1,000; default 150 is unchanged.
That validation ceiling grants no spending. The API/web/worker now use the merged source; native identity is unchanged.
No additional migration was introduced by this preparation.

Local preparation is complete. Readiness finished in stages after a sandbox
loopback denial: 206 Python passes with 36 PostgreSQL-only skips, 326 JavaScript
passes, lint/types, contracts, web/Expo-web builds, smoke and report-only performance.
An additional restricted-PostgreSQL pass covered 40 selected tests with zero skips;
two production-build deletion-help browser journeys passed. Hosted CI passed 242 Python tests, 326 JavaScript tests and five browser journeys
with zero skips; merge and rollout are complete. Synthetic staging acceptance remains open. See the
[verification and next gate](pilot-staging-preparation.md#local-verification-and-handoff).

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
