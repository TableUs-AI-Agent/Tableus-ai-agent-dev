# Merge evidence: Claude Code workflow migration

Recorded 2026-10-15 (America/Chicago) after Brian approved the merge in the
project thread.

| Item | Value |
| --- | --- |
| PR | [#13](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/13), merge commit |
| Base before merge | `3a2357f888d075b766d9b1259abe9e0e04856bd5` (verified with `git ls-remote`) |
| Tested head | `716d1e8c45bfc2c762863eb133c869f3667fc86f` (merge bound with `--match-head-commit`) |
| Merge | `743781ae7f36cc3e5b16023a9fc27f27a3a70ff2`; tree identical to the tested head |
| Hosted CI | [Run 38799532717](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/38799532717) passed: 378 JavaScript tests, 242 Python tests with zero skips, 13 browser journeys, plus migrations, lint/types, contracts, builds and smoke |
| Deployment | `vercel.json` disables Git deployment for `main` and the PR branch; GitHub lists no deployment or commit status for the head or merge SHA after merge |

Scope: development workflow only (Claude Code settings, helper subagents, the
GPT-6.1 Sol review wrapper and documentation). Application code, providers and
`.codex/` are unchanged. No deployment, native build or other gate was exercised.
