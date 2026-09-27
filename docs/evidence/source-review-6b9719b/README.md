# Staging source review: accepted

The owner accepted this targeted review on 2026-09-14 for the existing isolated
staging environment, with the two medium risks below retained. The security
review requirement is satisfied for this candidate. This does not approve
deployment, native builds, live operations, production, store distribution or
cohort expansion.

## Exact decision

- Policy: [`staging-source-review-v1`](../../reviews/2026-09-14-staging-source-review-policy.md).
- Application candidate: `6b9719b4e63e34803f2e7c2598e45851790df661`.
- Report: [`review.json`](review.json).
- Parsed-report SHA-256: `046bba5a771112ef1e49888b6a09235f9c6d259b757b81f90f85607785795122`.
- Owner acceptance: **accepted** in [`security.accepted.json`](security.accepted.json).
- Actual decision and verification: [`owner-acceptance.json`](owner-acceptance.json),
  recording the owner's direct reply, “accept,” in the referenced Codex turn.
- Operator tooling commit: `1c75832ef421335662319635e1b74888476cdb77`;
  [local validation and file/log hashes](local-validation.json). This is separate
  from the application source above.

The report digest hashes UTF-8 `JSON.stringify(parsedReport)`, not the raw
pretty-printed file. A later source/report change needs new matching acceptance.
The recorded confirmation binds the policy, full candidate SHA, report hash
and recorded risks. The report itself is unchanged. The original
[`security.pending.json`](security.pending.json) and local validation record
remain historical preparation evidence; they are superseded by the accepted
record for the current decision.

## Findings and limits

| Open risk | Severity | Existing controls and boundary |
| --- | --- | --- |
| One approved participant can consume shared provider limits. | Medium | Per-minute limits and rolling ceilings constrain spend. Add durable per-actor quotas before cohort expansion. |
| Private join capabilities remain in URLs and can be copied from history or sharing. | Medium | Approved authentication, random hashed tokens, rotation and telemetry redaction reduce exposure. Capability exchange or an explicit production risk decision remains deferred. |

The primary agent reviewed named authentication, authorization, private-link,
idempotency, provider-limit, hosted-origin and telemetry controls in eleven
source files. Every reported file hash matches its Git blob at the candidate.
No unresolved critical or high runtime finding was identified in those reviewed
controls. This was a targeted source review, not a plugin scan, independent audit
or comprehensive vulnerability assessment. The report lists the exact scope
and remaining limitations.

The [candidate's local verification](../device-session-plan-refresh/local-validation.json)
passed 204 JavaScript and 98 Python tests; three Postgres-only checks skipped
locally. The new evidence tooling separately passed fourteen focused gate tests
and `make ready`: 212 JavaScript and 98 Python tests, three local Postgres skips,
lint, types, contracts, web/Expo-web builds and deterministic smoke.
The candidate-check evidence hash in the report is the SHA-256 of the linked
candidate validation file's raw bytes. It is a retained attestation pointer;
the evidence validator does not re-run or independently prove those tests.

The accepted security record passes local validation, including all eleven
source-file hashes and the report/approval binding. The original pending
record still fails acceptance. Version-one records and every
web/native/association/telemetry/release gate remain required under their
applicable schema. No existing c5b041c evidence was relabeled or changed.

## Work still required

The [active packet](../../task-packets/active.md) scopes replacement hosted/native verification.
The corrected app still needs real cross-device sign-out preservation and
focus/foreground refresh observations at its own source. Deployed staging and
accepted native/telemetry artifacts remain at
`c5b041c85f4f7b959436c13bef48c959622c624f`.
No cumulative release acceptance follows from the review alone.

No scanner, live-provider operation, sign-in message, native build, deployment,
resource/secret creation or destructive cleanup ran during this objective.
