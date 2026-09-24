# Account lifecycle clients — local completion

Application commit: `98f082088fe76c2768178302e8b7dca6beec29ef`

Branch: `codex/account-lifecycle-clients`

Worktree: `/Users/brianchei/.codex/worktrees/account-lifecycle-clients/Tableus-ai-agent-dev`

Exact base: `6ed12793253a285b0890d6358ab5f60c551b3615` ([backend handoff](2026-09-24-account-lifecycle-backend.md)).

Brian owns this stage of development. Historical two-developer work remains
shared; this implementation does not reassign authorship of the existing app.

## Completed behavior

Web/mobile account screens resolve organized plans through confirmed transfer
to an existing participant or exact DELETE confirmation for a sole plan. They
request full account deletion only when available, preserve data export and
local sign-out, and show pending/completed/support-attention or unconfirmed
recovery after the profile disappears. Other product routes stay gated during
recovery. No silent application-only fallback, queued write or polling was added.

Account metadata reads and transfer responses no longer hydrate restaurants or
call Places. The new transfer response is minimal management metadata; this
revises the inherited, undeployed endpoint, not existing deployed plan contracts.
The backend must accompany or precede the client release.

Sensitive client requests retain the initiating subject through credential lookup
and 401 refresh replay. Reads reconcile ambiguous outcomes; explicit retries
keep their original target, payload and key. Subject changes and late responses
cannot restore the prior account's private state. Mobile refresh is excluded
while a deletion is committing; web recovery controls share in-flight state.

## Observed verification

- One final passing `make ready`: **314 JavaScript / 121 Python**, four
  PostgreSQL-only skips; lint/types, OpenAPI generation, Next production build,
  Expo **web** export, deterministic smoke and report-only web byte baseline.
  Initial readiness stopped on two obsolete legacy source assertions; coverage
  was updated and the complete rerun passed. No native build was run.
- Three mocked Chrome management checks: confirmed transfer, sole-plan removal,
  feature unavailable, and lost deletion response with durable-status recovery.
- Four Auth-mode Chrome checks using local mocks: cold profile403 recovery,
  ordinary unapproved403, truthful status after local sign-out, and a same-page
  account switch while a prior-account status response is delayed. Root's final
  run waits for that old response to finish before checking the new account.
- Shared-client checks cover missing/changed/malformed credentials, same-subject
  refresh, exact retry payload/key, conflicting demo identity, and portable
  UTF-8 claim decoding. Backend checks prove organizer privacy and zero Places
  calls for management/transfer. Mobile rendered tests cover confirmations,
  offline writes, exact retry, recovery and the refresh/write race.
- Generated contract drift and staged whitespace checks pass. After readiness,
  only the browser race assertion was strengthened; its suite and frontend
  typecheck/focused lint passed on final files. Application bytes were unchanged.

[Verification manifest](../evidence/account-lifecycle-clients-2026-09-24/verification.json)
binds changed application/test/contract files and accepted private artifacts to
this application commit. [Evidence notes and release matrix](../evidence/account-lifecycle-clients-2026-09-24/README.md)
retain limits. Private artifacts: `/Users/brianchei/.codex/artifacts/tableus/account-lifecycle-clients-2026-09-24`.
Root inspected the final overview, plan confirmation and pending recovery images.
An earlier incomplete browser paint image is superseded and retained separately.

Commands for the standalone browser checks, from the worktree root:

```sh
node_modules/.bin/playwright test -c frontend/app/lib/account-lifecycle.playwright.config.ts
node_modules/.bin/playwright test -c frontend/app/lib/account-lifecycle-hosted.playwright.config.ts
```

They use separate localhost ports and installed Chrome. Test servers are stopped.
Auth-mode configuration here is SDK behavior against local mocks, not a real
Supabase deletion or hosted acceptance result.

## Remaining gates and next bounded objective

Keep full deletion disabled. PostgreSQL lock/race and migration/runtime-role
checks remain unverified locally. A server-only credential, deployed monitored
recovery runner, retention/support policy and affected release acceptance are
required before activation. A session that expires before completion cannot
query status publicly; the durable worker and support procedure must finish it.
No broad backup/log purge duration is promised. Shared plan contributions remain.

**Next recommended objective: PostgreSQL lifecycle verification and recovery-worker
readiness.** Use an isolated local test database to establish deletion/redeem and
transfer concurrency plus grants/migrations; prepare exact worker scheduling,
pending-age/attention monitoring, rollback and support procedures. Exit with
passing PostgreSQL evidence and one concrete reviewable activation proposal.
Do not provision secrets, cloud resources or deploy while preparing it.
This can proceed alongside native validation.

Native validation stays in `Prepare native replacement validation`, task
`01a0c678-55c8-7cc0-a3cb-e3200776906a`, application
`8972865893a3f018a064594457dc9cc664f8a61f`. A compact read during this work found
that task active; no later acceptance is inferred. Its candidate, worktree,
budgets, failed evidence and stop conditions were untouched. September30's
dependency boundary remains unextended. No canceled security scan was restarted.

No merge/push, deployment, hosted migration, secrets/resources, live/paid calls,
native/device operations, store submission, cohort activation or shared Notion
edit occurred. Merge and external activation still require their existing gates.
