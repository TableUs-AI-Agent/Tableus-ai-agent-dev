# Dependency/toolchain disposition — 2026-09-21

This is the targeted assessment requested by the staging handoff, **not a Security
Scan**, a Python/native/system dependency audit, or release acceptance. Base:
`5375e3389823b9c0736328709aab1cdc9be6ef98`. The frozen staging application remains
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`; none of its artifacts or observations
are relabelled as evidence for these changed dependencies.

## Result and scope

The replacement npm graph has **zero critical/high findings**. The full graph
reports 17 affected package entries (16 moderate, one low), arising from **three
underlying advisories**, all in development/build tooling. The production-labelled
monorepo graph reports 12 moderate entries, all propagation from xcode's UUID
build dependency. `--omit=dev` does not describe the shipped Expo bundle.

The old graph reported 30 affected entries: one critical, six high, 22 moderate,
one low. Counts include dependent packages, not just distinct advisories. Raw
before/after/production JSON, hashes, exact dependency paths and version changes
are retained beside this report. npm's nonzero audit status denotes the recorded
findings; it is not a successful zero-findings audit.

Local remediation plus the exact-use dispositions below replace the blanket
September 30 exception **for this replacement graph only**. No exception extension
is granted. Existing f94a1d9 staging bytes still contain the old dependencies and
must not be promoted to production. Deployment/distribution remains gated; local
completion does not patch the hosted service or installed apps.

## Compatible remediation

| Path | Change and rationale |
| --- | --- |
| Web → Next.js | 16.3.1 → 16.3.5; matching eslint config/plugin and native SWC packages. Same minor line, unchanged React. 16.3.3 is the advisory fix floor; 16.3.5 is the current stable patch. Root override prevents a stale peer-installed Next copy in the monorepo. |
| EAS 23.2.0 → AJV/Joi/minimatch/nanoid/tar/yaml | Scoped fixes to 8.18.0 / 17.13.6 / 5.1.9 / 3.3.18 / 7.5.21 / 2.8.3. EAS itself remains exactly pinned; 23.2.0 is still the latest stable registry release. Preserve EAS's nested prebuild-config minimatch 9.0.9 instead of forcing that consumer onto major 5. |
| OpenAPI tooling → Redocly → js-yaml | Redocly 1.34.19 → 1.34.20 selects js-yaml 4.3.2 through its own manifest; no Redocly major upgrade or custom YAML parser. |
| Expo Router 57 → query-string 7 → decoder | Keep the router and query-string interfaces. Root local adapter calls the unmodified upstream decode-uri-component 0.5.0 ESM default through an audited npm alias. Its local 0.2.3 version fits query-string's existing range and is explicitly not an upstream release. No source fork, postinstall patch, decoder override or SDK migration. |

`version-changes.json` includes every changed package-version set, including the
compatible root nanoid 3.3.18 → 3.3.19 resolution. All other direct runtime pins,
the Python lock, Expo 57.0.23, React Native 0.86.2 and scene plugin remain unchanged.
The adapter requires Node >=22.12 within the existing Node 22 line for synchronous
ESM loading; package engines now state that minimum. Tested host: Node 22.23.1,
npm 10.9.8. Jest transforms the aliased ESM package; Metro's actual iOS/Android
exports contain both the adapter and upstream decoder.

## Shipped-runtime findings

- **GHSA-p293-qw3h-jr36 (Next.js, critical):** the specified exploit requires a
  Windows-hosted server. TableUs's recorded Vercel deployment and macOS local
  development do not use that hosting mode. Patch anyway; no platform assumption
  is used to waive the replacement graph's critical/high gate.
- **GHSA-2xp9-vwfh-vxw4 (Next.js, critical):** the image optimizer processes AVIF
  input through the affected image stack. TableUs config enables the optimizer
  with remote hosts; the absence of an AVIF UI option or the use of a local SVG
  attribution image does not prove that endpoint unreachable. Treat frozen
  staging as potentially affected and prioritize replacement review/rollout.
  No exploit was attempted. Next's patch disables AVIF optimization pending its
  underlying fix.
- **GHSA-vcc3-ghjq-m6fr (decoder, moderate):** Expo Router's query parser reaches
  query-string before application-level auth/share validation. A malicious link
  can therefore reach the old decoder. Upgrading just the decoder breaks its
  CommonJS call shape; query-string 9 changes its export API too. The adapter
  preserves the old callable boundary while using upstream's patched algorithm.
  Tests exercise valid credentials/share queries, malformed bytes and a large
  malformed query in a child process with a five-second completion limit.

## Remaining exact-use dispositions

These are bounded source/path assessments, not a claim that the vulnerable
packages are universally safe. `reviewed-source-hashes.json` binds the inspected
installed consumers; `dependency-paths.after.json` records their parents. Reopen
assessment when the lock, consumer, exposed command or input trust changes.

| Advisory | Exact consumer evidence | Disposition |
| --- | --- | --- |
| GHSA-w5hq-g745-h8pq, UUID | xcode 3.0.1 `lib/pbxProject.js:90` calls v4 without an output buffer; @expo/bunyan 4.0.1 `lib/bunyan.js:928` calls v1; @expo/rudder-sdk-node 1.1.1 `index.js:146` calls v4. Those are the only parents of the affected UUID 7/8 instances. | The advisory concerns v3/v5/v6 with caller-provided buffers. The affected methods are not used here. No forced multi-major UUID upgrade. |
| GHSA-73rr-hh4g-fpgx, diff 7 | EAS 23.2.0 `build/fingerprint/diff.js:41` calls diffLines; its sole affected dependency has no parsePatch/applyPatch consumer. | Advisory affects parsing/applying untrusted patches; the used line-diff API is outside that path. Keep EAS's supported major 7. |
| GHSA-87mf-gv2c-c62c, ts-deepmerge 6.2 | EAS `build/commandUtils/new/projectFiles.js:60` merges the local template/config while creating a new project. No app imports or repository scripts/workflows invoke `eas new`. | Outside TableUs's approved build/update/inspection workflow and absent from shipped bundles. Do not use the repo-locked CLI to scaffold projects with untrusted templates. Reassess before enabling that command; changing to 8 also removes the default API EAS calls. |

All other after-audit entries are propagation of these three advisories. Local
Metro source maps for both platforms contain **none** of EAS, xcode, the affected
UUID packages, Expo Bunyan/Rudder, diff or ts-deepmerge. This evidence is for local
JavaScript exports, not the retained native artifacts. Production-labelled audit
entries cannot be counted as 12 separate mobile-runtime vulnerabilities.

## Expo patch guidance

Official Expo guidance recommends version checks against the SDK's supported
package set. Installed 57.0.23 metadata and an offline check identify eight
remaining recommended direct-package patches: build-properties, image,
image-picker, linking, router, secure-store, sharing and updates. The offline CLI
warns its validation is not authoritative online Doctor evidence. Existing Jest,
jest-expo and React Native exclusions remain visible in `expo-compatibility.json`.
Registry metadata also records Expo 57.0.24 and Router 57.0.22; the latter still
uses query-string ^7.1.3, so those upgrades alone do not fix the decoder.

These are compatibility recommendations, distinct from the advisory exception.
Defer broader SDK-package alignment to an approved native candidate objective with
its own inspected artifacts and scene/startup regressions. This report does not
claim a clean Expo Doctor run, general SDK compatibility, or native acceptance.

## Verification and release impact

See `verification.json` for fresh commands, outcomes and log digests. Meaningful
checks cover frozen install, installed dependency consistency, actual EAS profile
validation, metadata formats, YAML/file patterns/IDs/archive behavior, actual
router parsing, bounded malformed input, platform JavaScript exports, generated
contract drift and one final `make ready`. Local deterministic browser checks
exercise the patched web application. No live provider calls, hosted changes,
new native artifacts, credential changes, Security Scan or paid evaluation.

A replacement application candidate requires review and affected release evidence.
Web changed; native JavaScript changed; EAS/configuration tooling changed. Preserve
all f94a1d9 receipts and the owner's isolated-staging AppHang acceptance. Obtain
usable symbols and a focused diagnostic check before distribution; no hang fix
is claimed. The next bounded objective is replacement-candidate review and a
concrete rollout/verification plan for owner approval, before account lifecycle
work. Merge, deployment and native-build authority are not supplied by this report.

## Official sources (queried September 21)

- [Next.js image advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4), [Windows advisory](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36), [16.3.3 release](https://github.com/vercel/next.js/releases/tag/v16.3.3).
- [Decoder 0.5.0 release](https://github.com/SamVerschueren/decode-uri-component/releases/tag/v0.5.0), [decoder advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr).
- [UUID advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq), [diff maintainer advisory](https://github.com/kpdecker/jsdiff/security/advisories/GHSA-73rr-hh4g-fpgx), [deep-merge fix](https://github.com/voodoocreation/ts-deepmerge/commit/305a058).
- [Expo CLI compatibility checks](https://docs.expo.dev/more/expo-cli/), [SDK upgrade guidance](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/), [EAS releases](https://github.com/expo/eas-cli/releases).
- [Node 22.12 ESM loading](https://nodejs.org/en/blog/release/v22.12.0).
- `registry-metadata.json` / `fix-manifests.json`: official npm manifests and exact compatible patch requirements. Raw npm audit files retain every underlying advisory URL and affected range, including EAS and Redocly fixes.
