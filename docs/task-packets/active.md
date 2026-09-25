# Active packet: capability-link design review

Owner: Brian, sole developer at this stage; historical shared attribution stays.
Authorized outcome: the recommended bounded read-only capability-link decision
packet, based on source and current native evidence. No implementation execution.

## Identities

- Branch: `codex/capability-link-review`.
- Worktree: `/Users/brianchei/.codex/worktrees/capability-link-review/Tableus-ai-agent-dev`.
- Exact base: `72e8ba137350b7a73b3dbd288a541039e35d5d52`.
- Unchanged application/operator source: `29edb5e9f47ab7ac74034f2bac5e271a162ea620`.
- Prior [invite handoff](../handoffs/2026-09-24-recipient-invites.md).
- Native task: `01a0c678-55c8-7cc0-a3cb-e3200776906a`, Prepare native replacement
  validation. Its latest inspected worktree HEAD is
  `f044c925d216c9caad201b2c4425bad878c0472c`; native application remains `8972865`.

## Scope and acceptance

Trace link creation, client navigation/authentication, joining, rotation, storage,
telemetry and logging boundaries. Compare alternatives, recommend a concrete
scope, identify consequential product choices and define implementation/acceptance
steps. Astra owns backend review, synthesis and source verification; bounded Sol
read-only work traces web/mobile paths. No broad security scan is authorized.

Only documentation changes in this isolated worktree. No application edits,
tests/builds, database/server runs, native tools/devices, hosted checks or CI,
provider/Auth calls, invitations, deployments, merges/pushes, Notion edits or
cleanup. Existing native limits and September 30 boundary are unchanged.
Validate document links, evidence/source hashes and docs-only diff; reuse earlier
application checks only at their original exact source. Do not claim runtime
proof for this design. Local implementation may be proposed after the product
choice; native release validation remains separately owned and gated.

## Status

Review packet complete. [Proposed design](../capability-link-decision.md) and
[evidence manifest](../evidence/capability-link-review-2026-09-24/manifest.json)
record current behavior, alternatives, a small implementation sequence and release
dependencies. The approved-members versus named/organizer-approved plan-sharing
question is pending; current behavior is the recommendation, not a new owner
decision. No implementation was performed. A later local implementation objective
can follow the choice; native/hosted acceptance is a separate gated stage.
