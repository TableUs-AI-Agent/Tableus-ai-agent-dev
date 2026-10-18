import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import { Body, Button, Centered, ErrorText, Title } from "@/components/ui";
import { Pip } from "@/components/pip";
import { ApiError } from "@tableus/api-client";

import { api, errorMessage } from "@/lib/api";
import { pendingJoin } from "@/lib/links";
import { useKeys, useMe, useSession } from "@/lib/session";
import { usePalette } from "@/theme";

/** Opened from an invite link. Joins once the person is signed in and set up. */
export default function Join() {
  const keys = useKeys();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const palette = usePalette();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const me = useMe();
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const waiting = pendingJoin.peek();
  const token = waiting?.planId === id ? waiting.token : null;

  useEffect(() => {
    if (!token || !me.data) return;
    let cancelled = false;
    api.joinPlan(id, token)
      .then((plan) => {
        if (cancelled) return;
        pendingJoin.take();
        queryClient.setQueryData(keys.plan(id), plan);
        router.replace(`/plan/${id}`);
      })
      .catch((failure) => {
        if (cancelled) return;
        // Keep the invite for problems that a retry can fix (offline, busy server).
        const status = failure instanceof ApiError ? failure.status : 0;
        const retryable = status === 0 || status === 429 || status >= 500;
        if (!retryable) pendingJoin.take();
        setError({ message: errorMessage(failure), retryable });
      });
    return () => { cancelled = true; };
  }, [token, me.data, id, router, queryClient, keys, attempt]);

  if (error?.retryable) {
    return (
      <Centered>
        <Pip pose="sleepy" size={128} />
        <Title size={36}>Couldn’t join yet</Title>
        <ErrorText>{error.message}</ErrorText>
        <Button label="Try again" icon="arrow.clockwise" onPress={() => { setError(null); setAttempt((value) => value + 1); }} />
      </Centered>
    );
  }
  if (!token || error) {
    return (
      <Centered>
        <Pip pose="sleepy" size={128} />
        <Title size={36}>This link didn’t work</Title>
        <ErrorText>{error?.message ?? "The invite link is incomplete. Ask whoever sent it for the full link."}</ErrorText>
        <Button kind="secondary" icon="list.bullet" label="Go to your plans" onPress={() => router.replace("/")} />
      </Centered>
    );
  }
  if (session.status !== "signed-in" || !me.data) {
    // Signing in (or finishing setup) returns to the plans list, which resumes this join.
    return (
      <Centered>
        <Pip pose="invite" size={140} />
        <Title size={36}>You’re invited</Title>
        <Body muted>Sign in to join the plan.</Body>
        <Button label="Continue" icon="arrow.right" onPress={() => router.replace(session.status === "signed-in" ? "/welcome" : "/sign-in")} />
      </Centered>
    );
  }
  return <Centered><ActivityIndicator color={palette.text} /><Body muted>Joining the plan…</Body></Centered>;
}
