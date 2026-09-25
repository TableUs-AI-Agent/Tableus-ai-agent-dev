# Active packet: shared-content deletion design

Owner: Brian, sole developer at this stage; preserve historical shared attribution.

- Branch: `codex/deletion-content-design`.
- Worktree: `/Users/brianchei/.codex/worktrees/deletion-content-design/Tableus-ai-agent-dev`.
- Base: `e2b9577f810fdd9b8933bdfb0155e61c34146195`.
- Unchanged application: `484632517345e7858f48caf8fa7b128f9d9dab80`.

## Outcome

[Implementation decision packet](../deletion-content-design.md) is prepared:
field ownership, all-contributor run provenance, legacy ambiguity, explicit vote/
pointer cleanup, generation/deletion serialization, stale-response replay fencing,
metadata replacement and client recovery. Root owns final design; Sol supplied
bounded source review. No implementation or tests were performed.

The concrete product question is pending: preserve shared plans and remaining
members' inputs, but remove dependent results and require new recommendations/
votes, with replacement title/location where needed. This changes the earlier
candidate-preservation expectation and cannot be assumed approved. Proposed
legacy remediation also needs its actual scope approved before data mutation.

Targeted Vercel retrieval of the saved TableUs project ID returns 404. It does not
justify creating a replacement project. Production/staging choice and exact target
bindings remain independent prerequisites for production trust implementation.

## Next

After the behavior choice, implement this packet in a bounded isolated objective,
including migration classification, shared cleanup service, replay fencing, client
metadata recovery and meaningful PostgreSQL/component checks plus one make-ready.
Prepare any actual legacy cleanup as a separately reviewable gated operation.
Do not merely alter the notice or erase a cache and retry successful writes.

Native task `01a0c678-55c8-7cc0-a3cb-e3200776906a` retains all native work.
No new native status/allowance is inferred here; the prior snapshot remains
historical. No new user-owned Codex task was created.

## Verification and limits

[Source snapshot and docs verification](../evidence/deletion-content-design-2026-09-25/README.md).
No builds/tests/services/simulator/device use, live Auth/providers, secrets,
resources, hosted writes/migrations, deployments, merge/push, store submission,
real invitations/deletion, Notion/Notes operation or destructive cleanup.
No retention duration, production target or changed deletion behavior approved.
