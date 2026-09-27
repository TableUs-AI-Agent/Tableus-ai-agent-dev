# Proposed N1-F1: local native-link remediation

**Prepared, not approved or executed.** The [N1-R2 native observation and offline
reproduction](n1-r2-result.md) establish custom-scheme token corruption. Repeating
the same frozen app cannot establish the required token-preservation behavior.
N1-R2 required stopping at the first failure and excluded an automatic app patch.

## Requested local work

Implement a bounded correction in the existing validation task/worktree, keeping
the incomplete native objective and all evidence here. Expected change scope:
`mobile/src/lib/links.ts`, `mobile/app/+native-intent.tsx` if needed, the matching
link tests, and `mobile/src/lib/router-dependency.component.test.tsx`. Touch the
join parameter boundary only if an integration test proves another decode there.
No dependency upgrade, authentication bypass, new scheme, provider or broad router
rewrite is included.

Normalize the app's supported custom-scheme join links to internal paths while
preserving encoded query data before Expo's custom-scheme extractor can decode
and rebuild it. Keep canonical-origin and UUID checks intact and do not expand
trusted origins or expose hosted credentials. Preserve the exact values of valid
encoded tokens, including plus, slash, equals, Unicode and literal percent data,
through the real route parameters consumed by the join screen. Keep missing/empty
tokens invalid. Duplicate or malformed token input should fail closed before a
join write; define explicit cases and avoid silently granting a different token
meaning. Keep unrelated development/E2E routes working.

First add a failing regression from the observed raw URL and API-body value.
Exercise the actual native sequence: native-intent normalization, Expo URL
extraction, the active `fork/getStateFromPath` parser, and the local search-param
hook/component boundary. Retain legacy decoder tests with their original narrow
meaning; add the missing integration coverage. Include current URL-safe tokens,
encoded delimiters, plus versus spaces, literal percent escapes, Unicode,
duplicate/missing/empty tokens, malformed UTF-8, invalid UUID/separators and
canonical/development-route controls. Use only deterministic local tests.

After focused checks pass, run `make ready` once and the contract-drift check.
Commit the local change, update current documents and freeze its exact new
application SHA. Prepare an impact review and revised native-validation proposal
before any new build. Identify which existing evidence remains reusable and which
must be replaced; never relabel ed8330a's artifact or symbol results as proof of
the changed application.

## Boundaries and acceptance

Success for F1 is a reviewed local fix with meaningful passing regressions,
required local checks and an exact candidate/impact report. It is not N1 completion
or authorization to compile, install, rerun native cases or proceed to exports.
New native builds/attempts and sufficient disk capacity remain separate gates.
The canonical-HTTPS dispatch/auth presentation gap and historical crash/AppHang
remain open and need a concrete future validation solution.

No native replay, debugger injection, deletion, SDK download, real auth/OTP,
telemetry, live provider/canary requests, cloud resource/secret change, CI,
deployment, merge, N2 update, store submission or risk waiver is authorized by F1.
All existing closed budgets and preserved devices/artifacts remain unchanged.
