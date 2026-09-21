# Completed packet: dependency/toolchain disposition

Completed locally 2026-09-21. Branch `codex/dependency-toolchain-exception`;
worktree `/Users/brianchei/.codex/worktrees/14a6/Tableus-ai-agent-dev`.
Base: `5375e3389823b9c0736328709aab1cdc9be6ef98`. The task began clean at the
provisioned older `e1184ec`, then branched from the verified staging handoff.
Previous task `01a0c555-30b1-7403-9ac2-83d272d7ff62` was retrieved narrowly.

## Outcome

- Patched Next.js/eslint to 16.3.5, EAS's affected compatible transitives and
  Redocly/js-yaml. Kept EAS 23.2.0, Expo 57.0.23 and React Native 0.86.2.
- Added a small module adapter to the unmodified fixed decoder 0.5.0, preserving
  Expo Router/query-string interfaces. Node minimum is now 22.12 within Node 22.
- Full npm graph: zero critical/high; 17 remaining package entries propagate
  three underlying tooling advisories with documented unaffected/unused paths.
  The production-labelled graph's 12 entries all concern xcode/UUID build tooling.
- Fresh frozen installation and dependency consistency passed. Eight focused
  regressions, iOS/Android JavaScript exports and four deterministic Chrome
  browser tests passed. One `make ready` passed 234 JavaScript and 98 Python tests,
  with three local PostgreSQL skips; generated contract unchanged.
- No exception extension. Dispositions apply only to the reviewed replacement
  graph/usage. Reassess on dependency, consumer, command or trust-boundary changes.

[Assessment](../evidence/dependency-toolchain-2026-09-21/README.md) ·
[Machine-readable disposition](../evidence/dependency-toolchain-2026-09-21/assessment.json) ·
[Verification](../evidence/dependency-toolchain-2026-09-21/verification.json) ·
[Next-task handoff](../handoffs/2026-09-21-dependency-toolchain.md).

## Remaining boundary and next objective

Frozen staging application `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` remains
unchanged and potentially affected by the old Next image-optimizer advisory.
Local remediation is complete; rollout and release acceptance are not. Review
this replacement source in a fresh task and prepare a concrete bounded web/native
verification and rollout proposal for owner approval. Broader Expo patch alignment
has eight recommendations and needs affected native evidence; no clean Doctor
claim is made. Symbols and a focused simulator-hang diagnostic remain required
before distribution. The cause of the old hang remains unknown.

No merge, push, deployment, resource/secret creation, paid/live-AI evaluation,
native build, Security Scan, migration, destructive cleanup, account deletion,
store submission or cohort activation occurred. All original worktrees/artifacts
and saved sessions remain intact. Places 92/100, emails 2/4, explicit canaries
6/6 per provider, new Gemini 0/0 are preserved closed-run limits, not a fresh
allowance. This completed packet is replaced only by the next task's own objective.
