// Scrubs error reports from the web and mobile apps before they leave the device.

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
  const contexts: Record<string, { name?: string; version?: string }> = {};
  for (const key of ["os", "browser"]) {
    const context = event.contexts?.[key];
    if (typeof context?.name !== "string") continue;
    contexts[key] = {
      name: context.name.slice(0, 40),
      version: typeof context.version === "string" ? context.version.slice(0, 40) : undefined,
    };
  }
  if (Object.keys(contexts).length) sanitized.contexts = contexts;
  sanitized.breadcrumbs = [];
  return sanitized as T;
}
