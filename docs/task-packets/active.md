# Active packet: Priority 3 approved staging campaign

## Source and authorization

Use `/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/pilot-realignment`
on `codex/pilot-staging-readiness`. The root checkout/local main are stale.
Preparation base: `810d410d32e7dd4ab29dc98a83ae733a304c10b3`, above Priority 2
merge `462a7dd6b3428d21a8fbccfe20a0003361904761`.

Brian approved the complete [prepared campaign](../pilot-staging-preparation.md)
on September 27 against application candidate
`e5e7d13478aaea6f526f2de9e6978824a30c79c3`. Approval remains valid; do not ask
for it again. The exact limits and stop conditions remain binding. Subsequent
documentation does not change application inputs or replenish allowances.

[PR #9](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/9) merged as
`2eefdc51345aeaa7951ffb343954c1669f9280c5`. Its full tree is identical to hosted
CI head `d2ccc7e32015b8982b64035382d7a3ab03b64acf`. Hosted CI passed 242 Python
tests, 326 JavaScript tests and five browser journeys, zero skips, plus lint/types,
migrations, deterministic evaluation, contracts, builds and smoke. Local readiness,
restricted PostgreSQL and browser evidence remain applicable to unchanged inputs.

## Current checkpoint, September 28 Central / September 29 UTC

Preflight is complete: actual Supabase Auth/SMTP/hook/schema/backup settings and
TableUs Sentry/PostHog plan/retention. Private logical backup/restore limitations
are in the [execution record](../evidence/e5e7d13/execution.md). A fresh private
backup was taken with the API stopped before migration. No stored credential was
manually extracted; the earlier Keychain-wrapper decoding denial remains binding.

All four migrations passed, using the separate normal CLI migration login and
verified TLS, ending at `9a1f2e7c4b80`. Private schema, browser denial, runtime
grants and invoker/Auth-admin hook grants were verified. Legacy counts remain
six profiles, seven Auth users, sixteen plans and eleven runs; sixteen plan credits
were backfilled. Legacy unknown provenance was preserved.

- API deployment `217e257f-9fbe-40fb-adec-ce231ff54c28` passed readiness with exact
  merged source, one process, deletion admission/inline attempts off and telemetry
  test hooks off. It is **stopped again for the natural-expiry wait**.
- Web Preview `dpl_7j4HwYgzPw4139i3W535V5iUFqrv` is READY from the same Git archive.
  Only `tableus-staging.vercel.app` and `links.table-us.com` moved to it. Public
  deletion/privacy/terms content passed checks. Both production aliases retain
  `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK`.
- Private worker service `cac758a2-077c-4011-bff5-12b52db2d05a`, deployment
  `18a8f3f8-886e-4dac-ba7e-9804bb584f75`, ran once with `processed=0`, healthy empty
  status and then exited. **No cron schedule or next run; restart NEVER.** New
  Railway services reject TOML configuration; normal service controls hold the
  identical reviewed Dockerfile/command/replica settings. No new app source.
- Existing server-only removal credential was privately provisioned to API/worker.
  Worker uses restricted runtime DB, deterministic providers and telemetry off;
  no Maps/Gemini/migration credentials or public domain.
- One D recipient-bound, one-use invitation was issued only to become the expiry
  fixture. Its code is private, with **real expiry `2026-09-30T02:48:54.780853Z`**:
  **September 29 at 9:48:55 p.m. America/Chicago**. No timestamp editing or early
  validation. No OTP email, new Auth account or live provider request was made.

## Resume in order

1. Wait until the fixture actually expires and Brian can operate the controlled
   mailbox. Do not sleep a day inside a tool. No automatic follow-up was scheduled.
2. Re-read this record and the private fixture/allowance ledger; verify exact source,
   aliases, role, queue, grant state and no unexpected activity. Use fresh isolated
   synthetic browser sessions: the ordinary staging browser has a pre-existing
   legacy session and must not be used as a test identity or cleared as cleanup.
3. Reconcile fresh rolling provider usage. API currently has Places ceiling 726
   (306 at configuration time + 420); old activity is aging out. During the first
   already-budgeted admission restart, tighten to fresh baseline + remaining
   campaign allowance. Independent campaign limit stays 420; no reset/increase.
4. Resume the **same API image**, enable queue-only deletion under the first of
   four approved configuration restarts, and verify worker/client readiness.
   Railway exposes `deploymentRedeploy(id, usePreviousImageTag: true)`; verify its
   resulting image digest and effective variables before any live request. No
   further API/web source build is authorized. Keep worker schedule held until
   actual A/C/D pending requests and private support binding have been verified.
5. Run the approved 60-minute four-account/six-invite Auth, two-person/two-round
   journey, blocker, pending/retry, support, pause/drain and final-B deletion cases.
   Schedule only the remaining bounded worker invocations, then remove scheduling
   before a fifth total invocation. Verify individual completion, not just totals.
6. End with API deletion admission and worker schedule off; preserve all tombstones,
   counters, invitation history and legacy data. Record evidence and remaining gaps.

Private fixture record:
`/Users/brianchei/Library/Application Support/TableUs/Rehearsals/2026-09-28-p3/d-expired-invite.json`.
Brian's four test addresses are `brian+tableus-p3-{a,b,c,d}@table-us.com`.
General support: `brian@table-us.com`; privacy/deletion: `privacy@table-us.com`,
which forwards to Brian. Alias delivery and the controlled support exchange still
need actual evidence; never request credentials in chat.

## Remaining bounds

Consumed: one API rollout, one web Preview/two staging alias assignments, one
private worker resource/deployment, four migrations, one of six invites and one
of four worker processing invocations. API configuration restarts: zero of four.
Auth DELETE attempts: zero of twelve. Accounts/OTP/verification/support/live
providers: zero. No 60-minute live window has started. All other ceilings in the
prepared campaign apply, including $15 providers, $5 hosting, $0.25 AI, three
logical/nine underlying AI attempts, eleven OTP requests/ten deliveries/twenty
verification submissions, fourteen support messages, twelve refresh/revoke calls
and thirty status reads. Empty `--status` reads do not process work.

No automatic retry after a rollout/core/Auth/budget/identity error, no additional
allowance, no production/native build, real invitation, secret rotation or legacy
cleanup. Preserve additive migrations; do not restore the old unmetered API.
Priority 3 acceptance remains open; Priority 4 physical-device/native acceptance
and real-pilot intake remain later, separately scoped work.
