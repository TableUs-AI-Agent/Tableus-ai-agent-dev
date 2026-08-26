export type * from "./schema";

export type ApiEnvelope<T> = { data: T; meta: Record<string, unknown> };
export type ApiFailure = {
  error: { code: string; message: string; fields?: unknown[] };
  request_id: string;
};

export type ApiRequestOptions = {
  idempotencyKey?: string;
};

export type TelemetryClientPlatform = "web" | "ios" | "android";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(
    message: string,
    status: number,
    code = "request_failed",
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

type ClientOptions = {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
  refreshAccessToken?: () => Promise<string | null>;
  demoUserId?: string;
  getDemoUserId?: () => Promise<string | null>;
  getTelemetrySessionId?: () => string | null;
  telemetryPlatform?: TelemetryClientPlatform;
  fetchImpl?: typeof fetch;
};

export function createIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function createApiClient(options: ClientOptions) {
  const request = async <T>(path: string, init: RequestInit = {}, requestOptions: ApiRequestOptions = {}): Promise<T> => {
    let token = await options.getAccessToken?.();
    const dynamicDemoUserId = await options.getDemoUserId?.();
    const demoUserId = dynamicDemoUserId ?? options.demoUserId;
    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
    if (demoUserId) headers.set("X-Demo-User-ID", demoUserId);
    const telemetrySessionId = options.getTelemetrySessionId?.();
    if (telemetrySessionId && options.telemetryPlatform) {
      headers.set("X-TableUs-Telemetry-Session", telemetrySessionId);
      headers.set("X-TableUs-Client", options.telemetryPlatform);
    }
    if (init.method && init.method !== "GET") {
      headers.set("Idempotency-Key", requestOptions.idempotencyKey ?? createIdempotencyKey());
    }
    const send = async () => {
      const requestHeaders = new Headers(headers);
      if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
      else requestHeaders.delete("Authorization");
      try {
        return await (options.fetchImpl ?? fetch)(`${options.baseUrl}${path}`, { ...init, headers: requestHeaders });
      } catch {
        throw new ApiError("Network unavailable. Reconnect and try again.", 0, "network_error");
      }
    };
    let response = await send();
    if (response.status === 401 && token && options.refreshAccessToken) {
      try {
        token = await options.refreshAccessToken();
      } catch {
        token = null;
      }
      if (token) response = await send();
    }
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | ApiFailure | null;
    if (!response.ok) {
      const failure = payload as ApiFailure | null;
      throw new ApiError(
        failure?.error?.message ?? `Request failed (${response.status})`,
        response.status,
        failure?.error?.code,
        failure?.request_id,
      );
    }
    return (payload as ApiEnvelope<T>).data;
  };

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown, requestOptions?: ApiRequestOptions) =>
      request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }, requestOptions),
    put: <T>(path: string, body: unknown, requestOptions?: ApiRequestOptions) =>
      request<T>(path, { method: "PUT", body: JSON.stringify(body) }, requestOptions),
    patch: <T>(path: string, body: unknown, requestOptions?: ApiRequestOptions) =>
      request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, requestOptions),
    delete: <T>(path: string, body?: unknown, requestOptions?: ApiRequestOptions) =>
      request<T>(path, { method: "DELETE", body: body === undefined ? undefined : JSON.stringify(body) }, requestOptions),
  };
}
