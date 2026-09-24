"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Download, Loader2, LogOut, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, createIdempotencyKey } from "@tableus/api-client";
import { PUBLIC_CONTACTS, mailto, type AccountControl, type AccountDeletionStatus, type ManagedPlan } from "@tableus/domain";
import { isSupabaseConfigured, supabase } from "../lib/supabase-browser";
import { v1Api } from "../lib/v1-api";
import { clearPrivateQueryState } from "../lib/session-query-isolation";
import { useUser } from "../context/user-context";

type Profile = { id: string; display_name: string; share_taste: boolean };
type PlanAction = { kind: "transfer" | "remove"; planId: string; recipientId?: string; key: string };
const CONFIRMATION = "DELETE" as const;
const deletionKey = (subject: string) => `tableus:account-deletion-key:${subject}`;
const actor = (subject: string) => ({ expectedSubject: subject });
const support = <a className="font-semibold underline" href={mailto(PUBLIC_CONTACTS.supportEmail)}>{PUBLIC_CONTACTS.supportEmail}</a>;
const button = "inline-flex min-h-11 items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50";

export default function AccountPage() {
  const { currentUser, userState, userError, deletionStatus, deletionSubject, deletionRequestKey, deletionRequestInFlight, deletionSessionAvailable, recordDeletion, refreshDeletion } = useUser();
  if (userState === "loading") return <Loading />;
  if (userState === "deleting") return <DeletionRecovery subject={deletionSubject} requestKey={deletionRequestKey} inFlight={deletionRequestInFlight} status={deletionStatus} sessionAvailable={deletionSessionAvailable} error={userError} onStatus={refreshDeletion} onRecord={recordDeletion} />;
  if (userState === "signed_out") return <Recovery message="Sign in to view your account settings." />;
  if (userState === "error") return <Recovery message={userError || "Unable to connect to TableUs."} retry />;
  if (!currentUser) return <Recovery message="Unable to load your approved TableUs profile." retry />;
  const subject = isSupabaseConfigured ? currentUser.id : (process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-organizer");
  return <AccountContent key={subject} subject={subject} onDeletion={recordDeletion} />;
}

function Loading() {
  return <main className="flex min-h-full items-center justify-center" aria-label="Loading account settings"><Loader2 className="h-7 w-7 animate-spin text-[var(--accent)]" /></main>;
}

function Recovery({ message, retry = false }: { message: string; retry?: boolean }) {
  return <main className="mx-auto flex min-h-full max-w-xl items-center px-6 py-16"><section className="glass w-full space-y-4 rounded-[2rem] p-8"><h1 className="text-3xl font-semibold">Account unavailable</h1><p role="alert" className="text-red-700">{message}</p>{retry ? <button type="button" onClick={() => window.location.reload()} className={`${button} bg-[var(--accent)] text-white`}>Retry</button> : <Link href="/invite?mode=sign-in" className={`${button} bg-[var(--accent)] text-white`}>Sign in</Link>}</section></main>;
}

function DeletionRecovery({ subject, requestKey, inFlight, status, sessionAvailable, error, onStatus, onRecord }: {
  subject: string | null; requestKey: string | null; inFlight: boolean; status: AccountDeletionStatus | null; sessionAvailable: boolean; error: string;
  onStatus: () => Promise<void>; onRecord: (subject: string, status: AccountDeletionStatus | null, key?: string, inFlight?: boolean) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const checkStatus = async () => { setBusy(true); setLocalError(""); try { await onStatus(); } finally { setBusy(false); } };
  const retryRequest = async () => {
    if (!subject || !sessionAvailable) return;
    setBusy(true); setLocalError("");
    try {
      let storedKey: string | null = null;
      try { storedKey = window.sessionStorage.getItem(deletionKey(subject)); } catch { /* In-memory intent remains available. */ }
      const key = requestKey ?? storedKey;
      if (!key) { setLocalError("The original request cannot be retried here. Check status or contact support."); return; }
      onRecord(subject, null, key, true);
      const result = await v1Api.post<AccountDeletionStatus>("/api/v1/me/deletion", { confirmation: CONFIRMATION }, { ...actor(subject), idempotencyKey: key });
      onRecord(subject, result);
      try { window.sessionStorage.removeItem(deletionKey(subject)); } catch { /* Storage is optional. */ }
    } catch {
      onRecord(subject, null, requestKey ?? undefined, false);
      await onStatus();
      setLocalError("We could not confirm the request. Check status again when connected.");
    } finally { setBusy(false); }
  };
  const signOut = async () => {
    setBusy(true); setLocalError("");
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    setBusy(false);
    if (signOutError) { setLocalError("Your deletion status is unchanged. Local sign-out failed; please retry."); return; }
    router.replace("/invite");
  };
  return <main className="mx-auto min-h-full max-w-2xl px-6 py-12"><section className="glass rounded-[36px] p-7 sm:p-9">
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Account and privacy</p>
    <h1 className="mt-2 text-3xl font-semibold">{status?.status === "completed" ? "Account deletion completed" : status || inFlight ? "Account deletion in progress" : "Check your deletion request"}</h1>
    <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">{status?.status === "completed" ? "Your TableUs account and sign-in record were removed. See our privacy notice for how other records are handled." : status ? "Your TableUs profile has been removed. We are finishing removal of your sign-in record." : "We cannot yet confirm whether your deletion request completed. Your private account content is hidden while we check."}</p>
    {status?.needs_attention ? <p role="alert" className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">This request needs help from our team. Contact {support} and mention account deletion. You do not need another invite.</p> : null}
    {!sessionAvailable ? <p role="status" className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Your session ended. The last status shown here may be out of date. Contact {support} if you need an update.</p> : null}
    {error || localError ? <p role="alert" className="mt-4 text-sm text-red-700">{localError || error}</p> : null}
    <div className="mt-6 flex flex-wrap gap-3">
      {sessionAvailable ? <button type="button" disabled={busy || inFlight} onClick={checkStatus} className={`${button} bg-[var(--accent)] text-white`}><RefreshCw className="h-4 w-4" />Check status</button> : null}
      {sessionAvailable && !status ? <button type="button" disabled={busy || inFlight} onClick={retryRequest} className={`${button} border border-[var(--border)]`}>Retry original request</button> : null}
      {sessionAvailable && !status ? <button type="button" disabled={busy || inFlight} onClick={() => window.location.reload()} className={`${button} border border-[var(--border)]`}>Reload account status</button> : null}
      {sessionAvailable ? <button type="button" disabled={busy || inFlight} onClick={signOut} className={`${button} border border-[var(--border)]`}><LogOut className="h-4 w-4" />Sign out here</button> : null}
    </div>
  </section></main>;
}

function AccountContent({ subject, onDeletion }: { subject: string; onDeletion: (subject: string, status: AccountDeletionStatus | null, key?: string, inFlight?: boolean) => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [control, setControl] = useState<AccountControl | null>(null);
  const [plans, setPlans] = useState<ManagedPlan[]>([]);
  const [recipients, setRecipients] = useState<Record<string, string>>({});
  const [transferConfirmation, setTransferConfirmation] = useState<Record<string, boolean>>({});
  const [planConfirmation, setPlanConfirmation] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const unresolvedAction = useRef<PlanAction | null>(null);
  const [unresolved, setUnresolved] = useState(false);
  const [retryAllowed, setRetryAllowed] = useState(false);
  const busyRef = useRef(false);
  const activeRef = useRef(true);
  useEffect(() => { activeRef.current = true; return () => { activeRef.current = false; }; }, []);

  const refreshManagement = useCallback(async () => {
    const [nextControl, nextPlans] = await Promise.all([
      v1Api.get<AccountControl>("/api/v1/me/account-control", actor(subject)),
      v1Api.get<ManagedPlan[]>("/api/v1/me/organized-plans", actor(subject)),
    ]);
    if (activeRef.current) { setControl(nextControl); setPlans(nextPlans); }
    return nextPlans;
  }, [subject]);
  useEffect(() => {
    let active = true;
    Promise.all([v1Api.get<Profile>("/api/v1/me", actor(subject)), v1Api.get<AccountControl>("/api/v1/me/account-control", actor(subject)), v1Api.get<ManagedPlan[]>("/api/v1/me/organized-plans", actor(subject))])
      .then(([nextProfile, nextControl, nextPlans]) => { if (active) { setProfile(nextProfile); setControl(nextControl); setPlans(nextPlans); } })
      .catch(() => { if (active) setError("Unable to load account settings. Reconnect and retry."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [subject]);

  const performPlanAction = async (action: PlanAction) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(action.planId); setError(""); setMessage("");
    try {
      if (action.kind === "transfer") await v1Api.post<ManagedPlan>(`/api/v1/plans/${encodeURIComponent(action.planId)}/transfer-ownership`, { recipient_profile_id: action.recipientId }, { ...actor(subject), idempotencyKey: action.key });
      else await v1Api.delete<{ deleted: boolean }>(`/api/v1/plans/${encodeURIComponent(action.planId)}`, { confirmation: CONFIRMATION }, { ...actor(subject), idempotencyKey: action.key });
      if (!activeRef.current) return;
      unresolvedAction.current = null; setUnresolved(false); setRetryAllowed(false);
      await refreshManagement();
      setMessage(action.kind === "transfer" ? "Plan ownership transferred." : "Plan removed.");
      setPlanConfirmation((previous) => ({ ...previous, [action.planId]: "" }));
    } catch (requestError) {
      if (!activeRef.current) return;
      try {
        const latest = await refreshManagement();
        if (!activeRef.current) return;
        const plan = latest.find((item) => item.id === action.planId);
        if (!plan) {
          unresolvedAction.current = null; setUnresolved(false); setRetryAllowed(false);
          setMessage("This plan is no longer under your organized plans. Check Plans to see whether it remains shared with you.");
        } else if (requestError instanceof ApiError && requestError.status === 409) {
          unresolvedAction.current = null; setUnresolved(false); setRetryAllowed(false);
          setError("This change could not be made. Review the current participants and choose again.");
        } else {
          unresolvedAction.current = action; setUnresolved(true); setRetryAllowed(true);
          setError("We could not confirm this change. Check the plan, then retry the same request if needed.");
        }
      } catch {
        if (!activeRef.current) return;
        unresolvedAction.current = action; setUnresolved(true); setRetryAllowed(false);
        setError("We could not confirm this change. Reconnect and check the plan before trying another action.");
      }
    } finally { busyRef.current = false; if (activeRef.current) setBusy(null); }
  };
  const reconcile = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy("reconcile"); setError("");
    try {
      const latest = await refreshManagement();
      if (!activeRef.current) return;
      const action = unresolvedAction.current;
      if (action) {
        const plan = latest.find((item) => item.id === action.planId);
        if (!plan) {
          unresolvedAction.current = null; setUnresolved(false); setRetryAllowed(false);
          setMessage("This plan is no longer under your organized plans. Check Plans to see whether it remains shared with you.");
        } else {
          setRetryAllowed(true);
          setError("You still organize this plan. You can retry the original request.");
        }
      }
    } catch { if (activeRef.current) setError("Unable to check plans. Reconnect and retry."); }
    finally { busyRef.current = false; if (activeRef.current) setBusy(null); }
  };
  const downloadExport = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy("export"); setError("");
    try {
      const data = await v1Api.get<unknown>("/api/v1/me/export", actor(subject));
      if (!activeRef.current) return;
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `tableus-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
      setMessage("Your TableUs data export was downloaded.");
    } catch { if (activeRef.current) setError("Unable to export your data. Reconnect and retry."); }
    finally { busyRef.current = false; if (activeRef.current) setBusy(null); }
  };
  const requestDeletion = async () => {
    if (busyRef.current || confirmation !== CONFIRMATION || !control?.can_delete || !control.full_deletion_available || unresolved) return;
    busyRef.current = true; setBusy("account"); setError("");
    let storedKey: string | null = null;
    try { storedKey = window.sessionStorage.getItem(deletionKey(subject)); } catch { /* Storage is optional. */ }
    const key = storedKey ?? createIdempotencyKey();
    try { window.sessionStorage.setItem(deletionKey(subject), key); } catch { /* The in-memory intent retains this key. */ }
    clearPrivateQueryState(queryClient);
    onDeletion(subject, null, key, true);
    try {
      const status = await v1Api.post<AccountDeletionStatus>("/api/v1/me/deletion", { confirmation: CONFIRMATION }, { ...actor(subject), idempotencyKey: key });
      try { window.sessionStorage.removeItem(deletionKey(subject)); } catch { /* Storage is optional. */ }
      onDeletion(subject, status);
    } catch (requestError) {
      try {
        const status = await v1Api.get<AccountDeletionStatus>("/api/v1/me/deletion", actor(subject));
        try { window.sessionStorage.removeItem(deletionKey(subject)); } catch { /* Storage is optional. */ }
        onDeletion(subject, status);
      } catch (statusError) {
        if (statusError instanceof ApiError && statusError.status === 404 && requestError instanceof ApiError && requestError.status >= 400) {
          onDeletion(subject, null);
        } else {
          onDeletion(subject, null);
        }
      }
    } finally { busyRef.current = false; if (activeRef.current) setBusy(null); }
  };
  const signOut = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy("signout"); setError("");
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    if (!activeRef.current) return;
    busyRef.current = false; setBusy(null);
    if (signOutError) { setError("Unable to sign out. Please retry."); return; }
    clearPrivateQueryState(queryClient);
    router.replace("/invite");
  };
  if (loading) return <Loading />;
  return <main className="min-h-full px-6 py-8 lg:px-10"><div className="mx-auto max-w-3xl space-y-6">
    <section className="glass rounded-[36px] p-6 sm:p-8"><div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-[var(--accent)]" /><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Account and privacy</p><h1 className="mt-1 text-3xl font-semibold">{profile?.display_name ?? "Your account"}</h1></div></div><p className="mt-5 text-sm leading-7 text-[var(--muted-foreground)]">Taste-profile sharing is <strong>{profile?.share_taste ? "on" : "off"}</strong>. Change it from your profile. Review the <Link className="font-semibold text-[var(--accent)]" href="/privacy">privacy notice</Link> or <Link className="font-semibold text-[var(--accent)]" href="/terms">beta terms</Link>.</p></section>
    <section className="glass rounded-[36px] p-6 sm:p-8"><h2 className="text-xl font-semibold">Session</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Sign out of this browser and clear private in-memory data.</p><button type="button" onClick={signOut} disabled={!!busy} className={`${button} mt-5 border border-[var(--border)] bg-white`}><LogOut className="h-4 w-4" />{busy === "signout" ? "Signing out…" : "Sign out"}</button></section>
    <section className="glass rounded-[36px] p-6 sm:p-8"><h2 className="text-xl font-semibold">Export my data</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Download a JSON copy of your profile, reviews and plan participation before deleting your account.</p><button type="button" onClick={downloadExport} disabled={!!busy} className={`${button} mt-5 bg-[var(--accent)] text-white`}><Download className="h-4 w-4" />{busy === "export" ? "Preparing export…" : "Download my data"}</button></section>
    <section className="glass rounded-[36px] p-6 sm:p-8"><h2 className="text-xl font-semibold">Plans you organize</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Give a shared plan to another participant. A plan with only you can be removed. Resolve every plan before deleting your account.</p>
      {plans.length === 0 ? <p className="mt-5 rounded-2xl bg-white/70 p-4 text-sm">You do not organize any plans.</p> : <div className="mt-5 space-y-4">{plans.map((plan) => {
        const choices = plan.participants.filter((person) => person.profile_id !== subject);
        const selected = recipients[plan.id] ?? "";
        return <div key={plan.id} className="rounded-3xl border border-[var(--border)] bg-white/75 p-5"><h3 className="font-semibold">{plan.title}</h3><p className="mt-1 text-sm text-[var(--muted-foreground)]">{plan.participants.length} participant{plan.participants.length === 1 ? "" : "s"}</p>
          {choices.length ? <>
            <label className="mt-4 block text-sm font-semibold" htmlFor={`recipient-${plan.id}`}>New organizer</label>
            <select id={`recipient-${plan.id}`} value={selected} onChange={(event) => { setRecipients((previous) => ({ ...previous, [plan.id]: event.target.value })); setTransferConfirmation((previous) => ({ ...previous, [plan.id]: false })); }} disabled={!!busy || unresolved} className="mt-2 min-h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4"><option value="">Choose a participant</option>{choices.map((person) => <option key={person.profile_id} value={person.profile_id}>{person.display_name}</option>)}</select>
            <label className="mt-3 flex items-start gap-2 text-sm text-[var(--muted-foreground)]"><input type="checkbox" className="mt-1" checked={!!transferConfirmation[plan.id]} onChange={(event) => setTransferConfirmation((previous) => ({ ...previous, [plan.id]: event.target.checked }))} disabled={!selected || !!busy || unresolved} /><span>I confirm that {choices.find((person) => person.profile_id === selected)?.display_name ?? "this participant"} will organize this plan. The plan and other participants&apos; contributions stay in place.</span></label>
            <button type="button" disabled={!selected || !transferConfirmation[plan.id] || !!busy || unresolved} onClick={() => performPlanAction({ kind: "transfer", planId: plan.id, recipientId: selected, key: createIdempotencyKey() })} className={`${button} mt-3 bg-[var(--accent)] text-white`}><ArrowRight className="h-4 w-4" />{busy === plan.id ? "Saving…" : "Transfer ownership"}</button>
          </> : <><label className="mt-4 block text-sm font-semibold text-red-800" htmlFor={`plan-delete-${plan.id}`}>Type DELETE to remove this plan</label><input id={`plan-delete-${plan.id}`} value={planConfirmation[plan.id] ?? ""} onChange={(event) => setPlanConfirmation((previous) => ({ ...previous, [plan.id]: event.target.value }))} autoComplete="off" disabled={!!busy || unresolved} className="mt-2 min-h-11 w-full rounded-2xl border border-red-200 bg-white px-4" /><button type="button" disabled={planConfirmation[plan.id] !== CONFIRMATION || !!busy || unresolved} onClick={() => performPlanAction({ kind: "remove", planId: plan.id, key: createIdempotencyKey() })} className={`${button} mt-3 bg-red-700 text-white`}><Trash2 className="h-4 w-4" />{busy === plan.id ? "Removing…" : "Remove sole plan"}</button></>}</div>;
      })}</div>}
      {unresolved ? <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={!!busy} onClick={reconcile} className={`${button} border border-[var(--border)]`}>Check plan changes</button><button type="button" disabled={!!busy || !retryAllowed} onClick={() => { if (unresolvedAction.current) void performPlanAction(unresolvedAction.current); }} className={`${button} bg-[var(--accent)] text-white`}>Retry original request</button></div> : null}
    </section>
    <section className="rounded-[36px] border border-red-200 bg-red-50/80 p-6 sm:p-8"><div className="flex items-center gap-2 text-red-800"><Trash2 className="h-5 w-5" /><h2 className="text-xl font-semibold">Delete my account</h2></div><p className="mt-3 text-sm leading-6 text-red-800/80">This removes your TableUs profile and requests removal of your sign-in record. Export anything you want to keep first. The request cannot be undone.</p>
      {!control?.full_deletion_available ? <p role="status" className="mt-4 text-sm font-semibold text-red-900">Account deletion is not available in this beta environment. Contact {support} for help.</p> : !control.can_delete ? <p role="status" className="mt-4 text-sm font-semibold text-red-900">Resolve {control.organized_plan_count} organized plan{control.organized_plan_count === 1 ? "" : "s"} above first.</p> : <p role="status" className="mt-4 text-sm font-semibold text-red-900">Ready to request full account deletion.</p>}
      <label className="mt-5 block text-sm font-semibold text-red-900" htmlFor="delete-confirmation">Type DELETE to confirm account deletion</label><input id="delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" disabled={!!busy || !control?.full_deletion_available} className="mt-2 min-h-11 w-full rounded-2xl border border-red-200 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200" /><button type="button" onClick={requestDeletion} disabled={confirmation !== CONFIRMATION || !!busy || unresolved || !control?.can_delete || !control.full_deletion_available} className={`${button} mt-4 bg-red-700 text-white`}><Trash2 className="h-4 w-4" />{busy === "account" ? "Requesting deletion…" : "Delete my account"}</button>
    </section>
    {message ? <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
    {error ? <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
  </div></main>;
}
