# F1 capacity cleanup — 2026-09-22

Owner authorization: “continue with the next steps, I authorize.” The
[scope amendment](n1-f1-resumption-approval.json) preserves the original native
attempt ledger and adds one bounded F1 iOS attempt, conditional Android rebinding,
and inspected regenerable-cache cleanup. It does not authorize N2 or the separate
canonical/auth/physical probes.

[Cleanup receipt](f1-storage-cleanup.json) records 53 removed cache directories:
package-manager downloads/transforms; browser HTTP/code caches; editor extension
installers; Expo Go download caches; Google updater downloads; and stale Xcode
compiler intermediates last written September 2. Final built apps, symbols,
archives, diagnostic logs, source, simulator sessions, Docker data, browser saved
data/service workers and personal files were preserved.

Filesystem free space rose from 15.34 GiB immediately before deletion to 42.20 GiB
after the batches. The observed 26.85 GiB change includes concurrent system
activity/APFS effects; overlapping per-batch measurements must not be summed.
Caches can refill. The build wrapper checks capacity again immediately before
starting and stops below 20 GiB during the attempt.

One roughly 258 MiB cached React Native DevTools download remains. Its user-owned
read-only app directories rejected deletion and then chmod outside the sandbox
(EACCES/EPERM). Both failures are retained; macOS protections were not bypassed.
The residual cache did not prevent the final capacity gate.

The exact source/operator/toolchain and output-path preflight passed, including
Node 22.23.1, npm 10.9.8, Xcode 27.0/27A266a and simulator SDK 27.0. The display shell
subsequently rejected its reserved variable `status`; no native attempt was
started by that shell. The build runner repeats all preflight checks separately.

Application remains 8972865893a3f018a064594457dc9cc664f8a61f; build operator remains
16603dd0cf36d27b492e57a02d3c6c438a2563c4. Cache deletion is not application
validation. The F1 make-ready result is reused for byte-identical source; no
full-suite rerun was needed for cleanup/evidence preparation.
