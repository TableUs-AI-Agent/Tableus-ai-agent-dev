import { ApiError, createIdempotencyKey } from "@tableus/api-client";
import { requireCanonicalUuid, type Plan } from "@tableus/domain";
import { router, useRoute } from "expo-router";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { pendingJoinStore } from "@/lib/pending-join";
import { pendingJoinAttempt } from "@/lib/pending-join-attempt";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme";

type Attempt = { handle: string; planId: string; subject: string; idempotencyKey: string };
type JoinState = "ready" | "joining" | "unknown" | "checking" | "retry_ready" | "invalid" | "blocked";

export default function JoinPlanScreen() {
  const { id, pending } = useRoute<{
    key: string;
    name: string;
    params?: { id?: unknown; pending?: unknown };
  }>().params ?? {};
  let planId: string | null = null;
  try { planId = requireCanonicalUuid(typeof id === "string" ? id : "", "Plan ID"); } catch { /* The link is invalid. */ }
  const handle = typeof pending === "string" ? pending : null;
  return <JoinFlow key={`${planId ?? "invalid"}:${handle ?? "missing"}`} planId={planId} handle={handle} />;
}

function JoinFlow({ planId, handle }: { planId: string | null; handle: string | null }) {
  const snapshot = useSyncExternalStore(
    (listener) => pendingJoinStore.subscribe(listener),
    () => pendingJoinStore.getSnapshot(),
    () => null,
  );
  const durableAttempt = useSyncExternalStore(pendingJoinAttempt.subscribe, pendingJoinAttempt.getSnapshot, () => null);
  const auth = useAuth();
  const subject = auth.subject ?? (!isSupabaseConfigured ? process.env.EXPO_PUBLIC_DEMO_USER_ID ?? "demo-organizer" : null);
  const subjectRef = useRef(subject);
  useEffect(() => { subjectRef.current = subject; }, [subject]);
  const [state, setState] = useState<JoinState>("ready");
  const [message, setMessage] = useState("");
  const attemptRef = useRef<Attempt | null>(null);
  const busyRef = useRef(false);
  const epochRef = useRef(0);
  useEffect(() => () => { epochRef.current += 1; }, []);

  const valid = Boolean(planId && handle && snapshot?.planId === planId && snapshot.handle === handle);
  const sameIntent = (attempt: Attempt) =>
    subjectRef.current === attempt.subject
    && pendingJoinStore.getSnapshot()?.handle === attempt.handle
    && pendingJoinStore.read(attempt.handle, attempt.subject) !== null;
  const current = (attempt: Attempt, epoch: number) => epochRef.current === epoch && sameIntent(attempt);
  const destination = (id: string) => router.replace({ pathname: "/plans/[id]", params: { id } });

  const join = async (attempt: Attempt) => {
    if (busyRef.current) return;
    const token = pendingJoinStore.read(attempt.handle, attempt.subject);
    if (!token || !current(attempt, epochRef.current)) {
      setState("invalid");
      setMessage("Reopen your private link to continue.");
      return;
    }
    const epoch = epochRef.current;
    busyRef.current = true;
    pendingJoinAttempt.start(attempt);
    setState("joining");
    setMessage("");
    try {
      await api.post<Plan>(`/api/v1/plans/${attempt.planId}/join`, { share_token: token }, {
        idempotencyKey: attempt.idempotencyKey,
        expectedSubject: attempt.subject,
      });
      if (!sameIntent(attempt)) return;
      const visible = current(attempt, epoch);
      pendingJoinStore.clear(attempt.handle);
      if (visible) destination(attempt.planId);
    } catch (error) {
      if (!sameIntent(attempt)) return;
      if (error instanceof ApiError && error.status === 404) {
        const visible = current(attempt, epoch);
        pendingJoinStore.clear(attempt.handle);
        if (!visible) return;
        setState("invalid");
        setMessage("This private link is invalid or has been rotated.");
      } else if (error instanceof ApiError && error.status === 409) {
        pendingJoinAttempt.update(attempt.handle, "blocked", "This plan is full or cannot accept new members right now.");
        if (!current(attempt, epoch)) return;
        setState("blocked");
        setMessage("This plan is full or cannot accept new members right now.");
      } else if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        pendingJoinAttempt.update(attempt.handle, "unknown", "Your account approval could not be confirmed. Check your membership and account before trying again.");
        if (!current(attempt, epoch)) return;
        setState("unknown");
        setMessage("Your account approval could not be confirmed. Check your membership and account before trying again.");
      } else {
        pendingJoinAttempt.update(attempt.handle, "unknown", "We could not confirm whether you joined. Check your membership before trying again.");
        if (!current(attempt, epoch)) return;
        setState("unknown");
        setMessage("We could not confirm whether you joined. Check your membership before trying again.");
      }
    } finally {
      if (epochRef.current === epoch) busyRef.current = false;
    }
  };

  const startJoin = () => {
    if (!auth.approved || !valid || !subject || !handle || !planId || busyRef.current || durableAttempt?.handle === handle) return;
    const attempt = { handle, planId, subject, idempotencyKey: createIdempotencyKey() };
    attemptRef.current = attempt;
    void join(attempt);
  };

  const checkMembership = async () => {
    const attempt = attemptRef.current ?? (durableAttempt?.handle === handle ? durableAttempt : null);
    if (!attempt || busyRef.current || !current(attempt, epochRef.current)) return;
    const epoch = epochRef.current;
    busyRef.current = true;
    pendingJoinAttempt.update(attempt.handle, "checking", "");
    setState("checking");
    setMessage("");
    try {
      await api.get(`/api/v1/plans/${attempt.planId}/revision`, { expectedSubject: attempt.subject });
      if (!sameIntent(attempt)) return;
      const visible = current(attempt, epoch);
      pendingJoinStore.clear(attempt.handle);
      if (visible) destination(attempt.planId);
      return;
    } catch (error) {
      if (!sameIntent(attempt)) return;
      if (error instanceof ApiError && error.status === 404) {
        pendingJoinAttempt.update(attempt.handle, "blocked", "This plan is no longer available.");
        if (!current(attempt, epoch)) return;
        setState("blocked");
        setMessage("This plan is no longer available.");
        return;
      }
      if (!(error instanceof ApiError) || ![401, 403].includes(error.status)) {
        pendingJoinAttempt.update(attempt.handle, "unknown", "We could not check your membership. Reconnect and check again.");
        if (!current(attempt, epoch)) return;
        setState("unknown");
        setMessage("We could not check your membership. Reconnect and check again.");
        return;
      }
      try {
        await api.get("/api/v1/me", { expectedSubject: attempt.subject });
        if (!sameIntent(attempt)) return;
        pendingJoinAttempt.update(attempt.handle, "retry_ready", "You are not a member of this plan yet. You can try joining with this private link again.");
        if (!current(attempt, epoch)) return;
        setState("retry_ready");
        setMessage("You are not a member of this plan yet. You can try joining with this private link again.");
      } catch {
        if (!sameIntent(attempt)) return;
        pendingJoinAttempt.update(attempt.handle, "unknown", "Your account approval could not be confirmed. Sign in to your approved account, then check again.");
        if (!current(attempt, epoch)) return;
        setState("unknown");
        setMessage("Your account approval could not be confirmed. Sign in to your approved account, then check again.");
      }
    } finally {
      if (epochRef.current === epoch) busyRef.current = false;
    }
  };

  const cancel = () => {
    epochRef.current += 1;
    if (handle) pendingJoinStore.clear(handle);
    attemptRef.current = null;
    busyRef.current = false;
    router.replace("/(tabs)");
  };

  const retryJoin = () => {
    const attempt = attemptRef.current ?? (durableAttempt?.handle === handle ? durableAttempt : null);
    if (attempt) void join(attempt);
  };

  const visibleState = durableAttempt?.handle === handle ? durableAttempt.status : state;
  const visibleMessage = durableAttempt?.handle === handle ? durableAttempt.message : message;
  const missing = !valid || visibleState === "invalid";
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "800" }}>Join this TableUs plan?</Text>
        <Text selectable style={{ color: colors.muted }}>Only invite-approved members with the current private link can join. Opening a link never joins automatically.</Text>
        {missing ? (
          <Text selectable accessibilityRole="alert" style={{ color: colors.danger }}>{visibleMessage || "This private link is unavailable on this device. Reopen your private link."}</Text>
        ) : !auth.approved ? (
          <>
            <Text selectable accessibilityRole="alert" style={{ color: colors.ink, fontWeight: "700" }}>Authentication required</Text>
            <Button label="Sign in to join" onPress={() => router.push({ pathname: "/auth", params: { mode: "sign-in" } })} />
          </>
        ) : (
          <>
            {visibleMessage ? <Text selectable accessibilityRole="alert" style={{ color: colors.danger }}>{visibleMessage}</Text> : null}
            {visibleState === "unknown" ? <Button label="Check membership" onPress={() => void checkMembership()} /> : null}
            {visibleState === "retry_ready" ? <Button label="Retry joining plan" onPress={retryJoin} /> : null}
            {visibleState === "ready" ? <Button label="Join this plan" onPress={startJoin} /> : null}
            {visibleState === "joining" || visibleState === "checking" ? <Text accessibilityRole="alert" style={{ color: colors.muted }}>{visibleState === "joining" ? "Joining…" : "Checking membership…"}</Text> : null}
          </>
        )}
        {valid ? <Button label="Cancel private link" onPress={cancel} disabled={visibleState === "joining" || visibleState === "checking"} /> : null}
      </Card>
    </ScrollView>
  );
}
