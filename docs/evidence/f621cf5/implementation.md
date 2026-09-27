# Priority 2 implementation handoff

Application/source candidate: `f621cf5dbf0c8663d92be5fe613b9910b68a9953`.
Base: `8ae3c94eb3e41b87f0840cd5aa2b0827c0882af4` (approved Priority 1 merge).
Branch: `codex/pilot-experience-measurement` in the reused
`.worktrees/pilot-realignment` checkout. The eight pre-existing Markdown changes
were reviewed, preserved and committed with this objective. The root checkout
was not edited. Later evidence-only commits do not change application inputs.

## Result and review

- Web landing/navigation and mobile tabs expose Plans/Account. Web redirects
  cover deferred routes and nested photo entry. Mobile People/Profile/Review
  route components redirect without importing the retained implementations in
  `mobile/src/screens/deferred`. Account is accessible through its own tab and
  existing recovery route, with privacy/terms/deletion help. Auth, invite, private
  Join and exports remain intact.
- `plan.finalized` records unique voting profiles in the active run. Vote updates
  do not inflate the count; new runs do not reuse old votes. Organizer discretion
  and ranking are unchanged. Deletion's reviewed payload allowlist retains only
  a true integer from 0–8, separately from any surviving candidate reference.
- The [bounded read-only report](../../pilot-measurement.md) uses an explicit
  private roster and half-open window, first retained join eligibility and any
  qualifying finalization. It counts plans once, requires two voters for success,
  refuses oversized reports and discloses missing plans/history and late entrants.
  Tests prove an earlier success survives both finalizer and other-member deletion,
  removal of its candidate/run, and later zero-vote re-finalization.
- No schema/dependency/API contract change. Deferred code, endpoints and export
  fields remain. No persistent analytics identities or aggregate store were added.

## Verification

One `make ready` passed: lint/types, **326 JavaScript tests, zero skips**,
**202 Python tests, 36 PostgreSQL-only skips**, contract generation, Next.js
production build, Expo-web export, deterministic smoke and report-only bundle
baseline. `npm run contract:check` passed with no drift. The final focused
measurement suite passed **24 tests**, including the operator wrapper; Ruff passed.
The pre-existing account lifecycle fixture query was scoped to its own plan after
focused test ordering exposed that it could otherwise select another test's event.

Local Chrome passed **five shared-plan/navigation**, **five account/deletion-help
recovery**, and **four private-Join** cases. Initial plan-detail requests timed out
using the pre-existing Next dev cache. The same application passed the full five
journeys and private-Join checks after preserving the cache and starting a fresh
one. This is an environment observation, not a proven application defect or fix.
A temporary Join runner initially used the API mock's port as the frontend port;
it was corrected to the fixture's separate frontend/API ports. No application
behavior was changed to make these checks pass.

The operator CLI was run against disposable synthetic SQLite browser data: three
retained plans, one eligible plan, one success, two without join history, and one
eligible with under 24 hours before cutoff. These are fixture results, not pilot
outcomes. No hosted pilot data was read.

Diagnostics remain privately in `/tmp/tableus-p2-*.log` and the ignored
`.artifacts/pilot-p2/` directory (failed browser traces, preserved dev cache,
runner configurations and screenshots). The hosted pass below supplies restricted
PostgreSQL/migration and pinned Chromium coverage for the local skips. The earlier Priority 1 mobile component timeout did not recur in this run;
its cause remains unestablished.

## Publication and gates

Read-only preflight on September 27 confirmed `main` still at `8ae3c94`, Railway
with zero deployment triggers and `prDeploys=false`, and unchanged Vercel target
IDs `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK` (production) and
`dpl_3ec5bdvridE1meArFaYWAp8yabKM` (preview). Repository `vercel.json` explicitly
disables Git deployment for this objective branch, `codex/pilot-realignment` and
`main`, following [Vercel's branch configuration](https://vercel.com/docs/project-configuration/git-configuration).
No hosting settings changed.

Automatic approval review initially rejected the combined push/draft-PR action
before execution because source publication required explicit owner authorization.
Brian then approved the concrete publication and hosted-CI scope in this chat on
September 27. Branch head `a08e3d0f64ed43c839adc4e9d7ae5134a45fbd6a` was pushed and
[draft PR #8](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/8) created
against unchanged `main` at `8ae3c94`. Application inputs are unchanged from
`f621cf5`; `a08e3d0` adds only the handoff and status documentation.

Pre-publication readback at 06:47:27 UTC again confirmed the branch/main Vercel
exclusions, zero Railway triggers and disabled PR environments. Post-publication
Vercel readback at 06:48:25 UTC returned no new deployments; Railway's latest
remained `24eefe75-9583-4a90-8d3e-48450818dec0` from September 21. No deployment,
resource, secret or hosted migration was created. [Hosted CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36301151907)
passed on the published head with **238 Python tests, 326 JavaScript tests and five
browser journeys, zero skips**. Restricted PostgreSQL roles/migrations, lint/types,
deterministic evaluation, contract generation/drift checks, web/Expo-web builds
and smoke passed. No application fixes were needed.

The tested synthetic merge is `0709d28649d409ca6d0238bdc050a981356a7769` against
base `8ae3c94eb3e41b87f0840cd5aa2b0827c0882af4`. Its tree and the PR head tree both
are `8be5ff50f40cbacc2193b4b980970d208b649fef`. A subsequent documentation-only
closeout records these results; it changes no application, test or configuration
inputs. GitHub's action-runtime notices are nonblocking and were not expanded into
a toolchain upgrade. The PR remains a draft for review; merge is not approved.

Approval includes routine deterministic CI fixes in this same chat. Merge and
deployment remain separately gated. Stop for an unexpected deployment trigger,
new external resource/secret or paid/live requirement, or significant scope
change. No force push or branch deletion is proposed.

Priority 3, deletion activation, hosted migrations/secrets/workers, deployments,
signed native builds/device campaigns, real invitations, live evaluations and
cleanup remain deferred. Physical-device acceptance has not been performed for
this candidate. Future authorized major work starts in a fresh chat; fixes and
verification of this Priority 2 pass stay here.
