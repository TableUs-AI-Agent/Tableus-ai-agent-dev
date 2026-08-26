import {
  createTelemetrySessionId,
  sanitizePostHogPayload,
  sanitizeTelemetryEvent,
  type TelemetryEventName,
} from "@tableus/domain";

type CaptureClient = { capture: (event: string, properties?: Record<string, unknown>) => void };

const telemetryMode = process.env.NEXT_PUBLIC_TELEMETRY_MODE;
const enabled = telemetryMode === "staging" || telemetryMode === "production";
const sessionId = enabled ? createTelemetrySessionId() : null;
let client: CaptureClient | null = null;

export function getTelemetrySessionId() {
  return sessionId;
}

export function registerTelemetryClient(value: CaptureClient) {
  client = value;
}

export function captureTelemetry(event: TelemetryEventName, properties: Record<string, unknown> = {}) {
  if (!enabled || !client) return false;
  const sanitized = sanitizeTelemetryEvent(event, { platform: "web", ...properties });
  if (!sanitized) return false;
  client.capture(sanitized.event, sanitized.properties);
  return true;
}

export function sanitizeWebPostHogPayload<T extends Record<string, any>>(payload: T): T | null {
  return sanitizePostHogPayload(
    payload,
    process.env.NEXT_PUBLIC_SOURCE_SHA ?? "unknown",
    sessionId ?? "",
  );
}
