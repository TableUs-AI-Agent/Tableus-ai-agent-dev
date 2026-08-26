export const TELEMETRY_PLATFORMS = ["web", "ios", "android", "api"] as const;
export type TelemetryPlatform = (typeof TELEMETRY_PLATFORMS)[number];

export const TELEMETRY_EVENTS = [
  "app_opened",
  "auth_approved",
  "plan_created",
  "plan_joined",
  "constraints_saved",
  "recommendations_generated",
  "vote_submitted",
  "plan_finalized",
  "plan_reopened",
  "mutation_retry_presented",
  "mutation_retry_succeeded",
  "telemetry_e2e",
] as const;

export type TelemetryEventName = (typeof TELEMETRY_EVENTS)[number];
export type TelemetryProperties = Record<string, string | number | boolean>;

const OPERATIONS = new Set([
  "create_plan",
  "join_plan",
  "save_constraints",
  "generate_recommendations",
  "submit_vote",
  "finalize_plan",
  "reopen_plan",
  "rotate_share_token",
  "create_connection",
  "create_review",
  "regenerate_taste",
  "change_taste_sharing",
  "account_export",
  "account_delete",
]);
const FAILURES = new Set(["offline", "network", "timeout", "rate_limited", "server"]);
const PROVIDERS = new Set(["deterministic", "gemini"]);
const AUTH_MODES = new Set(["signup", "sign_in"]);
const COMPONENTS = new Set(["web", "mobile", "api"]);
const EVENT_PROPERTY_KEYS: Record<TelemetryEventName, string[]> = {
  app_opened: [],
  auth_approved: ["mode"],
  plan_created: [],
  plan_joined: [],
  constraints_saved: [],
  recommendations_generated: ["candidate_count", "provider"],
  vote_submitted: ["ranking_count"],
  plan_finalized: ["vote_count"],
  plan_reopened: [],
  mutation_retry_presented: ["operation", "failure_class"],
  mutation_retry_succeeded: ["operation"],
  telemetry_e2e: ["component"],
};

function isPlatform(value: unknown): value is TelemetryPlatform {
  return typeof value === "string" && TELEMETRY_PLATFORMS.includes(value as TelemetryPlatform);
}

function integerBetween(value: unknown, minimum: number, maximum: number) {
  return Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum;
}

export function sanitizeTelemetryEvent(
  event: string,
  properties: Record<string, unknown> = {},
): { event: TelemetryEventName; properties: TelemetryProperties } | null {
  if (!TELEMETRY_EVENTS.includes(event as TelemetryEventName)) return null;
  const platform = properties.platform;
  if (!isPlatform(platform)) return null;

  const allowed = new Set<string>(["platform"]);
  const safe: TelemetryProperties = { platform };
  const acceptEnum = (key: string, values: Set<string>) => {
    allowed.add(key);
    const value = properties[key];
    if (typeof value !== "string" || !values.has(value)) return false;
    safe[key] = value;
    return true;
  };
  const acceptInteger = (key: string, minimum: number, maximum: number) => {
    allowed.add(key);
    const value = properties[key];
    if (!integerBetween(value, minimum, maximum)) return false;
    safe[key] = Number(value);
    return true;
  };

  let valid = true;
  switch (event) {
    case "auth_approved":
      valid = acceptEnum("mode", AUTH_MODES);
      break;
    case "recommendations_generated":
      valid = acceptInteger("candidate_count", 0, 4) && acceptEnum("provider", PROVIDERS);
      break;
    case "vote_submitted":
      valid = acceptInteger("ranking_count", 0, 3);
      break;
    case "plan_finalized":
      valid = acceptInteger("vote_count", 0, 8);
      break;
    case "mutation_retry_presented":
      valid = acceptEnum("operation", OPERATIONS) && acceptEnum("failure_class", FAILURES);
      break;
    case "mutation_retry_succeeded":
      valid = acceptEnum("operation", OPERATIONS);
      break;
    case "telemetry_e2e":
      valid = acceptEnum("component", COMPONENTS);
      break;
    default:
      break;
  }
  if (!valid || Object.keys(properties).some((key) => !allowed.has(key))) return null;
  return { event: event as TelemetryEventName, properties: safe };
}

export function createTelemetrySessionId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function sanitizePostHogPayload<T extends Record<string, any>>(
  payload: T,
  release: string,
): T | null {
  const event = payload.event;
  if (!TELEMETRY_EVENTS.includes(event)) return null;
  const raw = payload.properties && typeof payload.properties === "object" ? payload.properties : {};
  const selected: Record<string, unknown> = { platform: raw.platform };
  for (const key of EVENT_PROPERTY_KEYS[event as TelemetryEventName]) selected[key] = raw[key];
  const sanitized = sanitizeTelemetryEvent(event, selected);
  if (!sanitized) return null;
  return {
    ...payload,
    event: sanitized.event,
    properties: {
      ...sanitized.properties,
      $process_person_profile: false,
      $geoip_disable: true,
      release: release || "unknown",
    },
  } as unknown as T;
}

export function isTelemetrySessionId(value: unknown): value is string {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function sanitizeTelemetryUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const relativeFile = !value.startsWith("/") && !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value);
    const url = new URL(value, "https://telemetry.invalid");
    const pathname = url.pathname
      .split("/")
      .map((segment) => {
        if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment)) return ":id";
        if (segment.length >= 24) return ":redacted";
        return segment;
      })
      .join("/");
    if (url.origin !== "https://telemetry.invalid") return `${url.origin}${pathname}`;
    return relativeFile ? pathname.replace(/^\//, "") : pathname;
  } catch {
    return undefined;
  }
}

export function sanitizeSentryEvent<T extends Record<string, any>>(event: T): T {
  const sanitized: Record<string, unknown> = {
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    logger: event.logger,
    release: event.release,
    environment: event.environment,
  };
  const values = event.exception?.values;
  if (Array.isArray(values)) {
    sanitized.exception = {
      values: values.map((item: Record<string, any>) => ({
        type: typeof item?.type === "string" ? item.type.slice(0, 120) : "Error",
        value: "[redacted]",
        mechanism: item?.mechanism ? { type: item.mechanism.type, handled: item.mechanism.handled } : undefined,
        stacktrace: Array.isArray(item?.stacktrace?.frames) ? {
          frames: item.stacktrace.frames.map((frame: Record<string, any>) => ({
            filename: sanitizeTelemetryUrl(frame.filename),
            function: typeof frame.function === "string" ? frame.function.slice(0, 160) : undefined,
            module: typeof frame.module === "string" ? frame.module.slice(0, 160) : undefined,
            lineno: Number.isInteger(frame.lineno) ? frame.lineno : undefined,
            colno: Number.isInteger(frame.colno) ? frame.colno : undefined,
            in_app: typeof frame.in_app === "boolean" ? frame.in_app : undefined,
          })),
        } : undefined,
      })),
    };
  }
  if (event.request) {
    sanitized.request = {
      method: event.request.method,
      url: sanitizeTelemetryUrl(event.request.url),
    };
  }
  const transaction = sanitizeTelemetryUrl(event.transaction);
  if (transaction) sanitized.transaction = transaction;
  const tags: Record<string, string> = {};
  for (const key of ["component", "operation", "request_id"]) {
    const value = event.tags?.[key];
    if (typeof value === "string" && value.length <= 80 && /^[A-Za-z0-9_.:-]+$/.test(value)) {
      tags[key] = value;
    }
  }
  if (Object.keys(tags).length) sanitized.tags = tags;
  sanitized.breadcrumbs = [];
  return sanitized as T;
}
