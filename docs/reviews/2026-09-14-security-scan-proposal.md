# Proposed security scan for the replacement candidate

Status: superseded after the owner asked to avoid another scan. Installation
was approved; execution was never approved or started. The active objective
prepares staging source-review acceptance instead.
Codex Security `0.1.24` was installed with explicit owner confirmation.
No scan ID was created. Existing canceled scans were not resumed or modified.

## Exact target

- Application SHA: `6b9719b4e63e34803f2e7c2598e45851790df661`.
- Clean detached checkout:
  `/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/security-6b9719b`.
- Proposed desktop launcher: `start_codex_security_prompt_only_scan` with
  `mode: "standard"`, `scope: "."` and that exact target path.
- One repository Standard scan of current source. The target has 503 tracked
  files before exclusions; this is an inventory count, not reviewed coverage.
  Do not traverse earlier revisions or scan the evidence descendant instead.

## Scope

Review the application's security boundaries across backend, web, mobile,
shared packages, deploy/build configuration and supporting tests. Prioritize
sessions/auth approval and local sign-out, query-cache subject isolation,
organizer/participant authorization, private capabilities and invites,
idempotency/replay, provider admission/budgets, telemetry redaction and hosted
origin/credential separation. Retain lower-severity findings too; prioritize
critical and high runtime findings for the release gate.

Exclude `.git`, vendored dependencies, generated build outputs/native projects,
private artifacts/logs, historical evidence and archived documents from audit
coverage. Read applicable current security/product policy as context. These
exclusions are not permission to ignore implementation-owning generated code.
Target source remains read-only. Source review and any deterministic validation
stay offline; no account access, provider calls, URLs, email, deployment or
production tests are authorized by this proposal.

## Effort controls and limitations

- One Standard pass; no Deep scan, repeat scan or automatic replacement.
- At most two active reviewers including the primary agent. Keep an independent
  baseline when possible and serialize other useful investigation within that
  allowance. No persistent concurrency/model/permission changes are proposed.
- At 20 minutes from actual scan start, checkpoint and pause further investigation
  if unfinished. Stop active workers at the next safe boundary, retain their
  partial findings/coverage and report what remains. Do not extend automatically.
  This is an operational checkpoint, not a guaranteed execution/billing cutoff.
- The exposed desktop launcher has no token-budget or dollar-limit argument.
  Its usage collector reports measured/partial/unavailable usage; it does not
  enforce a cap. An internal CLI-only cost-limit method is not a desktop control
  and will not be used as a workaround. No usage percentage or dollar maximum
  is promised. A mandatory hard usage cap would block this proposed launcher.

The plugin's six-worker preflight preference is a warning, not a requirement
for six active reviewers. Keep the explicit two-reviewer limit; report degraded
coverage honestly if it prevents completion. Capability preflight and the access
advisory run only after an authorized scan has authoritative context. Reading
those instructions now has not run preflight or started source investigation.

## Completion and retention

Use the authoritative scan ID/directory returned by the launcher. Save progress
checkpoints to that scan. Validate findings, record the final semantic draft and
seal the canonical artifacts using the plugin once all required phases finish.
Retain the generated report, manifest, findings and coverage plus hashes in
private durable storage, and commit only privacy-safe release evidence.

A paused or partial scan is not release acceptance. Cumulative security sign-off
requires complete authorized coverage, an exact-candidate sealed report and no
unresolved critical/high runtime findings. The existing validator is unchanged;
manual source review, this proposal and the historical scan cannot satisfy it.
Native/hosted acceptance for the replacement remains a separate later gate.

## Inspected controls

Installed plugin sources:
- `skills/security-scan/SKILL.md` and `references/desktop-scan.md`: Standard
  workflow, authoritative desktop launch and sealing.
- `references/core-scan.md`: independent review, bounded worker allowance and
  honest partial coverage when a user limit prevents completion.
- `preflight/capability-profiles.toml`: worker-capacity warning.
- Desktop start/cancel/context/progress tool schemas: no hard usage cap exposed.
- `scripts/workbench_scan_usage.py`: measured usage and unavailable/partial states.
- `scripts/workbench_db.py:set_scan_cost_limit`: limited to a running CLI recipe.

Owner approval must explicitly cover this execution proposal. The prior approval
covered installing the plugin and inspecting controls only.
