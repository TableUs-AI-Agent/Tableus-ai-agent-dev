import { ApiError, createIdempotencyKey } from "@tableus/api-client";
import { PUBLIC_CONTACTS } from "@tableus/domain";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Linking, RefreshControl, ScrollView, Text, View } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import type { AccountControl, AccountDeletionStatus, ManagedPlan } from "@/lib/account-controls";
import { shareAccountExport } from "@/lib/account-export-file";
import { api } from "@/lib/api";
import { OFFLINE_REFRESH_MESSAGE, refreshWhenOnline } from "@/lib/offline-refresh";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";
import { useAuth } from "@/providers/auth-provider";
import { useConnectivity } from "@/providers/connectivity-provider";
import { colors } from "@/theme";

type Profile = { id: string; display_name: string; share_taste: boolean };
type Attempt =
  | Readonly<{ kind: "transfer"; subject: string; planId: string; recipientId: string; key: string }>
  | Readonly<{ kind: "delete-plan"; subject: string; planId: string; key: string }>
  | Readonly<{ kind: "full-delete"; subject: string; key: string }>;

function ambiguous(error: unknown) {
  return error instanceof ApiError && (error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500);
}

export default function AccountScreen() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { isOnline } = useConnectivity();
  const subjectRef = useRef(auth.subject);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [retryReady, setRetryReady] = useState(false);
  const [recipient, setRecipient] = useState<Record<string, string>>({});
  const [transferText, setTransferText] = useState<Record<string, string>>({});
  const [planText, setPlanText] = useState<Record<string, string>>({});
  const [accountText, setAccountText] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");
  const enabled = auth.approved;
  const profile = useQuery({ queryKey: ["me", auth.subject], queryFn: () => api.get<Profile>("/api/v1/me", { expectedSubject: auth.subject ?? undefined }), enabled, retry: false });
  const currentSubject = auth.subject ?? profile.data?.id ?? null;
  const control = useQuery({ queryKey: ["account-control", currentSubject], queryFn: () => api.get<AccountControl>("/api/v1/me/account-control", { expectedSubject: currentSubject ?? undefined }), enabled: enabled && Boolean(currentSubject), retry: false });
  const plans = useQuery({ queryKey: ["organized-plans", currentSubject], queryFn: () => api.get<ManagedPlan[]>("/api/v1/me/organized-plans", { expectedSubject: currentSubject ?? undefined }), enabled: enabled && Boolean(currentSubject), retry: false });

  const exportData = useRecoverableMutation({
    mutationFn: async (_subject: string, _key: string) => {
      const data = await api.get<unknown>("/api/v1/me/export", { expectedSubject: _subject });
      if (subjectRef.current !== _subject) return;
      await shareAccountExport(data);
    },
    onSuccess: (_data, subject) => {
      if (subjectRef.current === subject) setMessage("Your TableUs application data export was prepared as a JSON file.");
    },
  });
  const resetExportRef = useRef(exportData.reset);

  useEffect(() => {
    subjectRef.current = currentSubject;
    return () => { subjectRef.current = null; };
  }, [currentSubject]);
  useEffect(() => { resetExportRef.current = exportData.reset; }, [exportData.reset]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAttempt((current) => current && current.subject === currentSubject ? current : null);
      setRetryReady(false);
      setMessage("");
      setRecipient({});
      setTransferText({});
      setPlanText({});
      setAccountText("");
      resetExportRef.current();
    }, 0);
    return () => clearTimeout(timer);
  }, [currentSubject]);

  async function reconcile(next: Attempt) {
    try {
      if (next.kind === "full-delete") {
        const status = await api.get<AccountDeletionStatus>("/api/v1/me/deletion", { expectedSubject: next.subject });
        if (subjectRef.current !== next.subject) return;
        auth.setDeletionOutcome(next.subject, status);
        setAttempt(null);
        setMessage(status.status === "completed" ? "Account deletion completed. Shared plans remain with their participants." : "Application data was removed; sign-in account deletion is pending. Shared plans remain with their participants.");
        return;
      }
      const latest = await api.get<ManagedPlan[]>("/api/v1/me/organized-plans", { expectedSubject: next.subject });
      if (subjectRef.current !== next.subject) return;
      queryClient.setQueryData(["organized-plans", next.subject], latest);
      if (!latest.some((plan) => plan.id === next.planId)) {
        setAttempt(null);
        setMessage(next.kind === "transfer" ? "You no longer organize this plan. Confirm the new organizer with participants." : "This plan is no longer organized by you.");
        await queryClient.invalidateQueries({ queryKey: ["account-control", next.subject] });
      } else {
        setRetryReady(true);
        setMessage("The plan is still yours. You may explicitly retry the same request.");
      }
    } catch (caught) {
      if (subjectRef.current !== next.subject) return;
      if (next.kind === "full-delete" && caught instanceof ApiError && caught.status === 404) {
        await auth.refreshDeletionStatus();
        if (subjectRef.current !== next.subject) return;
        setRetryReady(true);
        setMessage("No deletion request is recorded. You may explicitly retry the same request.");
      } else {
        setMessage("Outcome unconfirmed. Reconnect and check status before retrying; contact support if your session expired.");
      }
    }
  }

  async function run(next: Attempt) {
    if (busyRef.current || exportData.isPending || !isOnline || (currentSubject && currentSubject !== next.subject)) return;
    busyRef.current = true;
    setBusy(true);
    setAttempt(next);
    setRetryReady(false);
    setMessage("");
    if (next.kind === "full-delete") auth.beginDeletion(next.subject);
    try {
      if (next.kind === "transfer") {
        await api.post<ManagedPlan>(`/api/v1/plans/${next.planId}/transfer-ownership`, { recipient_profile_id: next.recipientId }, { idempotencyKey: next.key, expectedSubject: next.subject });
      } else if (next.kind === "delete-plan") {
        await api.delete<{ deleted: boolean }>(`/api/v1/plans/${next.planId}`, { confirmation: "DELETE" }, { idempotencyKey: next.key, expectedSubject: next.subject });
      } else {
        const status = await api.post<AccountDeletionStatus>("/api/v1/me/deletion", { confirmation: "DELETE" }, { idempotencyKey: next.key, expectedSubject: next.subject });
        if (subjectRef.current === next.subject) auth.setDeletionOutcome(next.subject, status);
      }
      if (subjectRef.current !== next.subject) return;
      if (next.kind !== "full-delete") {
        setMessage(next.kind === "transfer" ? "Ownership transferred." : "Plan deleted.");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["organized-plans", next.subject] }),
          queryClient.invalidateQueries({ queryKey: ["account-control", next.subject] }),
        ]);
      }
      setAttempt(null);
    } catch (caught) {
      if (subjectRef.current !== next.subject) return;
      if (ambiguous(caught)) await reconcile(next);
      else {
        setMessage(caught instanceof ApiError ? caught.message : "Could not complete this request. Check your connection.");
        if (next.kind === "full-delete") await auth.refreshDeletionStatus();
        setAttempt(null);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function refresh() {
    if (busyRef.current || exportData.isPending || auth.busy) return;
    if (!isOnline) { setRefreshMessage(OFFLINE_REFRESH_MESSAGE); return; }
    busyRef.current = true;
    setBusy(true);
    try {
      if (auth.phase === "deletion") {
        if (attempt?.kind === "full-delete") await reconcile(attempt);
        else await auth.refreshDeletionStatus();
      }
      else if (attempt) await reconcile(attempt);
      else await refreshWhenOnline(isOnline, () => Promise.all([profile.refetch(), control.refetch(), plans.refetch()]));
      setRefreshMessage("");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const deletion = auth.deletionStatus;
  const statusText = deletion?.status === "completed"
    ? "Account deletion completed. Your TableUs application and sign-in account were removed. Shared plans remain with their participants."
    : deletion?.needs_attention
      ? "Application data is removed. Sign-in account deletion needs support attention. Shared plans remain with their participants."
      : deletion?.status === "pending"
        ? "Application data is removed. Sign-in account deletion is pending. Shared plans remain with their participants. Check status later."
        : "Deletion status is unconfirmed. Check status with this session, or contact support if it expired.";
  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} refreshControl={<RefreshControl refreshing={profile.isRefetching || control.isRefetching || plans.isRefetching} onRefresh={() => void refresh()} />}>
    {auth.phase === "deletion" ? <Card>
      <Text selectable accessibilityRole="header" style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>Account deletion</Text>
      <Text selectable accessibilityLiveRegion="polite" style={{ color: colors.muted }}>{statusText}</Text>
      {deletion?.next_retry_at ? <Text selectable style={{ color: colors.muted }}>Next retry: {deletion.next_retry_at}</Text> : null}
      <Text selectable style={{ color: colors.muted }}>Support: {PUBLIC_CONTACTS.supportEmail}</Text>
      <Button label="Contact support" onPress={() => void Linking.openURL(`mailto:${PUBLIC_CONTACTS.supportEmail}`)} />
      {auth.error ? <ErrorText message={auth.error} /> : null}
      <Button label="Check deletion status" onPress={() => void refresh()} disabled={busy || !isOnline} />
      {attempt?.kind === "full-delete" && retryReady ? <Button label="Retry same deletion request" onPress={() => void run(attempt)} disabled={busy || !isOnline} /> : null}
    </Card> : <>
      <Card>
        <Text selectable accessibilityRole="header" style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>{profile.data?.display_name ?? "Your account"}</Text>
        <Text selectable style={{ color: colors.muted }}>Taste-profile sharing is currently {profile.data?.share_taste ? "on" : "off"}.</Text>
      </Card>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "800" }}>Export my data</Text>
        <Text selectable style={{ color: colors.muted }}>Share a JSON copy of your profile, reviews, and participating plan identifiers.</Text>
        <Button label="Export my data" onPress={() => { if (currentSubject) exportData.submit(currentSubject); }} loading={exportData.isPending} disabled={busy || exportData.canRetry || !currentSubject} />
        {exportData.failure ? <>
          <ErrorText message={exportData.failure.message} />
          {exportData.canRetry ? <Button label="Retry account export" onPress={exportData.retry} disabled={busy} /> : null}
          <Button label="Dismiss export error" onPress={exportData.reset} disabled={busy} />
        </> : null}
      </Card>
      <Card>
        <Text selectable accessibilityRole="header" style={{ color: colors.ink, fontSize: 18, fontWeight: "800" }}>Organized plans</Text>
        <Text selectable style={{ color: colors.muted }}>Transfer shared plans to a participant. Delete a plan only when you are its sole participant.</Text>
        {(plans.data ?? []).map((plan) => {
          const others = plan.participants.filter((person) => person.profile_id !== currentSubject);
          const chosen = recipient[plan.id] ?? "";
          return <View key={plan.id} style={{ gap: 8, borderTopWidth: 1, borderColor: colors.line, paddingTop: 12 }}>
            <Text selectable style={{ color: colors.ink, fontWeight: "700" }}>{plan.title}</Text>
            <Text selectable style={{ color: colors.muted }}>{plan.participants.length} participant{plan.participants.length === 1 ? "" : "s"}</Text>
            {others.length ? <>
              {others.map((person) => <Button key={person.profile_id} label={`${chosen === person.profile_id ? "Selected: " : "Select "}${person.display_name}`} onPress={() => { setRecipient((value) => ({ ...value, [plan.id]: person.profile_id })); setTransferText((value) => ({ ...value, [plan.id]: "" })); }} disabled={busy || exportData.isPending || Boolean(attempt)} />)}
              <Field accessibilityLabel={`Type TRANSFER to confirm ${plan.title}`} placeholder="Type TRANSFER" autoCapitalize="characters" value={transferText[plan.id] ?? ""} onChangeText={(value) => setTransferText((current) => ({ ...current, [plan.id]: value }))} />
              <Button label={`Transfer ${plan.title}`} onPress={() => { if (currentSubject && chosen) void run(Object.freeze({ kind: "transfer", subject: currentSubject, planId: plan.id, recipientId: chosen, key: createIdempotencyKey() })); }} disabled={busy || exportData.isPending || Boolean(attempt) || !chosen || transferText[plan.id] !== "TRANSFER" || !isOnline} />
            </> : <>
              <Field accessibilityLabel={`Type DELETE to confirm ${plan.title}`} placeholder="Type DELETE" autoCapitalize="characters" value={planText[plan.id] ?? ""} onChangeText={(value) => setPlanText((current) => ({ ...current, [plan.id]: value }))} />
              <Button label={`Delete ${plan.title}`} onPress={() => { if (currentSubject) void run(Object.freeze({ kind: "delete-plan", subject: currentSubject, planId: plan.id, key: createIdempotencyKey() })); }} disabled={busy || exportData.isPending || Boolean(attempt) || planText[plan.id] !== "DELETE" || !isOnline} />
            </>}
          </View>;
        })}
        {plans.isPending ? <Text selectable>Loading organized plans…</Text> : null}
        {plans.error ? <ErrorText message="Could not load organized plans. Refresh to try again." /> : null}
        {attempt && attempt.kind !== "full-delete" ? <Button label="Check plan outcome" onPress={() => void refresh()} disabled={busy || !isOnline} /> : null}
        {attempt && attempt.kind !== "full-delete" && retryReady ? <Button label="Retry same plan request" onPress={() => void run(attempt)} disabled={busy || !isOnline} /> : null}
      </Card>
      <Card>
        <Text selectable accessibilityRole="header" style={{ color: colors.danger, fontSize: 18, fontWeight: "800" }}>Delete my account</Text>
        <Text selectable style={{ color: colors.danger }}>This removes application data, then requests deletion of your sign-in account. Shared plans stay with their participants, but your plan details and recommendations based on your input are removed. Other members may need to choose new details, generate options, and vote again.</Text>
        <Text selectable accessibilityLiveRegion="polite" style={{ color: colors.danger }}>
          {!control.data ? "Checking deletion availability…" : !control.data.full_deletion_available ? "Full account deletion is unavailable. Contact support." : !control.data.can_delete ? `${control.data.organized_plan_count} organized plans must be transferred or removed first.` : "Full account deletion is available."}
        </Text>
        <Field accessibilityLabel="Type DELETE to confirm full account deletion" placeholder="Type DELETE" autoCapitalize="characters" autoComplete="off" value={accountText} onChangeText={setAccountText} />
        <Button label="Delete my account" onPress={() => { if (currentSubject) void run(Object.freeze({ kind: "full-delete", subject: currentSubject, key: createIdempotencyKey() })); }} disabled={busy || exportData.isPending || Boolean(attempt) || accountText !== "DELETE" || !control.data?.full_deletion_available || !control.data.can_delete || !isOnline} />
        {attempt?.kind === "full-delete" && retryReady ? <Button label="Retry same deletion request" onPress={() => void run(attempt)} disabled={busy || !isOnline} /> : null}
      </Card>
    </>}
    <Card>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "800" }}>Session</Text>
      <Text selectable style={{ color: colors.muted }}>Sign out on this device and clear its cached TableUs data.</Text>
      {auth.error ? <ErrorText message={auth.error} /> : null}
      <Button label="Sign out" onPress={() => void auth.signOut()} loading={auth.busy} disabled={busy || exportData.isPending} />
    </Card>
    {message ? <Text selectable accessibilityRole="alert" style={{ color: colors.accent }}>{message}</Text> : null}
    {refreshMessage ? <Text selectable accessibilityRole="alert" style={{ color: colors.muted }}>{refreshMessage}</Text> : null}
    {profile.error && auth.phase !== "deletion" ? <ErrorText message="Could not load your profile. Refresh to try again." /> : null}
    {control.error && auth.phase !== "deletion" ? <ErrorText message="Could not check deletion availability. Refresh to try again." /> : null}
  </ScrollView>;
}
