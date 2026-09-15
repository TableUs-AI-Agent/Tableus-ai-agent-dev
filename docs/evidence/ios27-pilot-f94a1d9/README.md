# Approved iOS 27 startup pilot: passed

Application `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` was built, independently
inspected and installed on the paired iPhone running iOS 27.0 / 24A437. The owner
confirms first launch reaches Plans, relaunch preserves the session, and the
canonical auth link opens TableUs. [Owner observations](owner-observations.json)
and the [pilot summary](summary.json) bind these results to the inspected artifact.

The [signed build](build-status.json) passed in 18 minutes under operator
`d0447b8711109f43fb7a1572cb2b0a275f9901ab`. [Independent verification](build-verification.json)
confirms exact source, signer, transport, receipt and artifact checksums.
[Native metadata](native-metadata.json) shows iPhoneOS 27 and the required Expo
scene manifest. [Installation](install-evidence.json) binds the new executable
UUID `5E8ED08A-6282-3483-90E7-53442A4511A8` and artifact checksum.

Both explicit cleanup approvals completed: [six temporary/generated paths](cleanup-completed.json)
and [four additional generated directories](additional-cleanup-completed.json).
Source status and untracked historical evidence hashes were preserved. Disk
passed the 20 GiB start gate at 21.584 GiB and recovered to 21.876 GiB after build.
The original [disk stop](preflight.json) and cleanup proposals remain historical.

[Pre-install usage](budget-before-install.json) is unchanged at 329 Places
attempts and nine Gemini rows. No new email, paid provider operation, canary,
additional artifact, deployment or Security Scan is part of this pilot.

The existing hosted API remains 2ad48a8 and passes health checks. The Apple
association contains the expected signer and canonical auth/join paths. This
pilot establishes bounded startup evidence against that existing API; it is
not cumulative same-SHA staging readiness or production/store/cohort approval.

[Post-pilot reconciliation](budget-after-pilot.json) confirms zero new Places/Gemini usage. The [remaining execution plan](remaining-verification-plan.md) is prepared but not authorized by the completed pilot approval.
