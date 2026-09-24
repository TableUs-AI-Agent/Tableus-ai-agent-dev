# F1-S2 — proposed cache recovery

**Prepared, not approved or executed.** Following the [P3 capacity stop](n1-f1-p3-result.md),
a read-only inventory measured **20.217 GiB free** and **1.664 GiB**
allocated to the seven disposable caches below. Storage has fluctuated without
our deleting anything. Recovered space is not guaranteed; current headroom above
the native 20 GiB gate is small. This proposal does not authorize native execution.

| Exact deletion target | Allocated GiB |
| --- | ---: |
| `/Users/brianchei/Library/Caches/Arc/User Data/Default/Cache` | 0.868 |
| `/Users/brianchei/Library/Caches/Arc/User Data/Default/Code Cache` | 0.092 |
| `/Users/brianchei/Library/Caches/Arc/User Data/Profile 4/Cache` | 0.019 |
| `/Users/brianchei/Library/Caches/Arc/User Data/Profile 4/Code Cache` | 0.001 |
| `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev/frontend/.next/cache/webpack` | 0.425 |
| `/Users/brianchei/.npm/_cacache` | 0.057 |
| `/Users/brianchei/Library/Caches/ReactNative` | 0.202 |

Webpack compiled application output outside `cache/webpack` remains intact.
React Native's six entries are downloaded React Native/Hermes tarballs; the
installed SDKs and native artifacts remain. Cache regeneration can require
redownloads and make subsequent builds/pages slower.

## Execution scope for approval

One cleanup operation, maximum 180 seconds, with at most 2 GiB of allocated target
data after a fresh measurement. Approval includes requesting a **normal Arc quit**
once, because Arc is running and has files open in both HTTP cache directories.
Wait at most 30 seconds; do not force quit or dismiss unsaved-work prompts. If Arc
remains running, skip all four Arc targets and report the smaller cleanup.

Before each deletion, verify exact real paths and identities, no symlink targets,
ancestors or descendants, no active builder/open files, and no evidence or final
build output. Skip any target whose idle state cannot be established. Delete only
the seven listed directories, retaining their parents. Stop on the first deletion
error, identity change, deadline or unexpected scope; record partial outcomes.
No permission changes, forced termination, fallback broad deletion or retry.
Retain a receipt and measure free bytes afterward. No native retry is included.

## Exclusions and evidence

Keep all TableUs worktrees, artifacts/logs/symbols/evidence, simulator data,
installed runtimes/apps/sessions, Xcode archives and Sellr final products/logs.
Keep all Codex task history/runtimes/plugins and its currently used browser cache;
keep Arc profile roots, cookies, local storage and service workers. Keep personal
files/downloads, Docker data, pending updates and the previously failed dotslash
cache. The broader scan encountered unreadable macOS caches and one protected
artifact pyc; none is proposed for deletion.

The [machine-readable scope](f1-storage-s2-proposal.json) binds exact sizes,
path identities, limits and the hashed private inventory. All seven targets and
descendants were free of symlinks at inspection. Non-Arc candidates had no retained
open-file rows; Arc HTTP caches did, despite `lsof` returning code1. Execution must
recheck output, not infer inactivity from exit code alone. Luna reviewed historical
retention/authorization limits; Astra selected and inspected the paths.

[Repository approval gates](../../../AGENTS.md) require explicit approval for
“destructive cleanup.” The earlier 53-target cache cleanup was completed and does
not authorize this batch. No files have been deleted or apps quit. The next
native operation remains separately bounded and gated; P3 is not silently retried.
