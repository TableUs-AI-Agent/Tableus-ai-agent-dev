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

## Current checkpoint, September 30: email receipt confirmed

At the September 29 22:58 UTC provider check, both API and worker deployments were
verified stopped, with null cron and
next run and future API deletion admission false. The cutoff requested API stop at
05:28:21 UTC, deployment metadata updated 05:28:27, and the immediate receipt still
showed stopping. The later provider read verifies stopped; exact instance stop time
was not captured. Private ledger segment index 1 is marked closed by cutoff with
its full 49m48.045s allocation charged; `ended_at` remains null rather than inventing
an exact timestamp. Cumulative allocation consumed is 90/105 minutes, leaving the
15-minute post-expiry reserve. Restart use remains 2/5; no attempt allowance resets.

A remains unverified. Its last code send was 04:41:40 UTC (September 28 11:41 p.m.
Central); the reservation expired 05:01:39 UTC and the code itself is also expired.
September 29 readback: eight Auth users/six profiles, zero active reservations/deletion
rows/new provider rows. No B/C/D enrollment, group journey or deletion acceptance.

On September 30 Brian corrected the missing-email report: the Auth code was
received, and he had checked the wrong inbox. Owner-visible receipt is passed;
OTP verification and enrollment remain incomplete. Close the missing-email
investigation without an SMTP/DNS/suppression change. The earlier self-to-alias
hypothesis was not established. No code/body was displayed or saved in evidence.
Three prior diagnostic status reads remain counted; aggregate status-read use is
15/30. No additional email or provider call accompanied this correction.

Private fixture records confirm all four normal invitations expired September 30
at 03:38:16–03:38:21 UTC. All six issued invitations are charged against the limit
of six. The separate natural-expiry fixture has elapsed; its HTTP rejection remains
untested. **Next: prepare a revised signup scope and allowance proposal, accounting
for replacement invitations and the incomplete first phase, before another live
window.** The receipt correction does not extend existing caps or authorize a resend.

The earlier pending verification instructions are stale. Do not submit the old
code, reset the clock or automatically extend the approved recovery. Preserve the
unverified A identity and all legacy data. B's old tab visibility is unconfirmed;
current user ambient UI lists only the links tab. The temporary Preview CORS origin
remains configured on the stopped API and must be removed at final containment.

## Historical recovery checkpoint, September 29 at 04:42 UTC

Brian approved the [recovery packet](../p3-rehearsal-recovery.md). Its limits are
now **105 cumulative live minutes and five same-image API configuration restarts**;
all other original limits and consumed counters remain unchanged. Restart **2/5**
is SUCCESS: deployment `b134094c-b6be-4f04-b8e9-87bbbd3e986a`, exact approved image
`sha256:4fc94ba63d5ee76f5e9e25868a0a347db252b12d4defacfcfa30078598d4c5b8` and source
`2eefdc51345aeaa7951ffb343954c1669f9280c5`. Readiness and A/B exact-origin CORS
preflights passed. Deletion is enabled, inline false; worker remains stopped and
unscheduled. Places ceiling stays 690 (fresh baseline 270 + unused 420).

The recovery live segment started `2026-09-29T04:39:03.227627Z`; hard deadline
`2026-09-29T05:28:51.272600Z` (12:28:51 a.m. Central). One-shot cutoff
`/private/tmp/tableus-p3-recovery-cutoff.py`, exec session **73801**, watches ledger
segment index 1 and stops services 30 seconds before the deadline. Check private
`recovery-cutoff.json`; a recorded `ended_at` disarms it. The earlier 40 minutes
11.955 seconds remain consumed; reserve at least 15 minutes for post-expiry work.

A's single recovery resend succeeded at `04:41:40.659236Z`, using the same Auth
identity. Its new reservation expires `05:01:39.315729Z`. Counts remain eight Auth
users/six profiles, with one active reservation, no other synthetic Auth accounts
and no live provider usage. Three OTP requests and two delivered-email allowances
are consumed/reserved; two verification submissions are conservatively reserved.
No replacement account or invitation was created.

**Next: Brian enters A's newest code in the visible in-app links tab and selects
Verify and continue once; verify Plans/profile creation before requesting B.**
Never request the code in chat. A is in-app tab 6; B's filled, unsubmitted form is
in-app tab 7 at the existing Preview's distinct origin. Preserve both tabs and
the legacy staging-origin session. Pointer activation did not trigger a request;
DB readback proved no send, then keyboard Enter triggered the single resend.
Use supported keyboard activation when in-app button clicks have no effect.

## Historical containment checkpoint, September 29 at 04:08 UTC

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

Brian has now confirmed visibility of the filled in-app A form. B's filled form
is prepared on the existing Preview's distinct origin in a second in-app tab,
without OTP or a new deployment. The [recovery proposal](../p3-rehearsal-recovery.md)
was explicitly approved by Brian September 29: 45 additional live minutes, one
additional same-image configuration restart and temporary permission for that
exact Preview origin in staging CORS. The private ledger now retains elapsed and
attempt usage under ceilings of 105 minutes/five restarts; all other bounds stay
unchanged. **Next: perform the approved recovery preflight, resume the same API
image under restart two and recover A through the visible form.** The original two-session sequence is incomplete;
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

## Planned sequence after scope reconciliation (not authorization to restart)

1. Wait for A's owner-entered code and verify actual Plans/profile creation before
   requesting B. The pending async question asks for result only, never the code.
   A's current reservation expires 05:01:39 UTC; no blind resend or duplicate click.
2. Preserve the legacy staging-origin session. A uses in-app links tab 6, B the
   existing Preview tab 7. C/D may reuse A's links origin after A's pending-deletion
   evidence and supported synthetic sign-out. Do not reset identity or counters.
3. Fresh source/alias/role/count/budget checks and recovery restart 2/5 are complete.
   API Places ceiling 690 equals baseline 270 + unused 420, deletion enabled and
   inline false. Worker is stopped/no cron. The exact three-origin CORS list passed
   A/B preflights; remove the temporary Preview origin at final disable.
4. Perform remaining original Auth, two-round group, blockers, A/C/D pending/status
   and verified D support-binding cases. Replay/contention need a supported
   authenticated execution path and actual hosted evidence; do not extract hidden
   browser tokens or infer a pass. Verify all queue subjects are the named synthetic
   fixtures before each of the three remaining worker invocations, limit three.
5. Restart 3/5 pauses API deletion admission for B's refusal check, then drain only
   verified A/C/D rows and verify individual completion. Complete B's shared-data
   cleanup/repair and sole-plan removal. Stop API and worker between phases.
6. After the unchanged expiry fixture reaches 2026-09-30T02:48:54.780853Z, restart
   4/5 re-enables/resumes the same image, checks expired-invite rejection without
   OTP/account creation, and performs B's planned returning sign-in and final
   supported deletion/drain. Restart 5/5 disables admission and removes the added
   Preview origin. Remove scheduling, stop services, preserve all durable history.
7. Respect the current segment's cutoff and all unchanged cumulative attempt/spend
   ceilings. Record actual end times. No extra allowance follows a failure or a
   continuation; preserve state and report exact acceptance gaps at any stop.

Private fixture record:
`/Users/brianchei/Library/Application Support/TableUs/Rehearsals/2026-09-28-p3/d-expired-invite.json`.
Brian's four test addresses are `brian+tableus-p3-{a,b,c,d}@table-us.com`.
General support: `brian@table-us.com`; privacy/deletion: `privacy@table-us.com`,
which forwards to Brian. Alias delivery/privacy forwarding are confirmed; six support messages remain for
the verified D challenge, duplicate and completion cases. Never request credentials in chat.

## Remaining bounds

Consumed: one API rollout, one web Preview/two staging alias assignments, one
private worker resource/deployment, four migrations, all six invites and one
of four worker processing invocations. API configuration restarts: two of five.
Auth DELETE attempts: zero of twelve. One new Auth user/no new profile; three OTP
requests, eight support messages, two OTP deliveries/verifications reserved. Live
Places/AI remain zero. The recovery segment is closed by cutoff at the current checkpoint above. All other ceilings in the
prepared campaign apply, including $15 providers, $5 hosting, $0.25 AI, three
logical/nine underlying AI attempts, eleven OTP requests/ten deliveries/twenty
verification submissions, fourteen support messages, twelve refresh/revoke calls
and thirty status reads. Empty `--status` reads do not process work.

No automatic retry after a rollout/core/Auth/budget/identity error, no additional
allowance, no production/native build, real invitation, secret rotation or legacy
cleanup. Preserve additive migrations; do not restore the old unmetered API.
Priority 3 acceptance remains open; Priority 4 physical-device/native acceptance
and real-pilot intake remain later, separately scoped work.
