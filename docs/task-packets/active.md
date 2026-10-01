# Active packet: Priority 3 approved staging campaign

## Source and authorization

Use `/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/pilot-realignment`
on `codex/pilot-staging-readiness`. The root checkout/local main are stale.
Preparation base: `810d410d32e7dd4ab29dc98a83ae733a304c10b3`, above Priority 2
merge `462a7dd6b3428d21a8fbccfe20a0003361904761`.

Brian approved the complete [prepared campaign](../pilot-staging-preparation.md)
on September 27 against application candidate
`e5e7d13478aaea6f526f2de9e6978824a30c79c3`. Approval remains valid; do not ask
for it again. The exact limits and stop conditions remain binding. Subsequent
documentation does not change application inputs or replenish allowances.

[PR #9](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/9) merged as
`2eefdc51345aeaa7951ffb343954c1669f9280c5`. Its full tree is identical to hosted
CI head `d2ccc7e32015b8982b64035382d7a3ab03b64acf`. Hosted CI passed 242 Python
tests, 326 JavaScript tests and five browser journeys, zero skips, plus lint/types,
migrations, deterministic evaluation, contracts, builds and smoke. Local readiness,
restricted PostgreSQL and browser evidence remain applicable to unchanged inputs.

## Mail-route preparation, October 1

The owner asked to continue. Read-only checks now find **no apex MX records** at
Squarespace authoritative DNS and two public resolvers. Resend still reports the
existing domain verified for sending, with receiving disabled. Outbound Gmail OTP
success therefore does not restore public support/privacy receipt. Website and
outbound-authentication DNS were captured before any change.

The in-app Squarespace Domains tab requires normal owner sign-in. Its Email
settings/forwarding eligibility have not been inspected. Built-in forwarding is a
candidate; documented plus-addressing limits mean A's original tagged route cannot
be assumed to work. No route, recipient, DNS, public contact or subscription changed.

Next: inspect authenticated Email settings and finish the exact forwarding proposal.
The remaining manual-case draft proposes 45 added live minutes, one first-phase
resume and three route-probe emails, while preserving financial/other attempt caps.
**None of those extensions or forwarding rules is approved.** Existing services
stay stopped and 18m14.050s remain under the current approval. The full preparation
and separate hosted-evidence gaps are in [the routing/remaining-case draft](../p3-mail-routing-and-remaining-cases.md).

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

**Next: prepare the remaining-case scope and resolve the support/privacy mailbox
route before another first-phase resume.** Only 3m14.050s remain outside the final
reserve, insufficient for two full ten-minute signup handoffs. C/D enrollment,
fresh A/B returning sign-in, hosted redemption replay/contention, server deletion
refusal, pending/support binding, drain/pause and final cleanup remain incomplete.
A cannot receive a fresh OTP at its original inbox; public support/privacy receipt
remains unresolved while Workspace is offline. Public contacts and A's identity
are unchanged. Full Priority 3 acceptance, real invitations and Priority 4 are not
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

## Historical recovery checkpoint, October 1 00:24 UTC / September 30 Central

Brian replied ready. Fresh readback found A Auth confirmed, no profile, same
eight-user/six-profile roster and empty queue/provider activity. The visible form
showed `Network unavailable. Reconnect and try again.` while API/worker remained
stopped. The earlier OTP was consumed; do not retry it. The approved normal-flow
resend reuses the same invitation and A identity.

Restart **4/7** is SUCCESS/ready, same approved source/image: deployment
`e26c892c-04d7-47ad-a71f-89b0b22dabf3`. A/B CORS passed. Worker stopped/no cron,
API deletion enabled/inline false. The single handoff recovery resume is consumed.
Window `b9e18f7d-cbd8-4312-820a-e15b04a5cf42` began `00:22:05.094507Z`, maximum
deadline `00:59:25.368553Z`. Durable cutoff process **64575** is armed; old cutoff
receipt was preserved as `next-attempt-handoff-stop.json` before rearming.

A fresh code was requested at `00:24:24.255314Z`, reservation expiry
`00:44:23.168219Z`. Auth confirmed/profile absent; eight Auth users/six profiles,
empty queue. Counters: five OTP requests, four delivery/verification reservations,
17/45 status reads. Invitations remain 7/10 and new Auth accounts 1/4.
The form displays code entry without an error. **Next: Brian enters the newest
code and selects Verify and continue; verify Plans/profile creation, then clear
the handoff deadline `00:29:24.255314Z`.** Do not advance to B without enrollment.
The hard first-phase budget is 37m20.274s from this window's start, preserving
15 final-phase minutes. If this second handoff stalls, contain and report gaps;
no further recovery resume is approved. B tab visibility is currently unconfirmed.

## Historical stopped checkpoint, October 1 00:10 UTC / September 30 Central

Brian explicitly approved [the extension](../p3-rehearsal-next-attempt.md) at
`a5f3de877f46673382b02ba69979eae12b295eb3`. Ledger ceilings are now ten invitations,
150 live minutes, seven same-image restarts and 45 status reads; all prior usage
remains charged. Stopped-state preflight verified exact source/image/aliases,
restricted roles, empty queue, A unverified and no campaign provider usage. Places
baseline remains 270 and ceiling 690. Railway workspace aggregate is $4.3062417,
$0.7525180 above the original baseline; this delayed aggregate is not exact spend.

Restart **3/7** is SUCCESS and same-image verified: deployment
`dd2c6643-3463-4923-9400-87ba93c50226`, source `2eefdc51345aeaa7951ffb343954c1669f9280c5`,
image `sha256:4fc94ba63d5ee76f5e9e25868a0a347db252b12d4defacfcfa30078598d4c5b8`.
Readiness and A/B CORS passed before the cutoff. API and worker are now verified
stopped/no cron; future API deletion admission false, inline false.
A replacement invite is saved privately as `a-next-invite.json`, expiring October 2
at `00:03:28.477022Z`; invitations used 7/10. No B/C/D replacement issued yet.

One A code was requested at `2026-10-01T00:05:27.467806Z`. The same existing Auth
identity was verified before/after; eight Auth users/six profiles, A unverified,
empty queue and zero campaign provider rows. Cutoff readback confirms A remains
unverified without a profile, with one active reservation. Reservation expiry
`00:25:25.923418Z`.
Counts: four OTP requests, three delivered-email/verification allowances reserved;
one readiness read brings known status reads to 16/45. No new account was created.

The window started `00:03:03.236948Z`, with maximum deadline `00:48:03.236948Z`.
Durable cutoff process **28701** contained window `dc025282-572b-48d7-99ba-43bf60e65af1`
for the unresolved A handoff: began `00:10:29.460276Z`, verified both stopped at
`00:10:42.962902Z`, then exited zero. The receipt is `next-attempt-cutoff.json`.
Charge **459.725954 seconds** through the verified-stop timestamp as a conservative
accounting endpoint; exact instance stop time is unknown. Ledger window/session
is closed. Total consumed **97m39.726s**, remaining **52m20.274s**, of which
**37m20.274s** is available for the incomplete first phase and 15 minutes reserved.
The single approved handoff recovery resume remains unused. Restarts used 3/7.

**Next: wait for Brian's readiness with the correct inbox and form open, then use
the already-approved recovery resume.** Check whether A's reservation is still
valid before choosing reuse versus a charged resend; no new invitation is needed
while A's replacement remains valid. Arm a new cutoff and verify API ready before
asking Brian to submit. Preserve the in-app form and private invitation. Clear the
handoff deadline only after actual profile creation. Tab 2 is B's separate existing
Preview origin. No full acceptance or hosted replay/contention pass is implied.

## Historical checkpoint, September 30: email receipt confirmed

At the September 29 22:58 UTC provider check, both API and worker deployments were
verified stopped, with null cron and
next run and future API deletion admission false. The cutoff requested API stop at
05:28:21 UTC, deployment metadata updated 05:28:27, and the immediate receipt still
showed stopping. The later provider read verifies stopped; exact instance stop time
was not captured. Private ledger segment index 1 is marked closed by cutoff with
its full 49m48.045s allocation charged; `ended_at` remains null rather than inventing
an exact timestamp. Cumulative allocation consumed is 90/105 minutes, leaving the
15-minute post-expiry reserve. Restart use remains 2/5; no attempt allowance resets.

A remains unverified. Its last code send was 04:41:40 UTC (September 28 11:41 p.m.
Central); the reservation expired 05:01:39 UTC and the code itself is also expired.
September 29 readback: eight Auth users/six profiles, zero active reservations/deletion
rows/new provider rows. No B/C/D enrollment, group journey or deletion acceptance.

On September 30 Brian corrected the missing-email report: the Auth code was
received, and he had checked the wrong inbox. Owner-visible receipt is passed;
OTP verification and enrollment remain incomplete. Close the missing-email
investigation without an SMTP/DNS/suppression change. The earlier self-to-alias
hypothesis was not established. No code/body was displayed or saved in evidence.
Three prior diagnostic status reads remain counted; aggregate status-read use is
15/30. No additional email or provider call accompanied this correction.

Private fixture records confirm all four normal invitations expired September 30
at 03:38:16–03:38:21 UTC. All six issued invitations are charged against the limit
of six. The separate natural-expiry fixture has elapsed; its HTTP rejection remains
untested. The [next-attempt proposal](../p3-rehearsal-next-attempt.md) is prepared:
ten total invitations, 150 live minutes, seven same-image restarts and 45 status
reads, with unchanged financial and other attempt caps. **Next: obtain approval
of that extension, then complete stopped-state preflight/cutoff setup before A's
fresh invitation and code.** No ledger ceiling or usage changed during preparation.

The earlier pending verification instructions are stale. Do not submit the old
code, reset the clock or automatically extend the approved recovery. Preserve the
unverified A identity and all legacy data. A is now prepared in in-app tab 1 (links)
and B in in-app tab 2 (existing unique Preview); both invitation fields are empty
and no send was submitted. The temporary Preview CORS origin
remains configured on the stopped API and must be removed at final containment.

## Historical recovery checkpoint, September 29 at 04:42 UTC

Brian approved the [recovery packet](../p3-rehearsal-recovery.md). Its limits are
now **105 cumulative live minutes and five same-image API configuration restarts**;
all other original limits and consumed counters remain unchanged. Restart **2/5**
is SUCCESS: deployment `b134094c-b6be-4f04-b8e9-87bbbd3e986a`, exact approved image
`sha256:4fc94ba63d5ee76f5e9e25868a0a347db252b12d4defacfcfa30078598d4c5b8` and source
`2eefdc51345aeaa7951ffb343954c1669f9280c5`. Readiness and A/B exact-origin CORS
preflights passed. Deletion is enabled, inline false; worker remains stopped and
unscheduled. Places ceiling stays 690 (fresh baseline 270 + unused 420).

The recovery live segment started `2026-09-29T04:39:03.227627Z`; hard deadline
`2026-09-29T05:28:51.272600Z` (12:28:51 a.m. Central). One-shot cutoff
`/private/tmp/tableus-p3-recovery-cutoff.py`, exec session **73801**, watches ledger
segment index 1 and stops services 30 seconds before the deadline. Check private
`recovery-cutoff.json`; a recorded `ended_at` disarms it. The earlier 40 minutes
11.955 seconds remain consumed; reserve at least 15 minutes for post-expiry work.

A's single recovery resend succeeded at `04:41:40.659236Z`, using the same Auth
identity. Its new reservation expires `05:01:39.315729Z`. Counts remain eight Auth
users/six profiles, with one active reservation, no other synthetic Auth accounts
and no live provider usage. Three OTP requests and two delivered-email allowances
are consumed/reserved; two verification submissions are conservatively reserved.
No replacement account or invitation was created.

**Next: Brian enters A's newest code in the visible in-app links tab and selects
Verify and continue once; verify Plans/profile creation before requesting B.**
Never request the code in chat. A is in-app tab 6; B's filled, unsubmitted form is
in-app tab 7 at the existing Preview's distinct origin. Preserve both tabs and
the legacy staging-origin session. Pointer activation did not trigger a request;
DB readback proved no send, then keyboard Enter triggered the single resend.
Use supported keyboard activation when in-app button clicks have no effect.

## Historical containment checkpoint, September 29 at 04:08 UTC

The owner could not find the external tool-created rehearsal window. A's signup
was not manually verified before its 20-minute invite reservation expired. Do not
submit that old form. External browser use is not required; the signed-out in-app
links-origin tab now contains A's filled, unsubmitted invitation form. No new OTP
was requested, and the legacy in-app staging session is untouched.

Session one ended early at `2026-09-29T04:08:34Z`: **40 minutes 11.955 seconds
used; 19 minutes 48.045 seconds remain** of the original 60. Future API admission
is disabled via `--skip-deploys`. API `76028185-7799-46ff-a361-e8571cb00867` and
worker `18a8f3f8-886e-4dac-ba7e-9804bb584f75` are verified stopped, each with null
cron/next run. The stop was asynchronous; the initial immediate check was false
and a subsequent read confirmed completion. No source deployment, configuration
restart, additional email, provider call or Auth deletion occurred. The existing
cutoff disarms on the recorded session end; check the private receipt.

Brian has now confirmed visibility of the filled in-app A form. B's filled form
is prepared on the existing Preview's distinct origin in a second in-app tab,
without OTP or a new deployment. The [recovery proposal](../p3-rehearsal-recovery.md)
was explicitly approved by Brian September 29: 45 additional live minutes, one
additional same-image configuration restart and temporary permission for that
exact Preview origin in staging CORS. The private ledger now retains elapsed and
attempt usage under ceilings of 105 minutes/five restarts; all other bounds stay
unchanged. **Next: perform the approved recovery preflight, resume the same API
image under restart two and recover A through the visible form.** The original two-session sequence is incomplete;
do not claim signup, group or deletion acceptance. Keep all cumulative allowances.

## Historical live checkpoint, September 29 at 03:44 UTC

Brian confirmed all eight marked support messages arrived: four privacy requests
and four A/B/C/D responses. His initial missing-mail report was resolved with
“none are missing”; no resend occurred. All four aliases/privacy forwarding pass.
Session one began `2026-09-29T03:28:22.044973Z`; its hard deadline is
`2026-09-29T04:13:22.044973Z` (September 28, 11:13:22 p.m. Central).

API configuration restart **1/4** is SUCCESS: deployment
`76028185-7799-46ff-a361-e8571cb00867` reuses the exact approved image/source,
passes readiness, enables queue-only deletion and tightens Places to 690 (fresh
baseline 270 + original 420 allowance). Worker remains stopped/unscheduled.
Expected no-reservation D signup returned hook 403, and wrong-recipient/revoked
validation returned 404 before OTP. All six invites are issued; natural expiry
is untouched. Eight support messages, two OTP requests, one new Auth account and
one worker invocation are spent. One OTP delivery/verification is conservatively
reserved. No new profile, group/provider action or deletion has occurred.

**Next: Brian enters A's newest emailed code in the prepared staging tab and
clicks Verify and continue once.** Do not ask for the code in chat or send B/C/D
codes until A succeeds. At 03:44 UTC totals are eight Auth users/six profiles,
fourteen invites, one reservation, empty queue and zero new provider usage.
Keep separate A/B browser origins; C/D may use the isolated in-app links origin
sequentially via supported synthetic sign-out. Preserve all legacy sessions.

A one-shot local cutoff is armed in `/private/tmp/tableus-p3-session-one-cutoff.py`
(exec session 59186). Thirty seconds before the deadline it removes worker cron,
disables future API admission without deploying, and stops latest API/worker
images. Check its private `session-one-cutoff.json` receipt before continuing.
Normal closeout sets session-one `ended_at` to disarm it. No clock/allowance reset.

## Rollout checkpoint, September 28 Central / September 29 UTC

Preflight is complete: actual Supabase Auth/SMTP/hook/schema/backup settings and
TableUs Sentry/PostHog plan/retention. Private logical backup/restore limitations
are in the [execution record](../evidence/e5e7d13/execution.md). A fresh private
backup was taken with the API stopped before migration. No stored credential was
manually extracted; the earlier Keychain-wrapper decoding denial remains binding.

All four migrations passed, using the separate normal CLI migration login and
verified TLS, ending at `9a1f2e7c4b80`. Private schema, browser denial, runtime
grants and invoker/Auth-admin hook grants were verified. Legacy counts remain
six profiles, seven Auth users, sixteen plans and eleven runs; sixteen plan credits
were backfilled. Legacy unknown provenance was preserved.

- API deployment `217e257f-9fbe-40fb-adec-ce231ff54c28` passed readiness with exact
  merged source, one process, deletion admission/inline attempts off and telemetry
  test hooks off. It is **stopped pending session-one mailbox/browser readiness**.
- Web Preview `dpl_7j4HwYgzPw4139i3W535V5iUFqrv` is READY from the same Git archive.
  Only `tableus-staging.vercel.app` and `links.table-us.com` moved to it. Public
  deletion/privacy/terms content passed checks. Both production aliases retain
  `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK`.
- Private worker service `cac758a2-077c-4011-bff5-12b52db2d05a`, deployment
  `18a8f3f8-886e-4dac-ba7e-9804bb584f75`, ran once with `processed=0`, healthy empty
  status and then exited. **No cron schedule or next run; restart NEVER.** New
  Railway services reject TOML configuration; normal service controls hold the
  identical reviewed Dockerfile/command/replica settings. No new app source.
- Existing server-only removal credential was privately provisioned to API/worker.
  Worker uses restricted runtime DB, deterministic providers and telemetry off;
  no Maps/Gemini/migration credentials or public domain.
- One D recipient-bound, one-use invitation was issued only to become the expiry
  fixture. Its code is private, with **real expiry `2026-09-30T02:48:54.780853Z`**:
  **September 29 at 9:48:55 p.m. America/Chicago**. No timestamp editing or early
  validation. No OTP email, new Auth account or live provider request was made.

## Split rehearsal, authorized September 28 Central

Brian requested “split the rehearsal.” Natural expiry no longer blocks session
one. Keep **60 supervised live minutes total across both sessions**: allocate at
most 45 minutes to session one and reserve at least 15 for session two. The stopped
overnight interval is excluded; neither session receives a fresh allowance.
Record actual starts, ends and remaining minutes in the private ledger. Mailbox
operation and isolated browser identities must be ready before the first test.

Session one performs all four enrollments, A's returning sign-in, recipient/revoked
and replay/contention checks, the two-round A/B group journey, blockers, A/C/D
pending requests and support binding, API pause/B refusal, bounded A/C/D drain,
then B's shared-content/metadata repair and sole-plan removal. Defer the already
budgeted **B returning sign-in** to session two. Sign out/close only synthetic
sessions before the interval, count revocations, disable worker scheduling and
stop the API; retain B's account and all durable evidence.

Session two begins after the real fixture expiry below. Verify expired-invite
rejection without requesting an OTP or creating a replacement D account; this
public validation route checks the invite independently of D's deleted identity.
Complete B's one returning sign-in, supported self-service deletion and bounded
worker drain, then final containment. Four configuration restarts remain exactly:
session-one enable and pause, session-two re-enable and final disable. The
session-two re-enable also resumes the stopped API using the same image. No extra
source deployment or overnight running service is needed.

## Approved next sequence

Follow the [fresh invitation proposal](../p3-rehearsal-next-attempt.md), which
supersedes the stale pending-code sequence. Brian explicitly approved it; the live
checkpoint above owns execution. It preserves the original cases and splits 60
remaining minutes at approval into 45 for the unfinished phase and 15 for
the final phase. The natural-expiry threshold is already elapsed. Issue each new
invitation only when ready for its signup. A/B stay in their visible in-app origins;
Brian enters OTPs directly. One interrupted handoff recovery is proposed, with
containment after five minutes without verified enrollment.

The old `/private/tmp` operator scripts no longer exist. A replacement
`next-attempt-cutoff.py` is now saved in the durable private rehearsal directory,
with eight local checks and syntax compilation passed; its hash is in the proposal
and private ledger. It successfully stopped the window above and is no longer
running. Arm a new window before the approved recovery. Verify its receipt and state
before additional actions; never assume an old process is running. The durable private
ledger and earlier stop receipts remain available. Hosted same-account
replay/contention still need a supported
authenticated test path; normal UI sends once and cannot establish contention.
Do not claim those criteria passed or silently waive them. No current limit changes
outside the explicitly approved extension.

Private fixture record:
`/Users/brianchei/Library/Application Support/TableUs/Rehearsals/2026-09-28-p3/d-expired-invite.json`.
Brian's four test addresses are `brian+tableus-p3-{a,b,c,d}@table-us.com`.
General support: `brian@table-us.com`; privacy/deletion: `privacy@table-us.com`,
which forwards to Brian. Alias delivery/privacy forwarding are confirmed; six support messages remain for
the verified D challenge, duplicate and completion cases. Never request credentials in chat.

## Remaining bounds

Consumed: one API rollout, one web Preview/two staging alias assignments, one
private worker resource/deployment, four migrations, all six invites and one
of four worker processing invocations. API configuration restarts: two of five.
Auth DELETE attempts: zero of twelve. One new Auth user/no new profile; three OTP
requests, eight support messages, two OTP deliveries/verifications reserved. Live
Places/AI remain zero. The recovery segment is closed by cutoff at the current checkpoint above. All other ceilings in the
prepared campaign apply, including $15 providers, $5 hosting, $0.25 AI, three
logical/nine underlying AI attempts, eleven OTP requests/ten deliveries/twenty
verification submissions, fourteen support messages, twelve refresh/revoke calls
and thirty status reads. Empty `--status` reads do not process work.

No automatic retry after a rollout/core/Auth/budget/identity error, no additional
allowance, no production/native build, real invitation, secret rotation or legacy
cleanup. Preserve additive migrations; do not restore the old unmetered API.
Priority 3 acceptance remains open; Priority 4 physical-device/native acceptance
and real-pilot intake remain later, separately scoped work.
