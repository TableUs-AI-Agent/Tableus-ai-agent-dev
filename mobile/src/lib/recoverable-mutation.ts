import { ApiError, createIdempotencyKey } from "@tableus/api-client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useConnectivity } from "@/providers/connectivity-provider";
import { mutationFailure, type RecoverableFailure } from "@/lib/mutation-retry-policy";

export { isRetryableMutationError, mutationFailure } from "@/lib/mutation-retry-policy";
export type { RecoverableFailure, RecoverableFailureKind } from "@/lib/mutation-retry-policy";

type Attempt<TVariables> = {
  idempotencyKey: string;
  variables: TVariables;
};

type RecoverableMutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables, idempotencyKey: string) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
};

export function useRecoverableMutation<TData, TVariables>(options: RecoverableMutationOptions<TData, TVariables>) {
  const { isOnline } = useConnectivity();
  const [attempt, setAttempt] = useState<Attempt<TVariables> | null>(null);
  const [failure, setFailure] = useState<RecoverableFailure | null>(null);

  const mutation = useMutation<TData, Error, Attempt<TVariables>>({
    mutationFn: ({ variables, idempotencyKey }) => options.mutationFn(variables, idempotencyKey),
    onSuccess: async (data, completedAttempt) => {
      setAttempt(null);
      setFailure(null);
      await options.onSuccess?.(data, completedAttempt.variables);
    },
    onError: (error) => setFailure(mutationFailure(error, true)),
  });

  const execute = useCallback((nextAttempt: Attempt<TVariables>) => {
    setAttempt(nextAttempt);
    setFailure(null);
    mutation.reset();
    if (!isOnline) {
      setFailure(mutationFailure(new ApiError("Network unavailable", 0, "offline_not_sent"), false));
      return;
    }
    mutation.mutate(nextAttempt);
  }, [isOnline, mutation]);

  const submit = useCallback((variables: TVariables) => {
    execute({ variables, idempotencyKey: createIdempotencyKey() });
  }, [execute]);

  const retry = useCallback(() => {
    if (attempt) execute(attempt);
  }, [attempt, execute]);

  const reset = useCallback(() => {
    setAttempt(null);
    setFailure(null);
    mutation.reset();
  }, [mutation]);

  return {
    data: mutation.data,
    failure,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    canRetry: Boolean(attempt && failure?.retryable),
    submit,
    retry,
    reset,
  };
}
