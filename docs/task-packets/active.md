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

Only local implementation and deterministic verification are authorized. No
native builds, hosted operations, live providers, migrations, resource/secret
changes, invitations, cleanup, merge, push or PR publication. Do not access the
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

Physical-device behavior and hosted PostgreSQL/CI remain unverified for these
bytes. Priority 4 signed builds and the bounded device lost-response check are
intentionally deferred; the canceled campaigns stay closed.

Next: review the local commit, then reconcile the evolving P3 documentation.
Later integration requires reconciliation with P3 and explicit owner approval
for publishing/merge/deployment; signed builds and device acceptance remain a
separate Priority 4 gate.
