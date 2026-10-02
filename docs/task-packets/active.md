# Active packet: Priority 3 web auth recovery and remaining rehearsal

## Source and authorization

Use `/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/pilot-realignment` on
`codex/pilot-staging-readiness`; the root checkout is stale. Local-fix base is
`341f0410260b33ca855ba7df0b7936409a4b262a`. API/worker remain on approved source
`2eefdc51345aeaa7951ffb343954c1669f9280c5`; deployed web is
`bffa2845f268ea8b1906b8de155aa130f199856e` (PR #11). CI/review, approved merge
and the single additional staging Preview are complete.

Original campaign approval at `e5e7d1` and subsequent bounded extensions remain
historical authority for their exact scope. The latest approved recovery is
`fa282f2e2d242a4a02eaafa832d06d611753339f`; its first phase has ended. The owner separately approved the new Preview/recovery restart/time increase
against handoff `b08cee4`. The latest account-flow closeout at `f518c1b` is now approved; all prior usage is retained.

## Closeout window stopped; Account page unavailable, October 2

The Account page cannot load its API-backed data while the staging API is stopped.
The automatic cutoff verified API and worker stopped and unscheduled at
**2026-10-01 23:52:18.364374Z** (6:52:18 p.m. Chicago). Current service/config
readback at **2026-10-02 05:18:41Z** confirms both remain stopped and unscheduled,
on the unchanged approved images. Future API deletion admission and inline Auth
attempts are disabled. No service was restarted to diagnose this loading report.

The owner approved the account-flow closeout at
`f518c1bcc5eadf7f676c014dc22ffde8f9d1fefc`. Restart 10/12 passed readiness and both
D/B CORS checks at 23:44:10Z October 1; D's existing session recovered normally
without a new OTP. On October 2 the owner confirmed the final deletion button
was not clicked. D deletion remains to be performed and verified;
last trusted roster/queue readback at 23:35:29Z had A/C pending with zero attempts
and intact B/D profiles and Auth records. No new database read or worker invocation
was performed for the loading diagnosis. B's prior tab had closed and D's old tab was unresponsive. Fresh responsive tabs
were opened on their original origins; normal session recovery is still unverified.
Two possible initialization refreshes are conservatively reserved, making 6/12
refresh/revoke uses or reservations. No OTP was requested.

First closeout window `fb428981-5783-41d5-9b15-32fde9267a33` ran from
23:43:16.900721Z through verified containment at 23:52:18.364374Z. Its immutable
23:54:07.815547Z deadline was preserved. Exact charge: **541.463653 seconds**;
cumulative **223m10.548827s / 240m**; remaining **1009.451173 seconds**. The final
900-second reserve remains untouched, leaving only 109.451173 seconds outside it,
which cannot fit the prior first-phase work and containment margin. No automatic
recovery start or extension is authorized by the stop. Restart slots 11/12 remain
allocated to pause/drain and final B resume; do not repurpose them silently.

Next: approve the prepared [final account resume](../p3-final-account-resume.md). It proposes two
15-minute windows, cumulative time ceiling 255 minutes and status reads 50, with
unchanged financial limits and API restart ceiling. Both services remain stopped. The previous sequence's active D handoff has expired; do not instruct the
owner to delete or request a fresh code against a stopped API. The existing private
ledger, trusted identity bindings and cutoff receipt remain authoritative.

Web remains PR #11 merge `bffa2845f268ea8b1906b8de155aa130f199856e`, READY Preview
`dpl_8tmFppeucwSv23uuj71qYF7mpthW` on the two staging aliases. Production aliases
remain unchanged. Hosted CI at the same merge tree passed 242 Python, 334 JavaScript
and 13 browser checks, zero skips. No application source or deployment changed
for this diagnosis. Latest hosting usage upper bound is $1.2498076379774683;
operator reads remain 37/45, support messages 13/17, Auth DELETE attempts 0/12.

D's support case remains `verification_required`: the owner saw no forwarded copy
in Inbox or Spam despite Gmail SMTP acceptance in ImprovMX at 22:24:27Z October 1.
The earlier three external route probes remain passing. The four remaining support
messages and their acceptance checks remain deferred. Final B cleanup, returning
sign-in/deletion, worker completion, hosted replay/contention and server-side
refusal checks remain incomplete. Full P3 acceptance stays open. See [account-flow closeout](../p3-post-mail-closeout.md)
for the prior approved scope and unchanged limits.

## Current cumulative allowances

| Item | Used/reserved | Approved ceiling |
| --- | ---: | ---: |
| Live minutes | 223m10.548827s, all windows closed | 240m; 1009.451173s remain, including reserved final 900s |
| API source rollouts | 1 | 1 |
| Same-image API configuration restarts | 10 | 12; remaining pause/final B resume; final disable after stop without redeploy |
| Web Previews | 3 | 3 |
| Worker resources / processing invocations | 1 / 1 | 1 / 4 |
| Invitations / new Auth accounts | 10 / 4 | 10 / 4 |
| OTP requests / delivery reservations | 11 / 10 | 12 / 11; only B returning remains |
| Verification submissions / refresh-revoke | 10 / 6 | 20 / 12 |
| Support/test messages | 13 reserved | 17; four remaining messages deferred |
| Operator status reads | 37 | 45 |
| Auth DELETE attempts | 0 | 12 |
| Places HTTP attempts | 74 (72 prior + 2 C fixture actual) | 420 |
| Logical AI / underlying reservations | 1 / 3 | 3 / 9 |
| Provider cost / AI cost | $1.5105715 reserved / $0.0005715 | $15 / $0.25 |

Keep $5 hosting and $20 combined caps. Last workspace usage delta is a conservative
$1.2498076379774683 above the original baseline, not exact campaign billing; recheck
headroom before a live start. Account-deletion status reads are 10, included in
operator accounting; worker status reads are 1. Private ledger is authoritative
for immutable receipts and identity bindings. The latest email diagnostic used
one read to verify the exact privacy-route delivery log. Never print tokens, codes, exact
Auth subjects, deletion hashes or private inbox destinations into Git/chat.

## Completion and boundaries

Prepared local recovery covers verified-session retries, expired validation,
committed signup reconciliation and subject mismatch; [the rollout proposal](../p3-session-recovery.md)
owns targets, requested deltas, sequencing and stop conditions. After approval,
C completed through its preserved session with no fresh OTP; D's single signup
code has been requested and only B's returning code remains unspent.

The owner-approved closeout separated account flow from support correspondence.
Its D handoff window has now closed before final-click/worker verification. Four
support messages remain deferred. D deletion was not clicked. The prepared final account resume requires approval
before changing time/read ceilings or assigning starts 11/12 to D/B recovery.
A's already accepted deletion is not repeated. Owner performs irreversible final
confirmations in the visible UI. Inspect the entire queue before each worker batch;
use supported operations and no direct Auth-admin or SQL deletion shortcut.

Hosted redemption replay/contention and server-side deletion refusal still lack
a supported exercised path. Keep them untested; manual completion or local CI is
not full P3 acceptance. Do not start Priority 4, native builds, production, real
invitations, new AI evaluation, secret changes or resource creation.

Preserve D at `links.table-us.com` and B at its existing immutable Preview origin.
Do not navigate B to the new Preview origin and lose its session. A new recovery
uses the same API image; temporary CORS continues to allow B's existing origin.
The worker remains unscheduled. Stale consumed helper scripts cannot allocate a
new attempt. Any new window needs a fresh receipt and the explicit approval of
[the prepared final resume](../p3-final-account-resume.md).
