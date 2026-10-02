# P3 account-flow closeout after the self-forwarding stop

Prepared October 1, 2026 from `130af2e747d2fa4104f5b8931a278642ae5e01b1`.
**Owner approved execution and revised restart order at `f518c1bcc5eadf7f676c014dc22ffde8f9d1fefc`.**
The first bounded window has closed: both services were verified stopped at
23:52:18.364374Z October 1. Restart 10 was consumed; the owner confirmed D's final UI confirmation
was not clicked. Remaining 1009.451173 seconds includes the reserved final 900;
the prior first-phase sequence cannot resume within the 109.451173-second balance. The [prepared final resume](p3-final-account-resume.md) proposes the next sequence;
it is not approved yet. The [active packet](task-packets/active.md) remains authoritative.

## Mail result and scope boundary

The owner received D's fresh challenge and replied, but found no forwarded copy
in Inbox or Spam. The exact subject/sender/recipient entry in the signed-in
ImprovMX log shows queue admission at 22:24:23Z and Gmail SMTP acceptance at
22:24:27Z (5:24:27 p.m. Chicago). This proves transport to Gmail, not user-visible
receipt or complete support verification. ImprovMX's documented same-inbox loop
behavior explains a plausible cause; Gmail's final disposition was not observed.
Keep the private support case `verification_required`. Earlier three external
route probes retain their passing receipt evidence. No DNS edit, mail resend,
new mailbox, alternate account identity, secret or provider change is proposed.

Defer the four remaining support-case messages (duplicate/ack and completion/
receipt) and their acceptance checks. Do not send a completion notice under an
unverified correspondence binding. D can still use its existing authenticated
account flow: its own session and trusted account lookup establish that route.
Preserve a separate private identity-to-job mapping for exact worker verification;
this does not mark support correspondence verified. Full P3 acceptance stays open.

## Approved scope (counts at approval)

Approve resuming the unchanged existing staging API/worker for the remaining
synthetic **account-flow** checks, with the three unused API restart slots assigned
below. All ceilings stay unchanged. Final admission/CORS disable is applied and
verified **after both processes are stopped**, without launching another API image.
This replaces the previous pause/final-resume/live-final-disable assignment.
The extra recovery start is obtained by eliminating the final live disable restart,
not by expanding a ceiling. Preserve all prior consumed counts and stopped receipts.

| Bound | Used | Remaining / proposed use |
| --- | ---: | --- |
| Supervised live time | 214m9.085174s / 240m | 1550.914826s total: first at most 650.914826s, final at most 900s |
| Same-image API starts | 9 / 12 | 10 resume D; 11 pause admission for drain; 12 final B resume |
| Worker processing invocations | 1 / 4 | One A/C/D batch and one B batch; at most one already-budgeted spare after diagnosis |
| Auth DELETE attempts | 0 / 12 | Existing bounded runner, limit 3; exact queue verification before each invocation |
| Operator reads | 35 / 45 | Ten remaining; planned check allocation below, no silent extra polling |
| OTP requests / deliveries | 11 / 12 and 10 / 11 | B returning only; no D code or resend |
| Support/test messages | 13 / 17 | No further sends in this closeout; four remain unspent and deferred |

Other counts are unchanged: four accounts, ten invitations and three web Previews
already consumed; no new issuance, signup, source build or web deployment. Preserve
$5 hosting, $15 provider, $20 combined and $0.25 AI caps. Places usage is 74/420 and
provider cost/reservations $1.5105715. No AI run is needed. If B's metadata repair
requires a fresh location resolve/details pair, reserve at most six Places HTTP
attempts/$0.147 before that normal UI operation and reconcile actual calls; stop
rather than add another pair without a separate scope decision.

## Targets and unchanged inputs

- API/worker source `2eefdc51345aeaa7951ffb343954c1669f9280c5`.
  API image `sha256:4fc94ba63d5ee76f5e9e25868a0a347db252b12d4defacfcfa30078598d4c5b8`;
  worker image `sha256:292ac97e9120612919399186ce53dbb68e650851f293c8d0a69421b2cae27797`.
  Existing Railway staging project/environment/services only.
- Deployed web `bffa2845f268ea8b1906b8de155aa130f199856e`, Preview
  `dpl_8tmFppeucwSv23uuj71qYF7mpthW`; no alias changes. D stays at
  `links.table-us.com`; B stays at its preserved immutable Preview origin.
- Last stopped API `a72eeed7-5765-46f8-b0a3-943af20d0673`, worker
  `18a8f3f8-886e-4dac-ba7e-9804bb584f75`; stop verified 22:27:42.306461Z.
  Both unscheduled; API future admission false and inline Auth deletion false.
- A/C exact pending bindings retained privately. D exists with one profile/
  redemption and zero deletion jobs at last readback. B owns the shared fixture.
  No unrelated/legacy identity or row is eligible for this campaign.

## Execution after approval

1. While stopped, bind approval to this handoff and perform one aggregate roster/
   queue preflight; privately bind B/D identities before any deletion. Verify
   images, unscheduled state, original source, current config, hosting/provider
   headroom and all remaining limits. Unexpected state stops before arming.
2. Start only when the owner is available for D's final UI click. Arm a new first
   window for at most `remaining_live_seconds - 900`, currently 650.914826 seconds.
   Verify its durable receipt before restart 10. Re-enable API admission with
   inline false using the same image; verify source, readiness and exact D/B CORS.
   No invitation validation, signup, mail send or D OTP is needed. If D's session
   cannot recover through the normal existing-session flow, stop without a resend.
3. Owner confirms D deletion in its normal Account UI. Verify profile removal,
   pending job, zero unexpected attempts and exact private identity/job binding.
   Inspect the entire queue: only approved A/C/D pending jobs, no unknown subject,
   lease or attention condition. Normal D sign-out may follow only after binding.
4. Restart 11 pauses API admission, inline stays false. Verify readiness/config
   and the supported pending-status UI where available; do not claim a server
   deletion-refusal test unless the supported UI actually sends that request.
   Run the existing worker once, unscheduled, same image/command, limit 3, with
   a pre-reserved invocation and at most three Auth attempts. Verify its aggregate
   report and each exact completed row/raw-subject removal. Stop both services,
   verify unscheduled state, and close/charge the window at the verified stop time.
   Start no batch with insufficient time for its 75-second outer bound plus the
   containment margin. A failure preserves pending jobs and ends this attempt.
5. Prepare B's final phase while stopped. Arm at most 900 seconds, within remaining
   live time; restart 12 re-enables the same API and verifies readiness/CORS.
   B first observes content cleanup, repairs fixture metadata if needed, and removes
   its sole plan with the owner's final confirmation. Then normal B sign-out and
   the one remaining returning OTP prove returning admission. Owner enters the
   code only in the existing B-origin tab. The handoff is at most five minutes and
   must leave sufficient time for deletion/worker/containment; no resend on expiry.
6. Owner confirms B account deletion. Verify the exact B pending job and whole
   queue before one existing-worker batch, limit 3. Verify exact completion for all
   four fixtures, subject clearing and no pending/attention/lease. No direct Auth
   admin delete, SQL mutation, manual queue insertion or legacy delete shortcut.
7. Stop and unschedule API/worker **first**. Using skip-deploy configuration only,
   set future API admission false, inline false and remove only B's temporary
   Preview origin from ALLOWED_ORIGINS. Preserve both staging aliases' origins.
   Read back stored values and stopped/unscheduled states, with no restart or new
   deployment. Charge time through this final verified containment receipt. A future
   deployment remains independently gated and must honor the disabled configuration.

## Read allocation, cutoff and acceptance

The ten remaining operator checks are: one stopped queue/roster preflight; three
API readiness/CORS checks; two pending-job/whole-queue checks; two worker aggregate
post-run reports; and two exact completion readbacks. Configuration/source/scheduler
and billing metadata reads remain part of their corresponding bounded preflight/
containment procedures. Any additional diagnostic read still requires remaining
headroom; never reset counts or mislabel a provider call to avoid the ceiling.

Use the existing tested cutoff with new immutable window IDs. Containment begins
120 seconds before each deadline; no extension after arming. Owner handoffs,
startup, verification and stopping count. Both services stay stopped between
phases and during any support-mail follow-up. If the first phase consumes its
whole allocation, the final 900 seconds remains untouched. Unused first-phase time
is headroom, not permission to enlarge the final phase beyond 900 seconds.

Stop on unexpected core/provider/Auth/identity failure, unrelated queue content,
insufficient time/headroom or hard ceiling. No new recovery start or resend. Keep
pending jobs, tombstones, quota counters, invitation history and legacy data. The
mail-receipt case, duplicate/completion correspondence, hosted invitation replay/
contention and unexercised server-side refusal remain explicit release gaps.
Account-flow success alone does not accept P3 or activate real-user/native/pilot work.
