# N1-F1 local remediation result

The owner [approved](n1-f1-approval.json) the exact [F1 scope](n1-f1-local-remediation.md).
The local application fix and checks pass. Application freeze and the impact /
native revalidation proposal follow in an evidence-only checkpoint. This is not
N1 completion or permission to execute native work.

## Result and review

The actual Expo native sequence reproduced the observed `a%2Bb%2Fc%3D` →
`a b/c=` error. A second failing regression proved that `useLocalSearchParams`
decoded an already parsed literal `%2F` again, changing `literal%2Ftoken` into
`literal/token`. Both failed on the prior application; the two legacy parser
checks passed, demonstrating their narrower coverage.

Owned custom-scheme and canonical join URLs now become validated internal paths
before Expo's custom URL extractor rebuilds query strings. The original query is
strictly decoded once and re-encoded: valid plus, slash, equals, Unicode and
literal percent data retain their values. Duplicate keys and malformed escapes /
UTF-8 fail closed. Missing/empty tokens, invalid UUIDs and extra/encoded path
separators cannot submit a join. The join screen uses the public `useRoute` hook
for already parsed values and rejects non-string parameters. Authentication,
mutation idempotency and server capability validation stay in their existing paths.

Review scope is two application files and two test files. No dependencies,
backend/API contract, web source, app profile, entitlements or executable build
operators changed. Other origins and unrelated development/E2E routes retain
existing behavior; this is not a new origin-dispatch acceptance claim. The real
route/hook component tests replace only API calls, auth/connectivity context and
imperative navigation. They assert the body from the real join button, and that
invalid cases cannot write. They are not OS delivery or native runtime proof.

## Fresh verification

- Before: two intended failures; two original parser checks pass. An earlier test
  initialization failed on Expo's unrelated HMR barrel; selective actual hook
  exports resolved it. Final tests use React `act` without the initial warnings.
- After: 48 route/component regressions pass; 10 focused link/safeguard tests pass.
- One `make ready` invocation passed lint/typecheck, then hit sandbox `EPERM` on
  the existing fault proxy's localhost listener. Resumed the remaining targets
  with localhost permission: `make test contract build smoke perf`, all pass.
  No source change or second full invocation was needed for that environment error.
- Totals: **292 JavaScript tests and 98 Python tests passed**; three PostgreSQL
  migration tests skipped under the local SQLite configuration. Next.js build,
  Expo web export and deterministic smoke passed. Native compilation did not run.
- `npm run contract:check` and explicit generated-file drift check pass. The
  2,820,194-byte web JS baseline is report-only, not measured native performance.

[Machine-readable results](n1-f1-result.json) bind the changed files and all
private logs by SHA-256. Logs remain under the current worktree's ignored,
mode-0700 `.artifacts/n1-f1`; files are mode 0600. Matching-lock dependency
installation trees were cloned with APFS copy-on-write from the retained ed8330a
workspace; relative workspace links resolve here. Python uses the existing local
runtime. No package download, old-source edit or device action was needed.

## Remaining gates

The old ed8330a native artifact, symbols, lifecycle/offline observations and all
failed traces remain historical evidence for those exact bytes. They cannot
validate this new application. Preserve the unresolved debugger crash and AppHang;
remaining native links, export cycles, canonical HTTPS/auth presentation and
Android verification are open. Native builds/replay need separate approval and
at least 40 GiB free before each build. No cleanup is authorized by F1.

Accepted native/API f94a1d9, staging web ed8330a and production e1184ec remain
unchanged. All prior attempts and the closed provider/email/canary ledger remain
unchanged; N2, CI, deployment, merge, uploads and stores are separately gated.
