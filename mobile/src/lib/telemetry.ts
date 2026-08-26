import {
  createTelemetrySessionId,
  sanitizePostHogPayload,
  sanitizeTelemetryEvent,
  type TelemetryEventName,
} from "@tableus/domain";
import { Platform } from "react-native";

type CaptureClient = { capture: (event: string, properties?: any) => void };

const telemetryMode = process.env.EXPO_PUBLIC_TELEMETRY_MODE;
const enabled = telemetryMode === "staging" || telemetryMode === "production";
const sessionId = enabled ? createTelemetrySessionId() : null;
const platform: "ios" | "android" = Platform.OS === "ios" ? "ios" : "android";
let client: CaptureClient | null = null;

export function getTelemetrySessionId() {
  return sessionId;
}

export function getTelemetryPlatform(): "ios" | "android" {
  return platform;
}

export function registerTelemetryClient(value: CaptureClient) {
  client = value;
}

export function captureTelemetry(event: TelemetryEventName, properties: Record<string, unknown> = {}) {
  if (!enabled || !client) return;
  const sanitized = sanitizeTelemetryEvent(event, { platform, ...properties });
  if (sanitized) client.capture(sanitized.event, sanitized.properties);
}

export function sanitizeMobilePostHogPayload<T extends Record<string, any>>(payload: T): T | null {
  return sanitizePostHogPayload(payload, process.env.EXPO_PUBLIC_SOURCE_SHA ?? "unknown");
}
