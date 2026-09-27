# D1 completed: runtime app/route source-map resolution

The owner [approved D1](d1-approval.json) against proposal commit
`8be19c0896b9aeb97a28b8f3f35bf19ce287ea70` and its exact private harness hashes.
Its single permitted launch completed in 33.331 seconds. The unchanged ed8330a
artifact yielded 9,339 runtime samples and 841 stack frames; app termination
returned zero. No D1 crash report was found during execution or the later
02:51:01 UTC check. No additional build or behavioral runner ran.

[Structured results](d1-result.json) bind the raw stderr, extracted profile,
separate symbolicated copy, logs, harnesses, map, bundle and symbolicator hashes.
The build remains `local-ios-test-ed8330a-2d-01`, application
`ed8330a766b3c4b80a505e075535678394e275e9`, build operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4`. The ad hoc harness retains its separate
identity. D1 consumed one diagnostic launch; no D1 retry remains.

## Runtime evidence

Setup scheduled Hermes profiler shutdown, enabled sampling, detached and exited.
A fresh debugger process performed readout. The observed sample span was
12.434069 seconds against the scheduled 12-second shutdown; this is a measured
span, not a claim that the dispatch deadline was an exact sampling cutoff.
At readout, main and JS threads were waiting in their run loops and no named
Hermes sampling thread appeared in the captured thread list.

Candidate-installed Metro symbolicator 0.84.5 processed a **copy** of the profile
with the exact retained composed map. Original samples and parent relationships
were preserved. Sixteen frames resolve into app sources; 67 resolve into the Expo
Router dependency tree. Representative actual captured frames include:

| Captured frame | Virtual address + bytecode offset | Resolved source |
| --- | --- | --- |
| `PlansScreen` | 1585561 + 0 | `mobile/app/(tabs)/plans.tsx:16:15` |
| `_temp` query callback | 1589100 + 22 | `mobile/app/(tabs)/plans.tsx:23:70` |
| `getItem` | 1459912 + 16 | `mobile/src/lib/supabase.ts:19:52` |
| `getRoutes` | 1382156 + 59 | `expo-router/build/getRoutes.js:20:40` |
| `loadRoute` | 3138977 + 31 | `expo-router/build/getRoutesCore.js:239:47` |
| `matchDynamicName` | 1227566 + 15 | `expo-router/build/matchers.js:20:32` |

The result records frame IDs, sample ancestry counts, original bytes/offsets,
resolved names, source hashes and exact source lines. All 57 sampled app/Router
source files match the retained build files. A separate check matches all 50
app/shared/decoder map contents (the previous 46 plus four shared-package files).
These are runtime-derived offsets, not invented frames or arbitrary map lookups.

Both decoder sources match, but **no direct decoder function was sampled**.
The captured app/route map-usability check passes. It does not prove malformed-URI
handling; the approved synthetic link matrix remains pending. No decoder runtime
frame, universal-link association or export/relaunch performance result is claimed.

## Crash review and next boundary

The [launch-four crash](n1-js-runtime-diagnostic.md) remains unresolved. Its report
shows sampler/JS-thread waits during the attached-debugger experiment. D1 avoided
that method and the stale nested debugger context, produced a valid trace, and
had no observed crash. This supports the revised capture method for this one run;
it does not prove the earlier crash's cause, classify it as harmless, or clear
the historical f94a1d9 AppHang.

[N1-R](n1-ios-resumption.md) proposes resuming the remaining bounded iOS checks
with the profiler disabled and no injected debugger calls. Those checks remain
unexecuted pending approval after the N1 crash stop. A fresh crash, a blocked
action or a qualifying stall stops them. No risk acceptance is inferred from D1.

Fresh artifact/config checks match the original checksum, ed8330a source,
loopback API, demo enabled and telemetry off. Accepted devices and application
bytes are unchanged. Current free space is 26.93 GiB; Android still needs both
the iOS gates and 40 GiB. No further cleanup is authorized. N2, live budgets,
uploads, CI, merges and deployments remain outside scope. N1 is incomplete.

Application and committed executable operator files did not change. Reuse the
recorded 2c suites; fresh verification covers trace/source associations, private
hashes, evidence JSON, document links and diff hygiene.

Final checks passed: 23 private file hashes, approval/proposal/harness bindings,
38 document links, evidence JSON parsing, preservation of all raw samples and
parent/offset fields, unchanged bundle/map/artifact identities and
`git diff --check`. Existing backend dependency imports passed without starting
a server; the retained exact application workspace has no tracked changes.
