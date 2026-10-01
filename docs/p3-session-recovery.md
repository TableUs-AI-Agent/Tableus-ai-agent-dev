# P3 authenticated-session recovery proposal

Prepared October 1, 2026 from `9d691d127c6080c5fa7dd3e406196884965bea8b`.
**Approved by the owner at `fa282f2e2d242a4a02eaafa832d06d611753339f`.**
Recovery restart 8/11 passed readiness and A returning application sign-in. The
active packet records the live deadline, A's verified pending deletion and C's
owner code-entry handoff.

## Confirmed cause

A's replacement code succeeded at `2026-10-01T20:26:14.298559Z` (3:26 p.m.
Chicago). A read-only aggregate returned one matching Auth user, one new session,
one existing profile and one existing invitation redemption. The browser reports
“Network unavailable. Reconnect and try again.” The returning flow verifies the
code before calling `/api/v1/me`; the API is stopped. Authentication passed, while
application membership/sign-in completion remains unverified. The consumed code
field was cleared without signing out or reading/storing the code. Preserve this
session and do not send A another code.

At 20:29:56Z, Railway confirmed API deployment
`db65606d-45eb-43b4-89df-3b8b9790369a` and worker deployment
`18a8f3f8-886e-4dac-ba7e-9804bb584f75` both stopped and unscheduled. The images match
the approved API/worker source `2eefdc51345aeaa7951ffb343954c1669f9280c5`:

- API: `sha256:4fc94ba63d5ee76f5e9e25868a0a347db252b12d4defacfcfa30078598d4c5b8`.
- Worker: `sha256:292ac97e9120612919399186ce53dbb68e650851f293c8d0a69421b2cae27797`.

Saved configuration matches the stopped state: deletion admission and inline
attempts false, existing three CORS origins retained, Places ceiling unchanged.
Vercel CLI resolves `links.table-us.com` to approved READY deployment
`dpl_99cFtsd56wHCam5dN1EwW5XmTred`, web source
`9593fba0202e830746523f29cee16532539e80a2`. No new build is needed.

Read-only database preflight returns nine Auth users, eight profiles, one B profile,
no C/D Auth users, no deletion jobs, no active invite validations and no provider
usage rows since verified stop. Delayed Railway workspace usage is
$4.656169764899754, or $1.10244608760889 above the original baseline. This is a
conservative workspace delta, not exact campaign cost, and stays below $5.

## Exact requested delta

| Allowance | Used/reserved | Current ceiling | Proposed ceiling | Purpose |
| --- | ---: | ---: | ---: | --- |
| Same-image API restarts | 7 | 10 | 11 | One recovery resume; preserve pause/final resume/final disable |
| OTP requests | 9 | 11 | 12 | Restore the three remaining C/D/B requests after A replacement |
| OTP delivery reservations | 8 | 10 | 11 | Corresponding C/D/B email delivery reservations |

No other limit changes. Keep 195 cumulative supervised minutes, $5 hosting,
$15 providers, $20 combined and $0.25 AI. Preserve invitations 10 (8 used), accounts
4 (2 used), verification submissions 20 (8 reserved), refresh/revoke 12 (1 used),
status reads 45 (23 used), support mail 17 (11 used), worker invocations 4 (1 used),
Auth DELETE attempts 12 (0 used), Places HTTP attempts 420 (72 observed), logical
AI 3 (1 used) and underlying AI attempts 9 (3 conservatively reserved).

Cumulative charged time is 9869.996196 seconds, including the full prepaid
ten-minute replacement-code handoff. Keep that conservative charge. Remaining
1830.003804 seconds split into **930.003804 seconds (15m30.003804s) for the first
phase** and **900 seconds for the final phase**. The existing cutoff accepts both
allocations in a local, provider-free check. No window was armed. The two-minute
containment margin applies inside each allocation; do not extend a running deadline.
If time runs out, contain services and report incomplete cases without spending
another recovery or OTP allowance.

## Execution after approval

1. Record approval of this exact proposal and only the three ceiling changes.
   Preserve all prior usage, receipts and the final 900-second reserve. Recheck
   source/image, stopped services, queue and remaining headroom before arming.
2. Arm a fresh first-phase window and verify the durable cutoff receipt before
   consuming recovery restart 8/11. Resume the existing API image, enable deletion
   admission, retain inline attempts false and the approved temporary Preview
   origin. Keep the worker stopped and unscheduled. Verify readiness/source/CORS.
3. Reuse A's authenticated browser context. Navigate normally to Plans/Account;
   verify A's unchanged identity and membership without resubmitting the code.
   Preserve the original expired handoff and replacement evidence. Recover B's
   missing Preview tab normally; its stored session has not been inspected or
   assumed lost. Stop on unexpected identity/auth errors.
4. Continue only the already-approved remaining manual cases in
   [the existing scope](p3-mail-routing-and-remaining-cases.md#manual-sequence-after-complete-approval-and-prerequisites):
   A pending deletion; C fresh signup/sole-plan cleanup/deletion; D fresh signup,
   verified support binding and six case messages; admission pause/refusal,
   bounded synthetic worker drain and B cleanup. Owner performs final destructive
   confirmations in the visible UI. C/D invitations stay recipient-bound. Use
   only supported application operations; inspect the whole queue before any
   worker batch. No manual queue insertion or direct Auth-admin deletion.
5. Retain restart 9/11 for admission pause, 10/11 for final resume and 11/11 for
   final disable/removal of only temporary Preview CORS. Final phase remains
   capped at 15 minutes for B returning/deletion/drain and containment. Both
   services finish stopped and unscheduled. No spare resend or recovery exists.

The short remaining window may leave cases incomplete; approval is not acceptance.
No new source/image, web deployment, schema, secret, resource, production work,
native distribution or real-user invitation is included. Hosted replay/contention
and server-side deletion refusal remain unproven until exercised through an approved
supported path. A fresh Auth session alone does not close those gaps.

Next: owner verifies C's single code before 20:53:29Z. A's application deletion
and exact pending job are verified; Auth removal remains queued. Preserve all
counters and continue the already-approved sequence only before the cutoff.
