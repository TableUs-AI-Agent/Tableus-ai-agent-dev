# GPT-6 development workflow migration

Owner-requested governance prerequisite on 2026-09-22, starting from
`8f6c34bd682923539f9edf23ae1db4437ab58d49` in the existing isolated native task.
Application remains frozen at `8972865893a3f018a064594457dc9cc664f8a61f`;
operator remains `16603dd0cf36d27b492e57a02d3c6c438a2563c4`. This amendment keeps
the incomplete native objective in place and changes only development instructions,
Codex agent configuration and current documentation.

## Migration scope and source review

The owner requested Astra orchestration, Sol implementation and Luna lighter work.
Root defaults remain Astra, preserving the existing reasoning preference. The
project defaults new child work to Sol/medium, limits concurrent children to two,
and defines named Sol and Luna/low read-only agents. Current tasks can have explicit
settings; a configuration edit does not change their running model. Mixed-model
collaboration in this task explicitly selected Sol and Luna with self-contained
briefs. No global account/model preference was overwritten.

All four requested sources were read. The two openai.com articles rejected the
HTTP reader, then loaded successfully in the background browser. No fallback
source was substituted for them.

| Official source | Applied decision |
| --- | --- |
| [GPT-6 model guidance](https://developers.openai.com/api/docs/guides/latest-model) and its [migration quickstart](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md#migration-quickstart) | Carry the authorized task through checks and repair; resolve routine gaps; make outstanding approval requests concrete; preserve the requested model roles |
| [Rethinking skills and prompts](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra) | Remove conflicting Astra-only/no-delegation rules, load documents by relevance, and avoid full application tests for developer-only instructions |
| [Introducing Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/) | Use the explicit GPT-6 model IDs and the owner's division of responsibilities; do not infer project quality or cost from launch benchmarks |
| [Better prompt caching](https://openai.com/index/better-prompt-caching-for-gpt-6/) and [API caching details](https://developers.openai.com/api/docs/guides/prompt-caching) | Keep stable role context ahead of task facts, limit repeated logs/history, and avoid model/tool-definition churn; do not promise cross-model reuse or measured savings |
| [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) | Use supported project `[agents]` defaults and standalone named-agent TOML, with per-agent effort and read-only Luna sandbox |

The migration applies to Codex development. Active application/provider inspection
found Gemini, not an OpenAI Responses/Chat Completions integration. Thus endpoint,
request sampling parameters, API keys, `prompt_cache_options`, breakpoints,
`configuration_update` and `allowed_tools` are not injected into application or
Codex config. Those are API-harness concerns if such a harness is introduced later.
No application provider migration or paid live evaluation ran.

## Instruction audit and implementation

Luna performed the bounded read-only audit and identified conflicts in root
`AGENTS.md`, the workflow, current state, decisions and active packet. Astra
rejected its suggestion to make Sol the root default, preserving the owner's
explicit Astra authority. Sol then implemented the owned AGENTS/workflow/config
slice; Astra reviewed it, clarified completion language, supplied usable task
briefs and integrated the current documents.

Routine implementation, local deterministic tests and fixes now continue within
standing authority; delegates return evidence to Astra. Consequential unresolved
decisions and still-unapproved external/destructive actions retain their gates.
Native stop-on-failure is explicitly separate from ordinary local test iteration.
Canceled security scans, attempt counts and the closed provider ledger remain intact.
No global/plugin skill was rewritten or disabled. There is no project SKILL.md;
the generated Next.js local guidance is relevant to frontend changes and retained.
If a used skill genuinely blocks work, the instructions require a precise linked
rule and explanation instead of an inferred blanket approval requirement.

## Verification and continuation

Configuration syntax, supported host settings, actual delegated tasks, active
instruction consistency, local links and unchanged application/operator bytes are
validated in [verification.json](verification.json). This is developer configuration, so F1's exact
application verification is reused: 292 JavaScript and 98 Python passes, three
PostgreSQL skips; no redundant full suite or native build.

The native continuation remains capacity-blocked: approximately 14.7 GiB free
versus 40 GiB required before a build. A read-only continuation measured npm storage at 7.97 GiB, Gradle caches at
4.19 GiB, CocoaPods cache at 3.30 GiB and Xcode DerivedData at 2.05 GiB. Even
recovering all of those measured blocks would leave free space below 40 GiB;
APFS sharing can also make actual recovery smaller. These are review candidates,
not verified-safe deletion targets; DerivedData may retain useful diagnostics.
The broader Library/Caches scan had 12 permission errors and is incomplete.
The capacity scan is retained privately; no personal download file was inspected.
No native retry, cleanup, SDK download, external app mutation, deployment, merge
or live budget reset occurred here.
The [F1 native plan](../native-replacement-validation-2026-09-21/n1-f1-native-revalidation.md)
and its unresolved canonical/auth and crash/AppHang gates remain active.
