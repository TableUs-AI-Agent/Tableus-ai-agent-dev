# Mobile signup recovery: publication and integration proposal

Prepared October 8, 2026. Brian subsequently approved publication and the initial
CI run against `e8345489e7f560f89b408ffabf0464596de63efe`; the execution status
below records that bounded approval. Merge and release remain unapproved. The active objective and boundaries are in the [local packet](task-packets/active.md).

## Source and verification

- Repository: `https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev`.
- Proposed head: `codex/mobile-signup-recovery`; proposed PR base: `main`.
- Locally verified integrated base: `bffa2845f268ea8b1906b8de155aa130f199856e`.
  No remote refresh or hosted trigger inspection occurred during preparation.
- Application implementation/check source:
  `99a4f8fbebee91e8c127031427f30ac7f37623cd`.
- Worktree: `/Users/brianchei/.codex/worktrees/f637/Tableus-ai-agent-dev`.
- The later preparation commit containing this proposal changes documentation
  and adds an exact branch deployment exclusion to `vercel.json`; application,
  test, dependency, contract and build inputs remain unchanged.

Readiness at the application source passed 364 JavaScript tests and 206 Python
tests with 36 PostgreSQL-only skips, lint/types, generated contracts/drift,
web/Expo-web exports, deterministic smoke and report-only performance. Focused
checks passed 33 coordinator tests and 18 operation/storage tests. The packet
retains the loopback/environment harness failures and successful staged checks.
Physical-device/native acceptance is still absent for these bytes. The approved
hosted CI below now supplies PostgreSQL/browser verification. No live Auth/provider or native build is included in preparation.

## P3 reconciliation and ownership

Read-only canonical document source is P3 operator HEAD
`00dbf4141c92e82c9c5d3cb5f00edfb2cfa931ba` on `codex/pilot-staging-readiness` in
`/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/pilot-realignment`.
That checkout is clean. Its differences from `bffa284` are ten documentation/
evidence files, with no application, dependency, migration or workflow changes.
The **Prepare Priority 3 staging readiness** chat was read without messaging or
interrupting it. Its private ledger, accounts, tabs and hosted environment were
not operated or modified.

The committed P3 documents prove A/C/D Auth/profile removal and describe the
approved visible-tab B resume preflight. The latest completed chat turn separately
records B sole-plan removal, normal local sign-out and one returning-code request.
It ends at the owner code-entry handoff. Returning verification, B account/Auth
removal, final CORS cleanup and present runtime/containment are unconfirmed in
this read. Do not infer them, copy private destinations or replenish allowances.
Support receipt and hosted redemption replay/contention/server refusal remain
open. P3 acceptance and Priority 4 authorization remain separate.

| Document | Reconciliation for this local branch | Before a later merge |
| --- | --- | --- |
| `current-state.md` | Keep mobile local readiness; distinguish P3 committed preflight from later chat observations. | Preserve the operator's latest closeout, exact source and acceptance gaps. |
| `roadmap.md` | Record this preparatory mobile repair alongside P3, without advancing Priority 4. | Preserve P3 completion/dependencies as actually accepted by the owner. |
| `decisions.md` | Retain mobile expiry/privacy/identity rules; correct web PR #11 rollout attribution. | Preserve the P3 branch's later owner decisions and scoped approvals. |
| `task-packets/active.md` | Keep this checkout's local objective and publication gate. | Choose the packet for the integrated objective explicitly; never replace P3's live packet from this branch. |

Both branches change these four documents, so a later merge/rebase needs explicit
content reconciliation. Do not resolve by replacing entire documents with this
branch or importing the P3 operator history wholesale. P3's pending documents
and evidence remain in its checkout; this PR does not publish or integrate that
separate history. Refresh the read-only comparison before any merge and retain
source-bound acceptance evidence at that gate.

## Proposed publishing scope and stop conditions

Request one push of the reviewed local head to the named GitHub repository,
one draft PR against `main`, and its existing `.github/workflows/ci.yml` run.
That workflow uses deterministic providers, disposable PostgreSQL roles/migrations,
unit tests, contract checks, web/Expo-web exports and localhost browser journeys.
It has no deployment step and no native build. No workflow changes, new secrets,
resources, invitations, live evaluation, staging migration or release are proposed.

`vercel.json` now sets `git.deploymentEnabled["codex/mobile-signup-recovery"]`
to `false`, preserving every existing exclusion including `main`. Vercel's
[Git configuration](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled)
documents that unspecified branches default to deployment enabled; the exact
exclusion is therefore part of the candidate before its first push. It does not
change deployed configuration until publication. Railway's no-trigger status is
historical P3 inventory, not a new hosted readback.

After approval, verify the exact repository/head/base and read-only repository/workflow trigger
configuration before pushing. Stop if the remote branch has unrelated commits,
remote `main` has application/workflow changes not covered by this candidate,
a deployment trigger cannot be shown disabled, or publishing would affect P3's
live candidate/environment. Do not overwrite remote history or change hosted
settings to work around a stop. Refresh P3 context without contacting its ledger
or taking control of its work.

Attach the draft PR to this chat and wait for the initial CI result. Stop and
report a failing or incomplete check; local deterministic fixes remain allowed,
but another published head/CI attempt needs its scope confirmed. Return the PR,
exact CI head and results for review. No auto-merge, merge, branch deletion,
deployment, signed build or device/distribution action is covered by this request.
A later merge requires separate owner approval and refreshed P3 reconciliation;
release/device gates stay with their separately approved objectives.

## Approved publication execution

The remote repository matched the named target. Remote `main` remained exactly
`bffa2845f268ea8b1906b8de155aa130f199856e`, and the mobile branch did not exist.
The reviewed branch exclusion had no overlapping deployment-enabled rules; the
only checked-in GitHub workflow is deterministic CI, with no deployment step.
One non-force push published exactly `e8345489e7f560f89b408ffabf0464596de63efe`.

[Draft PR #12](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/12)
is attached to this chat and targets `main` at `bffa284`. The GitHub connector
returned 403 when creating the PR; the authenticated GitHub CLI completed that
same approved action. [Initial CI run 37873107070](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/37873107070)
completed successfully for the exact published head, on the pull-request event.
It passed 364 JavaScript tests, 242 Python tests with zero skips, 13 browser
journeys (five main and eight hosted account/deletion checks), restricted-role
migrations, lint/types, deterministic evaluation, generated contracts/drift,
web/Expo-web exports and deterministic smoke.

GitHub checked out synthetic PR merge commit
`6bfdf2e647e20c73789f5dea74d24ae71f3cd082`, with parents `bffa284` and `e834548`.
Its API-reported tree `406a621777b394054f28fc6584fc6b11ea8fd360` exactly matches
the published head's local tree. This binds the passing checks to the proposed
bytes; the synthetic merge is not an approved merge into `main`.
Final readback confirms the PR remains open/draft on the same head/base and
GitHub still reports no deployment record for that SHA.
This observation is bounded to the repository record, not an independent hosted
service/configuration audit. P3 services/accounts/tabs/ledger were not operated.

No further branch push, CI rerun, merge or deployment is included in this
execution. Later local publication-result documentation remains unpublished and
does not replace the exact PR/CI source binding. Next: review draft PR #12 and
refresh P3 reconciliation before requesting a separately approved merge. No
application tests were rerun for the local documentation closeout.

## Draft PR content

Title: **Fix mobile recovery after verified signup loses its API response**

Mobile signup previously signed out a verified session when its redemption grant
expired, including when enrollment had already committed but its response was
lost. Reconcile membership after redemption 400/409, preserve deletion recovery,
and offer explicit invitation re-entry through the existing recipient-bound API
without another OTP. Server Auth lookup and an expiring stored subject binding
protect account switching; invitation codes and OTPs remain unpersisted.

Validation: 364 JavaScript tests, 206 Python tests with 36 PostgreSQL-only local
skips, lint/types, contract drift, web/Expo-web exports and deterministic smoke.
Regression coverage includes outage/expiry, lost committed responses, restoration,
identity mismatch, stale success/error, refusal and deletion precedence. The
branch's Vercel Git deployment is disabled. Hosted CI and physical-device checks
remain separate evidence; this change is local preparatory work alongside P3.
