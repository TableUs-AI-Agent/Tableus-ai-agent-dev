import type { QueryClient } from "@tanstack/react-query";

export function shouldClearForAuthTransition(
  previousSubject: string | null | undefined,
  nextSubject: string | null,
  event: string,
) {
  if (event === "SIGNED_OUT") return true;
  return previousSubject !== undefined && previousSubject !== nextSubject;
}

export function clearPrivateQueryState(queryClient: QueryClient) {
  void queryClient.cancelQueries();
  queryClient.clear();
}
