# Accepted staging source-review policy

Policy identifier: `staging-source-review-v1`.
Scope: existing isolated staging only. It does not authorize production,
TestFlight/Play distribution, cohort invitations or an increased operating budget.
The owner accepted this policy and the exact 6b9719b report on 2026-09-14.
The [decision record](../evidence/source-review-6b9719b/owner-acceptance.json)
binds the policy, candidate, report digest and two recorded medium risks.

## Evidence contract

Version-one cumulative input keeps the original scan fields and meaning.
Version two adds `environment: staging` and a separate security record with
`kind: source_review`, candidate SHA, embedded report, report hash and owner
acceptance. There is no scan ID or fabricated scan result.

The report contains reviewer identity and UTC time, exact candidate SHA,
reviewed file paths/SHA-256 hashes, assessments of authentication, authorization,
private links, idempotency, provider limits, hosted origins and telemetry,
passing deterministic check evidence hashes, findings/dispositions and limitations.
The validator reads immutable Git blobs from the candidate to verify every file.
Coverage must reference those files; it cannot omit an area or reference unbound
files. These are targeted assessments of named controls, not claims that every
line or attack surface was audited.

Owner acceptance must explicitly bind this policy, the candidate and the exact
report hash, with a sanitized reference to the actual acceptance message. The
report hash is SHA-256 of UTF-8 `JSON.stringify(parsedReport)`; it is not the
hash of pretty-printed JSON bytes. Native inspection receipts have their own
file-byte hash contract. The accepted report digest and its algorithm are unchanged.
Any report/source change requires new matching acceptance. A recorded approval
is an operator attestation, not a digital signature or proof of the person's identity.

Missing/unknown fields, incomplete coverage, tampering, failed checks, unresolved
critical findings or high runtime findings, production scope and missing/mismatched
approval fail validation. Lower findings and limitations remain visible for the
owner's decision. All web/native/association/telemetry/release gates remain required.

## Operator use

The existing cumulative tool automatically selects the evidence contract by its
schema version. An optional `--source-root` selects the local Git object store;
it defaults to the tooling repository. It still contacts only the source-owned
staging readiness origin, after local input validation. There is no offline
substitute for final hosted readiness, and no request is needed to validate the
prepared report itself.

The candidate report and `security.accepted.json` live under
`docs/evidence/source-review-6b9719b/`. The original pending record is retained
as historical preparation evidence. Future report/source changes need their
own concrete acceptance. Do not construct a passing cumulative
input for 6b9719b from older c5b041c native or telemetry artifacts.

## Assurance and limits

This workflow provides traceable primary-agent source review and deterministic
regressions with owner risk acceptance. It does not provide an independent audit,
plugin scan, comprehensive vulnerability guarantee, hosted configuration audit
or replacement-device acceptance. The missing historical scan is not treated
as evidence. The policy removes a mandatory repeat scan for isolated staging
only when the replacement review evidence and owner acceptance are complete.
