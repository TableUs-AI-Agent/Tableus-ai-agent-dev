# Capability-link review handoff

The [decision packet](../capability-link-decision.md) is complete. This is a
read-only application review, with documentation changes only. Brian is the
current sole development owner; historical shared attribution is preserved.

- Branch/worktree: `codex/capability-link-review` /
  `/Users/brianchei/.codex/worktrees/capability-link-review/Tableus-ai-agent-dev`.
- Review base: `72e8ba137350b7a73b3dbd288a541039e35d5d52`.
- Unchanged application/operator: `29edb5e9f47ab7ac74034f2bac5e271a162ea620`.
- [Source manifest](../evidence/capability-link-review-2026-09-24/manifest.json)
  binds 30 repository files and two native-task evidence files.

Recommendation: keep approved-member private-link sharing, move the secret into
a URL fragment, hold it briefly in client memory, clear navigation state and use
the existing authenticated explicit Join API. No intermediary ticket service,
new admission endpoint or database change is justified for this scope. Existing
provider-free revision reads can recover ambiguous membership outcomes. Native
fragment capture and signed-out return need implementation; emitting fragment
links before compatible mobile readers are accepted would break older clients.

One owner question remains pending: preserve current approved-holder sharing or
require named recipients/organizer approval. The former is recommended; neither
silence nor this documentation commit authorizes a new product policy. The packet
contains the concrete next local implementation and later release criteria.

Fresh verification is documentation-only: source/manifest hashes, references,
local link existence and changed-file scope. Astra and Sol performed bounded source
review; no tests/builds, application edits, database work, providers, real invite
or native/hosted actions were executed. Prior full readiness belongs exclusively
to application 29edb5e (193 Python/314 JavaScript), not to the proposed design.

Native task 01a0c678-55c8-7cc0-a3cb-e3200776906a remains separate. Latest inspected
native HEAD f044c925 records C7 stopping before UI, no remaining allowance and no
C8 authority; local diagnostic verification does not complete native acceptance.
No retry, environment replacement or budget extension is implied. September 30
and all release/merge/deployment/store/cohort gates remain unchanged.

Next: after the owner sharing-model choice, start a bounded isolated local
implementation from this documentation descendant with application 29edb5e.
Keep native execution and release rollout under their own prepared approval scope.
