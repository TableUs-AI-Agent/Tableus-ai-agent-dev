# Priority 3 rehearsal recovery proposal

Prepared September 29, 2026, after the inaccessible browser handoff. **Pending
Brian's explicit approval; this document grants no additional allowance.** The
approved deployed application remains
`2eefdc51345aeaa7951ffb343954c1669f9280c5`, with no application changes or new build.

## Verified starting point

Brian confirmed he can see A's filled form in the Codex in-app browser at
`https://links.table-us.com/invite?mode=join`. The inaccessible external A/B tabs
were closed. A's old 20-minute reservation expired without verified enrollment.
The normal join flow can revalidate the same unused invite and request another
code for the existing A Auth identity; it does not require a replacement account.
Use one of the four already-approved resend allowances and verify identity counts
before and after recovery. No new code has been requested.

The API and worker are stopped, future API deletion admission is false, and worker
cron/next run are null. The private ledger records 2,411.955 seconds used and
1,188.045 seconds remaining. The earlier cutoff receipt confirms disarmed because
the session ended. All original attempt/spend counters remain cumulative.

B's filled, unsubmitted form is now a second in-app tab on the **existing** READY
Preview, `dpl_7j4HwYgzPw4139i3W535V5iUFqrv`, at
`https://tableus-staging-mvbl5qxnl-briancheis-projects.vercel.app/invite?mode=join`.
Its metadata was re-read through the existing authenticated Vercel CLI. The Vercel
connector returned 404, so no connector mutation was attempted. The page is public
and its inputs enable the send button. No new Preview, alias or resource is needed.
The legacy in-app staging-origin session remains untouched.

## Requested changes

1. Add **45 supervised live minutes** to the campaign ceiling: 60 → **105 total**.
   With 40 minutes 11.955 seconds consumed, at most 64 minutes 48.045 seconds remain.
   Allow at most 49 minutes 48.045 seconds for the interrupted first phase and keep
   at least 15 minutes for the natural-expiry/final phase. Stopped preparation and
   overnight time stay excluded; the elapsed first segment is never reset.
2. Add **one same-image API configuration restart**: four → **five total**. One
   is already consumed. The four remaining are recovery resume, admission pause
   with B refusal, post-expiry re-enable, and final disable. No changed-source
   build, deployment retry, secret, resource, web deployment or alias change.
3. During recovery resume, add only the exact existing Preview origin
   `https://tableus-staging-mvbl5qxnl-briancheis-projects.vercel.app` to the API's
   existing two-origin CORS allowlist. This permits independent A/B sessions in
   visible in-app tabs. No wildcard or production origin. Remove this additional
   origin at final disable. Verify the effective list and preflight before signup.

All other original ceilings remain unchanged: four accounts, six invites, eleven
OTP requests/ten deliveries/twenty verification submissions, fourteen support
messages, twelve refresh/revoke calls, thirty status reads, four worker invocations,
twelve Auth DELETE attempts, 420 Places attempts, three logical/nine underlying AI
attempts, $0.25 AI, $15 providers, $5 hosting and $20 combined. Previously consumed
and conservatively reserved attempts are not refunded. No cleanup of legacy data.

## Execution and stop conditions

Before resuming, verify both visible forms, source/image/aliases, private identity
ledger, queue, grants, fresh rolling provider totals and remaining spend/attempts.
Prepare the deadline cutoff against the remaining allocation before any live
action. Tighten the rolling Places ceiling to fresh baseline plus unused campaign
allowance, never increase the independently approved campaign allowance.

Resume the existing API image under restart two, verify readiness and the exact
CORS origin, then recover A through the normal join/code flow. Brian enters codes
directly in the visible forms. Stop at the first unexpected Auth or identity error;
do not delete/recreate A. B uses the separate existing Preview origin. After A's
group participation and pending-deletion evidence, C then D can reuse the links
origin through supported synthetic sign-out. Do not overwrite B or legacy sessions.

Continue the original enrollment, returning-sign-in, group rounds, blockers,
pending/status/support-binding, pause/refusal/drain and B repair cases. Same-account
redemption replay and one-use contention remain required and untested; establish
a supported authenticated execution path before claiming either result. Do not
extract hidden browser tokens or report deterministic tests as hosted evidence.
The six remaining support messages retain their original D verification/duplicate/
completion purposes. Check exact queued subjects before each bounded worker run.

Stop the API and worker between phases. The second phase begins only after the
unchanged D fixture expiry, `2026-09-30T02:48:54.780853Z` (September 29 at 9:48:55 p.m.
Central), verifies rejection without another D account or OTP, performs B's planned
returning sign-in and final deletion, and ends with admission/scheduling off and
both services stopped. Retain all tombstones, counters, invite-use and evidence.

All original error, identity, privacy, queue, attempt, spending and time stop
conditions remain binding. The extra time is a ceiling, not a promise of completion.
If the remaining cases cannot finish within it, stop and report the exact gaps;
never infer another extension or pilot acceptance.
