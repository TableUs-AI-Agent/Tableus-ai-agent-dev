# Priority 3: signup context fix and bounded staging resume

Prepared October 1, 2026 (September 30 Central). **Brian explicitly approved this
complete scope at `9e9e939ed7000f9e19923dcbf112d2aaea2e37cc`.** The private ledger
now records ceilings of two web Previews and eight same-image API restarts; all
spent attempts and cumulative time remain charged.
Reviewed local fix candidate: **`a5a1f44913b9956e9c0aa54e30492a58367f97f9`**, based
on `ca9bcc35bf5147d8a3b11e58f59c6ac26de9e973`. Subsequent scope-document edits do
not change application inputs. Local `make ready` and six browser checks passed;
326 JavaScript tests, 206 Python passes/36 PostgreSQL-only skips, lint/types,
contracts without drift, web/Expo-web builds, smoke and report-only performance.
Hosted CI/review and live verification of the fix remain outstanding.
This supplements the [original campaign](pilot-staging-preparation.md) and
[approved invitation extension](p3-rehearsal-next-attempt.md); all used allowances
remain charged. It does not accept Priority 3 or start Priority 4.

## Observed failure and prepared change

A has confirmed Auth, one application profile and one redeemed invitation. The
web reached Plans but said to sign in. A deterministic browser test reproduced the
same ordering: Auth emits `SIGNED_IN`, the membership read runs before invitation
redemption, and the resulting denial remains in context after redemption succeeds.

The local fix refreshes membership after redemption/returning-member approval,
bound to the verified subject, before Plans navigation or private-join continuation.
Existing guards ignore stale responses. Two signup regressions plus four existing
account/deletion browser checks pass and are added to CI. No backend, migration,
provider configuration, dependency or native application code changes are needed.
The deployed API and worker remain on `2eefdc51345aeaa7951ffb343954c1669f9280c5`.

## Requested scope and limits

Approve publication/PR, passing hosted CI and review, merge of these reviewed
inputs, **one additional exact-source Vercel Preview**, assignment of only
`links.table-us.com` and `tableus-staging.vercel.app`, and **one additional
same-image API resume** for the remaining synthetic rehearsal. Production aliases
stay excluded. Check Git deployment exclusions and Railway triggers before push;
no implicit deployment may consume an unreviewed attempt. Stop on a failed build
or deployment; no changed-source rebuild/retry is included.

| Allowance | Current total | Used | Requested total | Remaining if approved |
| --- | ---: | ---: | ---: | ---: |
| Vercel Preview deployments | 1 | 1 | **2** | 1 |
| Same-image API configuration restarts | 7 | 4 | **8** | 4 |
| Supervised live time | 150 min | 105m7.672s | **unchanged** | 44m52.328s |
| Recipient-bound invitations | 10 | 7 | **unchanged** | 3 (B/C/D) |
| Provider-free status reads | 45 | 17 | **unchanged** | 28 |

The four remaining API restarts cover this resume, admission pause/B refusal,
final-phase re-enable, and final disable/CORS removal. No spare handoff recovery
is included. Keep worker processing at four total (one used), with no new worker
resource or image. No new API source rollout, migrations, secrets or paid upgrades.
Replace the temporary old Preview CORS origin with the newly returned exact Preview
origin during the approved resume, retaining the two staging aliases; remove the
Preview origin during final containment. B uses that separate origin with the fix.

Other unchanged caps: four new Auth accounts (one used); 11 OTP requests (five
used), ten delivered-email allowances (four reserved), 20 verification submissions
(four reserved); 14 support messages (eight used); 12 refresh/revoke and 12 Auth
DELETE attempts; 420 Places attempts; three logical/nine underlying AI attempts
and $0.25 AI. **$5 incremental hosting, $15 providers, $20 combined** remain the
financial ceilings. Fresh billing/provider headroom must be checked before resume;
delayed workspace usage is an upper bound, not exact campaign spend. No counters
are reset and the ledger ceilings change only after explicit approval.

## Execution and stop conditions

1. Publish the reviewed source under the existing deployment exclusions, run CI
   (including six mocked hosted-auth browser checks), review, and merge only if
   green. Verify merge application inputs match the tested candidate. Build one
   Preview from a clean source archive; verify its source, auth/API configuration
   and READY state before assigning the two staging aliases.
2. Keep services stopped throughout preparation. Reconcile A/legacy identity
   counts, queue, source/image, schedules, grants, budget and provider totals.
   Keep A's existing session; do not resend its consumed OTP or re-redeem its
   invitation. Prepare B's form on the new Preview origin without sending mail.
3. Before resume, confirm owner availability and arm/verify the durable cutoff
   with the remaining cumulative clock. Allocate at most **29m52.328s** to the
   unfinished first phase and preserve **15 minutes** for the final phase;
   startup/containment count. Resume the existing API image with deletion enabled,
   inline false, exact CORS origins and unchanged quotas/provider limits. Verify
   readiness before refreshing A's Plans tab. A must show actual Plans/profile
   access before proceeding to B. An expired session uses normal returning sign-in
   within the existing OTP allowance, never hidden token extraction.
4. Issue B/C/D's three remaining recipient-bound, one-use 24-hour invitations only
   when ready. Brian enters codes in the visible in-app forms. Apply a five-minute
   handoff cutoff to each unresolved signup; observe profile plus usable Plans
   before advancing. No extra recovery restart is included. Continue the original
   two-round group, returning sign-in, ownership, support-binding and A/C/D pending
   deletion cases within remaining bounds. Hosted replay/contention is still open;
   ordinary repeated clicks must not be described as proving either criterion.
5. Pause admission, verify B refusal, and drain only verified synthetic queue rows
   within remaining worker/Auth attempts. Stop services between phases. In the
   reserved final phase, check natural-expiry rejection, B returning sign-in and
   deletion/drain, then disable admission, remove temporary Preview CORS and verify
   API/worker stopped with null schedules/next runs. Preserve tombstones/history
   and all legacy accounts/data. Record partial acceptance honestly if time runs out.

The first unexpected core failure, wrong source/subject/recipient, privacy leak,
missing support binding, unknown billable attempt, deployment error, inability to
contain, or exhausted clock/attempt/budget stops new work. Disable future admission,
stop/unschedule services and preserve evidence; drain only when Auth/configuration
is healthy and the original synthetic bounds permit it. Do not extend the clock.
Do not roll aliases back to an incompatible version while API intake remains open.
Any additional recovery or changed-source deployment needs a new scoped decision.


## Execution checkpoint

PR #10 merged as `9593fba0202e830746523f29cee16532539e80a2`, identical tree to
passing CI head `4c9392261b0ba8e4154fd8db9e621674579ae1b4`. A test-only portability
fix uses the runner's temp directory; application inputs remain the approved fix.
Preview `dpl_99cFtsd56wHCam5dN1EwW5XmTred` is READY and assigned to both staging
aliases; production targets are unchanged. Web deployments 2/2, restarts 4/8,
44m52.328s remain. API/worker stay stopped. Brian subsequently reported loss of `@table-us.com`
mailbox access; the recipient/support plan must be reconciled before resume.
See [integration evidence](evidence/9593fba/integration.md). Steps 3–5 remain open.


Brian then supplied a replacement controlled inbox and approved three tagged
aliases for B/C/D. Exact personal addresses are stored privately; new invitations
will bind those recipients. Existing limits and the approved resume remain valid.
A keeps its original identity; fresh A sign-in and original support/privacy mailbox
checks remain incomplete. No additional account, public contact change or bypass.
