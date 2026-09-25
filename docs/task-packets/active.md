# Active packet: shared-content deletion implementation — locally complete

Owner Brian approved the recommended behavior on September 25 by asking to continue
with it. Root integrates and verifies; Sol delegates own bounded backend and client
changes. Historical shared contribution remains attributed.

- Branch: `codex/deletion-content-implementation`.
- Worktree: `/Users/brianchei/.codex/worktrees/deletion-content-implementation/Tableus-ai-agent-dev`.
- Base: `c87505ca0268f1c5dfec56180313d88e663ee8ba`.
- Application: `72c592b511bba6b74bba2521524c6111b9cf5916`.
- Verification source: `390cd2f7531dbc955317556b3693546ee3eadead`; only the mobile safeguard assertion differs.
- [Completed handoff](../handoffs/2026-09-25-deletion-content.md) and [evidence](../evidence/deletion-content-implementation-2026-09-25/README.md).

## Completed result

Approved behavior is implemented and locally verified: 214 Python / 313 JavaScript
tests with zero skips, lint/types, generated contract, Next production build, Expo
web export, deterministic smoke and three production-build mocked Chrome journeys.
Initial make-ready stopped at a stale six-action assertion; the test-only repair
and all remaining stages passed. Task-owned services are stopped and artifacts
retained. No implementation work remains in this packet; integration and release
gates remain separate.

## Outcome and scope

Implement [the deletion design](../deletion-content-design.md): preserve shared plans
and remaining member inputs, remove departing-account authored metadata and dependent
recommendation results, reset affected voting/finalization, and enable explicit
organizer metadata repair. Track all participant/query/location provenance; classify
unknown legacy records conservatively. Apply shared cleanup to both deletion APIs.
Fence cached response bodies while preserving consumed idempotency keys. Update
web/mobile recovery and deletion copy and meaningful regression checks.

Root owns replay middleware/cache, integration, verification and final handoff.
Backend delegate owns models/migration/cleanup/API and focused backend checks.
Client delegate owns domain types and web/mobile UI/checks. No delegate runs full
readiness or native validation. Root runs focused checks then one make-ready and
records exact-source evidence. Local deterministic PostgreSQL services/data and
web/Expo-web readiness builds are within this implementation objective.

## Boundaries

No native build/simulator/device work, live Auth/Places/AI/telemetry, hosted changes,
production migrations, resource/secret provisioning, deployment, store submission,
merge/push, real account deletion/invites, bulk legacy cleanup, Notion/Notes edits
or renewed security scans. Native task 01a0c678-55c8-7cc0-a3cb-e3200776906a retains
its own artifacts, campaign and limits. Environment choice, production target access,
retention durations and real legacy remediation remain separately gated.

## Recommended next bounded objective

Prepare the external account-deletion request page and matching web/mobile
explanation against implemented behavior, plus a concrete support verification,
pending/attention/completion procedure for Brian. Use current contacts, preserve
in-app deletion, and do not invent retention durations or send real requests.
Resolve enforceable retention/support targets and actual provider/backup settings
before publishing a completed policy. Start in a fresh task from the verification
source plus this documentation/evidence handoff, preserving the unmerged branch.
Do not start from the stale saved checkout. No new task or gated action is
created/authorized by this handoff itself.
