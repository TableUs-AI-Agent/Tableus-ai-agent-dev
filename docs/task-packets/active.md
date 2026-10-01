# Active packet: Priority 3 web auth recovery and remaining rehearsal

## Source and authorization

Use `/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/pilot-realignment` on
`codex/pilot-staging-readiness`; the root checkout is stale. Local-fix base is
`341f0410260b33ca855ba7df0b7936409a4b262a`. API/worker remain on approved source
`2eefdc51345aeaa7951ffb343954c1669f9280c5`; deployed web is
`9593fba0202e830746523f29cee16532539e80a2` (PR #10). The new fix is approved for publishing/CI and conditional merge/deployment; it
remains unmerged and undeployed until those checks pass.

Original campaign approval at `e5e7d1` and subsequent bounded extensions remain
historical authority for their exact scope. The latest approved recovery is
`fa282f2e2d242a4a02eaafa832d06d611753339f`; its first phase has ended. The owner separately approved the new Preview/recovery restart/time increase
against handoff `b08cee4`. Prior usage is retained.

## Web signup recovery prepared; staging stopped, October 1

C's email verification succeeded at 21:00:40Z, after automatic containment had
stopped API/worker at 20:53:37.369456Z. C has one Auth account, no application
profile and no invitation redemption. Its validation expired at 21:09:34Z.
A's profile is removed and its exact Auth-deletion job remains pending, with zero
processing attempts. B's preserved session owns the shared plan. Keep both C/B
browser sessions and the private A job binding; do not resend C's consumed code.

The local web fix preserves signup progress after successful OTP verification:
confirm the same email/subject with Supabase `getUser`, retry normal API completion,
and refresh an expired validation only after checking whether signup already
committed. The UI offers **Retry and continue**, hides the consumed code field,
and provides explicit local sign-out/start-over. No token extraction, manual
profile insertion or invitation bypass is used. The existing backend still owns
recipient binding, capacity, revocation and tombstone checks.

Local readiness passes: 334 JavaScript tests, 206 Python tests with 36 PostgreSQL-only
skips, lint/types, contract generation, web/Expo-web builds and deterministic smoke.
The in-app browser, using fake localhost Auth/API only, recovered from failed
redemption plus expired validation, and again after reopening the page. Counters
remained one OTP request and one verification throughout. Mismatched email refusal
and explicit start-over also passed. Two CI browser regressions cover retry/reload. Application candidate
`8861eece0e77574bcd693550d9b2628f362dccf3` is committed locally; the owner explicitly approved publishing to the named GitHub repository,
CI, merge after checks, staging deployment and the bounded recovery. The branch
push succeeded; CI is required before merge. Production/staging are unchanged.

Charged live use is 10687.415236 seconds (178m7.415236s) out of 195 minutes.
Only 1012.584764 seconds remain, including the final 900-second reserve. The other
112.584764 seconds cannot form a usable recovery phase. No new first phase is
currently authorized. The [complete recovery proposal](../p3-session-recovery.md) requests one new
web Preview, one extra same-image API restart and 45 additional cumulative live
minutes, retaining all monetary and message limits. The owner approved this exact scope against handoff `b08cee4`; preserve all prior use.

Next: finish candidate CI/review, merge and deploy the approved web fix, then arm
the approved recovery. Keep API/worker stopped and unscheduled during preparation.

## Current cumulative allowances

| Item | Used/reserved | Approved ceiling |
| --- | ---: | ---: |
| Live minutes | 178m7.415236s | 240m, first phase at most 45m and final 15m |
| API source rollouts | 1 | 1 |
| Same-image API configuration restarts | 8 | 12; recovery/pause/final resume/final disable |
| Web Previews | 2 | 3 |
| Worker resources / processing invocations | 1 / 1 | 1 / 4 |
| Invitations / new Auth accounts | 9 / 3 | 10 / 4 |
| OTP requests / delivery reservations | 10 / 9 | 12 / 11; remaining two reserved for D and B |
| Verification submissions / refresh-revoke | 9 / 2 | 20 / 12 |
| Support/test messages | 11 | 17; six D-case messages remain |
| Operator status reads | 27 | 45 |
| Auth DELETE attempts | 0 | 12 |
| Places HTTP attempts | 72 | 420 |
| Logical AI / underlying reservations | 1 / 3 | 3 / 9 |
| Provider cost / AI cost | $1.4615715 / $0.0005715 | $15 / $0.25 |

Keep $5 hosting and $20 combined caps. Last workspace usage delta is a conservative
$1.10244608760889 above the original baseline, not exact campaign billing; recheck
headroom before a live start. Account-deletion status reads are 3, included in
operator accounting; worker status reads are 1. Private ledger is authoritative
for immutable receipts and identity bindings. Never print tokens, codes, exact
Auth subjects, deletion hashes or private inbox destinations into Git/chat.

## Completion and boundaries

Prepared local recovery covers verified-session retries, expired validation,
committed signup reconciliation and subject mismatch; [the rollout proposal](../p3-session-recovery.md)
owns targets, requested deltas, sequencing and stop conditions. After approval,
C should complete through its preserved session with no fresh OTP; only D and B
have remaining OTP slots. If C's session/invite is lost, contain and report the gap.

The remaining manual sequence is C sole-plan removal/deletion, D verified support
case and six messages, admission pause/refusal, bounded synthetic worker drain,
B shared-content cleanup/sole-plan removal and its final returning/deletion/drain.
A's already accepted deletion is not repeated. Owner performs irreversible final
confirmations in the visible UI. Inspect the entire queue before each worker batch;
use supported operations and no direct Auth-admin or SQL deletion shortcut.

Hosted redemption replay/contention and server-side deletion refusal still lack
a supported exercised path. Keep them untested; manual completion or local CI is
not full P3 acceptance. Do not start Priority 4, native builds, production, real
invitations, new AI evaluation, secret changes or resource creation.

Preserve C at `links.table-us.com` and B at its existing immutable Preview origin.
Do not navigate B to the new Preview origin and lose its session. A new recovery
uses the same API image; temporary CORS continues to allow B's existing origin.
The worker remains unscheduled. Stale consumed helper scripts cannot allocate a
new attempt. Any new window needs a fresh receipt and the explicit approval of
[the prepared recovery](../p3-session-recovery.md).
