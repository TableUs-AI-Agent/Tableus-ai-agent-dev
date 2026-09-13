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

function networkError() {
  return new ApiError("Network unavailable. Reconnect and try again.", 0, "network_error");
}

function createDeadline(timeoutMs?: number, onTimeout?: () => void) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    if (timeoutMs && timeoutMs > 0) {
      timeout = setTimeout(() => {
        reject(networkError());
        onTimeout?.();
      }, timeoutMs);
    }
  });
  return {
    wait: <T>(pending: PromiseLike<T> | T): Promise<T> => timeout === undefined
      ? Promise.resolve(pending)
      : Promise.race([pending, deadline]),
    cleanup: () => { if (timeout !== undefined) clearTimeout(timeout); },
  };
}

/** Bound an auth/storage read without deleting a session or exposing SDK errors. */
export async function withAuthTimeout<T>(operation: () => Promise<T>, timeoutMs = 15_000): Promise<T> {
  const deadline = createDeadline(timeoutMs);
  try {
    return await deadline.wait(operation());
  } catch {
    throw networkError();
  } finally {
    deadline.cleanup();
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
  onAuthorizationError?: (status: 401 | 403) => void;
  fetchImpl?: typeof fetch;
  requestTimeoutMs?: number;
};

export function createIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function createApiClient(options: ClientOptions) {
  const request = async <T>(path: string, init: RequestInit = {}, requestOptions: ApiRequestOptions = {}): Promise<T> => {
    // One budget covers credentials, both fetch attempts and the response body.
    // Await each stage against it so a late credential cannot dispatch a write.
    const controller = options.requestTimeoutMs && options.requestTimeoutMs > 0 ? new AbortController() : null;
    const upstreamSignal = init.signal;
    const forwardAbort = () => controller?.abort();
    if (controller && upstreamSignal) {
      if (upstreamSignal.aborted) controller.abort();
      else upstreamSignal.addEventListener("abort", forwardAbort, { once: true });
    }
    const deadline = createDeadline(options.requestTimeoutMs, () => controller?.abort());
    try {
      let token = await deadline.wait(options.getAccessToken?.());
      const dynamicDemoUserId = await deadline.wait(options.getDemoUserId?.());
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
        return deadline.wait((options.fetchImpl ?? fetch)(`${options.baseUrl}${path}`, {
          ...init,
          headers: requestHeaders,
          signal: controller?.signal ?? upstreamSignal,
        }));
      };
      let response = await send();
      if (response.status === 401 && token && options.refreshAccessToken) {
        token = await deadline.wait(options.refreshAccessToken());
        if (token) response = await send();
      }
      const payload = await deadline.wait(response.json().catch(() => null)) as ApiEnvelope<T> | ApiFailure | null;
      if (response.ok && payload === null) {
        throw networkError();
      }
      if (!response.ok) {
        const failure = payload as ApiFailure | null;
        if (response.status === 401 || response.status === 403) {
          options.onAuthorizationError?.(response.status);
        }
        throw new ApiError(
          failure?.error?.message ?? `Request failed (${response.status})`,
          response.status,
          failure?.error?.code,
          failure?.request_id,
        );
      }
      return (payload as ApiEnvelope<T>).data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw networkError();
    } finally {
      deadline.cleanup();
      upstreamSignal?.removeEventListener("abort", forwardAbort);
    }
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
