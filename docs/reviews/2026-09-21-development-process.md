# Development process reassessment — September 21

Continue the frozen staging candidate to closure, then use a fresh task for the
next bounded objective. Preserve the architecture and completed verification.
This review examined the previous task's recent owner exchanges, repository
worktrees, source-of-truth documents, release procedures and candidate evidence.
It is a process/evidence review, not a new exhaustive code or security audit.

## Findings and changes

| Finding | Consequence | Change |
| --- | --- | --- |
| Root checkout and historical worktree handoff pointed to superseded work | A new task could branch from stale application code | New `codex/staging-closeout` worktree from `33d79b6`; explicit identity table and active worktree |
| Four current documents grew to roughly 1,800 lines with repeated, contradictory status | Large intake cost and unclear remaining work | Preserve exact snapshots, condense to about 300 lines, keep observations in one candidate matrix |
| Last turn hit the usage limit with four uncommitted evidence files | Passed link checks and partial session work could be lost | Hash-recorded recovery copies; old worktree preserved; owner confirms the unanswered Android observation |
| Release checklist/runbook named multiple older candidates | Incorrect gates or unnecessary rebuilding | Point current procedures at f94a1d9; preserve older evidence without promoting it |
| Each small live step accumulated another status entry across documents | More commits/context without a clearer outcome | Commit at meaningful phases; update current state in place; detailed journal is historical |
| Artifact, operator and evidence identities were easy to conflate | Evidence-only edits could trigger redundant expensive verification | Explicit impact-based checks and exact-source artifact reuse; distinguish fresh from retained checks |
| Telemetry companion events and full-plan hydration exhausted small phase estimates | Repeated approval amendments and stopping mid-journey | Cost the complete phase and companion events first; maintain baseline/amendments and remaining shared allowance |
| There was no short task exit/entry contract | Every fresh conversation required rediscovery | One feature/fix per task, compact commit-based handoff, preserve unresolved scope in the same task |
| Developer-toolchain exception expires September 30 | Closing staging alone does not clear release obligations | Make targeted dependency/reachability assessment the next bounded objective, before privacy and distribution work |

## Acceptance and limits

All six retained artifacts match their source/lock/receipt/inspection hashes.
The accepted f94a1d9 source review validates. Fresh `make ready` passes (226
JavaScript, 98 Python, three local PostgreSQL skips); generated contracts have
no drift. Public health still reports f94a1d9, and association bodies match.
No native rebuild, scan, deployment or paid-provider operation was requested.

The pending cumulative input deliberately fails while Android token renewal is
unproven. The owner confirms its relaunch and account read; Supabase reconciliation
is blocked by connector permissions. The unexplained simulator AppHang remains
an explicit risk with a concrete proposed disposition, not an inferred fix.

The workflow bounds context and avoids repeated work. It does not assert an
exponential cache-pricing relationship or a measured billing improvement.
See [workflow](../development-workflow.md), [current state](../current-state.md)
and [active packet](../task-packets/active.md) for the ongoing objective.
