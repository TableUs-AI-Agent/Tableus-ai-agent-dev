# Active packet: staging source-review acceptance

## Objective and authority

The owner asked to avoid another usage-heavy security scan and continued with
preparation of the recommended staging source-review pathway. Build a distinct,
truthful evidence type, targeted review and deterministic rejection checks.
No plugin scan is authorized. This is the only active implementation packet.

Branch: `codex/staging-source-review`, isolated worktree
`.worktrees/astra-project-reassessment`, based on tooling/evidence `5256390`.
Application candidate remains `6b9719b4e63e34803f2e7c2598e45851790df661`.
Hosted staging/artifacts remain `c5b041c85f4f7b959436c13bef48c959622c624f`.

## Acceptance criteria

- Version-one scan evidence remains unchanged. New version-two cumulative input
  accepts only `environment: staging` and an explicit `source_review` record.
- The report identifies candidate, reviewer, date, seven security boundary areas,
  source file digests, passing deterministic checks, findings and limitations.
  Verify file bytes from the exact Git commit, not the current working tree.
- Require an owner acceptance record for `staging-source-review-v1`, bound to
  the exact candidate and parsed-report SHA-256. Keep it pending until the owner
  accepts the concrete report. Hashes detect changes, not reviewer truthfulness.
- Reject missing/unknown fields, file/report tampering, incomplete coverage,
  failed checks, unresolved critical/high runtime findings, production scope
  and absent/mismatched owner acceptance. Preserve every native/web/telemetry gate.
- Run focused tests and one final `make ready`; record source/tooling/evidence
  provenance and the remaining acceptance boundary without inventing scan data.

## Scope and handoff

This is operator tooling and evidence preparation. It neither changes application
runtime/locks/contracts nor approves release. Targeted source review covers the
listed controls; it is not a whole-repository audit or independent verification.
The historical scanner report remains unavailable, and canceled scans stay canceled.

The prepared report and policy need final owner acceptance. The replacement still
needs its own authorized hosted/native verification; do not reuse c5b041c artifacts
as replacement evidence. Production, store and cohort approval stay separate.
No push, merge, deployment, native build, new provider call, message/account,
resource or secret creation, destructive cleanup or scan is implied.

## Completed preparation and next decision

The evidence validator and targeted [candidate report](../../evidence/source-review-6b9719b/README.md)
are prepared. All fourteen focused gate tests pass. `make ready` passed 212
JavaScript and 98 Python tests, with three Postgres-only local skips, plus lint,
types, contracts, web/Expo-web builds and deterministic smoke. The actual report
passes source-file verification; its pending owner acceptance correctly fails.
Historical c5b041c input remains unchanged and blocked on missing security evidence.
Tooling source is `1c75832ef421335662319635e1b74888476cdb77`, distinct from
application candidate 6b9719b. The evidence-only follow-up binds the local checks
and retained log hashes to that tooling commit.

The remaining step in this packet is the owner's decision on the concrete
staging-only policy/report and its two recorded medium risks. After acceptance,
record the actual message reference and matching report hash. The next bounded
packet should scope replacement hosted/native verification around cross-device
sign-out preservation and plan focus/foreground refresh. It must preserve source
provenance and define any required deployment, build and live-operation approvals.

## Closure — 2026-09-14

The owner accepted the linked staging policy, exact 6b9719b report and its two
medium risks. The accepted security record validates; no scanner or external
operation ran. This packet is complete and superseded by the active replacement
verification preparation packet. The original preparation text above is historical.
