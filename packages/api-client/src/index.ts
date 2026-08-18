export type * from "./schema";

export type ApiEnvelope<T> = { data: T; meta: Record<string, unknown> };
export type ApiFailure = {
  error: { code: string; message: string; fields?: unknown[] };
  request_id: string;
};

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
  demoUserId?: string;
  fetchImpl?: typeof fetch;
};

export function createApiClient(options: ClientOptions) {
  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const token = await options.getAccessToken?.();
    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.demoUserId) headers.set("X-Demo-User-ID", options.demoUserId);
    if (init.method && init.method !== "GET") {
      headers.set("Idempotency-Key", `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    }
    let response: Response;
    try {
      response = await (options.fetchImpl ?? fetch)(`${options.baseUrl}${path}`, { ...init, headers });
    } catch {
      throw new ApiError("Network unavailable. Reconnect and try again.", 0, "network_error");
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
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
    put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  };
}
