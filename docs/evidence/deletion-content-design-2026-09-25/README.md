# Shared-content deletion design evidence

September 25, 2026. Base `e2b9577f810fdd9b8933bdfb0155e61c34146195`;
unchanged application `484632517345e7858f48caf8fa7b128f9d9dab80`.

[Decision/implementation packet](../../deletion-content-design.md) maps persisted
fields, contributor provenance, legacy ambiguity, transaction/replay ordering,
client recovery and completion cases. [Snapshot](source-snapshot.json) binds
14 source files and the targeted Vercel 404. [Verification](verification.json)
records docs-only checks.

Root reviewed write/read/export/cache paths. Sol independently reviewed provenance,
legacy attribution and concurrency; root corrected the initial delegate assumption
that votes cascade with a run (they do not). No application test was executed,
so race and stale-replay concerns are source-supported design findings, not a
reproduced exploit or fresh runtime result. This is not a restarted security scan.

Owner's behavior choice remains pending. No implementation, builds, services,
native tooling, hosted mutations, real account deletion, provider/Auth calls,
Notion/Notes writes, new resources/secrets or deployment occurred. Exact application's
prior readiness evidence remains historical and unchanged.
