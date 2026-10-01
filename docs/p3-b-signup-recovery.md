# P3: recover B signup after the handoff cutoff

Prepared October 1, 2026. **Brian approved this complete scope at proposal commit
`eaa32aecbec22172781bef3b6139de3053053454`.** This supplements the
[consumed signup-fix scope](p3-signup-fix-rollout.md), without resetting allowances.

B's OTP was accepted at `05:02:14.784399Z`, after API stop was verified at
`04:59:22.273730Z`. Auth exists, but no B profile or invitation redemption exists.
The UI verifies the OTP before redeeming the invitation, so its network error
reflects the stopped API. Pressing Verify again would retry the consumed OTP.
A's preserved session already passed live Plans on the deployed web fix.

## Approved change

Approved: **one additional same-image API resume**, raising the cumulative restart
ceiling from **8 to 9**, and **ten minutes for each unresolved code-entry handoff**
instead of five. Five restarts are used; the other three remain reserved for
admission pause, final-phase re-enable, and final disable/CORS removal. No spare
recovery follows this resume. No new web/API source deployment or migration.

Keep the 150-minute cumulative live limit: **36m46.977941s remain**, with at most
**21m46.977941s** for the first phase and **15 minutes** reserved for the final
phase. Startup and containment count. Keep $5 incremental hosting, $15 provider
and $20 combined caps, plus every invitation/account/OTP/provider allowance.
No new budget is requested. Partial acceptance remains possible within this time.

## Execution

1. Confirm current owner availability, stopped services, approved source/images,
   empty or understood synthetic queue, billing/provider headroom and remaining
   counters. Prepare the form and all diagnostics before sending any email.
2. Record approval, reconcile the private ledger and prepare the next guarded
   resume helper. Archive the existing cutoff receipt. Arm and verify durable
   containment before resuming the unchanged `2eefdc5` API image. Retain the exact
   staging/Preview origins and unchanged provider quotas; keep worker stopped.
3. Verify readiness/CORS. Use B's visible **Use a different email or request a
   new code** control, preserving its approved recipient, display name and valid
   invitation. Reserve one request, delivery and verification allowance before
   sending. The normal Join flow revalidates the invitation and requests a fresh
   code for the existing B Auth account; it does not create another identity.
   The invitation expires October 2 at `04:53:41.656074Z`; stop if it has expired.
4. Arm a ten-minute handoff immediately before the send; report the exact deadline
   and hand off as soon as code entry appears. Do not spend handoff time on routine
   documentation. Brian enters/submits the new code. Verify B profile/redemption
   and actual Dinner plans before advancing. Do not retry a consumed OTP or access
   hidden browser tokens. Stop on ambiguity or unexpected core failure.
5. Continue remaining approved rehearsal checks only within available clock and
   counters. Each handoff is bounded by both ten minutes and the phase deadline;
   neither is extended. Start hard-deadline containment two minutes early as in
   the existing helper. Pause/stop between phases and preserve the final reserve.
   Perform final containment under the existing scope. If time is insufficient,
   record incomplete cases rather than expanding the budget or claiming acceptance.

The approved ten-minute handoff now replaces the prior five-minute limit.
Services stay stopped until the guarded clock and cutoff are armed. B's OTP remains recorded
as consumed; A's identity/session and legacy data are preserved. A fresh sign-in and original
support/privacy delivery/binding remain incomplete during the mailbox outage;
replacement recipients do not authorize a public contact change or pilot launch.

## Execution checkpoint (recovery consumed)

Resume 6/9 completed B's signup and the A/B group/ownership checks. One
recommendation supplied four candidates; two voting/finalization rounds passed
with different winners. Natural-expiry rejection also passed without email.
The API/worker were verified stopped at `05:35:40.174199Z`, schedules absent,
future admission false. The durable cutoff disarmed after verified closure.

Cumulative remaining time is **18m14.049714s**, including the 15-minute final
reserve. No C/D identity or deletion request exists. Exact counters, source-bound
results, billing limits and acceptance gaps are in [current state](current-state.md).
This scope's extra recovery is consumed; no additional first-phase resume follows
from the three remaining purpose-bound configuration restarts. Prepare a scoped
continuation and resolve original support/privacy mailbox access before resuming.
