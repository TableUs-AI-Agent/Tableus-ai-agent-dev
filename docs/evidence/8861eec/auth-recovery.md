# Web Auth completion recovery: local verification and gated handoff

Application candidate: `8861eece0e77574bcd693550d9b2628f362dccf3`.
Preparation base: `341f0410260b33ca855ba7df0b7936409a4b262a`.
Branch: `codex/pilot-staging-readiness` in the existing `pilot-realignment` worktree.
Deployed web remains `9593fba0202e830746523f29cee16532539e80a2`; API/worker remain
`2eefdc51345aeaa7951ffb343954c1669f9280c5`. No merge or deployment occurred.

## Behavior and review

OTP success can precede an application API outage. The old verify handler then
replayed the consumed code. The fix uses trusted Auth `getUser`, confirmed email
and subject binding to continue normal membership/redemption. Expired-grant
recovery first reconciles already-completed enrollment, then validates the same
bound invitation only for missing membership. Other failures do not loop or
revalidate. Subject changes are rejected before API transport; server authorization
remains authoritative. UI fields are locked during a pending attempt, consumed
OTP is cleared, retry is explicit and local sign-out allows a deliberate restart.

Reviewed the component, helper, API subject binding, backend validation/redemption
semantics, test fixtures and source/operating documentation. No new auth setting,
schema, backend contract, dependency or secret. No further actionable issue was
found in this bounded review; no independent security scan was performed.

## Verification

- Eight new helper tests and six existing related tests passed (14 focused total).
- `make ready` passed: 334 JavaScript tests; 206 Python passes and 36 PostgreSQL-only
  skips; lint/types, generated contracts, web/Expo-web builds and deterministic
  smoke. The initial attempt could not bind a localhost test port under sandbox
  restrictions; rerun with localhost permission passed. Log:
  `/private/tmp/tableus-auth-recovery-ready.log`.
- After adding two CI browser regression cases, web typecheck and lint passed.
  Those authored Playwright cases have not yet run in hosted CI. Normal readiness
  does not include them, PostgreSQL integration or real-provider evaluation.
- Actual in-app-browser test used local web at `127.0.0.1:3407` and fake Auth/API
  at `127.0.0.1:8407`, without real credentials, outbound email or providers.
  After OTP success, redemption returned 503. UI hid the consumed code and offered
  Retry and continue. The old grant was then expired; retry performed membership
  reconciliation and normal revalidation/redemption, reaching Dinner plans.
  Counters: OTP 1, verify 1, validation 2, redemption 3. Reopening the page with
  an existing verified session and missing membership completed again; cumulative
  OTP/verify stayed 1/1, validation 3, redemption 4. Mismatched email refused and
  explicit local sign-out reset the form. Both localhost servers and test tab
  were closed afterward; staged C/B sessions were preserved.
- Screenshots: `/private/tmp/tableus-auth-recovery-retry.png` and
  `/private/tmp/tableus-auth-recovery-plans.png`. Only synthetic local values appear.
- `git diff --check` passed. Generated API contracts have no drift.

## Gate and remaining risk

Automatic approval review rejected the GitHub push because permission to export
committed code and operational notes to the repository was not established.
Nothing was pushed, no PR was created and no hosted candidate CI ran. Do not use an
alternate upload path to bypass that block. The complete approval request names
`https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev` explicitly and includes
publishing, candidate CI/review, conditional merge/deployment and bounded rehearsal.

The fix is locally verified, not hosted acceptance. C is Auth-verified but still
unredeemed, A Auth deletion remains queued, B is preserved, D is not created.
If C's session or original invitation is no longer usable, there is no spare C
OTP: contain and report the gap. Hosted replay/contention and server-side deletion
refusal remain untested. Native acceptance, production and real invitations remain
deferred. No automatic extension/retry or new monetary ceiling is proposed.

Next: owner approval of the [complete exact scope](../../p3-session-recovery.md),
then publish candidate/notes, run candidate CI, review and merge only on success,
deploy one staging Preview, and start the supervised sequence when the owner is
available. Keep API/worker stopped until the approved, armed recovery window.
