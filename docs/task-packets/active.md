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

## Current checkpoint, September 29 at 04:08 UTC

The owner could not find the external tool-created rehearsal window. A's signup
was not manually verified before its 20-minute invite reservation expired. Do not
submit that old form. External browser use is not required; the signed-out in-app
links-origin tab now contains A's filled, unsubmitted invitation form. No new OTP
was requested, and the legacy in-app staging session is untouched.

Session one ended early at `2026-09-29T04:08:34Z`: **40 minutes 11.955 seconds
used; 19 minutes 48.045 seconds remain** of the original 60. Future API admission
is disabled via `--skip-deploys`. API `76028185-7799-46ff-a361-e8571cb00867` and
worker `18a8f3f8-886e-4dac-ba7e-9804bb584f75` are verified stopped, each with null
cron/next run. The stop was asynchronous; the initial immediate check was false
and a subsequent read confirmed completion. No source deployment, configuration
restart, additional email, provider call or Auth deletion occurred. The existing
cutoff disarms on the recorded session end; check the private receipt.

**Next: confirm the owner can see the filled in-app A form, then reconcile the
expired reservation and all unfinished cases against remaining bounds before
any further OTP or API restart.** The original two-session sequence is incomplete;
do not claim signup, group or deletion acceptance. Keep all cumulative allowances.

## Historical live checkpoint, September 29 at 03:44 UTC

Brian confirmed all eight marked support messages arrived: four privacy requests
and four A/B/C/D responses. His initial missing-mail report was resolved with
“none are missing”; no resend occurred. All four aliases/privacy forwarding pass.
Session one began `2026-09-29T03:28:22.044973Z`; its hard deadline is
`2026-09-29T04:13:22.044973Z` (September 28, 11:13:22 p.m. Central).

API configuration restart **1/4** is SUCCESS: deployment
`76028185-7799-46ff-a361-e8571cb00867` reuses the exact approved image/source,
passes readiness, enables queue-only deletion and tightens Places to 690 (fresh
baseline 270 + original 420 allowance). Worker remains stopped/unscheduled.
Expected no-reservation D signup returned hook 403, and wrong-recipient/revoked
validation returned 404 before OTP. All six invites are issued; natural expiry
is untouched. Eight support messages, two OTP requests, one new Auth account and
one worker invocation are spent. One OTP delivery/verification is conservatively
reserved. No new profile, group/provider action or deletion has occurred.

**Next: Brian enters A's newest emailed code in the prepared staging tab and
clicks Verify and continue once.** Do not ask for the code in chat or send B/C/D
codes until A succeeds. At 03:44 UTC totals are eight Auth users/six profiles,
fourteen invites, one reservation, empty queue and zero new provider usage.
Keep separate A/B browser origins; C/D may use the isolated in-app links origin
sequentially via supported synthetic sign-out. Preserve all legacy sessions.

A one-shot local cutoff is armed in `/private/tmp/tableus-p3-session-one-cutoff.py`
(exec session 59186). Thirty seconds before the deadline it removes worker cron,
disables future API admission without deploying, and stops latest API/worker
images. Check its private `session-one-cutoff.json` receipt before continuing.
Normal closeout sets session-one `ended_at` to disarm it. No clock/allowance reset.

## Rollout checkpoint, September 28 Central / September 29 UTC

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
  test hooks off. It is **stopped pending session-one mailbox/browser readiness**.
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

## Split rehearsal, authorized September 28 Central

Brian requested “split the rehearsal.” Natural expiry no longer blocks session
one. Keep **60 supervised live minutes total across both sessions**: allocate at
most 45 minutes to session one and reserve at least 15 for session two. The stopped
overnight interval is excluded; neither session receives a fresh allowance.
Record actual starts, ends and remaining minutes in the private ledger. Mailbox
operation and isolated browser identities must be ready before the first test.

Session one performs all four enrollments, A's returning sign-in, recipient/revoked
and replay/contention checks, the two-round A/B group journey, blockers, A/C/D
pending requests and support binding, API pause/B refusal, bounded A/C/D drain,
then B's shared-content/metadata repair and sole-plan removal. Defer the already
budgeted **B returning sign-in** to session two. Sign out/close only synthetic
sessions before the interval, count revocations, disable worker scheduling and
stop the API; retain B's account and all durable evidence.

Session two begins after the real fixture expiry below. Verify expired-invite
rejection without requesting an OTP or creating a replacement D account; this
public validation route checks the invite independently of D's deleted identity.
Complete B's one returning sign-in, supported self-service deletion and bounded
worker drain, then final containment. Four configuration restarts remain exactly:
session-one enable and pause, session-two re-enable and final disable. The
session-two re-enable also resumes the stopped API using the same image. No extra
source deployment or overnight running service is needed.

## Execute in order

1. Brian chose to operate the mailbox and enter codes directly in TableUs.
   Two Chrome sessions on the separate staging origins are verified signed out;
   the legacy in-app staging session is untouched. Confirmation that the four
   tagged aliases and privacy forwarding is complete. A's requested code awaits
   manual verification as recorded above. Only session two
   waits for expiry. Do not sleep a day inside a tool. No follow-up was scheduled.
   Fresh read-only preflight passed: expected source/images and all four aliases,
   API/worker stopped, empty queue/reservations, restricted grants, legacy counts
   unchanged and zero new provider rows. Places baseline is now 270; re-read and
   tighten its ceiling at the first restart. Billing/evidence are in execution.md.
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
5. Run the two sessions in the order above within the shared 60-minute limit,
   retaining the four-account/six-invite and two-person/two-round scope.
   Schedule only the remaining bounded worker invocations, then remove scheduling
   before a fifth total invocation. Verify individual completion, not just totals.
6. At both session boundaries leave admission and scheduling off and the API
   stopped. Preserve tombstones, counters, invitation history and legacy data.
   Record evidence and remaining gaps; session one alone cannot close acceptance.

Private fixture record:
`/Users/brianchei/Library/Application Support/TableUs/Rehearsals/2026-09-28-p3/d-expired-invite.json`.
Brian's four test addresses are `brian+tableus-p3-{a,b,c,d}@table-us.com`.
General support: `brian@table-us.com`; privacy/deletion: `privacy@table-us.com`,
which forwards to Brian. Alias delivery and the controlled support exchange still
need actual evidence; never request credentials in chat.

## Remaining bounds

Consumed: one API rollout, one web Preview/two staging alias assignments, one
private worker resource/deployment, four migrations, all six invites and one
of four worker processing invocations. API configuration restarts: one of four.
Auth DELETE attempts: zero of twelve. One new Auth user/no new profile; two OTP
requests, eight support messages, one OTP delivery/verification reserved. Live
Places/AI remain zero. Session one is stopped at the current checkpoint above. All other ceilings in the
prepared campaign apply, including $15 providers, $5 hosting, $0.25 AI, three
logical/nine underlying AI attempts, eleven OTP requests/ten deliveries/twenty
verification submissions, fourteen support messages, twelve refresh/revoke calls
and thirty status reads. Empty `--status` reads do not process work.

No automatic retry after a rollout/core/Auth/budget/identity error, no additional
allowance, no production/native build, real invitation, secret rotation or legacy
cleanup. Preserve additive migrations; do not restore the old unmetered API.
Priority 3 acceptance remains open; Priority 4 physical-device/native acceptance
and real-pilot intake remain later, separately scoped work.
