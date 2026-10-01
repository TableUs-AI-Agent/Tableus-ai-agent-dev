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


## Live handoff checkpoint, October 1 04:56 UTC

Approved restart **5/8** is SUCCESS on the unchanged API image: deployment
`721c710a-999a-4324-9b38-2b3dc1f79589`, source `2eefdc5`, deletion enabled/inline
false, exact links/new-Preview CORS passed. Worker remains stopped/unscheduled.
Window `7dd980e3-6ce5-42e1-ab7e-464d3bea6de7` began `04:51:16.923843Z`, maximum
deadline `05:21:09.251671Z`, preserving 900 final-phase seconds. Durable cutoff
process **78403** is armed; it begins deadline containment two minutes early.

A's preserved session now visibly opens **Dinner plans** on web source `9593fba`;
no new A OTP was needed. Screenshot `/private/tmp/tableus-p3-a-plans-fixed-live.png`.
B received a fresh recipient-bound invitation and one normal signup-code request
using the private approved replacement map. Its form shows code entry, no error.
Readback: nine Auth users/seven profiles; B Auth created but unconfirmed, no B
profile; one reservation expires `05:14:47.518242Z`, queue/new provider rows zero.
Counters: invites 8/10, accounts 2/4, OTP requests 6/11, delivery/verification
reservations 5/10 and 5/20, known status reads 18/45; other counters unchanged.

**Next: Brian enters B's newest code in in-app tab 3 and selects Verify and
continue. Verify actual Dinner plans plus B profile/redemption, then clear the
handoff deadline `04:59:13.762141Z` before advancing.** The deadline was reserved
before submission and was not extended. A's fresh sign-in and original support/
privacy mail acceptance remain unresolved. No C/D invitation or OTP was issued.
