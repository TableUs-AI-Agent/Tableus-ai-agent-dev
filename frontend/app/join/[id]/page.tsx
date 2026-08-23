"use client";

import { ApiError } from "@tableus/api-client";
import type { Plan } from "@tableus/domain";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthCard } from "../../components/auth-card";
import { isSupabaseConfigured, supabase } from "../../lib/supabase-browser";
import { v1Api } from "../../lib/v1-api";

export default function JoinPage() {
  const { id } = useParams<{ id: string }>();
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(!isSupabaseConfigured);
  const [hasSession, setHasSession] = useState(!isSupabaseConfigured);
  const [showAuth, setShowAuth] = useState(false);
  const join = useMutation({
    mutationFn: () => v1Api.post<Plan>(`/api/v1/plans/${id}/join`, { share_token: token }),
    onSuccess: () => router.replace(`/plans/${id}`),
    onError: (error) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) setShowAuth(true);
    },
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.session));
      setSessionReady(true);
    });
    return () => { active = false; };
  }, []);

  const invalidLink = !token || (join.error instanceof ApiError && join.error.status === 404);

  if (showAuth) {
    return (
      <div className="mx-auto flex min-h-full max-w-xl items-center px-6 py-16">
        <AuthCard
          initialMode="sign-in"
          onApproved={() => {
            setHasSession(true);
            setShowAuth(false);
            join.reset();
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-xl items-center px-6 py-16">
      <section className="glass w-full space-y-5 rounded-[2rem] p-8">
        <h1 className="text-4xl font-bold">Join this dinner plan?</h1>
        <p className="text-[var(--muted-foreground)]">Only authenticated, invite-approved diners with the current private link can join.</p>
        {invalidLink ? <p role="alert" className="text-red-700">This private link is invalid, expired, or has been rotated.</p> : null}
        {join.error && !invalidLink && !(join.error instanceof ApiError && (join.error.status === 401 || join.error.status === 403)) ? <p role="alert" className="text-red-700">{join.error.message}</p> : null}
        {!sessionReady ? <p role="status" className="text-[var(--muted-foreground)]">Checking your TableUs session…</p> : null}
        {sessionReady && !hasSession ? <button onClick={() => setShowAuth(true)} className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 font-semibold text-white">Sign in to join</button> : null}
        {sessionReady && hasSession ? <button disabled={invalidLink || join.isPending} onClick={() => join.mutate()} className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 font-semibold text-white disabled:opacity-50">{join.isPending ? "Joining…" : "Join plan"}</button> : null}
      </section>
    </div>
  );
}
