# Signup context fix: integration and web deployment

## Provenance and approval

Brian approved the complete [rollout/resume scope](../../p3-signup-fix-rollout.md)
at documentation commit `9e9e939ed7000f9e19923dcbf112d2aaea2e37cc`. The application
fix is `a5a1f44913b9956e9c0aa54e30492a58367f97f9`, based on `ca9bcc3`.
[PR #10](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/10) merged as
**`9593fba0202e830746523f29cee16532539e80a2`** on October 1 at `01:06:48Z`.
Its entire tree matches tested head `4c9392261b0ba8e4154fd8db9e621674579ae1b4`.
No backend, native, dependency or migration inputs changed from deployed `2eefdc5`.

Source review found no further actionable issue after correcting the browser
suite's Mac-only artifact paths to use `os.tmpdir()`. The application fix is
unchanged: explicit membership reload after redemption/returning approval, bound
to the verified subject, preserving version guards and private-join continuation.
The earlier CI run was superseded/cancelled by the portability commit.

## Verification

- Before-fix local regression failed to show Dinner plans after successful
  redemption; both early/late denial cases pass after the fix.
- Local `make ready`: 326 JavaScript, 206 Python passes/36 PostgreSQL-only skips,
  lint/types, contracts without drift, web/Expo-web builds, smoke and report-only
  performance. Test-only portability follow-up: web lint/types and six browser
  checks passed. No unaffected application check was relabeled or rerun needlessly.
- [Hosted CI 36798973088](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36798973088):
  **242 Python, 326 JavaScript and 11 browser checks**, zero skips; restricted
  PostgreSQL migrations/grants, lint/types, deterministic evaluation (seven cases),
  contracts, builds and smoke passed. Full log retained privately in
  `/private/tmp/tableus-signup-hosted-ci.log`.

## Stopped-state preflight

Vercel Git deployments remain excluded for the objective branch and main. Railway
project and both service Git triggers are empty; PR deploys false. No implicit
rollout occurred during publication/merge. Both API/worker remained stopped with
null cron and next run. Restricted runtime is non-superuser/non-bypass-RLS; browser
roles lack app usage/table reads; signup hook remains invoker. API admission/inline
are false; worker remains deterministic without a schedule. Runtime source stamps
and approved image digests remain `2eefdc5`.

A has confirmed Auth, one profile/redemption; eight Auth users/seven profiles,
no B/C/D identities, zero active reservations/deletion rows/campaign provider rows.
Existing 30-day usage is 270 Places units and $0.00224625 Gemini, unchanged.
Railway workspace usage is $4.324445298176605 versus original $3.5537236772908645;
the $0.7707216208857405 difference is a delayed workspace upper bound, not exact
campaign spend. $5 hosting/$15 provider/$20 combined caps remain in place.
Vercel Preview public origins match staging; no DB/removal credential variable
names are configured. Sensitive blank values returned by env pull are not evidence
of absence. The unchanged cutoff passed all eight self-tests.

## Web deployment

A clean `git archive` of merge `9593fba` (1,019 tracked files) supplied the build;
only project-link metadata was added locally. No private fixture/environment file
was included. One additional Preview allowance was reserved before deployment:
**`dpl_99cFtsd56wHCam5dN1EwW5XmTred`**, READY, Node 22.x, Preview target.
Both source metadata stamps equal the full merge SHA. This binds uploaded source,
observed build configuration and metadata, not an independently recomputed remote
source hash. Source/telemetry/query-link stamps were explicit; Sentry build upload
remained disabled as in the prior accepted Preview.

URL: [new Preview](https://tableus-staging-jg7z2er4o-briancheis-projects.vercel.app).
Its unsigned Join page renders normally. B's display name/controlled alias are
prepared in in-app tab 3; invitation is empty and send disabled. No OTP was sent.
Only `links.table-us.com` and `tableus-staging.vercel.app` moved. Both production
aliases remain on `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK`, verified after assignment.
Screenshot: `/private/tmp/tableus-p3-fixed-preview-prepared.png`.

## Remaining gate and allowances

API `e26c892c-04d7-47ad-a71f-89b0b22dabf3` and worker
`18a8f3f8-886e-4dac-ba7e-9804bb584f75` were reverified stopped/unscheduled after
alias assignment. No clock is armed; cumulative use stays 6307.672172 seconds,
remaining 2692.327828 seconds (including 900 final-phase seconds). Web Previews
2/2, same-image restarts 4/8; all other counters unchanged. The existing temporary
old-Preview CORS origin remains on the stopped API until the approved resume
replaces it; remove the new temporary origin during final containment.

Owner availability is pending. Next: arm containment, resume the same API image,
verify readiness/CORS, then refresh A's preserved links-origin session and require
actual Plans access before issuing B. Live signup, group/deletion/support binding,
hosted replay/contention and final cleanup acceptance remain open. This deployment
does not accept the pilot or authorize native builds/activation.


## Historical stopped checkpoint, October 1 05:03 UTC

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

**Next: execute the [approved B recovery](../../p3-b-signup-recovery.md).** Brian approved one extra
same-image resume (ceiling **9**) and ten-minute handoffs at proposal `eaa32ae`.
All spent time/counters stay charged. Services remain stopped during preparation.
Prepare and verify durable containment before the resume; hand off immediately
after one normal B resend. Do not reuse consumed OTPs or extract session tokens.
A's fresh sign-in, original support/privacy mail binding, group/deletion
and hosted replay/contention acceptance remain incomplete. No pilot activation.

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
