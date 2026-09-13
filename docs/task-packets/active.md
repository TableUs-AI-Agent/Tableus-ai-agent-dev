# Active packet: cumulative staging acceptance for c5b041c

## Objective and source

Close cumulative staging acceptance for the frozen candidate. Device, live
journey, artifact, association and telemetry verification are complete. The
remaining gate is security-evidence acceptance; no release sign-off is claimed.
This is the only active implementation packet.

Application source: `c5b041c85f4f7b959436c13bef48c959622c624f`.
Evidence branch: `codex/astra-project-reassessment`.
Development uses Astra; application providers remain Gemini and Places.
Evidence descendants stay local because a push would trigger another Preview.
The detailed execution history is [archived](../history/2026-09-13/native-verification-packet.md).

## Accepted evidence

- Local `make ready` passed: 197 JavaScript and 98 Python tests, with three
  Postgres checks subsequently passed in CI. Exact-source CI run `34728044149`
  passed 197 JavaScript/101 Python tests, four browser tests and seven
  deterministic AI cases. No runtime or dependency changes followed this freeze.
- Railway staging deployment `dcccd4a1-cca7-489b-9d7d-81e4019aad0c` and Vercel
  Preview `dpl_9zGVqXpFNQkCzSXBaecR18hqMs2M` use the candidate. Production
  aliases and deployment protection remain unchanged.
- All six native artifacts have verified source/profile/signer/digest receipts
  in durable private storage. Both deterministic lifecycle/offline suites pass.
- One shared journey used three existing approved accounts, two constraint
  submissions, four distinct live candidates and two saved ranked votes.
  Finalize, reopen and link rotation each occurred once. Both native clients
  rejected the old link and passed read-only export/deletion-status checks.
- Physical iPhone and ARM64 Android each have a ten-phase readiness checklist.
  Summaries explicitly combine owner observations with source-runner installation
  evidence; the original interactive runners ended before final reports.
  Android's final current-state observation followed emulator restart.
- Web, iOS, Android and API telemetry delivered at the exact release. PostHog
  counts are 1/1/1/2 respectively. Three Sentry projects show five redacted
  events. Connector/UI evidence is labeled as such; the standalone collector
  was not run. Android's telemetry replacement preserved its session.
- API readiness, canonical association bodies, signed identities, path allowlists,
  auth redirect and invalid-join fallback passed a public recheck with hashes.
  Both simulators are now stopped without wiping data.

[Candidate status](../evidence/c5b041c/native/candidate-readiness-status.json),
[native evidence](../evidence/c5b041c/native/README.md), and
[deployment evidence](../evidence/c5b041c/README.md) bind these claims to their sources.

## Remaining security decision

The [pending cumulative input](../evidence/c5b041c/native/cumulative-readiness-input.pending.json)
contains the accepted components and explicitly missing security evidence.
The unchanged validator rejects it with `security.passed must be true`.
It requires a candidate-bound scan ID, report SHA-256 and zero critical/high
runtime findings. No report, checksum or passing disposition is invented.

The historical focused scan applies to `069473c`, not this candidate, and its
sealed report/digest remains unrecovered. The owner's canceled deep scan stays
canceled. The [attributable source review](../reviews/2026-09-12-security-delta.md)
is an ordinary review and does not satisfy the current scan requirement.
Resolve this through explicitly authorized exact-candidate scan evidence or an
explicitly approved, truthfully implemented staging acceptance-policy change.
Do not start a scan or weaken the validator before that decision.
The [decision brief](../reviews/2026-09-13-security-acceptance-options.md)
describes the unchanged requirement and a proposed staging-only alternative.

## Scope and limits carried forward

The owner authorized one shared live journey, one generation, at most 100 Places
attempts, $0.25 estimated Gemini and six returning sign-in messages. Final
observed usage is 80 attempts and $0.00056825; all six message slots are
conservatively consumed. Existing staging quotas were unchanged. The completed
journey does not authorize a new journey, generation, message or account.

No merge, push, new resources/secrets, production migration/deployment, store
submission, cohort activation, account deletion or destructive cleanup is
implied. Preserve all approved sessions and durable artifacts.

## Queued work and handoff

Before the next client candidate, align device-only sign-out with its current
provider-global behavior, reproduce and remove unnecessary Places detail reads
using deterministic providers, and address native tab glyphs. See the
[live findings](../reviews/2026-09-13-live-readiness-findings.md). Production
privacy, signing/symbolication, distribution and cohort controls remain later
roadmap objectives with their own approval gates.

This checkpoint changes evidence and planning only. Validate JSON, component
sources/digests, evidence privacy and `git diff --check`; do not rerun native
builds, paid providers or the already passed full suite for these document changes.
Handoff includes the evidence commit and the unchanged application source.
