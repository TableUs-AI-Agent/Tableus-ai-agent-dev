#!/usr/bin/env node
import { parseArgs, posthogCanaryQuery, writeSafeEvidence } from "./telemetry-evidence-utils.mjs";
import { RELEASE_ORIGINS, requireReleaseOrigin } from "./release-origins.mjs";

const args = parseArgs(process.argv.slice(2));
const apiUrl = args["api-url"];
const sha = args.sha;
const evidence = args.evidence;
if (!apiUrl || !sha || !evidence) throw new Error("--api-url, --sha, and --evidence are required");
requireReleaseOrigin(apiUrl, RELEASE_ORIGINS.stagingApi, "Telemetry staging API");

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required through the process environment`);
  return value;
};
const sentryToken = required("TABLEUS_SENTRY_READ_TOKEN");
const sentryOrg = required("TABLEUS_SENTRY_ORG");
const sentryProjects = [required("TABLEUS_SENTRY_API_PROJECT"), required("TABLEUS_SENTRY_WEB_PROJECT"), required("TABLEUS_SENTRY_MOBILE_PROJECT")];
const posthogToken = required("TABLEUS_POSTHOG_READ_TOKEN");
const posthogProject = required("TABLEUS_POSTHOG_PROJECT_ID");
const posthogOrigin = requireReleaseOrigin(
  process.env.TABLEUS_POSTHOG_API_HOST ?? RELEASE_ORIGINS.posthogApi,
  RELEASE_ORIGINS.posthogApi,
  "PostHog API",
);
const posthogHost = new URL(posthogOrigin);

const readyResponse = await fetch(`${apiUrl.replace(/\/$/, "")}/health/ready`, { redirect: "error" });
if (!readyResponse.ok) throw new Error(`Staging readiness failed (${readyResponse.status})`);
const ready = await readyResponse.json();
if (ready.build_sha !== sha || ready.auth_mode !== "supabase" || ready.telemetry_mode !== "staging" || ready.analytics_mode !== "anonymous" || ready.error_reporting_mode !== "errors_only" || ready.telemetry_e2e !== true) {
  throw new Error("Staging readiness does not match the exact telemetry candidate");
}

const sentryCounts = {};
for (const project of sentryProjects) {
  const url = `https://sentry.io/api/0/projects/${encodeURIComponent(sentryOrg)}/${encodeURIComponent(project)}/issues/?query=${encodeURIComponent(`release:${sha} environment:staging`)}`;
  const response = await fetch(url, { redirect: "error", headers: { Authorization: `Bearer ${sentryToken}` } });
  if (!response.ok) throw new Error(`Sentry read failed for ${project} (${response.status})`);
  const issues = await response.json();
  sentryCounts[project] = Array.isArray(issues) ? issues.length : 0;
}

const posthogUrl = new URL(`/api/projects/${encodeURIComponent(posthogProject)}/query/`, posthogHost);
const posthogResponse = await fetch(posthogUrl, {
  method: "POST",
  redirect: "error",
  headers: { Authorization: `Bearer ${posthogToken}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: { kind: "HogQLQuery", query: posthogCanaryQuery(sha) } }),
});
if (!posthogResponse.ok) throw new Error(`PostHog read failed (${posthogResponse.status})`);
const posthogPayload = await posthogResponse.json();
const rows = Array.isArray(posthogPayload.results) ? posthogPayload.results : [];
const platforms = [...new Set(rows.map((row) => row?.[0]).filter((value) => ["web", "ios", "android", "api"].includes(value)))].sort();
const expectedPlatforms = ["android", "api", "ios", "web"];
if (Object.values(sentryCounts).some((count) => count < 1)) throw new Error("Sentry canary evidence is incomplete");
if (JSON.stringify(platforms) !== JSON.stringify(expectedPlatforms)) throw new Error("PostHog canary evidence is incomplete");

const summary = {
  schema_version: 1,
  sha,
  readiness_passed: true,
  sentry_project_count: sentryProjects.length,
  sentry_issue_counts: sentryCounts,
  posthog_event_count: rows.length,
  posthog_platforms: platforms,
  anonymous_mode: true,
  error_only_mode: true,
  raw_payloads_retained: false,
};
const target = writeSafeEvidence(evidence, summary);
process.stdout.write(`Sanitized telemetry evidence written to ${target}\n`);
