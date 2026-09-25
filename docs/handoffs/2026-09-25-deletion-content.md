# Shared-content deletion — local implementation handoff

Completed September 25, 2026. Brian owns current development and product decisions;
TableUs remains a shared historical project. This objective contributes authored
content provenance, transactional cleanup, response replay protection and client
recovery to Brian's portfolio. Root integrated/reviewed/verified; bounded Sol
agents implemented backend and platform changes. No other developer's historical
work is reassigned.

## Exact source

- Branch: `codex/deletion-content-implementation`.
- Worktree: `/Users/brianchei/.codex/worktrees/deletion-content-implementation/Tableus-ai-agent-dev`.
- Base: `c87505ca0268f1c5dfec56180313d88e663ee8ba`.
- Application: `72c592b511bba6b74bba2521524c6111b9cf5916`.
- Verification: `390cd2f7531dbc955317556b3693546ee3eadead`; only a mobile test
  assertion changes after application freeze. Application bytes are identical.
- Subsequent handoff commit changes documentation/evidence only. Use its Git
  identity for the complete handoff, keeping application and verification SHAs
  above unchanged. No merge or push occurred.

## Observable result

After transfer and account deletion, collaborators keep their shared plan and
own inputs. Both deletion APIs remove departing-account authored title/location,
dependent historical/current recommendation runs, their candidates and votes, and
free-text event payloads authored by that account. Affected active/finalized plans
return to collecting. Proven independent runs survive. The organizer explicitly
repairs removed metadata and requests new recommendations; participants vote anew.
No provider operation runs automatically during deletion or repair recovery.

New writes record metadata author/version, run requester/location provenance and
all participant dependencies. Sorted plan locks serialize cleanup with generation
and overlapping deletions. Cleanup and application deletion commit atomically;
full deletion retains the existing durable Auth-removal recovery semantics.

Committed deletion invalidates response bodies in the current API process and
fences late response insertion/delivery, including a deletion across final lock
release. Consumed idempotency keys remain; stale replay returns
`409 idempotency_content_changed` and requires a fresh read without repeating the
write. Clients reset obsolete voting intent, preserve remaining constraint drafts,
and reject location results for a query the organizer has since changed.

## Verification and evidence

[Results and hashes](../evidence/deletion-content-implementation-2026-09-25/README.md)
record fresh versus reused checks, commands, the initial failure and its repair.

- One `make ready` passed lint/types, then stopped on the outdated six-action
  mobile assertion. The two new repair actions make eight; the corrected assertion
  checks all routes and explicit keys. Focused checks passed, followed by
  `make test contract build smoke perf` for the remaining stages.
- **214 Python and 313 JavaScript tests passed, zero skips**, including PostgreSQL
  lock orderings, overlapping deletion, private grants, provenance, cleanup/export,
  actual deletion endpoint replay invalidation and final-release race regressions.
- Generated API contract has no drift. Next production build, Expo web export and
  deterministic smoke passed. Bundle size is report-only, not performance approval.
- **Three mocked Chrome journeys passed against the production web build**;
  mobile component checks include metadata repair, stale-response refresh and
  normal vote-success feedback. No native-device acceptance is claimed.
- Fresh migration and populated predecessor upgrade passed locally. The latter
  preserves existing records and marks unknown provenance; it does not bulk-delete.
- Independent review's final-lock-release issue was fixed and regression-tested;
  no concrete unresolved implementation finding remained within the stated scope.
- Task-owned PostgreSQL and web services are stopped; logs/builds/synthetic data
  remain in durable private worktree artifacts. Ports 55937 and 3404 are closed.

## Release limits and residual work

1. Apply `9a1f2e7c4b80` only in an approved migration scope, prove hosted private
   grants/exposed-schema configuration and deploy compatible repair clients.
   Full-account deletion remains off by default; no hosted activation occurred.
2. Legacy migration intentionally preserves old data as unknown. Current-member
   deletion conservatively removes affected unknown content; already-deleted
   historical contributors can be unidentifiable. Inventory and scope real legacy
   remediation before rollout; no bulk cleanup or false complete-erasure claim.
3. Replay coordination is bounded and process-local. Retain one API process until
   durable coordination exists; expiry, eviction or restart removes consumed keys.
   Already delivered/offline bytes cannot be recalled. Independently authored
   mentions by other people are not comprehensively identified by this cleanup.
4. Rebind the prior `4846325` cumulative staging plan to this application and add
   affected deletion/repair journeys before execution. Native task
   `01a0c678-55c8-7cc0-a3cb-e3200776906a` retains its campaign and limits. Its last
   recorded C9 preparation is historical, not freshly rechecked here. No native,
   provider, September 30 dependency or deployment allowance was extended.
5. Production environment/link transition/signing choices, TableUs Vercel access,
   retention durations, actual provider/backups handling and secure support/external
   deletion completion remain open. Local code does not accept a distributed beta.

No builds of native artifacts, simulator/device work, live Auth/Places/AI/telemetry,
real account cleanup, hosted migrations/configuration, resource/secret provisioning,
deployments, store submissions, merge/push, shared Notion/Notes changes or canceled
security scans were performed. Web/Expo-web builds were local deterministic checks.

## Recommended next step

Implement a bounded external account-deletion request page and web/mobile explanatory
parity, with a concrete support verification and pending/attention/completion
procedure. Brian already owns support and development; no developer assignment
question is needed. Retain current contacts, do not collect credentials or private
links, do not fabricate retention periods, and preserve the in-app flow.

The consequential remaining inputs are an enforceable support response/completion
target and approved retention purposes/periods grounded in actual host/provider
settings. Prepare the concrete copy/procedure before asking for those decisions;
publication, real support messages and deletion operations remain separately gated.
Use a fresh task from this exact unmerged handoff when requested. No additional
objective was started by this completion.
