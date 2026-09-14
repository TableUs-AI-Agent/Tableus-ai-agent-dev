# Closed-beta readiness checklist

Reviewed 2026-09-14. Deployed staging source:
`c5b041c85f4f7b959436c13bef48c959622c624f`.
The owner-approved push, CI and existing Railway staging/Vercel Preview
deployment are verified in [deployment evidence](evidence/c5b041c/README.md).
Historical live-smoke/native/scan observations keep their original source
associations and do not certify the replacement.
A historical confirmation is not a fresh test or a new owner signature.

## Candidate acceptance

- [x] Public CI verified for `c5b041c`: run `34728044149`, including all three
  Postgres migration assertions and four browser tests.
- [x] Public Railway readiness rechecked on 2026-09-12 at the exact candidate.
- [x] Vercel Preview READY at the exact candidate; production target/aliases
  and deployment protection preserved. Both new Preview URLs and both existing
  origins pass CORS; an unrelated origin is rejected.
- [x] Historical `daa89a0` two-user live Places/Gemini report recovered.
- [x] Current-candidate real-session web/native journey accepted under its
  applicable auth/provider scope; old smoke is not relabeled.
- [x] Canonical fallback and association bodies rechecked for native acceptance;
  [public response and manifest hashes](evidence/c5b041c/native/public-readiness-recheck.json) retained.
- [x] All six current native artifact/inspection/receipt pairs accepted with
  source/profile/signer/checksum verified in the [artifact matrix](evidence/c5b041c/native/artifact-matrix.json).
- [x] Both deterministic lifecycle/offline journeys pass at the selected source.
- [x] Web, physical-iPhone and ARM64 Android staging journeys pass together.
  Native summaries explicitly assemble owner observations with verified
  installation evidence; original interactive runners ended before final output.
- [x] Separate telemetry-test evidence is bound to the exact selected release.
  [All four platforms delivered](evidence/c5b041c/native/telemetry-staging-summary.json)
  through explicitly attributed owner, connector and Sentry UI observations.
- [x] The reproduced credential-wait deadline gap is fixed locally, with shared
  API tests and mobile restoration/retry/stale-result component tests.
- [x] The [source delta](reviews/2026-09-12-security-delta.md) identifies the
  historical scan and subsequent changes without relabeling the old scan.
- [x] Security evidence acceptance for replacement 6b9719b is resolved. The owner
  accepted the distinct
  staging-only [source-review policy and report](evidence/source-review-6b9719b/README.md)
  on 2026-09-14, including the two medium staging risks; its exact-source
  security record passes validation. This does not accept c5b041c security. The legacy
  version-one scan contract retains its original meaning.
- [ ] Cumulative evidence validator accepts an honestly sourced evidence set.
  The [pending input and component hashes](evidence/c5b041c/native/candidate-readiness-status.json)
  are assembled for c5b041c; validation still rejects their missing security
  evidence. Older native/telemetry artifacts cannot complete the 6b9719b input.

## Implemented controls and recorded owner confirmations

The source contains approved-profile/organizer checks, bounded body/admission
work, bounded JWKS caching, idempotent replay checks, strict hosted origins,
private query state, provider validation and telemetry scrubbing. `c5b041c` CI
passed. This is not a new security certification.

Owner legal/privacy and attribution approval, delivery to support and privacy
mailboxes, and rollback ownership were recorded on 2026-08-26. Preserve those
confirmations unless their scope changes. Do not ask for identical approvals
again merely because an agent or coding model changed. The prior checklist also
records the staging verification-code template correction and expired unused
invites; no mail or invite operation was repeated in this review.

The last completed focused scan is `528a703f-7ff1-4505-828d-1a8b1de1fdc5`, for
`069473c24e7921e5b4b2ad51faa04e71899721ad`. The deep scan
`2482f6f3-b05c-4c40-bc9f-e5d5a0ec41a0` remains canceled at the owner's request.
Do not start any new plugin scan without explicit authorization. Preserve the
actual source/report association and review only the relevant later delta.

## Residual-risk register

The following controls and exceptions are carried forward from the prior
record. Dependency counts are historical observations, not a fresh advisory
query. Recheck current advisory reachability before production/store approval;
the existing exception expires on 2026-09-30 or before that approval.


| Risk | Current control | Owner / expiry | Production effect |
| --- | --- | --- | --- |
| Deployed c5b041c device sign-out uses the provider's global default. | The local replacement explicitly selects local scope, clears local state after success and reports failures; deterministic SDK-boundary tests pass. | Repository owner; verify another device's session on the authorized replacement build. | Local correction prepared; existing deployed artifacts do not contain it. |
| Every full plan response hydrates live Places details; historical subsequent reads consumed 72 attempts. | The local replacement unsubscribes hidden routes and removes duplicate auth-driven foreground invalidation. Deterministic request-count tests pass; hard provider ceilings remain unchanged. | Repository owner; verify native focus/navigation on replacement artifacts. Individual historical read triggers remain unproven. | Visible reads/mutation responses still hydrate provider data. Verify corrected behavior before cohort/budget expansion. |
| The full developer dependency graph reports four high, 19 moderate, and one low advisory through the local EAS CLI/Expo build toolchain; the production graph has zero critical/high findings and 12 moderate Expo build-chain findings. | EAS CLI is locked exactly at `23.2.0`, SDK 57-compatible packages are fully patched, Expo Doctor passes, release inputs are inspected, and no forced audit rewrite or unsupported SDK downgrade is accepted. Recheck upstream patches and audit reachability on every release packet. | Repository owner; exception expires 2026-09-30 or before any production/store approval, whichever is earlier. | Blocks production if unresolved or newly runtime-reachable; does not block isolated staging while the shipped runtime graph remains free of critical/high findings. |
| Idempotency response cache and paid-operation reservation locks are process-local. | Single Railway API process; explicit retry UX; verified-subject/role replay; fixed entry, byte, request, and response bounds; request fingerprints; conservative rate/spend limits. | Repository owner; replace before horizontal scaling. | Horizontal scaling is blocked until durable coordination exists. |
| Private-plan capability remains in the canonical join URL query. | Approved authentication is also required; tokens are random, hashed at rest, rotatable, redacted from telemetry/evidence, and old links are rejected after rotation. | Repository owner; design a short-lived exchange before production. | Production is blocked on a reviewed exchange or explicit risk acceptance. |
| Aggregate provider usage is readable by any approved beta profile. | Output excludes identities, queries, coordinates, Place IDs, provider content, prompts, responses, and credentials. | Repository owner; add an operator boundary before cohort expansion. | Does not block isolated staging; cohort expansion is blocked until resolved. |
| A bearer of a reusable invite can repeatedly renew one email reservation until invite expiry. | Closed beta issues one-use invites to named recipients, reservations expire, redemption is email-bound, and approved profiles cannot consume a different invite. Do not issue multi-use cohort invites. | Repository owner; redesign as server-bound recipient invitations before cohort expansion. | Does not block isolated one-use staging evidence; multi-use invites and cohort expansion are blocked. |
| One approved user can consume the shared rolling Places/Gemini budget before other approved users. | Per-user and global minute limits, a hard rolling database ceiling, isolated small cohort, and provider budgets bound spend. | Repository owner; add durable per-actor quotas before cohort expansion or scaling. | Does not block isolated staging; broader cohort activation is blocked. |
| Plan and event storage have no per-user lifetime plan quota or archival policy. | Invite-only access, bounded participants/reviews/providers, request limits, and operator monitoring constrain the current staging cohort. | Repository owner; define quotas, retention, and archival before cohort expansion. | Does not block isolated staging; broader cohort and production retention approval are blocked. |
| Deterministic simulator artifacts are locally attested rather than remotely signed. | The isolated exact-SHA orchestrator, signer inspection, digest-bound receipts, private same-byte installation, and signed production-shaped artifacts separate deterministic evidence from release evidence. | Repository owner; require store/remote signing evidence at production gate. | Does not block local deterministic evidence; store submission remains blocked. |
| Supabase JWKS and same-`kid` replacement may remain cached for at most five minutes. | One bounded provider cache, no indefinite per-key LRU, coalesced refresh, negative cache, and cached-known-key behavior under unknown-key traffic. | Repository owner; re-evaluate if revocation SLA becomes shorter than five minutes. | Accepted for isolated closed beta; a stricter production revocation SLA would require a shorter/provider-driven policy. |
| Staging Vercel uses an exact-SHA Preview deployment because the Production target also owns production-facing aliases. | Cumulative validator binds deployment ID and SHA; do not move production aliases. | Repository owner; revisit before production. | Production deployment remains blocked by a separate gate. |
| Production Google Play signing fingerprint is not yet associated. | Preview certificate remains isolated; verified links are tested only against inspected preview artifacts. | Repository owner; required before Play submission. | Google Play submission is blocked. |
| Legal text is operational disclosure, not counsel-reviewed legal advice. | Owner review is mandatory before source freeze; formal counsel review remains separately recordable. | Repository owner; before closed-beta cohort. | Cohort activation is blocked until owner acceptance. |

## Owner record and release decision

- Legal/privacy and rollback owner: Brian Chei.
- Legal/contact/attribution confirmation date: 2026-08-26 (historical record).
- Current deployed application source: `c5b041c85f4f7b959436c13bef48c959622c624f`.
- Historical application source for old evidence: `daa89a03e1ba09b4249125476c5d28b7f2a98f31`.
- Cumulative staging sign-off: **not complete**.
- Production/store/cohort authorization: **not granted by this reassessment**.

Do not fill a missing checkbox from an assumption or older source. The
[roadmap](roadmap.md) defines the next bounded objectives and the
[active packet](task-packets/active.md) records remaining actions and inputs.
