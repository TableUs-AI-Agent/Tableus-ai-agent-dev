# F1-S2 — cleanup completed with three skips

The owner approved the [seven-path proposal](f1-storage-s2-proposal.md) at
`f1cf6e7710133a0f235e60a4ff68e9f907f3e3f2`. One cleanup operation completed in **15.082 seconds**,
within its 180-second limit and 2 GiB allocation cap.

**Four Arc HTTP/code cache directories were deleted**, totaling approximately
**0.980 GiB allocated**. Arc quit normally before deletion;
no force quit or unsaved-work prompt dismissal occurred. Their parent profile
folders remain. The Webpack, npm and React Native cache directories were untouched.

Those three skips resulted from a bug in the one-off guard: its `/pod` substring
matched Apple's `PodcastsWidget` executable. This was a false positive, not proof
that a build was running. The immutable receipt retains that original classification;
this review corrects its interpretation. No failed deletion, follow-up deletion
or retry occurred. The one-off script must not be reused with this matcher.

## Observations and preservation

| Observation | Free GiB |
| --- | ---: |
| Before cleanup | 20.209 |
| Immediately afterward | 22.236 |
| Independent postcheck | 26.245 |

Availability fluctuated beyond the deleted allocation; the larger increase cannot
be attributed solely to deleting caches. Postcheck at `2026-09-24T04:15:32.625163+00:00` confirmed
all four deleted paths absent, their parents intact, all three skipped paths at
their original filesystem identities, and no Arc processes. It also verified all
18 frozen P3 preparation files and their index, and existence of retained native
evidence, simulator data, Codex sessions and final frontend output. This was not
a whole-disk integrity audit. Application/executable source is unchanged.

Seven private files retain the receipt, exact invoked script, inventory, proposal
and independent postcheck under `/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/storage-execution-s2`.
Index SHA-256: `a0bcde6bb8e54126186fee9a5eac8e94bfd72eefc4751b54cb4cc77cb9366c86`.
[Machine-readable result](f1-storage-s2-result.json) records exact paths/counts and
source associations. Luna independently reviewed the scope and matcher defect.
Fresh evidence hashes, JSON and local links were checked; unchanged P3 readiness
results are reused. No native operation or full-suite rerun occurred.

## Next action

S2 is closed with skips; the remaining three caches need no further cleanup now.
Current observed capacity exceeds the native gate, but it must be measured again
immediately before any run. The [P3-R1 resumption proposal](n1-f1-p3r1-proposal.md)
requests one invocation of the unchanged frozen operator under the same limits.
It is not executed or automatically authorized by cleanup. Previous native
failures and remaining acceptance gates are unchanged; this task stays open.
