#!/usr/bin/env node
// Independent read-only code review through the Codex CLI (GPT-6.1 Sol).
// The review binds to an exact base and candidate commit, or to a recorded
// working-tree diff, and fails closed when Codex fails or its output is invalid.
// See docs/development-workflow.md#independent-review.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REVIEW_MODEL = "gpt-6.1-sol";
export const EFFORTS = ["low", "medium", "high", "xhigh"];
export const DEFAULT_EFFORT = "medium";
const SEVERITIES = ["critical", "high", "medium", "low"];
const FINDING_FIELDS = ["severity", "title", "file", "line", "trigger", "consequence", "evidence"];

// Features that could reach connectors, browsers, other agents or hooks. The
// read-only sandbox limits the filesystem; these keep the reviewer off the rest.
export const DISABLED_FEATURES = [
  "apps",
  "plugins",
  "remote_plugin",
  "multi_agent",
  "browser_use",
  "browser_use_external",
  "in_app_browser",
  "computer_use",
  "image_generation",
  "hooks",
];

export const EXIT = { ok: 0, usage: 64, codexFailed: 2, invalidOutput: 3, configMismatch: 4, workingTreeChanged: 5 };

const USAGE = `Usage: node scripts/codex-review.mjs --base <ref> [--head <ref> | --uncommitted]
       [--criteria <file>] [--effort ${EFFORTS.join("|")}] [--out <dir>] [--codex <path>]

Reviews the change from --base to --head (default HEAD), or with --uncommitted the
working tree against --base including untracked files. Codex is found through
--codex, CODEX_BIN, or "codex" on PATH. Output goes to .artifacts/reviews/.`;

export class UsageError extends Error {}

export function parseArgs(argv) {
  const options = { head: undefined, uncommitted: false, effort: DEFAULT_EFFORT };
  const valued = { "--base": "base", "--head": "head", "--criteria": "criteria", "--effort": "effort", "--out": "out", "--codex": "codex" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg === "--uncommitted") {
      options.uncommitted = true;
    } else if (valued[arg]) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("--")) throw new UsageError(`${arg} requires a value`);
      options[valued[arg]] = value;
      index += 1;
    } else {
      throw new UsageError(`Unknown argument: ${arg}`);
    }
  }
  if (!options.base) throw new UsageError("--base is required");
  if (options.uncommitted && options.head) throw new UsageError("--head and --uncommitted cannot be combined");
  if (!EFFORTS.includes(options.effort)) throw new UsageError(`--effort must be one of ${EFFORTS.join(", ")}`);
  return options;
}

export function findingsSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["verdict", "summary", "findings"],
    properties: {
      verdict: { type: "string", enum: ["clean", "findings"] },
      summary: { type: "string" },
      findings: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: FINDING_FIELDS,
          properties: {
            severity: { type: "string", enum: SEVERITIES },
            title: { type: "string" },
            file: { type: "string" },
            line: { type: "integer" },
            trigger: { type: "string" },
            consequence: { type: "string" },
            evidence: { type: "string" },
          },
        },
      },
    },
  };
}

export function buildPrompt({ baseSha, headSha, uncommitted, status, criteria }) {
  const scope = uncommitted
    ? [
        `Scope: the working tree against base ${baseSha}, including untracked files.`,
        `Inspect it with \`git diff ${baseSha}\` and read the untracked files listed below directly.`,
        "Working-tree status at capture time:",
        "```",
        status.trim() || "(clean)",
        "```",
      ]
    : [
        `Scope: the change from base ${baseSha} to candidate ${headSha}.`,
        `Inspect it with \`git diff ${baseSha} ${headSha}\` and \`git log ${baseSha}..${headSha}\`.`,
        `Read candidate files with \`git show ${headSha}:<path>\`; the working tree may differ.`,
      ];
  return [
    "You are an independent code reviewer for the TableUs repository. You only review.",
    "Do not edit, create or delete files, change git state, install packages, run builds or",
    "test suites, contact external services or start other agents. Read-only git, ls and rg",
    "commands are fine.",
    "",
    ...scope,
    "",
    "Context to read as needed: AGENTS.md, docs/task-packets/active.md,",
    "docs/development-workflow.md and the touched files. Key architecture: backend/ is",
    "Python 3.12 FastAPI with async SQLAlchemy and Alembic; frontend/ is Next.js; mobile/ is",
    "Expo Router; only packages/api-client and packages/domain are shared; app data flows",
    "through /api/v1 and Supabase client access is authentication-only. Preserve invite-only",
    "access, privacy controls and deterministic local/CI providers.",
    "",
    "Acceptance criteria:",
    criteria?.trim() || "Use the objective and acceptance in docs/task-packets/active.md at the candidate.",
    "",
    "Look for concrete bugs, security or privacy regressions, missing failure handling and",
    "material test gaps introduced or exposed by this change. Report only issues you can",
    "support with evidence from the repository; skip style preferences. A clean result is",
    "valid and expected when you find nothing actionable.",
    "",
    "For each finding give severity (critical, high, medium or low), a short title, the file",
    "and line (0 when not line-specific), the trigger or reproduction, the consequence and",
    "the evidence. Set verdict to \"clean\" with an empty findings list when there are none.",
  ].join("\n");
}

export function buildCodexArgs({ repoRoot, effort, schemaPath, lastMessagePath }) {
  return [
    "exec",
    "--model", REVIEW_MODEL,
    "-c", `model_reasoning_effort="${effort}"`,
    "-c", `review_model="${REVIEW_MODEL}"`,
    "-c", 'approval_policy="never"',
    "-c", 'web_search="disabled"',
    "-c", "agents.enabled=false",
    ...DISABLED_FEATURES.flatMap((feature) => ["--disable", feature]),
    "--sandbox", "read-only",
    "--ignore-user-config",
    "--strict-config",
    "--ephemeral",
    "--color", "never",
    "--cd", repoRoot,
    "--output-schema", schemaPath,
    "--output-last-message", lastMessagePath,
    "-",
  ];
}

// Codex prints its effective configuration as "key: value" lines before the transcript.
export function parseHeader(output) {
  const header = {};
  for (const line of output.split("\n")) {
    const match = /^(model|provider|approval|sandbox|reasoning effort): (.+)$/.exec(line.trim());
    if (match && header[match[1]] === undefined) header[match[1]] = match[2].trim();
  }
  return header;
}

export function headerMismatches(header, effort) {
  const expected = { model: REVIEW_MODEL, sandbox: "read-only", approval: "never", "reasoning effort": effort };
  return Object.entries(expected)
    .filter(([key, value]) => header[key] !== value)
    .map(([key, value]) => `${key}: expected ${value}, observed ${header[key] ?? "(missing)"}`);
}

export function validateFindings(value) {
  const errors = [];
  if (!value || typeof value !== "object") return ["result is not an object"];
  if (!["clean", "findings"].includes(value.verdict)) errors.push("verdict must be clean or findings");
  if (typeof value.summary !== "string") errors.push("summary must be a string");
  if (!Array.isArray(value.findings)) return [...errors, "findings must be an array"];
  if (value.verdict === "clean" && value.findings.length > 0) errors.push("clean verdict has findings");
  if (value.verdict === "findings" && value.findings.length === 0) errors.push("findings verdict has no findings");
  value.findings.forEach((finding, index) => {
    for (const field of FINDING_FIELDS) {
      if (finding?.[field] === undefined) errors.push(`finding ${index} lacks ${field}`);
    }
    if (finding && !SEVERITIES.includes(finding.severity)) errors.push(`finding ${index} has invalid severity`);
    if (finding && !Number.isInteger(finding.line)) errors.push(`finding ${index} line must be an integer`);
  });
  return errors;
}

export function formatSummary(summary, result) {
  const lines = [
    `Codex review: ${summary.status}`,
    `  base ${summary.baseSha}  candidate ${summary.uncommitted ? `working tree at ${summary.headSha}` : summary.headSha}`,
    `  model ${summary.observed.model ?? "(unknown)"}  effort ${summary.observed["reasoning effort"] ?? "(unknown)"}  sandbox ${summary.observed.sandbox ?? "(unknown)"}`,
    `  artifacts ${summary.outDir}`,
  ];
  for (const problem of summary.problems) lines.push(`  problem: ${problem}`);
  if (result) {
    lines.push("", `Verdict: ${result.verdict}. ${result.summary}`);
    for (const finding of result.findings) {
      lines.push(`- [${finding.severity}] ${finding.title} (${finding.file}:${finding.line})`);
      lines.push(`  trigger: ${finding.trigger}`, `  consequence: ${finding.consequence}`, `  evidence: ${finding.evidence}`);
    }
  }
  return lines.join("\n");
}

function defaultRun(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...options });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error };
}

function git(run, cwd, args) {
  const result = run("git", args, { cwd });
  if (result.status !== 0) throw new UsageError(`git ${args.join(" ")} failed: ${(result.stderr || "").trim()}`);
  return result.stdout.trim();
}

export function resolveCodex(options, env, run) {
  const candidate = options.codex || env.CODEX_BIN || "codex";
  const probe = run(candidate, ["--version"], {});
  if (probe.error || probe.status !== 0) {
    throw new UsageError(
      `Codex CLI not found at "${candidate}". Install it on PATH or set CODEX_BIN to its path, ` +
        "then run `codex login status` to confirm ChatGPT authentication.",
    );
  }
  return { command: candidate, version: probe.stdout.trim() };
}

// Binds a working-tree review to the exact tracked diff and untracked bytes.
function workingTreeFingerprint(run, repoRoot, baseSha) {
  const hash = createHash("sha256").update(git(run, repoRoot, ["diff", "--binary", baseSha]));
  const untracked = git(run, repoRoot, ["ls-files", "--others", "--exclude-standard", "-z"]).split("\0").filter(Boolean);
  for (const path of untracked.sort()) hash.update(`\0${path}\0`).update(readFileSync(join(repoRoot, path)));
  return hash.digest("hex");
}

export function runReview(options, { env = process.env, run = defaultRun, cwd = process.cwd(), now = new Date() } = {}) {
  const repoRoot = git(run, cwd, ["rev-parse", "--show-toplevel"]);
  const baseSha = git(run, repoRoot, ["rev-parse", "--verify", `${options.base}^{commit}`]);
  const headSha = git(run, repoRoot, ["rev-parse", "--verify", `${options.head ?? "HEAD"}^{commit}`]);
  const status = git(run, repoRoot, ["status", "--porcelain=v1", "--untracked-files=all"]);
  const codex = resolveCodex(options, env, run);
  const criteria = options.criteria ? readFileSync(resolve(cwd, options.criteria), "utf8") : undefined;

  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const outDir = resolve(cwd, options.out ?? join(repoRoot, ".artifacts", "reviews", `${headSha.slice(0, 12)}-${stamp}`));
  mkdirSync(outDir, { recursive: true });
  const schemaPath = join(outDir, "schema.json");
  const lastMessagePath = join(outDir, "findings.json");
  if (["findings.json", "summary.json", "codex.log"].some((name) => existsSync(join(outDir, name)))) {
    throw new UsageError(`${outDir} already holds a review; choose a new --out directory`);
  }
  const prompt = buildPrompt({ baseSha, headSha, uncommitted: options.uncommitted, status, criteria });
  writeFileSync(schemaPath, `${JSON.stringify(findingsSchema(), null, 2)}\n`);
  writeFileSync(join(outDir, "prompt.md"), `${prompt}\n`);

  const diffFingerprint = options.uncommitted ? workingTreeFingerprint(run, repoRoot, baseSha) : undefined;

  const args = buildCodexArgs({ repoRoot, effort: options.effort, schemaPath, lastMessagePath });
  const execution = run(codex.command, args, { cwd: repoRoot, input: prompt });
  const log = `${execution.stdout}\n${execution.stderr}`;
  writeFileSync(join(outDir, "codex.log"), log);
  const observed = parseHeader(log);

  const problems = [];
  let result;
  let exitCode = EXIT.ok;
  if (execution.error || execution.status !== 0) {
    problems.push(`codex exited with ${execution.error ? execution.error.message : `status ${execution.status}`}`);
    exitCode = EXIT.codexFailed;
  } else {
    const mismatches = headerMismatches(observed, options.effort);
    if (mismatches.length > 0) {
      problems.push(...mismatches);
      exitCode = EXIT.configMismatch;
    }
    if (!existsSync(lastMessagePath)) {
      problems.push("codex wrote no final message");
      exitCode = EXIT.invalidOutput;
    } else {
      try {
        result = JSON.parse(readFileSync(lastMessagePath, "utf8"));
        const errors = validateFindings(result);
        if (errors.length > 0) {
          problems.push(...errors);
          result = undefined;
          exitCode = EXIT.invalidOutput;
        }
      } catch (error) {
        problems.push(`final message is not JSON: ${error.message}`);
        exitCode = EXIT.invalidOutput;
      }
    }
  }
  if (options.uncommitted && workingTreeFingerprint(run, repoRoot, baseSha) !== diffFingerprint) {
    problems.push("working tree changed during the review; rerun on a stable tree");
    result = undefined;
    exitCode = EXIT.workingTreeChanged;
  }

  const summary = {
    status: exitCode === EXIT.ok ? "completed" : "failed",
    exitCode,
    baseSha,
    headSha,
    uncommitted: options.uncommitted,
    diffFingerprint,
    workingTreeStatus: status,
    requested: { model: REVIEW_MODEL, effort: options.effort, sandbox: "read-only", approval: "never" },
    observed,
    codexVersion: codex.version,
    verdict: result?.verdict,
    findingCount: result?.findings.length,
    problems,
    outDir,
    startedAt: now.toISOString(),
  };
  writeFileSync(join(outDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  return { summary, result, exitCode };
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(USAGE);
      return EXIT.ok;
    }
    const { summary, result, exitCode } = runReview(options);
    console.log(formatSummary(summary, result));
    return exitCode;
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(`${error.message}\n\n${USAGE}`);
      return EXIT.usage;
    }
    throw error;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
