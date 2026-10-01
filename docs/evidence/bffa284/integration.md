# Web signup completion recovery: integration and staging deployment

Approved application candidate: `8861eece0e77574bcd693550d9b2628f362dccf3`.
Preparation base: `341f0410260b33ca855ba7df0b7936409a4b262a`.
Owner approved the complete publishing/CI/merge/deployment/rehearsal scope against
handoff `b08cee4e7b8dfd952fc75fa7823d38494d78d4e2`. The earlier automatic push
rejection was resolved by explicit authorization naming the GitHub destination;
no alternate upload path was used.

## CI and merge

[PR #11](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/11) merged
October 1 at 21:44:12Z as `bffa2845f268ea8b1906b8de155aa130f199856e`. The full tree
is identical to passing head `7b137ed93ddeb30fc02173b6e4a7982aa06d3545`; application
inputs are unchanged from `8861eec`. [CI run 36929366496](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36929366496)
passed 242 Python, 334 JavaScript and 13 browser checks, zero skips, plus restricted
PostgreSQL migrations, lint/types, deterministic evaluation, contracts, builds and
smoke. Both new retry/reload browser cases passed without another OTP. Local
verification is retained in [the candidate handoff](../8861eec/auth-recovery.md).
Review found no further actionable issue in the bounded component/helper/API/
fixture change; no independent security scan was performed.

## Deployment

A clean `git archive` of merge `bffa284` supplied 1,031 tracked source files; only
existing-project link metadata was added locally. No private fixtures or local
credential files were included. The first CLI invocation failed resolving Vercel
at user lookup before upload. Retrying with network permission produced exactly
one Preview, consuming allowance 3/3; there was no deployment retry/build failure.

Preview **`dpl_8tmFppeucwSv23uuj71qYF7mpthW`** is READY with Preview target and
both `githubCommitSha`/`tableusSourceSha` equal to the merge. URL:
[immutable Preview](https://tableus-staging-dj5hgm88o-briancheis-projects.vercel.app).
Build/runtime source stamps, staging telemetry and query-link format were explicit;
Sentry build upload remained disabled as in the previous accepted Preview.
Both staging aliases resolve to this deployment. Both production aliases remain
on `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK`. B's old immutable Preview and session were
preserved. Browser readback rendered the new Continue form, with no OTP sent.
Screenshot: `/private/tmp/tableus-web-auth-deployed.png`.

## API resume and hosted C recovery

Fresh preflight verified stopped/unscheduled API and worker, exact approved image
and configuration, and hosting headroom (conservative upper bound $1.1247938732362335).
One aggregate queue/roster read confirmed A pending with zero attempts and no
unknown pending subject/lease/attention, B approved, C Auth-only, D absent.
The existing cutoff passed eight local self-tests. The new operator helper checks
the exact owner approval and rejects increased ceilings. No new infrastructure,
API source, schema or secret was introduced.

Window `7c0874ab-7b52-4838-831f-6d76b35ec588` began 21:51:40.636523Z. Its immutable
deadline is 22:36:40.636523Z, containment two minutes earlier. API restart 9/12
created `a72eeed7-5765-46f8-b0a3-943af20d0673` with source `2eefdc5` and original
image; readiness and C/B CORS passed at 21:53:49Z. Worker remains stopped and
unscheduled, inline attempts false, API admission true only inside this window.

C's preserved browser session resumed normal signup after reload. Dinner plans
rendered, and trusted aggregate readback confirmed one profile/redemption with
unchanged Auth creation 20:49:35Z and last sign-in 21:00:40Z. No new OTP was sent
or entered; cumulative requests remain 10/12. Screenshot:
`/private/tmp/tableus-c-recovered-plans.png`. C's sole test plan was then created
through normal location resolution and create UI. The initial six-attempt/$0.147
reservation reconciled to one location.resolve and one location.details request,
two attempts/$0.049 on the approved cost basis, no AI operation. The owner removed
the sole plan and confirmed account deletion. Trusted readback at 22:09:26Z confirms
the plan/profile/redemption absent and exact job pending since 22:04:53.905565Z.
Complete queue: A/C pending, zero attempts, leases, attention or unrelated jobs.
Private exact bindings are retained. Screenshot:
`/private/tmp/tableus-c-deletion-pending.png`. Normal Sign out here then showed
session ended; no claim of Auth removal is made.

D's last recipient-bound invitation and one signup code are now issued. Code-entry
UI is ready, with owner handoff deadline 22:21:09Z; no D profile/redemption proof
yet. OTP requests are 11/12, invitation allowance 10/10, provider attempts 74/420.
Next: owner completes D's code entry, then verify signup and support binding.
A's Auth removal, D support flow, bounded worker drain and final B cleanup remain
incomplete. Hosted redemption replay/contention and server-side deletion refusal
remain untested. Staging progress is not P3/native/pilot acceptance. See the active
packet/private ledger for the live deadline and latest consumption; charge the
window at verified stop and preserve final 900 seconds.
