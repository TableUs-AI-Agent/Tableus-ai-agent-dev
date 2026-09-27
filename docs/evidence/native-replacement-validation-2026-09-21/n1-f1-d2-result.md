# F1 D2 runtime diagnostic — passed

The owner [approved the exact D2 amendment](n1-f1-d2-approval.json). Fresh
artifact/source/lock, native UUID and map checks matched the pinned F1 proof
before launch. This used the existing `8972865` build and disposable iOS 26.5
target; no rebuild, application change or accepted-device update occurred.

One additional capture completed in **39.147 seconds**, within the 120-second
limit. It recorded 8,661 samples and 1,644 stack frames; termination returned
zero and no matching crash report was found in the initial or pre-replay check.
The 12-second scheduled sampler disable produced an observed sample span of
11.634223 seconds. The raw trace is retained unchanged.

LLDB observed the app startup breakpoint, with arm64 executable/dSYM UUID
`FDFE7E63-E080-3870-AE80-E8D074049175`. Independent `atos` resolution of the
captured program counter matches AppDelegate.swift:18. Candidate-installed
Metro 0.84.5 resolved 21 sampled app frames and 77 Router frames, matching
55 source files while preserving sample/parent relationships. No direct decoder
frame was sampled; its map-source contents remain covered by artifact proof.

Operator timestamps measured 0.601021 seconds for attach and 9.517696 seconds
between `continue` and the observed breakpoint. These are wall-clock differences
inside the same LLDB process. The successful capture does not explain the earlier
untimed 45-second failure or clear the historical debugger crash/AppHang.

[Structured evidence](n1-f1-d2-result.json) binds the exact source, artifact,
simulator and private-file hashes. Both earlier F1 output directories remain
retained. The D2 allowance is consumed, with no further automatic capture retry.
Fresh runtime proof now permits the already-authorized local lifecycle,
offline/refresh, link and export sequence under its original limits. Their
behavioral results are separate; N1 is not complete from this diagnostic alone.
