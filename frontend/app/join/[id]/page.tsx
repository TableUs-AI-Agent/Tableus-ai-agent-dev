"use client";

import { ApiError, withAuthTimeout } from "@tableus/api-client";
import { requireCanonicalUuid, type Plan, type PlanRevision } from "@tableus/domain";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { AuthCard } from "../../components/auth-card";
import { captureJoinLocation, clearJoinUncertainty, markJoinUncertain, needsJoinReconciliation, pendingJoin, pendingJoinSnapshot, subscribePendingJoin, type JoinCaptureResult } from "../../lib/pending-join";
import { isSupabaseConfigured, supabase } from "../../lib/supabase-browser";
import { v1Api } from "../../lib/v1-api";

const demoSubject = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-organizer";
const serverSnapshot = () => null;

function verifiedPlanId(value: string | undefined): string | null {
  try { return requireCanonicalUuid(value ?? "", "Plan ID"); } catch { return null; }
}

export default function JoinPage() {
  const { id } = useParams<{ id: string }>();
  const planId = verifiedPlanId(id);
  const router = useRouter();
  const pending = useSyncExternalStore(subscribePendingJoin, pendingJoinSnapshot, serverSnapshot);
  const [captureState, setCaptureState] = useState<JoinCaptureResult | "checking">("checking");
  const [sessionReady, setSessionReady] = useState(!isSupabaseConfigured);
  const [subject, setSubject] = useState<string | null>(isSupabaseConfigured ? null : demoSubject);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"join" | "sign-in">("sign-in");
  const [busy, setBusy] = useState<"join" | "check" | null>(null);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false);
  const mountedRef = useRef(false);
  const authEpoch = useRef(0);
  const observedSubject = useRef<string | null>(isSupabaseConfigured ? null : demoSubject);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useLayoutEffect(() => {
    const result = captureJoinLocation(planId, window.location, window.history);
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setCaptureState(result);
      setNeedsRecovery(false);
      setError("");
    });
    return () => { active = false; };
  }, [planId]);

  useEffect(() => {
    const captureNavigation = () => {
      // Next may emit both popstate and hashchange for one navigation. The
      // second event observes our cleaned URL and must not erase an error.
      if (!window.location.search && !window.location.hash) return;
      if (!planId || window.location.pathname !== `/join/${planId}`) return;
      const result = captureJoinLocation(planId, window.location, window.history);
      setCaptureState(result);
      setNeedsRecovery(false);
      setShowAuth(false);
      setError("");
    };
    window.addEventListener("hashchange", captureNavigation);
    window.addEventListener("popstate", captureNavigation);
    return () => {
      window.removeEventListener("hashchange", captureNavigation);
      window.removeEventListener("popstate", captureNavigation);
    };
  }, [planId]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      authEpoch.current += 1;
      observedSubject.current = session?.user.id ?? null;
      setSubject(observedSubject.current);
      setSessionReady(true);
    });
    const startupEpoch = authEpoch.current;
    void withAuthTimeout(() => supabase.auth.getSession()).then(({ data }) => {
      if (!active) return;
      if (startupEpoch !== authEpoch.current) return;
      observedSubject.current = data.session?.user.id ?? null;
      setSubject(observedSubject.current);
      setSessionReady(true);
    }).catch(() => {
      if (active) setSessionReady(true);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const current = pending?.planId === planId ? pending : null;
  const requiresReconciliation = needsRecovery || Boolean(current && needsJoinReconciliation(current.handle));
  const linkMissing = captureState !== "checking" && !current;
  const invalidLink = captureState === "invalid";

  async function activeSubject(): Promise<string | null> {
    if (!isSupabaseConfigured) return demoSubject;
    const startedAt = authEpoch.current;
    const { data, error: sessionError } = await withAuthTimeout(() => supabase.auth.getSession());
    if (sessionError) throw sessionError;
    if (startedAt !== authEpoch.current) throw new Error("Session changed during this action");
    const actor = data.session?.user.id ?? null;
    if (observedSubject.current && observedSubject.current !== actor) {
      throw new Error("Session changed during this action");
    }
    return actor;
  }

  function stillCurrent(handle: string, actor: string) {
    const snapshot = pendingJoin.getSnapshot();
    return mountedRef.current && snapshot?.handle === handle
      && snapshot.planId === planId && snapshot.subject === actor;
  }

  function mayBind(handle: string, actor: string) {
    const snapshot = pendingJoin.getSnapshot();
    return mountedRef.current && snapshot?.handle === handle && snapshot.planId === planId
      && (snapshot.subject === null || snapshot.subject === actor);
  }

  function requireAuthentication() {
    setAuthMode("sign-in");
    setShowAuth(true);
    setError("Sign in to your invite-approved account, then choose Join plan.");
  }

  async function joinPlan() {
    if (busyRef.current || requiresReconciliation || !current || !planId) return;
    busyRef.current = true;
    setBusy("join");
    setError("");
    let dispatched = false;
    let actor: string | null = null;
    try {
      actor = await activeSubject();
      if (!actor) { requireAuthentication(); return; }
      if (!mayBind(current.handle, actor)) return;
      pendingJoin.setSubject(actor);
      const token = pendingJoin.read(current.handle, actor);
      if (!token) { setError("This pending link is no longer available. Reopen your private link."); return; }
      markJoinUncertain(current.handle);
      dispatched = true;
      await v1Api.post<Plan>(`/api/v1/plans/${planId}/join`, { share_token: token }, { expectedSubject: actor, idempotencyKey: current.handle });
      if (!stillCurrent(current.handle, actor)) return;
      clearJoinUncertainty(current.handle);
      pendingJoin.clear(current.handle);
      router.replace(`/plans/${planId}`);
    } catch (caught) {
      if (!mountedRef.current || pendingJoin.getSnapshot()?.handle !== current.handle) return;
      if (!dispatched) {
        setError("Unable to check your session. Reconnect and try again.");
      } else if (caught instanceof ApiError && caught.status === 401) {
        clearJoinUncertainty(current.handle);
        requireAuthentication();
      } else if (caught instanceof ApiError && caught.status === 404) {
        clearJoinUncertainty(current.handle);
        pendingJoin.clear(current.handle);
        setError("This private link no longer works. Ask the organizer for a fresh link.");
      } else if (caught instanceof ApiError && caught.status === 403 && actor) {
        clearJoinUncertainty(current.handle);
        try {
          await v1Api.get("/api/v1/me", { expectedSubject: actor });
          if (!stillCurrent(current.handle, actor)) return;
          clearJoinUncertainty(current.handle);
          setError("This account is approved, but the plan did not admit it. Ask the organizer for help.");
        } catch (approvalError) {
          if (pendingJoin.getSnapshot()?.handle !== current.handle) return;
          if (approvalError instanceof ApiError && approvalError.status === 403) {
            setAuthMode("join");
            setShowAuth(true);
            setError("This account needs a separate TableUs beta invitation before joining a plan.");
          } else {
            setError("Unable to confirm account approval. Reconnect and try again.");
          }
        }
      } else if (!(caught instanceof ApiError) || caught.status === 0 || caught.status >= 500) {
        setNeedsRecovery(true);
        setError("The result is unknown. Check whether you joined before trying again.");
      } else {
        clearJoinUncertainty(current.handle);
        setError(caught instanceof Error ? caught.message : "Unable to join this plan.");
      }
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setBusy(null);
    }
  }

  async function checkJoinStatus() {
    if (busyRef.current || !requiresReconciliation || !current || !planId) return;
    busyRef.current = true;
    setBusy("check");
    setError("");
    let actor: string | null = null;
    try {
      actor = await activeSubject();
      if (!actor) { requireAuthentication(); return; }
      if (!mayBind(current.handle, actor)) return;
      pendingJoin.setSubject(actor);
      if (!stillCurrent(current.handle, actor)) return;
      await v1Api.get<PlanRevision>(`/api/v1/plans/${planId}/revision`, { expectedSubject: actor });
      if (!stillCurrent(current.handle, actor)) return;
      clearJoinUncertainty(current.handle);
      pendingJoin.clear(current.handle);
      router.replace(`/plans/${planId}`);
    } catch (caught) {
      if (!mountedRef.current || pendingJoin.getSnapshot()?.handle !== current.handle) return;
      if (caught instanceof ApiError && caught.status === 403 && actor) {
        try {
          await v1Api.get("/api/v1/me", { expectedSubject: actor });
          if (!stillCurrent(current.handle, actor)) return;
          clearJoinUncertainty(current.handle);
          setNeedsRecovery(false);
          setError("You have not joined this plan. If your link is still current, choose Join plan again.");
        } catch (approvalError) {
          if (pendingJoin.getSnapshot()?.handle !== current.handle) return;
          if (approvalError instanceof ApiError && approvalError.status === 403) {
            setAuthMode("join");
            setShowAuth(true);
            setError("This account needs a separate TableUs beta invitation before joining a plan.");
          } else {
            setError("Unable to confirm account approval. Reconnect and check again.");
          }
        }
      } else if (caught instanceof ApiError && caught.status === 401) {
        requireAuthentication();
      } else {
        setError("Unable to confirm membership. Reconnect and check again.");
      }
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setBusy(null);
    }
  }

  async function authApproved() {
    try {
      const actor = await activeSubject();
      if (!current || !actor || !mayBind(current.handle, actor)) return;
      pendingJoin.setSubject(actor);
      setSubject(actor);
      setShowAuth(false);
      setError("");
    } catch {
      if (!mountedRef.current) return;
      setShowAuth(false);
      setError("Unable to confirm your session. Reconnect and try again.");
    }
  }

  function cancel() {
    if (current) {
      clearJoinUncertainty(current.handle);
      pendingJoin.clear(current.handle);
    }
    router.replace(subject ? "/plans" : "/invite");
  }

  if (showAuth && current) {
    return <div className="mx-auto flex min-h-full max-w-xl items-center px-6 py-16">
      <div className="w-full space-y-4">
        <AuthCard initialMode={authMode} onApproved={authApproved} />
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        <button type="button" onClick={cancel} className="w-full rounded-2xl border border-[var(--border)] bg-white px-5 py-4 font-semibold">Cancel pending join</button>
      </div>
    </div>;
  }

  return <div className="mx-auto flex min-h-full max-w-xl items-center px-6 py-16">
    <section className="glass w-full space-y-5 rounded-[2rem] p-8">
      <h1 className="text-4xl font-bold">Join this dinner plan?</h1>
      <p className="text-[var(--muted-foreground)]">Only invite-approved TableUs members with the current private link can join. Opening it does not join you.</p>
      {captureState === "checking" ? <p role="status">Opening your private link…</p> : null}
      {invalidLink ? <p role="alert" className="text-red-700">This private link is invalid. Ask the organizer for a fresh link.</p> : null}
      {linkMissing && !invalidLink ? <p role="alert" className="text-red-700">Your pending link is unavailable or its 20-minute window ended. Reopen your private link.</p> : null}
      {error ? <p role="alert" className="text-red-700">{error}</p> : null}
      {!sessionReady && current ? <p role="status">Checking your TableUs session…</p> : null}
      {sessionReady && !subject && current ? <button type="button" onClick={() => { setAuthMode("sign-in"); setShowAuth(true); }} className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 font-semibold text-white">Sign in to join</button> : null}
      {sessionReady && subject && current ? <>
        {requiresReconciliation ? <button type="button" disabled={busy !== null} onClick={checkJoinStatus} className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 font-semibold text-white disabled:opacity-50">{busy === "check" ? "Checking…" : "Check whether I joined"}</button> : null}
        {!requiresReconciliation ? <button type="button" disabled={busy !== null} onClick={joinPlan} className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 font-semibold text-white disabled:opacity-50">{busy === "join" ? "Joining…" : "Join plan"}</button> : null}
      </> : null}
      <button type="button" onClick={cancel} disabled={busy !== null} className="w-full rounded-2xl border border-[var(--border)] bg-white px-5 py-4 font-semibold disabled:opacity-50">Cancel</button>
    </section>
  </div>;
}
