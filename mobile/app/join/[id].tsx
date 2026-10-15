import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import { Body, Button, Centered, ErrorText, Title } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { pendingJoin } from "@/lib/links";
import { useMe, useSession } from "@/lib/session";
import { usePalette } from "@/theme";

/** Opened from an invite link. Joins once the person is signed in and set up. */
export default function Join() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const palette = usePalette();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const me = useMe();
  const [error, setError] = useState<string | null>(null);
  const waiting = pendingJoin.peek();
  const token = waiting?.planId === id ? waiting.token : null;

  useEffect(() => {
    if (!token || !me.data) return;
    let cancelled = false;
    api.joinPlan(id, token)
      .then((plan) => {
        if (cancelled) return;
        pendingJoin.take();
        queryClient.setQueryData(["plan", id], plan);
        router.replace(`/plan/${id}`);
      })
      .catch((failure) => {
        if (cancelled) return;
        pendingJoin.take();
        setError(errorMessage(failure));
      });
    return () => { cancelled = true; };
  }, [token, me.data, id, router, queryClient]);

  if (!token || error) {
    return (
      <Centered>
        <Title size={36}>This link didn’t work</Title>
        <ErrorText>{error ?? "The invite link is incomplete. Ask whoever sent it for the full link."}</ErrorText>
        <Button kind="quiet" label="Go to your plans" onPress={() => router.replace("/")} />
      </Centered>
    );
  }
  if (session.status !== "signed-in" || !me.data) {
    // Signing in (or finishing setup) returns to the plans list, which resumes this join.
    return (
      <Centered>
        <Title size={36}>You’re invited</Title>
        <Body muted>Sign in to join the plan.</Body>
        <Button label="Continue" onPress={() => router.replace(session.status === "signed-in" ? "/welcome" : "/sign-in")} />
      </Centered>
    );
  }
  return <Centered><ActivityIndicator color={palette.text} /><Body muted>Joining the plan…</Body></Centered>;
}
