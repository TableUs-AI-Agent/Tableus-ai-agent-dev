# Active packet: review and integrate the pilot baseline

## Status and working identity

Priority 1 of the [roadmap](../roadmap.md): prepare the reviewed baseline for
integration. The product direction and September 27 follow-up decisions are
recorded in [decisions](../decisions.md#pilot-follow-up--adopted-2026-09-27).
The cumulative review is prepared with [evidence](../evidence/6dac996/integration.md).
Publication uses repository-local Vercel exclusions for this branch and `main`;
Railway has no current deployment triggers or PR environments. [PR #7](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/7)
is published; its first CI run exposed a Homebrew-specific test wrapper, now
corrected to use `python3` from `PATH`. A full replacement hosted pass and an
explicitly approved merge remain the completion gates.

- Branch: `codex/pilot-realignment`.
- Worktree: `/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/pilot-realignment`.
- Application baseline: `4a2f9ecc37070f434df7fc75c1054d5875f21ba9`.
- Root checkout `codex/privacy-safe-observability` and local `main` are stale;
  confirm actual branch/remote state rather than using them as implementation bases.

## Outcome and sequence

Establish a reviewed, tested baseline on `main` before the focused pilot changes.

1. Inspect actual remote/default-branch state and the cumulative application diff.
   September 27 readback confirms `main` at `e1184ec`, 165 commits behind `6dac996`
   with no divergence. Refresh again before merge. Preserve existing work and
   resolve material review findings in this objective.
2. Prepare one reviewable integration PR with exact base/source, checks and known
   gaps. Review automatic Preview side effects before requesting any needed push
   scope; an integration objective does not itself authorize deployment.
3. Run hosted CI on the proposed source before merge. Restricted-runtime PostgreSQL
   setup and migrations passed in the first run, but later tests were not reached
   after the test-wrapper failure. Fix failures and apply impact-based checks
   from the [workflow](../development-workflow.md).
4. Merge only with Brian's explicit approval. Record the actual integrated SHA and
   matching CI results. Do not merge the separate native diagnostic branch wholesale;
   assess any required helper by its consumers and keep operator provenance distinct.

## Completion

Reviewed baseline on `main`, exact-source hosted CI green (including restricted
PostgreSQL and browser checks), and authoritative state/packet updated. Integration
alone does not accept deployment, native artifacts or pilot operation.

## Following objective: focused pilot experience and measurement

Priority 2 is a separate change after integration:

- Signed-in web/mobile users land on Plans; Plans and Account remain accessible.
  Hide Discover, Friends/People, Review, Taste/Profile and photo surfaces, including
  direct entry. Preserve their code/data, endpoints and export fields.
- Provide mobile Account access before hiding Profile. Preserve invite, auth,
  private Join, privacy, legal and deletion-help navigation and recovery.
- Record `distinct_voter_count` for the active run in `plan.finalized`; preserve a
  validated integer in the range 0–8 through account deletion's strict payload
  allowlist independently of whether its candidate or run still exists, without
  retaining voter identities or arbitrary payload fields.
  Cover zero/one/multiple voters, vote updates, deleting the finalizer/another
  member, removal of the recorded candidate/run and missing/invalid old fields.
  The removed-candidate/run test must still count the earlier finalization.
  Validate a read-only query that counts
  each eligible plan once across reopen/re-finalize and reports deletion-related
  coverage gaps. Do not reconstruct missing historical counts from current votes.
- Preserve organizer finalization discretion; no new quorum or ranking feature.

Completion: focused navigation/recovery, audit-count/cleanup and measurement
checks, shared-plan browser checks, one `make ready` and CI. Update the lifecycle
contract for the new safe event field when its implementation changes. Application
changes produce a replacement candidate for later acceptance.

## Boundaries and dependencies

The integration packet does not authorize Priority 2 implementation or later
release actions. Secrets, resources, migrations, deployments, signed pilot builds,
real invitations and destructive cleanup retain the [approval gates](../../AGENTS.md#approval-gates).
Do not resume the canceled simulator/security campaigns or reuse spent allowances.
The [pilot checklist](../release-readiness-checklist.md) defines later acceptance;
Priority 3 includes approved deletion activation and synthetic rehearsal, and
Priority 4 requires the private iPhone roster before its signed build.
