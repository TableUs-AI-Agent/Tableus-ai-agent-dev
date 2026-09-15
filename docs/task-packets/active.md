# Active packet: complete f94a1d9 cross-platform staging verification

## Status

The bounded iOS 27 startup pilot is complete for
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`. The signed update builds, passes
independent artifact/receipt/signing/scene inspection, installs and reaches Plans.
The owner confirms relaunch preserves the session and the canonical auth link
opens TableUs. [Pilot evidence](../evidence/ios27-pilot-f94a1d9/README.md) is recorded.
Use one primary agent; no Security Scan or new application-provider migration.

## Next bounded objective and gate

The owner approved the [remaining execution plan](../evidence/ios27-pilot-f94a1d9/remaining-verification-plan.md).
Complete exact-source CI, existing staging/Preview deployment, five remaining
native artifacts and the required deterministic/live lifecycle, links, refresh,
account and telemetry evidence. Reuse the accepted f94a1d9 signed readiness-ios
artifact. Its checksum is `9d569309e437b3212a827305e1e119d4424d65c40f1c5fd464a120ad9bcf1798`.
The subsequent owner approval now covers those steps; preserve all stated limits.
The exact-source review is already accepted; do not request acceptance again
while the source and report remain unchanged.

## Preserved evidence and boundaries

- Local f94a1d9 checks: 226 JavaScript and 98 Python passes, three local PostgreSQL
  skips, actual before/after/repeated prebuild and all `make ready` targets.
- Native build operator: `d0447b8711109f43fb7a1572cb2b0a275f9901ab`. Xcode 27.0,
  iPhoneOS 27.0 SDK, physical iOS 27.0 / 24A437. New executable UUID:
  `5E8ED08A-6282-3483-90E7-53442A4511A8`. Prior crash evidence remains intact.
- API and Preview still serve 2ad48a8. Pilot success is bounded startup/session/
  canonical-link evidence, not cumulative same-SHA or production acceptance.
- Both exact cleanup requests completed. Saved devices/account data, source,
  evidence and signed artifacts are preserved; no further cleanup is authorized.
- Read-only reconciliation at 22:31 UTC: 329 Places attempts, nine Gemini rows,
  $0.0050015 historical estimated Gemini cost. Pilot adds zero attempts, emails,
  generations and explicit canaries. Prior shared ledger conservatively counts
  one of four emails and one of five canaries per provider; 80 new Places attempts
  remain against baseline 329 and existing backstop 409, subject to reconciliation
  and the next plan's approval. No new generation is permitted.
- No production/store/cohort action, new resource/secret, migration, scan or
  dependency change is included. Any future application change requires a new
  frozen source review and correctly bound execution evidence.
