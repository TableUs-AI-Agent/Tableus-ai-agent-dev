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
  requestTimeoutMs?: number;
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
      const controller = options.requestTimeoutMs && options.requestTimeoutMs > 0 ? new AbortController() : null;
      const upstreamSignal = init.signal;
      const forwardAbort = () => controller?.abort();
      if (controller && upstreamSignal) {
        if (upstreamSignal.aborted) controller.abort();
        else upstreamSignal.addEventListener("abort", forwardAbort, { once: true });
      }
      let timeout: ReturnType<typeof setTimeout> | null = null;
      const deadline = new Promise<never>((_resolve, reject) => {
        if (!controller || !options.requestTimeoutMs) return;
        timeout = setTimeout(() => {
          controller.abort();
          reject(new ApiError("Network unavailable. Reconnect and try again.", 0, "network_error"));
        }, options.requestTimeoutMs);
      });
      const cleanup = () => {
        if (timeout) clearTimeout(timeout);
        upstreamSignal?.removeEventListener("abort", forwardAbort);
      };
      try {
        const pendingResponse = (options.fetchImpl ?? fetch)(`${options.baseUrl}${path}`, {
          ...init,
          headers: requestHeaders,
          signal: controller?.signal ?? upstreamSignal,
        });
        const response = controller
          ? await Promise.race([pendingResponse, deadline])
          : await pendingResponse;
        return { response, cleanup, deadline: controller ? deadline : null };
      } catch (error) {
        cleanup();
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network unavailable. Reconnect and try again.", 0, "network_error");
      }
    };
    let attempt = await send();
    let response = attempt.response;
    if (response.status === 401 && token && options.refreshAccessToken) {
      try {
        token = await options.refreshAccessToken();
      } catch {
        token = null;
      }
      if (token) {
        attempt.cleanup();
        attempt = await send();
        response = attempt.response;
      }
    }
    let payload: ApiEnvelope<T> | ApiFailure | null;
    try {
      const pendingPayload = response.json().catch(() => null);
      payload = (await (attempt.deadline
        ? Promise.race([pendingPayload, attempt.deadline])
        : pendingPayload)) as ApiEnvelope<T> | ApiFailure | null;
    } finally {
      attempt.cleanup();
    }
    if (response.ok && payload === null) {
      throw new ApiError("Network unavailable. Reconnect and try again.", 0, "network_error");
    }
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
