# Active packet: shared-content deletion implementation

Owner Brian approved the recommended behavior on September 25 by asking to continue
with it. Root integrates and verifies; Sol delegates own bounded backend and client
changes. Historical shared contribution remains attributed.

- Branch: `codex/deletion-content-implementation`.
- Worktree: `/Users/brianchei/.codex/worktrees/deletion-content-implementation/Tableus-ai-agent-dev`.
- Base: `c87505ca0268f1c5dfec56180313d88e663ee8ba`.
- Prior application: `484632517345e7858f48caf8fa7b128f9d9dab80`; new application SHA will be frozen after implementation.

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
