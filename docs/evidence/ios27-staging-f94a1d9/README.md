# Approved f94a1d9 remaining staging verification

The owner approved the [exact execution scope](execution-approval.json), including
CI/push, deployment to existing staging targets, five sequential native builds
and bounded device/live checks. Reuse the signed iOS pilot artifact. The shared
usage ledger is carried forward; no allowance is reset or increased. No scan,
production/store/cohort action, secrets, migrations or additional cleanup.

Status: exact-source CI and hosted checks pass. Candidate branch:
`codex/ios27-f94a1d9`; application SHA
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`.

- [CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/35031840606):
  226 JavaScript, 101 Python, four browser tests and seven deterministic AI cases.
- [Protected Preview](https://tableus-staging-i6b1exrb3-briancheis-projects.vercel.app)
  and Railway staging serve this source. [Hosted checks](hosted-preflight.json)
  confirm served JavaScript, API readiness, exact origins, canonical association
  hashes and unchanged production target/protection.
- [Execution record](hosted-execution.json) preserves the initial rejected
  Preview and the branch-scoped metadata correction. No live provider operation,
  new email, generation or canary was requested in this phase.
- `test-android` built successfully in about 23 minutes. Its
  [build status](test-android-build-status.json) and
  [independent verification](test-android-verification.json) prove the expected
  signer, exact source and lock, matching receipt/inspection, ARM64 native code,
  local-demo configuration, telemetry off and bundled refresh correction.
  Artifact SHA-256: `5ca6c184d0dd716ea80802c3b3d7cd40db6b3b830be7cf5df6249cb7aed4bae7`.
- The first cache cleanups completed under owner approval: [active web cache](web-cache-cleanup.json)
  and [inactive Astra caches](inactive-astra-cache-cleanup.json). Source status
  remained unchanged. The build started at 21.47 GiB and finished at 18.20 GiB
  after its temporary workspace cleanup; the 9 GiB stop guard did not trigger.
- Four native builds and deterministic/live device verification remain. The next
  build is `test-ios`, but disk is below the 20 GiB start guard. Permission is
  pending for root `frontend/.next` and root `node_modules` (about 2.92 GiB).
  Reuse the accepted signed iOS pilot. No live allowance was consumed by this build.
