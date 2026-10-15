import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  DEFAULT_EFFORT,
  EXIT,
  REVIEW_MODEL,
  UsageError,
  buildCodexArgs,
  buildPrompt,
  parseArgs,
  parseHeader,
  runReview,
  validateFindings,
} from "./codex-review.mjs";

const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);
const HEADER = (overrides = {}) => {
  const values = { model: REVIEW_MODEL, provider: "openai", approval: "never", sandbox: "read-only", "reasoning effort": "medium", ...overrides };
  return ["OpenAI Codex vtest", "--------", ...Object.entries(values).map(([key, value]) => `${key}: ${value}`), "--------"].join("\n");
};
const CLEAN = { verdict: "clean", summary: "No actionable issues.", findings: [] };

function fakeRun({ codexStatus = 0, header = HEADER(), message = CLEAN, writeMessage = true, codexMissing = false, status = "" } = {}) {
  const calls = [];
  const run = (command, args, options) => {
    calls.push({ command, args, options });
    if (command === "git") {
      const [sub, ...rest] = args;
      if (sub === "rev-parse" && rest[0] === "--show-toplevel") return ok("/repo\n");
      if (sub === "rev-parse") return ok(`${rest[1].startsWith("base") ? BASE : HEAD}\n`);
      if (sub === "status") return ok(status);
      if (sub === "diff") return ok("diff --git a/x b/x\n");
      if (sub === "ls-files") return ok("");
      return { status: 1, stdout: "", stderr: "unexpected git call" };
    }
    if (args[0] === "--version") {
      return codexMissing ? { status: null, stdout: "", stderr: "", error: new Error("ENOENT") } : ok("codex-cli test\n");
    }
    const lastMessage = args[args.indexOf("--output-last-message") + 1];
    if (writeMessage) writeFileSync(lastMessage, typeof message === "string" ? message : JSON.stringify(message));
    return { status: codexStatus, stdout: "", stderr: header };
  };
  return { run, calls };
}

function ok(stdout) {
  return { status: 0, stdout, stderr: "" };
}

function withOutDir(fn) {
  const out = mkdtempSync(join(tmpdir(), "tableus-codex-review-"));
  try {
    return fn(out);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

test("parseArgs requires a base and rejects incompatible or unknown options", () => {
  assert.throws(() => parseArgs([]), UsageError);
  assert.throws(() => parseArgs(["--base", "main", "--head", "x", "--uncommitted"]), /cannot be combined/);
  assert.throws(() => parseArgs(["--base", "main", "--effort", "max"]), /--effort/);
  assert.throws(() => parseArgs(["--base", "main", "--model", "other"]), /Unknown argument/);
  assert.throws(() => parseArgs(["--base", "--uncommitted"]), /requires a value/);
  assert.deepEqual(parseArgs(["--base", "main"]), { head: undefined, uncommitted: false, effort: DEFAULT_EFFORT, base: "main" });
});

test("buildCodexArgs pins Sol, read-only sandbox, no approvals and no connector features", () => {
  const args = buildCodexArgs({ repoRoot: "/repo", effort: "high", schemaPath: "/o/s.json", lastMessagePath: "/o/f.json" });
  assert.equal(args[0], "exec");
  assert.equal(args[args.indexOf("--model") + 1], REVIEW_MODEL);
  assert.equal(args[args.indexOf("--sandbox") + 1], "read-only");
  assert.ok(args.includes('model_reasoning_effort="high"'));
  assert.ok(args.includes('approval_policy="never"'));
  assert.ok(args.includes("agents.enabled=false"));
  assert.ok(args.includes("--ignore-user-config"));
  assert.ok(args.includes("--strict-config"));
  for (const feature of ["apps", "plugins", "multi_agent", "computer_use", "browser_use", "hooks"]) {
    assert.equal(args[args.indexOf(feature) - 1], "--disable", feature);
  }
  assert.ok(!args.some((arg) => arg.includes("dangerously")));
  assert.equal(args.at(-1), "-");
});

test("buildPrompt binds commit and working-tree scopes", () => {
  const commit = buildPrompt({ baseSha: BASE, headSha: HEAD, uncommitted: false, status: "" });
  assert.match(commit, new RegExp(`git diff ${BASE} ${HEAD}`));
  assert.match(commit, /docs\/task-packets\/active\.md/);
  const tree = buildPrompt({ baseSha: BASE, headSha: HEAD, uncommitted: true, status: "?? new.md\n", criteria: "Must not leak tokens." });
  assert.match(tree, /including untracked files/);
  assert.match(tree, /\?\? new\.md/);
  assert.match(tree, /Must not leak tokens\./);
});

test("parseHeader reads the effective configuration Codex prints", () => {
  assert.deepEqual(parseHeader(`${HEADER({ "reasoning effort": "high" })}\nuser\nmodel: ignored later`), {
    model: REVIEW_MODEL,
    provider: "openai",
    approval: "never",
    sandbox: "read-only",
    "reasoning effort": "high",
  });
});

test("validateFindings accepts clean and evidenced results and rejects inconsistent ones", () => {
  assert.deepEqual(validateFindings(CLEAN), []);
  const finding = { severity: "high", title: "t", file: "a.py", line: 3, trigger: "x", consequence: "y", evidence: "z" };
  assert.deepEqual(validateFindings({ verdict: "findings", summary: "s", findings: [finding] }), []);
  assert.ok(validateFindings({ verdict: "clean", summary: "s", findings: [finding] }).length > 0);
  assert.ok(validateFindings({ verdict: "findings", summary: "s", findings: [] }).length > 0);
  assert.ok(validateFindings({ verdict: "findings", summary: "s", findings: [{ ...finding, severity: "info" }] }).length > 0);
  assert.ok(validateFindings({ verdict: "findings", summary: "s", findings: [{ ...finding, line: "3" }] }).length > 0);
});

test("runReview completes a clean review and records the binding", () =>
  withOutDir((out) => {
    const { run, calls } = fakeRun();
    const { summary, exitCode } = runReview({ base: "base", effort: "medium", uncommitted: false, out }, { run, env: {}, cwd: "/repo" });
    assert.equal(exitCode, EXIT.ok);
    assert.equal(summary.verdict, "clean");
    assert.equal(summary.baseSha, BASE);
    assert.equal(summary.headSha, HEAD);
    assert.equal(summary.observed.model, REVIEW_MODEL);
    const codexCall = calls.find((call) => call.args[0] === "exec");
    assert.equal(codexCall.command, "codex");
    assert.match(codexCall.options.input, new RegExp(BASE));
    assert.equal(JSON.parse(readFileSync(join(out, "summary.json"), "utf8")).status, "completed");
  }));

test("runReview fails closed when Codex exits nonzero even if output exists", () =>
  withOutDir((out) => {
    const { run } = fakeRun({ codexStatus: 1 });
    const { summary, exitCode } = runReview({ base: "base", effort: "medium", uncommitted: false, out }, { run, env: {}, cwd: "/repo" });
    assert.equal(exitCode, EXIT.codexFailed);
    assert.equal(summary.status, "failed");
    assert.equal(summary.verdict, undefined);
  }));

test("runReview rejects missing, malformed or invalid final messages", () => {
  for (const scenario of [{ writeMessage: false }, { message: "not json" }, { message: { verdict: "maybe" } }]) {
    withOutDir((out) => {
      const { run } = fakeRun(scenario);
      const { exitCode } = runReview({ base: "base", effort: "medium", uncommitted: false, out }, { run, env: {}, cwd: "/repo" });
      assert.equal(exitCode, EXIT.invalidOutput);
    });
  }
});

test("runReview reports a model, sandbox or effort mismatch instead of a clean review", () =>
  withOutDir((out) => {
    const { run } = fakeRun({ header: HEADER({ model: "gpt-6-astra", sandbox: "workspace-write" }) });
    const { summary, exitCode } = runReview({ base: "base", effort: "medium", uncommitted: false, out }, { run, env: {}, cwd: "/repo" });
    assert.equal(exitCode, EXIT.configMismatch);
    assert.ok(summary.problems.some((problem) => problem.includes("gpt-6-astra")));
    assert.ok(summary.problems.some((problem) => problem.includes("workspace-write")));
  }));

test("runReview fingerprints working-tree reviews and honors CODEX_BIN", () =>
  withOutDir((out) => {
    const { run, calls } = fakeRun({ status: " M AGENTS.md\n" });
    const { summary, exitCode } = runReview({ base: "base", effort: "medium", uncommitted: true, out }, { run, env: { CODEX_BIN: "/opt/codex" }, cwd: "/repo" });
    assert.equal(exitCode, EXIT.ok);
    assert.match(summary.diffFingerprint, /^[0-9a-f]{64}$/);
    assert.equal(calls.find((call) => call.args[0] === "exec").command, "/opt/codex");
  }));

test("runReview explains how to locate Codex when it is unavailable", () =>
  withOutDir((out) => {
    const { run } = fakeRun({ codexMissing: true });
    assert.throws(
      () => runReview({ base: "base", effort: "medium", uncommitted: false, out }, { run, env: {}, cwd: "/repo" }),
      /CODEX_BIN/,
    );
  }));
