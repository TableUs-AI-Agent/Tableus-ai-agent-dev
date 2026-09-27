# Proposed next objective: complete f94a1d9 cross-platform staging verification

This is a proposed execution plan, not an extension of the completed one-build
pilot's authorization. Candidate remains
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`; its accepted exact-source review
remains applicable while application bytes stay unchanged. No Security Scan.

## Order and reuse

1. With owner approval, push the frozen candidate for its existing CI checks.
   Require the exact SHA to pass before deploying to the existing Railway
   staging service and Vercel Preview. Verify both source identifiers, readiness,
   existing origins and associations. No production alias, secrets or migrations.
2. Reuse the inspected f94a1d9 signed readiness-ios artifact and its receipt;
   do not rebuild it. Build only the five still-missing artifacts, sequentially:
   test-android, test-ios, readiness-android, telemetry-test-ios, and
   telemetry-test-android. Inspect each artifact and receipt before continuing.
   Retain failed attempts and stop on failure rather than starting another build.
3. Run deterministic lifecycle/offline/explicit-refresh suites on isolated local
   devices, recording the actual OS/toolchain. Verify the iOS 27 physical pilot
   separately; a simulator on iOS 26.5 does not substitute for iOS 27 evidence.
   Any required new simulator runtime download is a separate disk/scope decision.
4. Reconcile provider totals, then use saved staging sessions and the existing
   dinner plan for source-bound device checks: cold/warm canonical and private
   links, returning sessions, local sign-out isolation, hidden-route inactivity,
   foreground refresh and explicit refresh/coalescing. Confirm previous-vote
   feedback before any deliberate submission; do not infer a new vote from an
   old saved-vote message. Complete remaining organizer/participant/account checks
   needed by the existing cumulative readiness gate.
5. Verify telemetry from the two isolated telemetry profiles against exact release
   f94a1d9 and record delivery in the existing providers. Assemble truthful
   cumulative same-SHA evidence; identify any unverified phase as such.

## Shared limits and stopping conditions

- Preserve the previous run's cumulative cap of 80 new Places attempts relative
  to baseline 329, four total sign-in emails and five canaries per provider.
  The pilot adds no allowance. At last reconciliation, new Places usage is zero,
  one email is conservatively counted, and one web canary reached each provider.
  Thus at most 80 Places attempts, three emails and four canaries per provider
  remain, subject to a fresh reconciliation before execution. No new generation
  and no additional Gemini budget; the existing staging backstop remains 409.
- Prompt for a code only when a specific app is on its sign-in screen; enter
  credentials solely in that app. Stop before exceeding any count.
- Keep all native builds sequential, logs private/file-backed and existing memory
  limits active. Require at least 20 GiB free before each build and stop below
  9 GiB during a build. Reuse accepted artifacts and do not remove existing
  caches, source, evidence, signed outputs or saved devices without approval.
- Do not add a provider, dependency upgrade, new resource, secret, production
  deployment, store submission, cohort activation or Security Scan. If any code
  repair changes the application SHA, freeze and review that source before
  accepting execution evidence; do not relabel artifacts from this candidate.

## Approval requested for the next objective

Exact-candidate push/CI and deployment to the two existing staging targets;
five named native builds and their inspected local device verification; and the
bounded live checks above using the remaining shared allowance. The signed iOS
pilot, historical approvals and accepted source report do not by themselves
approve this proposed remaining execution.
