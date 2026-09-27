import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

export const SOURCE_REVIEW_POLICY = "staging-source-review-v1";
export const SOURCE_REVIEW_AREAS = ["authentication", "authorization", "private_links", "idempotency", "provider_limits", "hosted_origins", "telemetry"];
const SHA = /^[0-9a-f]{40}$/;
const DIGEST = /^[0-9a-f]{64}$/;
const ID = /^[A-Za-z0-9._:-]{1,200}$/;

export function evidenceDigest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
function exact(value, fields, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...fields].sort())) {
    throw new Error(`${label} contains missing or unknown fields`);
  }
}
function text(value, label) {
  if (typeof value !== "string" || !value.trim() || value.length > 4000) throw new Error(`${label} must be nonempty bounded text`);
}
function list(value, label, minimum = 1) {
  if (!Array.isArray(value) || value.length < minimum || value.length > 256) throw new Error(`${label} has an invalid item count`);
}
function digest(value, label) {
  if (typeof value !== "string" || !DIGEST.test(value)) throw new Error(`${label} must be a SHA-256 checksum`);
}
function path(value) {
  if (typeof value !== "string" || value.length > 300 || !/^[A-Za-z0-9_@.()[\]/-]+$/.test(value)
    || value.split("/").some((part) => !part || part === "." || part === ".." || part === ".git")) {
    throw new Error("Reviewed file path must be repository-relative without traversal");
  }
}

export function validateSourceReviewReport(report, expectedSha, sourceRoot) {
  exact(report, ["schema_version", "kind", "sha", "environment", "reviewer", "reviewed_at", "files", "coverage", "checks", "findings", "limitations"], "source review report");
  if (!SHA.test(expectedSha) || report.schema_version !== 1 || report.kind !== "source_review"
    || report.sha !== expectedSha || report.environment !== "staging") {
    throw new Error("Source review must identify the exact candidate and staging environment");
  }
  if (!ID.test(report.reviewer ?? "") || typeof report.reviewer !== "string") throw new Error("Reviewer must be a sanitized identifier");
  if (typeof report.reviewed_at !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(report.reviewed_at)
    || !Number.isFinite(Date.parse(report.reviewed_at))) throw new Error("Review timestamp must be UTC ISO format");
  if (typeof sourceRoot !== "string" || !sourceRoot) throw new Error("Source review requires a local Git source root for verification");
  const commit = execFileSync("git", ["rev-parse", "--verify", `${expectedSha}^{commit}`], { cwd: sourceRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  if (commit !== expectedSha) throw new Error("Source review candidate is not the exact Git commit");
  list(report.files, "Reviewed files");
  const files = new Set();
  for (const file of report.files) {
    exact(file, ["path", "sha256"], "Reviewed file");
    path(file.path);
    digest(file.sha256, "Reviewed file hash");
    if (files.has(file.path)) throw new Error("Duplicate reviewed file");
    files.add(file.path);
    // Read immutable Git blobs, never current worktree files or report-supplied shell text.
    const bytes = execFileSync("git", ["cat-file", "blob", `${expectedSha}:${file.path}`], { cwd: sourceRoot, maxBuffer: 10 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
    if (createHash("sha256").update(bytes).digest("hex") !== file.sha256) throw new Error(`Reviewed file hash mismatch: ${file.path}`);
  }
  list(report.coverage, "Review coverage");
  const areas = new Set();
  for (const row of report.coverage) {
    exact(row, ["area", "files", "assessment"], "Coverage item");
    if (!SOURCE_REVIEW_AREAS.includes(row.area) || areas.has(row.area)) throw new Error("Unknown or duplicate review area");
    areas.add(row.area);
    list(row.files, "Coverage files");
    if (new Set(row.files).size !== row.files.length || row.files.some((file) => !files.has(file))) throw new Error("Coverage must reference unique verified files");
    text(row.assessment, "Coverage assessment");
  }
  if (areas.size !== SOURCE_REVIEW_AREAS.length) throw new Error("Source review is missing required coverage");
  list(report.checks, "Deterministic checks");
  for (const check of report.checks) {
    exact(check, ["name", "passed", "evidence_sha256"], "Deterministic check");
    text(check.name, "Check name");
    if (check.passed !== true) throw new Error("Deterministic review checks must pass");
    digest(check.evidence_sha256, "Check evidence hash");
  }
  list(report.findings, "Review findings", 0);
  const findings = new Set();
  for (const finding of report.findings) {
    exact(finding, ["id", "severity", "runtime", "status", "disposition"], "Review finding");
    if (typeof finding.id !== "string" || !ID.test(finding.id) || findings.has(finding.id)) throw new Error("Finding IDs must be unique sanitized identifiers");
    findings.add(finding.id);
    if (!["critical", "high", "medium", "low"].includes(finding.severity) || typeof finding.runtime !== "boolean"
      || !["open", "resolved", "deferred"].includes(finding.status)) throw new Error("Finding severity, runtime and disposition are required");
    text(finding.disposition, "Finding disposition");
    if (finding.status !== "resolved" && (finding.severity === "critical" || (finding.severity === "high" && finding.runtime))) {
      throw new Error("Unresolved critical or high runtime review findings block readiness");
    }
  }
  list(report.limitations, "Review limitations");
  for (const limitation of report.limitations) text(limitation, "Review limitation");
  return report;
}

export function validateStagingSourceReview(value, expectedSha, sourceRoot) {
  exact(value, ["kind", "sha", "report", "report_sha256", "owner_acceptance"], "Source review evidence");
  if (value.kind !== "source_review" || value.sha !== expectedSha) throw new Error("Source review evidence must match the candidate");
  validateSourceReviewReport(value.report, expectedSha, sourceRoot);
  digest(value.report_sha256, "Source review report hash");
  if (value.report_sha256 !== evidenceDigest(value.report)) throw new Error("Source review report hash mismatch");
  exact(value.owner_acceptance, ["policy", "approved", "sha", "report_sha256", "reference"], "Owner acceptance");
  const approval = value.owner_acceptance;
  if (approval.policy !== SOURCE_REVIEW_POLICY || approval.approved !== true || approval.sha !== expectedSha
    || approval.report_sha256 !== value.report_sha256 || typeof approval.reference !== "string" || !ID.test(approval.reference)) {
    throw new Error("Explicit owner acceptance must bind the staging policy, candidate and report hash");
  }
  return value;
}
