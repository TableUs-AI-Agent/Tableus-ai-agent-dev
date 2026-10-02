# P3 final account resume after the expired D handoff

Prepared October 2, 2026 from `9918d6dbe3942db5d91e97f6ad9c1c6093deca4e`.
**Prepared only. Revised sequencing and allowance changes need owner approval.**
Both services remain stopped; no live window or restart is armed by preparation.
This proposal supersedes the uncompleted steps of the approved
[post-mail closeout](p3-post-mail-closeout.md), preserving all consumed usage.

## Reason and exact requested changes

The owner confirmed D's final deletion button was not clicked before shutdown.
The prior 9m1.463653s window is closed. Cumulative live usage is 223m10.548827s,
leaving 1009.451173 seconds under the existing 240-minute ceiling. Only 109.451173
seconds lies outside the reserved final 15 minutes, insufficient for D and its drain.

Approve **two new windows, each at most 15 minutes**, and these exact changes:

| Bound | Current | Proposed |
| --- | --- | --- |
| Cumulative live time ceiling | 240 minutes | 255 minutes, +15 minutes |
| Operator status-read ceiling | 45 | 50, +5 checks |
| API starts | 10 used / 12 allowed | Same ceiling; 11 resumes D, 12 resumes B |
| Before each worker batch | Prior first batch followed a live admission-pause restart | Stop API and verify disabled future admission before inspecting the queue and running the worker |

This makes 1909.451173 seconds available; the two windows use at most 1800, leaving
109.451173 seconds unused. Unused time does not authorize a third window, extra
restart or extension. The live admission-pause test remains unexercised. Stop/disable
before each worker prevents new application requests while that exact queue drains.

Keep $5 hosting / $15 provider / $20 combined / $0.25 AI caps. No AI is planned.
Keep worker invocations 1 used / 4 allowed, Auth DELETE attempts 0 / 12, four accounts,
ten invitations, three Previews, 11 / 12 OTP requests and 10 / 11 deliveries. Only
B's one returning OTP remains; no D OTP or resend. Support messages stay 13 / 17,
with four deferred and no new sends. Normal refresh/revoke allowance stays 12;
two reopened-tab initializations are conservatively reserved, making 6 used/reserved.
Places remains 74 / 420 and provider cost/reservations $1.5105715. If B metadata
repair needs location lookup, reserve one resolve/details pair, at most six HTTP
attempts / $0.147, then reconcile via the next aggregate readback or retain the
conservative reservation. No additional lookup or provider operation is implied.

## Exact existing targets

- Railway staging project `93dcd3f4-7c47-4010-9431-fc28638813d2`, environment
  `0f546dbc-222f-48b8-a27b-ff008af4fec9`.
- API service `94aeecda-4575-4fc1-bb08-796bf779ada5`, stopped deployment
  `aae2e714-81b4-4aea-896d-58187ec6517f`; image
  `sha256:4fc94ba63d5ee76f5e9e25868a0a347db252b12d4defacfcfa30078598d4c5b8`.
- Worker service `cac758a2-077c-4011-bff5-12b52db2d05a`, stopped deployment
  `18a8f3f8-886e-4dac-ba7e-9804bb584f75`; image
  `sha256:292ac97e9120612919399186ce53dbb68e650851f293c8d0a69421b2cae27797`.
  Original source for both: `2eefdc51345aeaa7951ffb343954c1669f9280c5`.
- Worker remains unscheduled with NEVER restart policy, existing command limit 3,
  70-second timeout and five-second kill grace. No direct Auth-admin deletion,
  SQL writes, manually inserted jobs, new resource, source deployment or secret.
- Web stays `bffa2845f268ea8b1906b8de155aa130f199856e`, existing Preview
  `dpl_8tmFppeucwSv23uuj71qYF7mpthW` and staging aliases. Production is unchanged.
  D uses `links.table-us.com`; B uses the same original immutable Preview origin.
  B's old tab had closed and D's old tab was unresponsive. Fresh tabs on their
  original origins now respond; application session recovery remains unverified
  until the API resumes. Do not infer a valid session from cached/browser data.

## Execution after explicit approval and readiness

1. Owner approves when available for about 30 minutes of active participation,
   plus a short stopped interval between phases. Prepare all operator helpers and
   responsive tabs before arming. If owner availability is stale, reconfirm readiness
   while stopped; this does not require repeating scope approval.
2. While stopped, use one combined roster/whole-queue read to require only the exact
   A/C pending jobs at zero attempts, with B/D intact and their trusted identities
   privately bound. Verify images, configuration, worker command, no schedules,
   source and budget headroom. Reconcile any unexpected state before starting.
3. Arm a fresh 900-second first window and verify the cutoff receipt before restart
   11. Enable API admission, inline false, on the same image. Verify readiness and
   exact D/B CORS. Recover D through its normal existing session; no new code. If
   recovery fails, contain and stop without spending B's reserved code.
4. Prepare D's final UI confirmation and hand it to the owner promptly. Allow at
   most five minutes, ending at least six minutes before the window deadline.
   Observe the pending-deletion screen. Stop API, verify stopped/unscheduled state,
   and set/read back future admission false and inline false using skip-deploy.
5. With API stopped, perform one combined D pending-job/whole-queue read. Require
   only A/C/D pending, no unrelated job, zero attempts, attention or active lease,
   and exact private identity-to-job bindings. Reserve one worker invocation and
   three Auth attempts. Run the existing worker once; verify its aggregate report
   and exact completed rows, raw-subject clearing and Auth/profile removal. Stop
   worker, verify both stopped/unscheduled and close the first window at its verified
   stop time. Keep B's temporary CORS origin for its second phase.
6. Prepare while stopped, then arm one final 900-second window and restart 12.
   Verify readiness/CORS, recover B's existing session, observe A-content cleanup,
   repair fixture metadata if required and obtain the owner's sole-plan removal.
   Sign B out normally, reserve the one returning OTP and have the owner enter it
   directly. Handoff lasts at most five minutes and ends at least eight minutes
   before the window deadline so deletion/drain can still fit. No resend on expiry.
7. Verify returning B identity in normal UI, then hand final account deletion to
   the owner. Observe pending state; stop API and disable future admission as above.
   Verify B's exact pending row and the whole queue, then run one limit-3 worker
   batch and verify all four exact completed rows and zero pending/attention/lease.
   Reconcile actual Auth DELETE attempts from durable rows against reservations.
8. Stop both processes first. Final skip-deploy configuration removes only B's
   temporary Preview origin while preserving both staging alias origins, with
   future admission false and inline false. Verify stored values and stopped/
   unscheduled states; no third restart. Charge through this final verified
   containment receipt. Full P3 acceptance is not implied.

## Bounds, checks and stop conditions

Nine planned operator reads: one stopped preflight, two readiness/CORS checks,
two pending/whole-queue checks, two worker aggregate reports and two exact completion
readbacks. From 37 used, 50 allows those nine plus four bounded diagnostic checks.
Do not silently poll or relabel reads. Configuration/image/scheduler/billing metadata
are the same bounded preflight/containment procedures used previously.

Each window has a fresh immutable ID. Existing cutoff starts containment 120 seconds
before deadline or sooner on a missed handoff; no deadline edit or automatic rearm.
Owner waiting, startup, verification and shutdown count. Stopped preparation does
not. Never start a worker with less than 240 seconds left, including its 75-second
outer bound and containment/verification time. Any unexpected core/provider/Auth
failure, identity mismatch, unrelated queue content or insufficient headroom ends
that attempt. No automatic spare worker retry is included in this sequence.

Nine offline operator-guard checks and eight existing cutoff self-tests pass.
Tests make no cloud calls or live ledger changes. Application inputs are unchanged;
reuse the already-passing 242 Python / 334 JavaScript / 13 browser hosted checks.
No claim is made that these local guard checks prove hosted deletion completion.

Keep all tombstones, invite history, quota counters and unrelated/legacy data. The
support case stays verification_required; four correspondence checks, hosted invite
replay/contention and unexercised server-side refusal stay explicit release gaps.
No native, production, real-user invitation, new AI evaluation or pilot activation.
