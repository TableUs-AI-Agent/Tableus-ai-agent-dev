# Active packet: focused pilot experience and measurement

## Status and working identity

Priority 2 of the [roadmap](../roadmap.md) is implemented; local readiness and browser checks pass; hosted CI is pending.
The product direction and September 27 follow-up decisions are
recorded in [decisions](../decisions.md#pilot-follow-up--adopted-2026-09-27).
Priority 1 is complete: Brian approved [PR #7](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/7),
merged as `8ae3c94eb3e41b87f0840cd5aa2b0827c0882af4`. Its tree matches
`97c3c65`, which passed [hosted CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36298539456).
The [integration evidence](../evidence/6dac996/integration.md) records review,
test-only repairs, validation limits and unchanged deployments.

- Current branch: `codex/pilot-experience-measurement`, created from the approved merge.
- Worktree: `/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/pilot-realignment`.
- Base for the next change: `8ae3c94eb3e41b87f0840cd5aa2b0827c0882af4` on `origin/main`.
- The eight pre-existing documentation closeout changes are preserved on this branch.
- Root checkout `codex/privacy-safe-observability` and local `main` are stale;
  confirm actual branch/remote state rather than using them as implementation bases.

## Outcome and scope

Make the shared-plan experience and completion measurement match the agreed pilot.

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

## Sequence and completion

1. Provide mobile Account access, then focus both clients' navigation and landing
   routes on Plans/Account while preserving the recovery and legal paths above.
2. Add the finalization count and its strict deletion-cleanup allowlist/test coverage.
3. Validate the bounded measurement query and user journeys against those changes.

Completion: focused navigation/recovery, audit-count/cleanup and measurement
checks, shared-plan browser checks, one `make ready` and CI. Update the lifecycle
contract for the new safe event field when its implementation changes. Application
changes produce a replacement candidate for later acceptance.

Local `make ready` passed once: 202 Python tests with 36 PostgreSQL-only skips,
326 JavaScript tests with zero skips, lint/types, generated contracts, web and
Expo-web builds, deterministic smoke and report-only bundle baseline. No migration
or dependency change. The [measurement procedure](../pilot-measurement.md) documents
the tested bounded query and accepted coverage gaps. Hosted CI must cover the
PostgreSQL checks before handoff. All five shared-plan/navigation browser journeys,
five account/deletion-help recovery cases and four private-Join cases pass locally
with Chrome. Initial local plan-detail responses timed out using the existing dev
cache; the unchanged application passed after preserving that cache and starting
a fresh one. Keep the diagnostics; this is not an application defect fix.

## Boundaries and dependencies

The completed integration is not staging/native acceptance. Repository configuration
now excludes this objective branch, `codex/pilot-realignment` and `main` from Vercel
Git deployment. Read-only preflight confirms Railway has no deployment triggers or
PR environments. Recheck before any gated release action. Do not merge the separate native
diagnostic branch wholesale or reopen its closed allowances.

Secrets, resources, migrations, deployments, signed pilot builds,
real invitations and destructive cleanup retain the [approval gates](../../AGENTS.md#approval-gates).
Do not resume the canceled simulator/security campaigns or reuse spent allowances.
The [pilot checklist](../release-readiness-checklist.md) defines later acceptance;
Priority 3 includes approved deletion activation and synthetic rehearsal, and
Priority 4 requires the private iPhone roster before its signed build.
