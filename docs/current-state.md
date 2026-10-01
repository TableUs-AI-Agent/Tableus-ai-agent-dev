# Current state


## Stopped checkpoint, October 1 05:03 UTC

B's email verification succeeded at `05:02:14.784399Z`, after the five-minute
handoff cutoff had stopped the API. The visible form says **Network unavailable.
Reconnect and try again.** The OTP is consumed; do not retry it. B has no
application profile/redemption and has not reached Plans. This is a cutoff-related
signup interruption, not evidence that the owner's internet failed.

Cutoff receipt `next-attempt-cutoff.json` verifies API/worker stopped and
unscheduled at `04:59:22.273730Z`, future deletion admission false. Window
`7dd980e3-6ce5-42e1-ab7e-464d3bea6de7` is closed. Its 485.349887 seconds are
charged through verified stop; exact instance-stop time was not captured.
Cumulative use is **6793.022059 seconds (113m13.022s)**; **2206.977941 seconds
(36m46.978s)** remain, including the 900-second final-phase reserve.

Restart **5/8** used unchanged API source `2eefdc5`, deployment
`721c710a-999a-4324-9b38-2b3dc1f79589`; readiness and exact links/new-Preview
CORS passed before cutoff. Worker stayed stopped. A's preserved session visibly
passed **Dinner plans** on web source `9593fba`, without another OTP; screenshot
`/private/tmp/tableus-p3-a-plans-fixed-live.png`. Preserve both in-app tabs.

Readback: nine Auth users/seven profiles; B Auth confirmed, B profiles/redemptions
zero, deletion queue/campaign provider rows zero. B's validation reservation was
active at readback and expires `05:14:47.518242Z`; its invitation expires October 2
`04:53:41.656074Z`. Revalidate through the normal form on any approved recovery.
Counters stay invites **8/10**, accounts **2/4**, OTP requests **6/11**, delivery/
verification reservations **5/10** and **5/20**, web Previews **2/2**, known status
reads **18/45**. Other counters/spending limits are unchanged. No C/D invitation
or OTP was issued during this resume.

**Next: review the [proposed B recovery scope](p3-b-signup-recovery.md). It is not yet approved.** There is
no spare recovery resume under the existing approval, so keep services stopped.
Do not reuse consumed OTPs, change identities, extract session tokens, or reset
allowances. A's fresh sign-in, original support/privacy mail binding, group/deletion
and hosted replay/contention acceptance remain incomplete. No pilot activation.

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
commands. No code, deployment, email send or provider call changed in this incident
reconciliation; no application suite was rerun for documentation-only edits.

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
