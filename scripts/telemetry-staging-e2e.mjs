#!/usr/bin/env node
import { parseArgs, writeSafeEvidence } from "./telemetry-evidence-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const apiUrl = args["api-url"];
const sha = args.sha;
const evidence = args.evidence;
if (!apiUrl || !sha || !evidence) throw new Error("--api-url, --sha, and --evidence are required");
const parsedApi = new URL(apiUrl);
if (parsedApi.protocol !== "https:") throw new Error("Telemetry staging evidence requires HTTPS");

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
const posthogHost = new URL(process.env.TABLEUS_POSTHOG_API_HOST ?? "https://us.posthog.com");

const readyResponse = await fetch(`${apiUrl.replace(/\/$/, "")}/health/ready`);
if (!readyResponse.ok) throw new Error(`Staging readiness failed (${readyResponse.status})`);
const ready = await readyResponse.json();
if (ready.build_sha !== sha || ready.auth_mode !== "supabase" || ready.telemetry_mode !== "staging" || ready.analytics_mode !== "anonymous" || ready.error_reporting_mode !== "errors_only" || ready.telemetry_e2e !== true) {
  throw new Error("Staging readiness does not match the exact telemetry candidate");
}

const sentryCounts = {};
for (const project of sentryProjects) {
  const url = `https://sentry.io/api/0/projects/${encodeURIComponent(sentryOrg)}/${encodeURIComponent(project)}/issues/?query=${encodeURIComponent(`release:${sha} environment:staging`)}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${sentryToken}` } });
  if (!response.ok) throw new Error(`Sentry read failed for ${project} (${response.status})`);
  const issues = await response.json();
  sentryCounts[project] = Array.isArray(issues) ? issues.length : 0;
}

const posthogUrl = new URL(`/api/projects/${encodeURIComponent(posthogProject)}/events/`, posthogHost);
posthogUrl.searchParams.set("event", "telemetry_e2e");
const posthogResponse = await fetch(posthogUrl, { headers: { Authorization: `Bearer ${posthogToken}` } });
if (!posthogResponse.ok) throw new Error(`PostHog read failed (${posthogResponse.status})`);
const posthogPayload = await posthogResponse.json();
const events = Array.isArray(posthogPayload.results) ? posthogPayload.results : [];
const releaseEvents = events.filter((event) => event?.properties?.release === sha);
const platforms = [...new Set(releaseEvents.map((event) => event?.properties?.platform).filter((value) => ["web", "ios", "android", "api"].includes(value)))].sort();

const summary = {
  schema_version: 1,
  sha,
  readiness_passed: true,
  sentry_project_count: sentryProjects.length,
  sentry_issue_counts: sentryCounts,
  posthog_event_count: releaseEvents.length,
  posthog_platforms: platforms,
  anonymous_mode: true,
  error_only_mode: true,
  raw_payloads_retained: false,
};
const target = writeSafeEvidence(evidence, summary);
process.stdout.write(`Sanitized telemetry evidence written to ${target}\n`);
