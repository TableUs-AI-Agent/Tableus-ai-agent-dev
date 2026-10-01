# Current state


## A code replaced after automatic cutoff; services stopped, October 1

The owner approved the remaining rehearsal at `32ab7cd` with cumulative ceilings
of 195 minutes and ten same-image API restarts. Its first window started at
`2026-10-01T07:48:29.335107Z`. The unresolved A code handoff triggered containment
at `08:00:59.521109Z`; the durable receipt verified both services stopped and
unscheduled, with future deletion admission disabled, at `08:01:13.381017Z`.
Charge **764.045910 seconds** through verified stop, bringing cumulative use to
**9269.996196 seconds**. The stopped overnight interval is excluded. A's returning
verification remains unconfirmed; its earlier reservation is retained.

The owner later explicitly requested reopening the prepared tab and resending the
expired code. At approximately `20:24Z`, one replacement request succeeded through
the normal returning sign-in form at `https://links.table-us.com/invite`, using A's
unchanged approved address and `shouldCreateUser: false`. The code-entry prompt
is visible; no code was read, stored or entered by the agent. Inbox receipt and
verification remain unconfirmed. Screenshot: `/private/tmp/tableus-a-replacement-code.png`.
The in-app browser is visible and this tab is retained for owner entry. B's prior
Preview tab was absent from the fresh tab inventory; its session was not inspected,
revoked or assumed lost. Recover its context normally before further B work.

This request authorizes one replacement, not a server restart or ceiling increase.
API/worker remain stopped. Code verification can establish the Supabase session
before the application's `/api/v1/me` check reports network unavailable; that error
alone does not prove OTP failure. Full returning-login acceptance needs the API and
identity/membership verification. Do not submit the same OTP again after such an error.

Conservatively charge the full ten-minute Auth-only handoff through
`2026-10-01T20:34:07.208948Z` in advance. No Railway window is armed. Total charged
use is **9869.996196 seconds (164m29.996196s)**, leaving **1830.003804 seconds
(30m30.003804s)**, including the final **900 seconds**. Counters: restarts **7/10**,
OTP requests **9/11**, delivery reservations **8/10**, verification reservations
**8/20**, refresh/revoke **1/12**, status reads **23/45**, mail **11/17**,
invitations **8/10**, accounts **2/4**, worker processing **1/4**, Auth DELETE **0/12**.
No other counter or limit changes. Reservation counts are not confirmed deliveries
or completed verification submissions.

Next: owner enters the newest code in the retained tab and reports the result.
Before restarting or continuing the complete rehearsal, reconcile a bounded recovery
scope: only two OTP requests/deliveries remain for three planned C/D/B logins, and
the three remaining restart slots are already allocated to pause/final resume/final
disable. Do not silently consume those reservations or extend a deadline. No P3
acceptance, new accounts, deletion, support-case mail or provider evaluation occurred.

## ImprovMX routing active; all three delivery routes passed, October 1

ImprovMX Free is Active with three exact aliases and no catch-all. The approved
MX/SPF changes pass all six DNS sources, 72 retained-record comparisons and
verified Resend sending. Public support/privacy addresses and A's identity remain.

The owner approved the exact three-message delivery test at
`1c42ca9a1ce5ed4875c413fe12b839868e591add`. SUPPORT, PRIVACY and A were each sent
once; all three Resend metadata checks reported **delivered**. The owner then
confirmed “all three received.” SUPPORT, PRIVACY and A all pass by owner inbox
receipt. The receipt report arrived after the window closed; it consumed no new
message, status lookup, supervised window or restart.

The supervised window ran from `2026-10-01T07:20:44.036274+00:00` to its
`2026-10-01T07:30:44.036274+00:00` deadline, charging 600 seconds. Ledger closeout
was recorded at `07:30:57.419244Z`; no provider action occurred after the deadline.
Cumulative use is **141m45.950286s of 160 minutes**, leaving
**18m14.049714s**, including the unchanged 15-minute final reserve.
Mail use is **11/17**, leaving six reserved rehearsal-case messages. Operator
status reads are **22/45**. The API/worker stayed stopped; no OTP, invitation,
restart, account, deletion or AI/Places operation occurred. All other limits and
counters are unchanged. The broader 195-minute/restart-10 scope remains unapproved.

See [the delivery-test evidence](p3-mail-route-delivery-test.md).

Next: approve the prepared remaining manual rehearsal and be available for code
entry and account confirmations. Its proposed 195-minute/restart-10 ceilings are
not yet applied; the first phase is capped at 38m14.049714s, followed by the
reserved 15-minute final phase.

The owner approved the brief remove/inspect/restore test and completed required
Google reauthentication. Removing only the Resend `send` MX cleared Squarespace's
existing-MX warning, but **Add Rule remained disabled** and the Google Workspace
management notice remained. Removing this record is therefore insufficient to
enable forwarding. The exact additional eligibility reason is not exposed by
this UI; do not infer that canceling Workspace is necessary or authorized.

Delete was confirmed at `06:43:32.535Z`; the original record was saved back at
`06:44:18.929Z` and visibly verified at `06:44:31.920Z` (59.385 seconds after Delete).
Restored: `send` MX, priority 10, TTL 14400,
`feedback-smtp.us-east-1.amazonses.com`. At `06:45:03.261037Z`, all four authoritative
servers plus Cloudflare and Google resolvers returned the original MX. Matching
baseline website, SPF, Resend DKIM and DMARC answers were unchanged. Resend still
reported the domain and all three sending DNS records verified, sending enabled.
This is configuration verification, not a test email or global absence measurement.

During the diagnostic no forward, destination submission, provider account,
subscription, SMTP or other DNS change occurred. Subsequent ImprovMX setup,
DNS activation, delivery-test results and revised accounting are recorded above. The diagnostic itself did not resume staging or change rehearsal counters.

The exact ImprovMX setup was approved at `ba5ec9546a1d668e0c2b91b52aa7af72e7f6be06`,
then held while investigating Squarespace. The owner has now explicitly resumed
that alternative; its exact aliases and approved DNS are now active. Do not
repeat this completed test.
See [the routing/remaining-case scope](p3-mail-routing-and-remaining-cases.md) and
[the diagnostic evidence](evidence/mail-routing-2026-10-01/squarespace-mx-test.json).

## B signup and group checks passed; stopped October 1 05:35 UTC

B completed the normal fresh-code signup in the existing Preview tab. Readback
confirmed one B profile and one redemption, and the browser showed **Dinner plans**.
Its ten-minute handoff was cleared only after those checks. A's preserved session
also works; neither result proves a fresh returning sign-in.

The synthetic A/B plan passed the following live checks on web `9593fba` and API
`2eefdc5`: location lookup and creation, B private-link confirmation/join, two
separate saved constraints, one recommendation returning four Google-grounded
options, two separate votes, organizer finalization, B refresh, reopen, changed
votes and a second finalization visible to B. First winner: Quartino Ristorante;
second winner: The Dearborn. Reopen reused the same four candidates: **one
recommendation run, two voting rounds**, not two recommendation runs. Database
events confirm four vote updates, two finalizations and one reopen.

A's account showed one organized shared plan and a disabled deletion action.
The normal confirmed transfer moved ownership to B; A then showed no organized
plans, and B showed the two-person plan. This proves the **UI eligibility blocker
and ownership transfer**, not a server-side rejected deletion request. No deletion
request, Auth removal, legacy edit or support message was performed.
The naturally expired D fixture returned HTTP 404 from normal invitation validation,
without an OTP, new reservation or account. Its timestamp was not edited.

The API and worker were deliberately stopped and unscheduled at
**`2026-10-01T05:35:40.174199Z`**, with future deletion admission false. Private
receipt `b-recovery-completion-stop.json` verifies both stopped/null next runs.
Cutoff process 85219 exited after verified closure. The window started
`05:17:07.245972Z`; charge **1112.928227 seconds** through stop verification.
Cumulative use is **7905.950286 seconds (131m45.950s)**; **1094.049714 seconds
(18m14.050s)** remain, including **900 final-phase seconds**. No live clock runs.
API deployment `f52a6861-b1f0-4b46-b9db-7576f60bfe45` remains the approved image.
Both in-app sessions are preserved on account pages; avoid paid-plan refreshes
against a stopped API. No additional recovery resume is authorized.

Final readback: nine Auth users/eight profiles, no C/D Auth accounts, zero deletion
rows and active reservations. A and B and their shared synthetic plan remain.
Restarts **6/9**, Previews **2/2**, invitations **8/10**, new accounts **2/4**,
OTP requests **7/11**, delivery/verification reservations **6/10** and **6/20**,
known operator status reads **19/45**, worker processing **1/4**, support **8/14**.
Remaining restarts were allocated to admission pause/final re-enable/final disable;
they are not an unallocated first-phase recovery allowance.

Observed campaign provider use: **72 Places HTTP attempts** (resolve 1, location
details 2, search 1, restaurant details 68), **one logical AI call**, and
**$0.0005715 estimated AI**. Conservatively retain three underlying AI attempts.
At the campaign's approved first-tier pricing, Places costs at most $1.461 before
credits; the combined provider estimate is $1.4615715. Places ledger cost zero
is not evidence of free billing. Final delayed Railway workspace usage
$4.405555630631419 is $0.8518319533405543 above the original baseline, not exact
campaign attribution. All $5 hosting/$15 provider/$20 combined caps remain.

**At the B-stop checkpoint below, only 3m14.050s remained outside the final
reserve.** Mail recovery and the prepared remaining-case scope now appear above;
that historical allowance was insufficient for two full ten-minute signup handoffs. C/D enrollment,
fresh A/B returning sign-in, hosted redemption replay/contention, server deletion
refusal, pending/support binding, drain/pause and final cleanup remain incomplete.
At that checkpoint Workspace was offline and A/support/privacy receipt was
unresolved. The later ImprovMX probes now pass all three routes; public contacts
and A's identity remain unchanged. A fresh Auth OTP after forwarding remains part
of the pending returning-sign-in test. Full Priority 3 acceptance, real invitations and Priority 4 are not
approved by these partial successes.

Evidence screenshots are under `/private/tmp`: `tableus-p3-b-plans-live.png`,
`tableus-p3-group-four-options.png`, `tableus-p3-group-round-one-b.png`,
`tableus-p3-group-round-two-b.png`, `tableus-p3-a-organizer-blocker.png` and
`tableus-p3-b-ownership.png`. These contain no OTP or private invitation/share code.
Checks: eight cutoff self-tests, source/image/readiness/CORS, visible normal flows,
read-only database/provider checks and documentation consistency. No application
code changed; prior source-bound CI remains applicable and was not rerun.

## Deployed source and prior authorization

Brian approved the signup-fix rollout at `9e9e939ed7000f9e19923dcbf112d2aaea2e37cc`.
PR #10 merged as **`9593fba0202e830746523f29cee16532539e80a2`**, identical full tree
to hosted CI head `4c9392261b0ba8e4154fd8db9e621674579ae1b4`. Hosted CI passed
242 Python, 326 JavaScript and 11 browser checks with zero skips, plus lint/types,
migrations, contracts, deterministic evaluation, builds and smoke. The fix refreshes
membership for the verified subject after redemption and guards against late denial.

Preview `dpl_99cFtsd56wHCam5dN1EwW5XmTred` is READY on both staging aliases;
production stays on `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK`. API/worker source remains
`2eefdc51345aeaa7951ffb343954c1669f9280c5`. The approved extra Preview and resume
are consumed. The durable cutoff's eight self-tests passed. Existing temporary
helpers have consumed counter assumptions; do not rerun their reserve/arm/resume
commands. The latest approved same-image resume and normal-flow email/provider actions
are recorded above. Application source and previous CI inputs are unchanged.

Brian approved replacement inbox aliases for B/C/D; exact personal addresses are
stored only in the private ledger. A's original identity and public support/privacy
contacts stay unchanged. The original inbox outage leaves fresh A sign-in and
support/privacy acceptance unresolved. Preserve earlier receipts as historical
proof rather than claiming current mailbox availability.

## Historical stopped checkpoints

At October 1 00:10:42 UTC (September 30 evening Central), API and worker are
verified stopped after the five-minute A handoff cutoff. Approved restart **3/7**
had passed: deployment `dd2c6643-3463-4923-9400-87ba93c50226`, unchanged source
`2eefdc51345aeaa7951ffb343954c1669f9280c5` and approved image digest. Readiness and
both A/B exact-origin CORS preflights passed. Both schedules are null and future
API deletion admission is false. No recovery resume has been used.
The approved extension records ten invitations, 150 live minutes, seven restarts
and 45 status reads; financial/other attempt caps are unchanged.

A's replacement invitation is issued (7/10 consumed). One fresh code was requested
at `2026-10-01T00:05:27.467806Z` through the visible in-app links form. Database
readback verifies the same existing Auth identity, still unverified, eight total
Auth users/six profiles, empty deletion queue and no campaign provider rows. Its
reservation expires `00:25:25.923418Z`. Cutoff readback still finds A unverified
without a profile, one active reservation and no queue/provider rows. Do not claim
enrollment. OTP counters are four requests, three deliveries and three verification
submissions conservatively reserved. Known status reads are 16/45.

The first-phase window began `00:03:03.236948Z`; containment began `00:10:29.460276Z`
and stopped readback completed `00:10:42.962902Z`. Cutoff process 28701 exited
successfully. Charge 459.725954 seconds through verified stop as a conservative
accounting endpoint, not an exact instance-stop timestamp. Cumulative use is
97m39.726s; **52m20.274s remain**, including the 15-minute final-phase reserve.
Next: Brian confirms readiness with the correct inbox and form open, then use the
already-approved single recovery resume after checking reservation validity and
arming a new cutoff. Hold verification until the API is ready; no automatic resend.
Full acceptance, including hosted replay/contention,
remains open. The following paragraphs preserve the preceding stopped checkpoint.

At the September 29 22:58 UTC check, API and worker deployments are both stopped,
with no cron or next run and future API deletion admission false. The recovery
cutoff requested shutdown at 05:28:21 UTC; its immediate read preceded complete
shutdown, and the later provider read confirms both stopped. Exact instance stop
time was not captured. The full recovery allocation is charged conservatively:
90 of 105 approved live minutes are used; 15 remain reserved for the post-expiry
phase. Two of five same-image configuration restarts are consumed.

A's last code was sent September 28 at 11:41:40 p.m. Central and is expired. The
associated reservation expired September 29 at 12:01:39 a.m. Central. The September 29
database readback found A unverified, eight Auth users/six profiles, zero active
reservations, zero deletion rows and zero new provider usage. Three
OTP requests/two deliveries and two conservative verification reservations remain
accounted for. First-phase acceptance is incomplete; reconcile the missing cases
and remaining phase allocation before any restart/resend. The temporary exact
Preview CORS origin remains configured on the stopped API pending final removal.

On September 30 Brian confirmed the Auth code was received: he had checked the
wrong inbox. Owner-visible email receipt is passed; the missing-email investigation
is resolved. The earlier self-to-alias hypothesis was not established. No email
configuration repair is indicated, and receipt does not establish OTP verification
or enrollment. The three prior diagnostic reads remain charged; no new email,
provider call, SMTP change or service restart accompanied this correction.

The four normal A/B/C/D invitations expired September 30 at approximately 03:38 UTC
(September 29 at 10:38 p.m. Central), as confirmed from their private fixture
records. All six issued invitations remain charged against the six-invitation
limit. The separate natural-expiry fixture has also elapsed, but its HTTP rejection
check remains untested. The [fresh invitation proposal](p3-rehearsal-next-attempt.md)
was subsequently approved: totals of ten invitations, 150 live minutes,
seven same-image restarts and 45 status reads; spending and all other caps unchanged.
A/B in-app forms were prepared without invitation codes or submission. Approval
changed only those four ceilings. The prior temporary helpers are no longer present;
the durable replacement cutoff passed eight local checks and successfully contained
the window above. Hosted replay/contention
remain open; the normal form alone does not supply reliable evidence for them.

Brian confirmed all eight synthetic support messages reached the four aliases and
privacy route. Hook/wrong-recipient/revoked-invite checks passed. The original live
segment stopped after an inaccessible external-browser handoff and consumed
40 minutes 11.955 seconds; that elapsed time and all prior attempts remain charged.
The legacy staging browser session is preserved, and A was handed off in the visible in-app browser. The [approved recovery packet](p3-rehearsal-recovery.md)
and [execution evidence](evidence/e5e7d13/execution.md) retain the sequence and exact
bounds. Priority 3 acceptance remains open; no real-pilot activation is implied.

## Source baseline

| Item | Value |
| --- | --- |
| Integrated source baseline | Priority 1 merge `8ae3c94`, Priority 2 merge `462a7dd`, and Priority 3 merge `2eefdc5` (approved app candidate `e5e7d1`) |
| Refreshed `origin/main` | `2eefdc51345aeaa7951ffb343954c1669f9280c5`, approved merge of [PR #9](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/9) on September 28 Central |
| Integration status | Priorities 1 and 2 complete. Priority 3 merge tree matches passing CI head `d2ccc7e`; app inputs remain the approved `e5e7d1` candidate. Rollout is complete; synthetic acceptance remains open. The separate native diagnostic branch remains excluded. |
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
| API (Railway `tableus-staging`) | `2eefdc5` | Same-image restart `b134094c-b6be-4f04-b8e9-87bbbd3e986a` (2/5) passed readiness/CORS, then cutoff stopped it. Future deletion admission/inline attempts off. Places ceiling 690; live providers unused. |
| Web aliases `tableus-staging.vercel.app`, `links.table-us.com` | `2eefdc5` | READY Preview `dpl_7j4HwYgzPw4139i3W535V5iUFqrv`; public deletion/privacy/terms checked. |
| Private deletion worker | `2eefdc5` | One empty startup completed and exited; no public domain/healthcheck, restart NEVER, schedule absent. One of four processing invocations consumed. |
| Accepted native artifacts | `f94a1d9` | Isolated-staging acceptance with an owner-accepted simulator AppHang risk ([closeout](evidence/ios27-staging-f94a1d9/closeout.md)) |
| Production-facing `table-us.com` | `e1184ec` | Not a pilot target |

Hosted Alembic head is `9a1f2e7c4b80`. All four missing migrations passed in
order with the API stopped and a separate migration login. Restricted grants,
private app schema and invoker Auth hook were verified. Six legacy profiles,
seven Auth users, sixteen plans and eleven runs remain intact; sixteen plan
credits were backfilled. Legacy unused unbound invites are rejected for new
signups. One new recipient-bound expiry fixture is stored privately; it must
expire naturally before its session-two rejection check. Five more synthetic invites
are now issued (including revoked D), and A is the sole new Auth user, unverified
at the 03:44 UTC checkpoint. No legacy invite was reissued.

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
| Full account deletion with recoverable Auth removal | Off today/default (`TABLEUS_ACCOUNT_DELETION_ENABLED=false`); pilot requires approved activation and rehearsal in Priority 3 | [account lifecycle](account-lifecycle.md), [operations](account-lifecycle-operations.md) |
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
- Full deletion is deployed but admission remains off. The worker passed empty
  startup; actual Auth removal and the scheduled drain still need acceptance.
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
Staging copy is published; mailbox delivery remains unverified. Brian approved the
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
OTP without changing security settings. The approved migration and rollout then completed; no OTP email has been sent.
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
