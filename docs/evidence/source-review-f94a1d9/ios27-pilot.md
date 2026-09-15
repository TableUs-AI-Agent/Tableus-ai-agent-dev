# Proposed next execution: one signed iOS 27 pilot

Candidate `f94a1d9d1125e6c9111aa08eda496f014f20d0c0`; profile `readiness-ios`; existing staging API,
Supabase project, canonical link host and Apple signer. Native build receipts
must name this application SHA and the actual operator SHA. New private outputs
belong below `.artifacts/mobile/f94a1d9d1125e6c9111aa08eda496f014f20d0c0/ios27-pilot/`; never overwrite
an accepted artifact or manufacture a post-hoc receipt.

1. Record acceptance of the exact linked source report and the owner's approval
   for this bounded pilot. Inspect existing signing inputs, receipt/output paths,
   selected Xcode 27 SDK and available disk (at least 20 GiB before starting).
   Stop on insufficient disk; no further cleanup is included.
2. Build exactly one signed `readiness-ios` artifact through the isolated
   exact-SHA orchestrator, serially with file-backed logs and existing memory
   limits. Inspect source, SDK scene manifest, transport, canonical hosts and
   signer, then verify its receipt and checksum. Stop on any failure; retain the
   failed attempt. No speculative parallel Android or telemetry build.
3. Before installation/launch, reconcile the existing Places aggregate and
   sign-in ledger. This pilot grants no extra Places allowance, generation,
   email or telemetry canary. The app starts on Plans; do not open plan detail.
   If reconciliation is unavailable, preserve the build and pause device work.
4. With the existing paired iPhone connected and unlocked, update the installed
   app without deleting app data. Verify launch to Plans, close/reopen once,
   and open the canonical auth link without requesting a code. If signed out or
   crashing, stop and diagnose; do not repeatedly relaunch or request email.
5. Record observed OS, installed executable identity and user-confirmed results.
   A successful pilot is only startup/session/canonical-link evidence against
   the existing 2ad48a8 staging API. It is not cumulative same-SHA readiness.
   Prepare remaining cold/warm private-link, foreground/refresh, Android,
   telemetry and same-source hosted verification as the next bounded phase.

This request includes the one native build, inspected installation and the
limited owner-assisted checks above. It excludes push/CI/deployment, provider
spend, new emails, resource/secret changes, destructive cleanup, Security Scan,
production/store/cohort work and additional artifacts. The previous build and
live limits are preserved; no previously granted source acceptance is reused.

The separation comes from the owner-approved local proposal's explicit
"does not authorize further native builds, installation, CI push" boundary and
AGENTS.md's requirement for explicit deployment approval. This plan is proposed,
not executed or approved by the earlier local repair reply.
