# F1-V1 — visual evidence investigation and local review gate

**The blank screenshot's cause remains unresolved.** Offline review establishes
that Preferences launched and its scene became foreground (PID 63600), while the
nearby XCTest snapshot was for SpringBoard. The matched “Settings” node was not
retained. A passing text assertion therefore does not establish visible Settings
content. The [P3-R1 qualified outcome](n1-f1-p3r1-result.md) remains unchanged;
there was no native run, permission reset or cleanup in this phase.

## Evidence and comparison

| Retained first-flow evidence | P2, iOS 26.5 | P3-R1, iOS 27 |
| --- | --- | --- |
| Completed title assertion and screenshot metadata | Yes | Yes |
| Logged Preferences hierarchy during assertion | Yes | No; nearby snapshot names SpringBoard |
| Root visual inspection of PNG | Settings, General and Accessibility visible | White content; system bars only |
| New offline gate | Requires visual review | Insufficient evidence |

P2's screenshot and command hash were checked against retained evidence; it is a
comparison of evidence quality, not a controlled diagnosis or transferred iOS 27
acceptance. System process/scene foreground does not prove rendered contents.
A stale XCTest target, an accessibility label on SpringBoard, or delayed rendering
are possible explanations, not established causes. No retained line identifies
the matching node or proves a rendering failure.

Maestro text selectors may match an accessibility label; they do not inspect
screenshot pixels. [Official selector documentation](https://docs.maestro.dev/reference/selectors/core-selectors).
Adding `waitForAnimationToEnd` would not supply a strict gate either: its timeout
can end successfully. [Official wait documentation](https://docs.maestro.dev/reference/commands-available/waitforanimationtoend).
No timeout was increased or assertion weakened.

## Discovered permission operations

P3-R1's retained CLI log shows its `launchApp` step invoking default `all=allow`
permission handling, including applesimutils and `simctl privacy ... grant
location-always com.apple.Preferences`, with completion records. This exceeded
the intended scope of no explicit Settings/permission changes. Maestro documents
this default. [Official launchApp documentation](https://docs.maestro.dev/reference/commands-available/launchapp).

There is no before/after permission snapshot, so individual state changes cannot
be reconstructed. No permission reset/revocation was attempted from an unknown
baseline. Old artifacts remain intact, and this discovery does not authorize
further permission changes.

Static review of the installed 2.8.0 JARs finds that `permissions: {}` suppresses
the default map expansion but still calls permission handlers. Empty-map native
receiver behavior is unproved; it is not a verified no-op. Exact JAR hashes,
class/method names and bytecode offsets are retained in the private archive.

## Local correction and verification

The new [pure analyzer](../../../scripts/maestro_ui_evidence.py) accepts bounded
command/log data. It requires the exact supported sequence, completed commands,
non-overlapping timestamps, the unchanged 5000ms title assertion, named screenshot
metadata, and a completed Preferences hierarchy wholly inside that assertion
window. Missing, stale, malformed, wrong-application or extra-command evidence
cannot advance to review. Even matching evidence returns **`acceptance:false`**
and `requires_visual_review`; screenshot visibility is a separate check.

Seven focused Python cases and the Node wrapper pass. Root replayed both original
P2 and P3-R1 command/log files through the pure function, with file/process/signal
side effects forbidden: P2 requires visual review; P3-R1 is insufficient. The
original files were rehashed unchanged. The helper's caller must still bind inputs
to the exact approved invocation and inspect the hashed PNG; this utility is not
a complete native acceptance operator.

One fresh `make ready` passed in 77.105s: **294 JavaScript tests** (226 TAP + 68 Jest),
**98 backend tests**, three PostgreSQL skips, lint/type checks, builds and smoke.
The report-only bundle budget completed. Contract generation/check showed no
drift, independently confirmed with `git diff --exit-code` for schema/OpenAPI.
Sol implemented/tests; Astra reviewed, replayed native artifacts and integrated.

[Machine-readable result](n1-f1-v1-result.json) binds source/evidence hashes, checks
and the proposed next protocol. The 14-file private archive index is
`5880ed4052387a15fdc9363c34b4bb51b39e31f609e39846cf27512678f10217`.
Application bytes, invoked P3 operator and all 45 original P3-R1 retained files are
unchanged. The new analyzer has not been used in a native run.

## Next bounded preparation

Prepare a new operator with one explicitly bounded Preferences launch followed by
an assertion/screenshot-only Maestro flow; omit Maestro `launchApp`, permission,
state-clearing and keychain commands. Keep T2 log discovery and add this review
gate. Root must inspect a screenshot showing Settings title and substantive
Settings content before accepting any visual baseline. No user approval is needed
for routine visual review; native execution remains separately gated.

This is a design, not a frozen executable operator or an approval request. Finish
reviewing the assertion-only initialization path, implement/mock-test and freeze
exact inputs/cleanup ownership, then present one concrete native proposal. Preserve
the existing 420s total/240s flow, cleanup reserves, 20 GiB gate and one-attempt limits.
Do not retry P3-R1 or assume changing launch order fixes its blank image. All other
native/application gates, provider budgets and the current task boundary remain.
