# Release readiness checklist

Updated 2026-09-27 for the [staging pilot](roadmap.md). Brian owns release,
support and rollback decisions. Planning approval is not permission to execute
builds, migrations, deployments, provider calls or invitations.

Priority 3 local preparation and the exact proposed synthetic campaign are in
[staging preparation](pilot-staging-preparation.md). Inventory is read-only; none
of the external acceptance boxes below is closed by the prepared code/config.

## Pilot gates

Record formal acceptance once per gate under the application candidate in
`docs/evidence/<commit>/`; bind artifacts/configuration and operator source
separately. Reuse unchanged checks and retain useful failure diagnostics privately.
Check a box only against actual candidate evidence; revalidate affected gates
when application inputs change.

- [x] Cumulative baseline reviewed and integrated through approved PR #7 as
      `8ae3c94eb3e41b87f0840cd5aa2b0827c0882af4`; its tree matches the passing
      `97c3c65` PostgreSQL/browser CI candidate ([evidence](evidence/6dac996/integration.md)).
      Later application changes require matching checks and replacement build bindings.
- [x] Priority 2 source: web/mobile show Plans and Account; hidden product routes lead to Plans.
      Auth, invite, Join, export, legal/privacy and deletion help remain reachable,
      including recovery states. No learned-taste or guest/proxy scope is added.
      Source `f621cf5` and final hosted `1270206` passed; PR #8 is approved and
      merged as `462a7dd` with the same file tree ([evidence](evidence/f621cf5/integration.md)).
      Deployment and physical-device acceptance remain separate gates below.
- [x] `plan.finalized` records the active run's distinct-voter count. Focused
      tests cover zero/one/multiple voters, updated votes, re-finalization and
      deletion of the finalizer/another member, including removal of the recorded
      candidate/run. Deletion's strict payload allowlist retains the reviewed
      bounded integer independently of whether those references still exist,
      alongside safe existing fields. The read-only measurement query counts each plan once, treats old
      missing counts as unknown and discloses whole-plan deletion coverage gaps.
      The same [Priority 2 evidence](evidence/f621cf5/implementation.md) covers the
      24 measurement cases, including hosted PostgreSQL and the read-only wrapper.
- [ ] Actual hosted source, migration head, runtime/Auth-hook grants, existing
      users/invites and rollout/rollback compatibility reconciled. Apply only
      missing migrations under approval (four expected from the recorded base).
      Compatible clients support shared-content cleanup/repair before full
      deletion admission. Do not blindly roll back to pre-quota/invite writers.
- [ ] API/web run the selected candidate with correct source stamps, CORS,
      canonical link associations, live providers and privacy-limited telemetry.
      Preserve production-facing aliases and one API process.
- [ ] Recipient-bound invitations and operator-only usage are verified. Size
      daily logical quotas, provider attempts, total spend and failure/retry
      allowance for a complete group journey; the default 20 Places operations
      is not an approved budget. Candidate-bearing reads can exhaust it.
- [ ] Under separate secret/resource/deployment approval, provision the server-only
      Auth-removal credential and bounded hosted worker using
      [lifecycle operations](account-lifecycle-operations.md). Verify restricted
      grants, schedule/status and independent API/worker flags. Enable
      `TABLEUS_ACCOUNT_DELETION_ENABLED=true` after prerequisites and rehearse
      export, organizer blockers/transfer/sole-plan removal, deletion, pending/
      attention/retry/completion and pause/drain behavior on approved synthetic
      accounts only. Each needs an operator-controlled inbox for email codes and
      its own recipient-bound invite; deletion consumes the account and does not
      refund invite use. Include account, inbox and invite counts, including any
      approved replacement fixtures, in the Priority 3 approval request. Bind live
      Auth/email attempts and worker limits to that scope; never use pilot accounts.
      Fragment emission remains off.
- [ ] Before real invitations, Brian approves working privacy/support contacts,
      secure case verification/escalation, retained-data treatment and compatible
      public copy. Follow the [support procedure](deletion-support-procedure.md).
      The accepted pilot-only residual risk is deletion unavailable after loss of
      sign-in email access until secure recovery/assisted verification exists.
      Rehearse truthful escalation for that case; do not promise email-only
      completion. Normal authenticated deletion and support readiness still gate
      invitations; revisit the access-loss exception before expansion/store release.
- [ ] Web journey passes with two distinct approved participants: sign in, create,
      Join, separate constraints, four options, independent votes, organizer
      finalize/reopen and another member's refreshed state. Organizer discretion
      remains; pilot success requires at least two votes, not all-member quorum.
- [ ] Before the iOS build, collect all pilot iPhone device IDs privately and verify
      that the selected ad hoc provisioning profile includes them. Registration
      alone does not prove profile inclusion. Bind signing/install access to the
      roster before spending the build allowance.
- [ ] Use the existing `readiness-ios` and `readiness-android` pilot profiles;
      they inherit internal distribution from `preview`, enable staging telemetry
      and disable test controls. One accepted signed build per platform from the candidate is
      inspected for staging origins, signing/association identity and absence of
      test controls, then installed on a physical iPhone and Android device.
      Bind artifact hashes, OS/device, observations and actual source.
- [ ] Physical acceptance covers the shared journey, cold/warm startup and links,
      signed-out Join return, rotation/old-link rejection, session restoration,
      device-local sign-out, explicit refresh and visible error/retry states.
      Cover airplane mode and visible retry without automatic replay. Use synthetic
      accounts for affected account-management/deletion checks on both platforms.
- [ ] One bounded `mobile-offline-e2e` run from the candidate proves explicit
      same-key create/finalize retry after a committed write loses its response,
      without duplicate effects. Declare the platform and inspect/bind its local
      `test-ios` or `test-android` artifact separately from the signed pilot builds.
      Use deterministic loopback services/fault proxy only; scope any required
      extra build explicitly and do not enable the extended refresh campaign.
      Record that one platform/test profile does not prove both physical clients.
- [ ] For a later iPhone added by re-signing, verify unchanged application inputs
      under the [decision](decisions.md#pilot-follow-up--adopted-2026-09-27), inspect
      the new artifact/profile and record install/launch on the added device.
      Otherwise review the delta and repeat affected acceptance. Existing signed
      build/distribution approval gates still apply.
- [ ] Review original refresh, initialization, AppHang and accessibility-driver
      findings against candidate results. Record what reproduced, what was fixed,
      what is a harness limitation and any owner-accepted residual risk. Missing
      coverage is explicit; a blocking user failure stops the pilot. Old isolated-
      staging risk acceptance does not automatically accept new pilot bytes.
- [ ] Normal allowlisted events arrive for web/iOS/Android/API. Distinguish
      deterministic error-scrubbing checks from observed runtime error delivery.
      Any required synthetic canary/test-profile build is explicitly scoped;
      it is not silently bundled into the one-pilot-build-per-platform target.
- [ ] Before the first pilot invitation, approve roster/participant cap,
      representative use of all three platforms, signing/install access, total
      budget, support owner, measurement method and stop/rollback scope. Existing
      expired/exhausted native/provider allowances are not reused.

The long simulator campaign is no longer a pilot prerequisite. Beyond the bounded
lost-response run, optional automated regressions may support these checks;
physical observations must not be inferred from simulator, mocked, older-artifact
or source-only results.

## Carried obligations before TestFlight, Play or production

| Obligation | Current state | Later requirement |
| --- | --- | --- |
| Native failures and symbols | Prior findings remain; physical pilot disposition is candidate-specific | Usable matching symbols/maps, focused checks and distributed install/update evidence; reopen on recurrence |
| Places cost and quotas | Candidate-bearing reads hydrate Places; logical quotas and spend caps are distinct | Use measured pilot journeys to size expansion; no implied budget increase |
| Process-local coordination | One API process, row locks and bounded replay | Durable idempotency/provider coordination before horizontal scaling |
| Capability link transport | Bounded capture on; fragment emission off; query URLs reach the initial web request | Reviewed hosted handling and candidate-scoped pilot risk, then reader adoption/cutoff/rotation before emission or wider release |
| Account deletion and retention | Full service off today/default; activation/recovery/support required for pilot, with an accepted email-access-loss limitation | Revisit assisted access-loss initiation, retention/support and distributed behavior before expansion/store release; no invented purge promise |
| Production trust/signing/updates | Production builds blocked; OTA disabled | Approved origins, signing, Play fingerprint and update policy ([spec](production-release-spec.md)) |
| Shared Vercel project | Staging Preview and production-facing aliases coexist | Separate production configuration and alias review |
| Native tab presentation | Placeholder glyphs in existing screenshots | Verify usable labels during pilot; finish store presentation before distribution |
| Contacts, attribution and public text | Historical attestations cover unchanged scope only | Review changed public behavior and actual support arrangements; no counsel review is implied |
| Security review | Older source review is bound to f94a1d9; scans remain canceled | Review the proposed release delta and make a separate production-review decision; do not transfer old acceptance |

The [f94a1d9 closeout](evidence/ios27-staging-f94a1d9/closeout.md) remains historical.
The [September 25 cumulative plan](cumulative-release-acceptance.md) retains useful
migration and distribution considerations; its candidate, ordering and native
campaign gates are superseded for this pilot. Rebind any reused procedure.
