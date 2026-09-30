# Priority 3: fresh invitation rehearsal proposal

Prepared September 30, 2026, from documentation checkpoint
`e64401a722a5cb3eb281cdad2809a60e1d4307e6`. **Proposed; not yet approved.**
Brian's request to continue authorizes this preparation. The original campaign and
September 29 recovery remain approved; their exhausted limits are not reset.
Deployed application source remains `2eefdc51345aeaa7951ffb343954c1669f9280c5`.

## Starting point and requested extension

Brian confirmed receipt of A's Auth email after checking the correct inbox. Its
code/reservation and all four normal invitations are expired. No email-delivery
repair is indicated. Last provider read, September 29 at 22:58 UTC, verified API
and worker stopped, no schedule, deletion admission off, A unverified, no active
reservations or deletion jobs, and no campaign Places/AI usage. This proposal does
not present those observations as a fresh September 30 provider check.

| Allowance | Approved total | Used | Proposed total | Remaining after approval |
| --- | ---: | ---: | ---: | ---: |
| Recipient-bound invitations | 6 | 6 | **10** | 4 |
| Supervised live minutes | 105 | 90 | **150** | 60 |
| Same-image API configuration restarts | 5 | 2 | **7** | 5 |
| Provider-free status reads | 30 | 15 | **45** | 30 |

Four invitations replace the expired A/B/C/D signup fixtures. Each stays one-use,
recipient-bound, and valid for 24 hours; issue each only when its signup is ready.
Do not edit existing expiries, revoke history, or replace an Auth identity. A reuses
its existing unverified identity; only B/C/D may add new identities, within the
original four-account cap. Keep the existing revoked and naturally expired D
fixtures for their rejection evidence; no replacement rejection fixtures.

The additional 45 minutes restore 45 minutes for the unfinished first phase while
preserving 15 minutes for the final phase. Both may run in the same sitting because
the original natural expiry has elapsed. Stop the API/worker between phases.
Previously charged time stays charged. Preparation with services stopped does not
consume the live clock; reserve startup and containment time inside each window.

Four remaining configuration restarts serve resume, admission pause/B refusal,
final-phase re-enable, and final disable/CORS removal. One further same-image resume
is reserved for a single interrupted mailbox handoff. It does not authorize another
build, image, configuration change or time extension. The extra status reads cover
readiness, pending/retry, exact completion, worker and remaining support receipts;
they do not add processing, OTP, provider or deletion attempts.

All financial ceilings stay unchanged: **$5 incremental hosting, $15 providers,
$20 combined**, including **$0.25 AI**. Other ceilings remain four accounts,
11 OTP requests/10 delivered emails/20 verification submissions, 14 support
messages, 12 refresh/revoke calls, four worker processing invocations, 12 Auth
DELETE attempts, 420 Places attempts and three logical/nine underlying AI attempts.
No new resource, secret, source rollout, migration, web deployment or production
change is included. All prior attempts, including conservative reservations, count.

## Prepared handoff and execution order

A's existing in-app links tab is filled with its synthetic name and alias; its
invitation field is empty and send is disabled. B has a separate in-app tab at the
existing Preview's unique origin, also filled without an invitation or submission.
The legacy staging-origin session remains untouched. C/D can reuse A's links
origin after supported synthetic sign-out. Brian enters each OTP directly in its
TableUs form. The normal web flow validates the invitation before requesting the
email and creates membership only after verification and redemption.

1. Record approval and only the four changed ceilings in the private ledger.
   Re-read stopped deployment/source/image, aliases, queue/identity counts, grants,
   fresh provider totals and billing headroom. Keep admission and worker schedule
   off during preparation. If observed state differs, reconcile before starting.
2. Use the existing repository invitation CLI and private cumulative ledger. Arm
   and verify the prepared one-shot cutoff before resuming. The previous temporary
   helpers no longer exist; the replacement is saved durably beside the ledger as
   `next-attempt-cutoff.py`. It requires explicit recorded extension approval and
   an armed `next_attempt_window`, checks remaining time, rejects clock extensions,
   and starts deadline containment two minutes early. A `handoff_deadline` supplies
   the five-minute mailbox stop. Closing a window only disarms after both service
   stop flags are verified. No live action may start without working containment;
   do not infer approval from this proposal's presence.
3. Confirm the correct inbox and A form are ready, issue only A's replacement
   invitation using `backend/scripts/invites.py create --expires-hours 24`, and
   capture its code privately. Resume the existing API image with deletion enabled,
   inline false, the already-approved exact three-origin CORS list and current
   baseline plus unused Places headroom. Verify readiness and CORS before sending.
4. Request one A code and verify the same Auth identity plus one application
   profile before B. No next signup while A is unresolved. If manual handoff stalls
   for five minutes, stop the services and charge actual elapsed time; one recovery
   resume is available within the same totals. Reuse an unexpired reservation/code
   when valid; any resend consumes an existing remaining OTP allowance. A second
   stalled handoff stops this attempt for a new scope decision.
5. Issue B/C/D replacements only as needed. Complete original returning-sign-in,
   two-round group, ownership blocker, C sole-plan, A/C/D pending/status and verified
   D support-binding cases. Six OTP requests/deliveries are planned across A/B/C/D
   signup and A/B returning sign-in, leaving two request/delivery allowances spare.
   No hidden browser session-token extraction or account replacement is permitted.
6. Pause API deletion admission and verify B refusal. Before each of the three
   remaining worker processing invocations, verify the entire queue contains only
   approved synthetic subjects. Drain A/C/D; verify each completed row and cleared
   subject, then B's shared-data cleanup/metadata repair and sole-plan removal.
   Preserve support binding before losing D's session. Stop services between phases.
7. Re-enable in the final 15-minute phase. Check the original naturally expired D
   invitation returns rejection without OTP/account creation, perform B returning
   sign-in, deletion and bounded drain, then disable admission and remove the exact
   temporary Preview CORS origin. Stop worker/API and verify null scheduling.
   Preserve tombstones, counters, invitation use/history and all legacy data.

## Evidence limits and stops

The original hosted same-account redemption replay and one-use contention checks
remain open. Source inspection confirms the normal web form sends a single
redemption after OTP verification; repeated clicking is not a reliable contention
test. Existing deterministic/PostgreSQL evidence is retained but cannot be relabeled
as hosted proof. Establish a supported authenticated test path before attempting
those cases; otherwise report them untested and keep Priority 3 acceptance open.
This extension does not waive either criterion or authorize a changed-source test
client, hidden credential extraction, or additional accounts/OTP calls.

Stop on the original core/Auth/identity/privacy/queue/configuration/spend errors,
any exhausted allowance, or inability to contain reliably. Never exceed 1,000 for
the rolling Places setting or increase the independent 420-attempt campaign cap.
No extra retries, old-code submissions, automatic extension or pilot acceptance
follow from a failed attempt. Natural expiry is already elapsed; there is no need
to wait another day. Native/device acceptance and real pilot intake remain deferred.

After approval, the next action is the stopped-state preflight and cutoff setup,
then A's fresh invitation and one OTP request. No replacement invitation, live
restart or new email has occurred during this preparation.

## Preparation verification

The replacement cutoff passed eight local checks covering missing approval,
oversized windows, valid arming, early deadline containment, mailbox timeout,
attempted clock extension, verified-close requirements, and continued containment
when one stop operation fails. Python syntax compilation passed. No test invoked
Railway or armed a live timer. Script SHA-256:
`672a1bbe52c21bc7d69fdc3824b0c1c1a1902a933fc07acdcc9bcfcbba91d5e2`.
The private proposal record is explicitly unapproved; ledger limits/usage are
unchanged. A/B forms were visibly checked, with invitation fields empty and send
disabled. Application inputs are unchanged, so prior application CI remains
applicable; none of these preparation checks establishes hosted acceptance.
