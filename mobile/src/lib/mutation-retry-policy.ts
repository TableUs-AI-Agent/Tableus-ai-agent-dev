import { ApiError } from "@tableus/api-client";

export type RecoverableFailureKind = "offline" | "ambiguous" | "server";

export type RecoverableFailure = {
  error: Error;
  kind: RecoverableFailureKind;
  message: string;
  retryable: boolean;
};

export function isRetryableMutationError(error: unknown) {
  return error instanceof ApiError && (
    error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500
  );
}

export function mutationFailure(error: unknown, sent: boolean): RecoverableFailure {
  const normalized = error instanceof Error ? error : new Error("Request failed");
  if (!sent) {
    return {
      error: normalized,
      kind: "offline",
      message: "You're offline. This change was not sent or queued. Reconnect, then retry.",
      retryable: true,
    };
  }
  if (error instanceof ApiError && error.status === 0) {
    return {
      error: normalized,
      kind: "ambiguous",
      message: "TableUs couldn't confirm this change. It may have completed. Retry safely.",
      retryable: true,
    };
  }
  return {
    error: normalized,
    kind: "server",
    message: normalized.message,
    retryable: isRetryableMutationError(error),
  };
}
