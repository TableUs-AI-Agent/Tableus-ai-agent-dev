# F1-O2 — approved, waiting for disk capacity

Historical proposal: its exact two-cache cleanup was subsequently approved and
completed. Further approved cleanup restored capacity and [O2 then ran and
failed](n1-f1-o2-result.md). The unused-attempt statements below describe this
historical checkpoint only.

The owner approved [O2](n1-f1-o2-approval.json), including conditional continuation
through the 44 link cases and exactly two exports after preceding checks pass.
The read-only preflight stopped before the native driver: **19.37 GiB free**, below
the required 20 GiB. A subsequent cache inspection measured 19.39 GiB.
**No native attempt was consumed; one O2 attempt remains authorized.** No link,
export, cache deletion or application change occurred.

Before the capacity stop, archive/operator/downstream/wrapper hashes, the exact
clean frozen workspace, booted target/runtime, stopped TableUs and idle local ports
passed. The fresh O2 output is absent. The driver's fresh artifact/receipt and
D2/lifecycle/P2 gates have not run in this turn and still precede execution.
[Structured evidence](n1-f1-o2-capacity.json) binds the private inspection and
prepared cleanup operator by hash.

## Concrete capacity action — approval needed

Delete only these idle, regenerable download caches:

| Exact path | Allocated size |
| --- | --- |
| `/Users/brianchei/.npm/_cacache` | 0.489 GiB |
| `/Users/brianchei/Library/Caches/CocoaPods/Pods` | 0.948 GiB |

The combined allocated size is **1.437 GiB**; the actual filesystem gain can differ
because of APFS sharing and concurrent activity. Both are real directories owned
by the current user; no open cache files or matching package/build processes were
found. Repeat those checks before deletion. The prepared operator refuses to run
without its explicit approval interlock and removes only these exact directories.
It preserves source, installed dependencies, application artifacts, symbols,
native evidence, simulator sessions and personal files. It does not alter file
protections. Caches will download again when needed.

The O2 proposal explicitly excludes cache cleanup, and the repository approval
gate requires authorization for destructive cleanup. Once this narrow action is
approved, perform it, repeat the fresh O2 preflight, and continue the existing
approved sequence when capacity reaches 20 GiB. Do not ask again for O2 itself
or between its successful phases. Capacity failure grants no native retry and
does not relax the minimum. All previous failures and closed budgets remain.

Verification: cleanup Python syntax passed; a no-approval invocation refused
before filesystem/process operations. No application or tracked executable bytes
changed; retain the existing exact-8972865 make-ready evidence.

The [continuation preparation](n1-f1-o2-continuation-preparation.json) archives an
outer host observer for the unchanged link matrix. Root review and four mocked
platform/result/deadline/cleanup checks passed; no native operation ran. Use it
only after the complete O2 proof passes root review. Export selectors and passive
native main-thread sampling must still be established before the first export tap.
