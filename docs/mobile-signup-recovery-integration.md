# Mobile signup recovery: publication and integration proposal

Prepared October 8, 2026. Brian subsequently approved publication and the initial
CI run against `e8345489e7f560f89b408ffabf0464596de63efe`; the execution status
below records that bounded approval. Merge and release remain unapproved. The active objective and boundaries are in the [local packet](task-packets/active.md).

## Source and verification

- Repository: `https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev`.
- Branch: `codex/mobile-signup-recovery`; draft PR #12 base: `main`.
- Locally verified integrated base: `bffa2845f268ea8b1906b8de155aa130f199856e`.
  Publication and review readbacks confirm the PR base is still this SHA.
  No hosted trigger inspection occurred during local preparation/review.
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
`a816c19417526e83d0caeb5430e94808c49c22df` on `codex/pilot-staging-readiness` in
`/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/pilot-realignment`.
That checkout is clean. Its differences from `bffa284` are eleven documentation/
evidence files, with no application, dependency, migration or workflow changes.
The **Prepare Priority 3 staging readiness** chat was read without messaging or
interrupting it. Its private ledger, accounts, tabs and hosted environment were
not operated or modified.

The committed P3 documents and latest completed chat turn agree: all four
synthetic application/Auth accounts are removed, deletion jobs completed,
rehearsal services stopped and the temporary browser origin removed. Account-flow
closeout is complete. Support receipt/correspondence, hosted redemption
replay/contention and server-side deletion refusal remain open; overall P3
acceptance and Priority 4 authorization remain separate.

This mobile candidate carries only a status summary and the operator commit's
provenance. P3's new operator documents, exact runtime/budget counters, private
bindings and later approval history remain in its unpublished checkout. Do not
import or publish that separate history, replenish its allowances or replace
its operating packet. No new P3 external action is part of mobile integration.

| Document | Reconciliation for this local branch | Before a later merge |
| --- | --- | --- |
| `current-state.md` | Keep mobile verification and the scoped, committed P3 account-flow closeout summary. | Refresh the operator source/status without importing its unpublished history. |
| `roadmap.md` | Record this preparatory mobile repair alongside P3, without advancing Priority 4. | Preserve P3 completion/dependencies as actually accepted by the owner. |
| `decisions.md` | Retain mobile expiry/privacy/identity rules; correct web PR #11 rollout attribution. | Preserve the P3 branch's later owner decisions and scoped approvals. |
| `task-packets/active.md` | Keep this checkout's local objective and publication gate. | Choose the packet for the integrated objective explicitly; never replace P3's live packet from this branch. |

Both branches change these four documents, so a later merge/rebase needs explicit
content reconciliation. Do not resolve by replacing entire documents with this
branch or importing the P3 operator history wholesale. P3's pending documents
and evidence remain in its checkout; this PR does not publish or integrate that
separate history. Refresh the read-only comparison before any merge and retain
source-bound acceptance evidence at that gate.

## Review and next integration scope

Review covered the changed mobile screen, coordinator, operations and transaction
storage, their regression tests, shared-client subject guards and feature contract.
No blocking finding was identified. Recovery checks server-verified identity,
reconciles committed membership before invite re-entry, preserves deletion
precedence and rejects stale account results. The tests exercise the failure
transitions rather than only successful calls. Physical-device behavior is still
unverified. This is a functional integration review; canceled security scans were
not restarted.

GitHub readback confirms open draft PR #12 at `e834548`, base `bffa284`, no posted
reviews and successful CI run `37873107070`. The local publication-result commit
`f99fa215449727ec00656632b38aac8f1be1414d` and this review/reconciliation change
modify only five scoped Markdown documents. Application, tests, dependencies,
contracts, build configuration, deployment exclusions and CI inputs are unchanged
from the published passing head. Local checks for this change cover Markdown
links, diff/consistency, source boundaries and the exact branch/main deployment
guards; application checks are reused.

Request one non-force update of the mobile branch with the reviewed local
documentation closeout, one automatic PR CI run, an updated PR description,
marking PR #12 ready and merging it into `main` only after the following checks:

1. The published branch is still exactly `e834548`, `main` is exactly `bffa284`,
   and the reviewed local head differs only in the five scoped documents.
2. P3 remains on the observed documentation-only lineage and its latest completed
   status agrees with the summary. Any new source/acceptance changes require
   reconciliation before proceeding; preserve any new uncommitted operator work.
3. The exact pushed head passes its initial deterministic CI, the PR is mergeable,
   no blocking review appears, and the tested synthetic merge has the same tree
   as that head. Do not rerun a failed check or publish another candidate under
   this request.
4. The mobile branch and `main` remain excluded from Vercel Git deployment and
   no new repository/workflow deployment trigger is present. Stop for any source,
   tree, trigger or approval mismatch; no force push, auto-merge or branch deletion.

Record source-bound merge evidence locally with the resulting main SHA, tested
tree and CI identities. Keep that follow-up unpublished; no post-merge push or
workflow dispatch is proposed. The checked-in workflow runs on pull requests,
merge groups or manual dispatch, with no push event or deployment step. Merge
uses the passing PR checks. Deployments, native builds/device acceptance, P3
continuation, operational-record publication and real invitations remain separate.
This scope is prepared and awaits explicit owner approval; prior publication
approval does not include it.

## Original approved publishing scope and stop conditions

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

No further branch push, CI rerun, merge or deployment was included in this
execution. Local publication-result/review documentation remains unpublished and
does not replace the exact PR/CI source binding. The next integration scope above
now requests the single documentation update and conditional merge together.
No application tests were rerun for the unchanged application inputs.

## Draft PR content

Title: **Fix mobile recovery after verified signup loses its API response**

Mobile signup previously signed out a verified session when its redemption grant
expired, including when enrollment had already committed but its response was
lost. Reconcile membership after redemption 400/409, preserve deletion recovery,
and offer explicit invitation re-entry through the existing recipient-bound API
without another OTP. Server Auth lookup and an expiring stored subject binding
protect account switching; invitation codes and OTPs remain unpersisted.

Validation: initial hosted CI passed 364 JavaScript tests, 242 Python tests with
zero skips and 13 browser journeys, restricted-role migrations, lint/types,
contract drift, web/Expo-web exports and deterministic smoke. Local readiness
passed 206 Python tests with 36 PostgreSQL-only skips before that hosted result.
Regression coverage includes outage/expiry, lost committed responses, restoration,
identity mismatch, stale success/error, refusal and deletion precedence. The
branch and main are excluded from Vercel Git deployment. Physical-device checks
remain separate; this is preparatory mobile work alongside P3, whose account-flow
closeout is complete but remaining acceptance is open. The documentation update
preserves P3's unpublished operating history and changes no application/CI inputs.
