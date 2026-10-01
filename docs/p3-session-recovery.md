# P3 web signup recovery: approved merge, deployment and rehearsal

Prepared October 1, 2026 from local base
`341f0410260b33ca855ba7df0b7936409a4b262a`. **Approved by the owner in chat against handoff `b08cee4e7b8dfd952fc75fa7823d38494d78d4e2`.** This replaces the
completed first phase approved at `fa282f2`; it retains all its consumed allowances.
Application candidate: `8861eece0e77574bcd693550d9b2628f362dccf3`. Bind any
merge/Preview to its unchanged application tree after hosted CI and review pass.
Later documentation-only handoff commits do not alter this application identity.

## Cause and prepared repair

C's OTP verification succeeded at 21:00:40Z, after the durable cutoff verified
API/worker stopped at 20:53:37.369456Z. One trusted Auth record exists, but C has
no app profile/redemption. Its short-lived validation expired at 21:09:34Z.
The old page retries the consumed OTP before completing the application request.

The new page confirms the existing Auth user server-side and requires the same
confirmed email/subject. It retries normal `/api/v1` signup completion without
another code. An invalid/expired grant first checks membership for a previously
committed signup; only missing membership permits normal validation of the
original recipient-bound invitation and redemption. Network errors and other
refusals do not trigger revalidation. Mismatched identity requires explicit local
sign-out. No auth setting, database schema, API code, secret or provider changes.

Local `make ready` passes 334 JavaScript and 206 Python tests (36 PostgreSQL-only
skips), lint/types, contracts, web/Expo-web builds and deterministic smoke. Eight
new semantic tests cover retry, identity binding, grant expiry, committed response
loss and refusals. Local in-app-browser verification used only fake localhost
Auth/API: first redemption failed, old grant expired, retry reached Dinner plans;
reopening with the verified session also completed. Both used exactly one OTP
request and one verification. Wrong-email refusal and explicit start-over passed.
Two CI browser cases reproduce retry/reload; hosted CI with PostgreSQL/browser
checks must pass on the candidate before an approved merge/deployment.
Local screenshots: `/private/tmp/tableus-auth-recovery-retry.png` and
`/private/tmp/tableus-auth-recovery-plans.png`. Readiness log:
`/private/tmp/tableus-auth-recovery-ready.log`.

## Exact approval requested

Approve publishing the candidate and committed rehearsal documentation to
`https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev` on existing branch
`codex/pilot-staging-readiness`, creating a review PR and running deterministic CI.
After CI/review pass, approve its merge, one staging web Preview from the identical
tested application tree, assignment of the two existing staging aliases, and the
bounded remaining rehearsal below. Production remains excluded. The push was
blocked by automatic approval review because authorization to export this source
and operational documentation to that remote was not established. The owner subsequently explicitly approved that destination and scope. Publishing,
CI (242 Python/334 JavaScript/13 browser checks), PR #11 merge `bffa284` and the
single approved Preview are complete. See the active packet for live execution. No private ledger, inbox
destination, token, Auth subject, deletion binding or credential is in the change.

| Allowance | Used | Approved ceiling | Proposed ceiling | Purpose |
| --- | ---: | ---: | ---: | --- |
| Web Previews | 2 | 2 | 3 | Deploy the signup-recovery fix once |
| Same-image API restarts | 8 | 11 | 12 | One recovery resume; preserve pause/final resume/final disable |
| Cumulative supervised live minutes | 178m7.415236s | 195m | 240m | Add 45m; allocate first phase at most 45m and final phase at most 15m |

No other allowance increase. OTP requests stay 12 (10 used), deliveries 11
(9 reserved), verification submissions 20 (9 reserved), refresh/revoke 12 (2 used),
invitations 10 (9 used), accounts 4 (3 used), support messages 17 (11 used), status
reads 45 (27 used), worker invocations 4 (1 used), Auth DELETE attempts 12 (0 used),
Places 420 (72 used), logical AI 3 (1 used) and underlying AI 9 (3 reserved).
Keep $5 hosting, $15 providers, $20 combined and $0.25 AI ceilings. No additional
recommendation run is needed for recovery. Existing remaining C/D/B cases retain
their original permissions and specific limits; approval is not a counter reset.

At the proposed ceiling, remaining time is 3712.584764 seconds (61m52.584764s).
Allocate at most 2700 seconds to phase one and preserve 900 for the final phase;
112.584764 seconds remains unallocated. Startup, owner code entry, verification
and containment count inside each phase. Trigger containment two minutes before
each immutable deadline. Each unresolved OTP handoff is at most ten minutes or
the earlier containment threshold. Stopped preparation/breaks do not consume live
time; never extend an armed window. No spare recovery or resend is included.

## Targets and preflight

- Web: existing Vercel project `tableus-staging` (`prj_lPu3pWZiJ5ZRUIab6wiXrJIW930G`),
  team `team_0Pu6vuMiug12C8K2HQqbgOQG`. Create one Preview and, after READY/source
  verification, assign `links.table-us.com` and `tableus-staging.vercel.app`.
  Preserve production deployment `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK` and old
  Preview `dpl_99cFtsd56wHCam5dN1EwW5XmTred`; no cleanup or production alias changes.
- API/worker: existing Railway staging project/environment, source
  `2eefdc51345aeaa7951ffb343954c1669f9280c5`. API image
  `sha256:4fc94ba63d5ee76f5e9e25868a0a347db252b12d4defacfcfa30078598d4c5b8`;
  worker image `sha256:292ac97e9120612919399186ce53dbb68e650851f293c8d0a69421b2cae27797`.
  API `5f5dad51-01a6-4690-bd0f-294aebb5f247` and worker
  `18a8f3f8-886e-4dac-ba7e-9804bb584f75` were last verified stopped/unscheduled.
- Keep the current three CORS origins, including B's existing unique Preview
  origin; C uses the stable links origin, so a new Preview-origin allowlist entry
  is unnecessary. Do not move B or sign it out early. Inline Auth DELETE remains
  false; worker is unscheduled and held until a verified synthetic batch.
- Before starting, reconcile source/images, aliases, complete pending queue,
  trusted A/B/C/D roster, costs and remaining counts with the private ledger.
  A's existing pending job is expected; it is not a reason to require an empty
  queue. No unknown or legacy subject may enter a worker batch. Verify the cutoff
  is armed and receipt durable before API resume. Old consumed helpers cannot
  authorize this new proposal or silently change limits.

## Execution after approval

1. Bind approval to the exact candidate. Finish CI/review, merge only the tested
   application tree, create the single Preview and verify source/READY before
   moving the staging aliases. Record all identifiers; a deployment failure
   stops the rollout. Keep API/worker stopped during web preparation.
2. Record only the three ceiling changes above, arm the first phase (at most
   45 minutes), then consume restart 9/12 to resume the existing API image with
   deletion admission true and inline attempts false. Verify readiness and C/B
   exact-origin CORS. A remains queued; worker stays stopped.
3. Reload C's stable-origin tab to load the fix, refill the original invite/name/
   email from private fixtures, and continue with its preserved session. Verify
   its exact profile/redemption before proceeding. Do not resend or re-enter C's
   consumed code. If session/invitation recovery fails, contain; no fallback OTP
   is allocated to C. Create/remove C's sole plan and complete its supported
   pending deletion, then sign out only C.
4. Use the same origin for D's last recipient-bound invite and one normal signup
   OTP. Owner enters the code directly. Establish the trusted support binding
   before losing D's session. Exercise the six remaining challenge/reply,
   duplicate/acknowledgment and completion/receipt messages through the existing
   support procedure. Complete D's pending deletion using supported operations;
   owner performs irreversible final UI confirmations.
5. Consume restart 10/12 for admission pause, exercise the supported refusal/
   status path and inspect the whole queue. Invoke only the existing worker with
   bounded batches (`--limit 3`), within four cumulative processing invocations
   and twelve Auth DELETE attempts. Confirm exact jobs completed and subjects
   cleared; counts alone are insufficient. No manual queue insertion/direct
   admin deletion. Verify B's content cleanup and sole-plan removal, then stop
   both services between phases and close the first-phase receipt.
6. Arm final phase (at most 15 minutes); restart 11/12 re-enables the same API.
   Use B's remaining returning OTP, self-service deletion and bounded drain.
   Restart 12/12 disables admission and removes only the temporary B Preview
   CORS origin. Preserve the other approved origins and finish API/worker stopped,
   unscheduled, with exact final job/accounting receipts.

Stop on first unexpected core/provider/auth/identity error, insufficient remaining
time/headroom, unrelated queue entry or hard ceiling. Contain and report incomplete
work; do not invent another recovery or resend. Preserve all earlier failed/
expired evidence, additive migrations, tombstones, invitation history and legacy
records. No cloud resources, secrets, migrations, native distribution, real-user
invitations, new paid AI evaluation, production change or destructive infrastructure
cleanup is included. Hosted replay/contention and server-side deletion refusal
remain untested until separately exercised by a supported approved path. Completing
these manual cases is not full P3 acceptance or permission for the pilot.
