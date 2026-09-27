# Development workflow

Updated 2026-09-27. This applies to any coding agent or person working in the
repository. [AGENTS.md](../AGENTS.md) holds the short rules; this page explains them.

## Start an objective

1. Begin each authorized major pass in a fresh thread: a new roadmap priority or
   distinct feature/release objective. Pass along the objective, canonical packet,
   worktree/branch/base, uncommitted work, relevant evidence and approval limits.
   If this thread was created for that pass, continue here; do not create another.
   Keep fixes, review and verification of the same objective in that thread.
2. Read the [active packet](task-packets/active.md) and [current state](current-state.md);
   read the roadmap and decisions when the work touches them.
3. Confirm the branch and base. The root checkout may be stale, and the latest
   work may be on an unmerged branch. Preserve uncommitted files.
4. Use a named `codex/<objective>` branch and reuse a suitable checkout for
   sequential work. Create another for concurrency or necessary isolation;
   choose the base by ancestry and accepted work, not edit recency.
5. Keep the objective reviewable in one change. If the active packet does not
   describe it, update the packet first.

When a previous conversation is referenced, read only what answers a concrete
question. Handoffs/reviews retain provenance, scoped approvals and limits; they
do not start a new objective. The fresh-thread preference does not authorize
advancing the roadmap or change approval gates. A new task or model does not
replenish spent limits.

## Keep documents current

- `current-state.md`: what is implemented and deployed now, and the known gaps.
- `roadmap.md`: the milestone, ordered priorities, and what is deferred or stopped.
- `decisions.md`: durable choices, with superseded entries marked in place.
- `task-packets/active.md`: the current objective, its acceptance and boundaries.
- Feature contracts (for example `account-lifecycle.md`): implemented behavior.

Replace outdated text instead of appending another status paragraph. Do not
snapshot the document set into `docs/history/`; Git history keeps prior versions.
Preserve existing referenced snapshots. Commit at meaningful boundaries when
authorized; leave work uncommitted when requested.

## Verify according to impact

| Change | Verification |
| --- | --- |
| Documentation or agent instructions only | Links, paths, configuration syntax and consistency with the other source-of-truth documents |
| Application code, contracts, dependencies or executable tooling | Focused tests while iterating; `make ready` once before handoff; generated contract drift check |
| Gate: merge, staging deployment, native pilot build, distribution or cohort activation | Applicable checks from the [release checklist](release-readiness-checklist.md), bound to exact source/artifact and recorded once in `docs/evidence/<commit>/`; reuse matching CI instead of rerunning it at each gate |

`make ready` runs lint, types, unit tests, contract generation, web and Expo-web
builds, deterministic smoke and a report-only bundle-size baseline. It does not run Playwright, native builds, device
journeys, live providers or hosted checks; hosted CI adds PostgreSQL and Playwright.

Evidence records answer "what was verified for this deployed or distributed
commit". Summarize routine checks and failures in the handoff without a new
record per command. Retain logs/diagnostics needed to investigate failures or
verify artifact provenance privately. Application, operator-tooling and evidence
commits are separate identities; never relabel older observations. Documentation
edits alone do not invalidate unchanged application checks or require native builds.

## Native builds

Build sequentially with file-backed logs and fresh capacity checks. Recorded
attempts hit disk/memory prerequisites; no root cause follows from worktree counts
alone. The [runbook](release-runbook.md) holds build and inspection commands.
Pilot acceptance uses signed builds on real devices plus one bounded lost-response
test with `mobile-offline-e2e`, on a declared platform and separate local test
artifact built from the candidate. Collect iPhone device IDs before the signed build.
Retain explicit dispositions of prior findings; other simulator/emulator checks
are optional. The canceled campaign's allowances remain closed.

Before proposing worktree cleanup, inspect dirty/unpushed work, attached tasks,
running processes, artifact/symbol paths, references and other consumers. Reclaim
only the approved scope; preserve useful recovery/evidence. No blanket pruning
or claim of reduced memory use follows from this planning review.

## Instructions, skills and tools

Keep project guidance agent-neutral; `.codex/` holds Codex-only preferences, not
standing delegation requirements. Read applicable nested instructions, including
the generated web guidance and its `CLAUDE.md` consumer.

Prefer the existing npm/uv/Make, CI, generated-contract and artifact-inspection
entry points. Check references and other consumers before retiring tooling;
optional tests are not automatically unused. Add a tool only for a demonstrated
gap that simpler existing capabilities cannot handle well.

Load task-specific skills only when their capability applies. Keep activation
descriptions narrow and supporting references on demand. Project guidance should
state durable requirements rather than session review logs or model promotions.

## Approvals

Before requesting a gated action from [AGENTS.md](../AGENTS.md#approval-gates),
finish the independent preparation and present one complete request: exact
targets, limits, stop conditions and cleanup. After approval, continue through
passing stages without asking again. Routine deterministic failures may be fixed
and retested. A bounded external/native campaign failure does not earn an extra
attempt beyond its approved recovery scope; preserve diagnostics and stop as agreed.

## Hand off

Include the exact base commit and branch, uncommitted changes if any, checks run, evidence for any
gate, residual risks, anything deferred and the next objective. Local completion,
merge, staging acceptance and production activation are distinct outcomes; say
which one was reached.
