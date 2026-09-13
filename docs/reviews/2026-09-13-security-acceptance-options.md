# Remaining staging security decision

Candidate: `c5b041c85f4f7b959436c13bef48c959622c624f`.
Device, live-journey, artifact, association and telemetry checks are complete.
The [assembled input](../evidence/c5b041c/native/cumulative-readiness-input.pending.json)
keeps unavailable security fields explicitly empty. The unchanged validator
rejects it with `security.passed must be true`.

The historical focused scan belongs to `069473c`; its sealed report/digest has
not been recovered. The later deep scan remains canceled at the owner's request.
The [recorded source delta](2026-09-12-security-delta.md) is an ordinary review.
None of these facts establishes a passing scan for this candidate.

## Preserve the exact-candidate scan requirement

Keep the validator unchanged and cumulative sign-off incomplete until an
explicitly authorized scan supplies the exact source SHA, retrievable report,
report checksum and zero critical/high runtime findings. The earlier cancellation
does not authorize restarting a job or a replacement scan. Agree scope and usage
limits before any new scan. If the queued client fixes will produce a replacement
candidate, scanning that final candidate avoids paying to repeat the same gate.

## Proposed alternative: an explicit staging review pathway

This is a proposal only; no policy or validator change has been applied.
Owner approval would authorize preparing a distinct source-review evidence type
for isolated staging with these requirements:

- Exact candidate SHA, review scope and reviewed-file hashes, reviewer identity,
  a retained review report and its checksum.
- Explicit distinction between direct source observations and inherited scan
  claims; the unrecovered historical report remains labeled as unavailable.
- Coverage of authentication and organizer boundaries, private links, idempotent
  replay, provider budgets, hosted origins and telemetry privacy.
- No unresolved critical/high runtime findings in the reviewed scope; findings
  and limitations remain visible instead of being converted into a scan result.
- Explicit owner acceptance tied to that candidate and review report. A changed
  candidate or report invalidates the acceptance record.
- Deterministic validation that missing scope, hashes, acceptance or required
  findings disposition cannot pass. Existing scan evidence remains a separate type.
- Staging-only applicability. Production, store submission, cohort activation,
  and their security/operating decisions retain their separate gates.

The current source-delta document alone would not automatically pass this new
pathway. Its required review, evidence and acceptance would still need to be
completed. This path provides a different form of assurance and would change
the repository's current acceptance rule, so it requires an explicit owner decision.

The confirmed device sign-out mismatch and unnecessary Places detail reads are
queued in the [live findings](2026-09-13-live-readiness-findings.md) for the next
client candidate. No additional live generation or message is needed to prepare
those fixes with deterministic tests.
