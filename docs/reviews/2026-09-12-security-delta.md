# Source review after the last recorded focused scan

Date: 2026-09-12. Reviewer: the primary Astra development agent.
This is an attributable code review, not an independent security audit or a new
plugin scan. It does not grant production or cumulative release approval.

## Provenance

- Recorded baseline: `069473c24e7921e5b4b2ad51faa04e71899721ad`.
- Recorded scan: `528a703f-7ff1-4505-828d-1a8b1de1fdc5`, reported complete with
  zero findings in the prior task and archived repository record. A raw sealed
  report/digest has not been recovered into this change; none is invented here.
- Inherited endpoint: `daa89a03e1ba09b4249125476c5d28b7f2a98f31`.
- Local delta: the auth/preflight replacement committed on
  `codex/astra-project-reassessment`; the handoff supplies its exact SHA.
- Canceled scan `2482f6f3-b05c-4c40-bc9f-e5d5a0ec41a0` remains canceled. No
  plugin scan was started, resumed or represented as complete in this work.

The inherited range contains nine commits and 46 changed files, mostly planning
and evidence. The review covered its runtime/tool changes and their tests,
then the local replacement diff. Historical screenshots and native receipts
are evidence inventory, not independently repeated device observations.

## Reviewed changes and boundaries

| Area | Review result | Validation / remaining boundary |
| --- | --- | --- |
| `backend/tableus/config.py` session pooler identity | Allows the configured runtime role suffixed by the matching Supabase project only on a Supabase pooler hostname and port 5432. The privileged migration role remains separate. | Existing tests reject wrong project, host and transaction-pooler port. Actual database grants are not newly attested by this source review. |
| Places attempt ceiling | Default remains 150; maximum configurable rolling allowance increased to 500 for bounded staging evidence. Gemini dollar caps remain pinned. | Config boundary tests and existing provider-budget tests. No new live call or budget setting was applied here. |
| Web runtime origins and rewrite | Credential-free loopback HTTP is limited to development. Production keeps the exact approved HTTPS origin policy. | Tests reject credentials, paths, query strings, wildcard host and production loopback. Alias/CORS bodies still need replacement-stage observation. |
| Web auth/profile recovery | Normalized requested email stays bound to OTP verification. Session/profile errors have a retry path; account queries are disabled while unapproved. | Existing local tests; replacement adds bounded boot reads and event-version checks. No new application authorization rule is introduced. |
| Shared API deadline | A single deadline covers lookup, dynamic demo identity, fetch, refresh and JSON. Every asynchronous stage is awaited against it. Late credentials cannot initiate a write; one refresh reuses its original idempotency key. | Fake hung/rejected/late credential and refresh tests, shared-budget test, existing body-timeout/idempotency/401/403 tests. A timed-out dispatched write remains ambiguous and still needs the existing explicit retry/key policy. |
| Supabase session handling | SDK errors propagate as sanitized recoverable failures. Mobile no longer forces local sign-out on refresh errors. Startup is bounded; a true absent session remains distinct from a timeout. | Mobile component tests cover timeout, rejection, storage stall, pending invite recovery and sign-out superseding approval. Real SDK/device behavior still requires staging acceptance. |
| Native operator changes | Early platform-bound build IDs, signer syntax, distinct outputs and explicit SDK roots prevent known wasted builds. The candidate remains detached/clean and uses its own lock, inspector and receipt generator. Local Sentry auto-upload isolation was inherited. | Preflight behavioral tests and existing attestation guard tests. This does not assert toolchain/signing compatibility, artifact existence or production symbolication. |
| Development config/plans | Project-only Astra pin; no API provider, global approval, sandbox, secret, database policy or deployed-origin change. Current documents identify old versus replacement evidence. | TOML/diff checks and preserved baseline evidence. No old approval or scan is rebound to a new source. |

## Release disposition

The review found the unbounded auth wait and refresh-error sign-out addressed
in this replacement. It does not certify the entire repository free of
vulnerabilities. Existing residual risks stay in the
[readiness checklist](../release-readiness-checklist.md).

`scripts/readiness-evidence-utils.mjs` currently requires a security scan with
`security.sha` equal to the candidate SHA. That check was deliberately not
weakened. This baseline-plus-delta record is insufficient for that validator
without an explicit acceptance-policy decision and corresponding truthful
schema change, or separately authorized candidate scan evidence. Cumulative
sign-off remains incomplete until that question is resolved.

Local checks and browser observations are recorded in the final handoff and
reassessment report. No live security probing or new provider evaluation was
performed for this review.
