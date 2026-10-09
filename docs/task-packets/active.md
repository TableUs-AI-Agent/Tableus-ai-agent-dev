# Active packet: local mobile signup recovery

## Source and authorization

Brian authorized this isolated development pass on October 8, 2026, alongside
Priority 3. This chat satisfies the fresh-chat rule. Worktree:
`/Users/brianchei/.codex/worktrees/f637/Tableus-ai-agent-dev`, branch
`codex/mobile-signup-recovery`, clean integrated base
`bffa2845f268ea8b1906b8de155aa130f199856e` (merged web recovery PR #11).

The **Prepare Priority 3 staging readiness** chat owns the live environment,
accounts, browser tabs, budgets and private ledger on `codex/pilot-staging-readiness`
in `/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/pilot-realignment`.
Its latest documents were read for context only; unmerged operator changes are
excluded here. Reconcile evolving canonical documents before integration.
Priority 3 acceptance remains a dependency; this pass does not start Priority 4.

## Objective and acceptance

Reproduce mobile signup recovery gaps with deterministic tests, then make the
smallest supported repair using existing `/api/v1` contracts. Cover verified
email followed by API outage, expired validation on retry, committed signup with
a lost response, app/session restoration, identity mismatch/account switching,
refusal/error handling and deletion recovery. Preserve explicit retry, recipient
binding, subject guards and the prohibition on persisting invitation codes/OTPs.

Run focused meaningful checks, one `make ready` and generated contract drift
checks. Finish with a reviewable local commit and handoff identifying exact base,
final source, results, residual risks and deferred physical-device acceptance.

## Boundaries and next gate

The original implementation scope authorized local work only. Brian separately
approved one push of `e8345489e7f560f89b408ffabf0464596de63efe`, one draft PR and
the initial existing deterministic CI. No native builds, live providers, staging
migrations, resource/secret changes, invitations, cleanup, merge or deployment
are authorized; CI uses its own disposable PostgreSQL migrations. Do not access the
rehearsal ledger or operate its tabs/accounts/services. Do not resume canceled
security or simulator campaigns. Use isolated test ports/resources.

## Local completion and verification

Expired-grant and lost-response gaps reproduced before implementation: four new
operation tests and two new coordinator tests failed. The repaired coordinator
preserves verified sessions, reconciles membership/deletion and offers explicit
invite re-entry without another OTP. Server Auth lookup binds email/subject;
restoration after the unchanged transaction TTL uses re-entry rather than saved
invite secrets. Mismatch, stale success/error, refusal, outage, local sign-out
failure and deletion precedence are covered.

Readiness passes: 364 JavaScript tests, 206 Python tests with 36 PostgreSQL-only
skips, lint/types, generated contract drift, web/Expo-web exports, deterministic
smoke and report-only performance. Focused checks pass 33 coordinator and 18
operation/storage tests. The one `make ready` finished in stages after sandbox
loopback denial; forced split-provider environment overrides caused four config
assertions, which passed after removal. No app source repair was required by
readiness. Private local logs are `/private/tmp/tableus-mobile-recovery-*.log`.
Dependencies were copied into this worktree from the matching-lock P3 checkout
read-only after offline npm cache installation failed; no dependency files changed.

Physical-device behavior remains unverified for these bytes. The initial hosted
PostgreSQL/browser CI below now verifies the published candidate. Priority 4 signed builds and the bounded device lost-response check are
intentionally deferred; the canceled campaigns stay closed.

## Reconciliation and publication preparation

Brian requested the next step after implementation. Read-only reconciliation
against P3 HEAD `00dbf4141c92e82c9c5d3cb5f00edfb2cfa931ba` and its latest completed
chat turn is recorded in the [integration proposal](../mobile-signup-recovery-integration.md).
P3 is clean and its changes since `bffa284` are documentation/evidence only.
The newer chat reports B sole-plan removal/sign-out/returning-code request;
its committed documents have not yet recorded those actions. No returning
verification, deletion, current runtime or overall P3 acceptance is inferred.
The P3 checkout, private ledger and external services were not modified.

Application source remains `99a4f8fbebee91e8c127031427f30ac7f37623cd`; all original
application checks are reused with unchanged inputs. Local preparation adds the
exact mobile branch to `vercel.json` with Git deployment disabled, updates only
scoped documentation and drafts the PR body in the proposal. JSON/guard, local
links, source boundaries and diff consistency checks pass; no new app tests or
native builds are required by this preparation.

## Approved publication status

Brian approved the proposal against `e834548`. Preflight verified remote `main`
unchanged at `bffa284`, no existing remote mobile branch and non-deploying
repository/workflow configuration. One push completed; [draft PR #12](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/12)
is attached, with exact head `e8345489e7f560f89b408ffabf0464596de63efe`.
[Initial CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/37873107070)
passed: 364 JavaScript tests, 242 Python tests with zero skips and 13 browser
journeys, plus migrations, lint/types, deterministic evaluation, contracts,
web/Expo-web exports and smoke. The tested synthetic merge `6bfdf2e647e20c73789f5dea74d24ae71f3cd082`
has exactly the published candidate tree `406a621777b394054f28fc6584fc6b11ea8fd360`.
Final readback confirms the same draft PR head/base and no GitHub deployment
record for this SHA.
No P3 state or approved runtime allowance was changed. The proposal records the
connector-to-CLI fallback and the exact publication binding.

Next: review draft PR #12 and refresh P3 reconciliation before requesting merge
approval. Merge, deployment,
signed builds/device acceptance and any P3 continuation remain separate owner
gates; refresh P3 reconciliation again before merge. Further published source or
CI attempts require their scope confirmed; local status documentation stays
unpublished and preserves the existing candidate.
