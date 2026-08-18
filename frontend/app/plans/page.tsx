"use client";

import type { Plan } from "@tableus/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { v1Api } from "../lib/v1-api";

export default function PlansPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => v1Api.get<Plan[]>("/api/v1/plans") });
  const create = useMutation({
    mutationFn: () => v1Api.post<{ plan: Plan; share_token: string }>("/api/v1/plans", { title, location_label: "Boston, MA", latitude: 42.3601, longitude: -71.0589 }),
    onSuccess: ({ plan, share_token }) => {
      setTitle("");
      setShareUrl(`${window.location.origin}/join/${plan.id}?token=${encodeURIComponent(share_token)}`);
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-10 md:px-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Shared decisions</p>
        <h1 className="mt-2 text-4xl font-bold">Dinner plans</h1>
      </header>
      <section className="glass flex flex-col gap-3 rounded-[2rem] p-6 sm:flex-row">
        <input className="min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-white p-4" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Friday dinner" />
        <button className="rounded-2xl bg-[var(--accent)] px-6 py-4 font-semibold text-white disabled:opacity-50" disabled={!title.trim() || create.isPending} onClick={() => create.mutate()}>{create.isPending ? "Creating…" : "Create plan"}</button>
      </section>
      {shareUrl ? <section className="glass rounded-[2rem] p-6"><p className="font-semibold">Private join link</p><p className="mt-2 break-all text-sm text-[var(--muted-foreground)]">{shareUrl}</p><button onClick={() => navigator.clipboard.writeText(shareUrl)} className="mt-4 rounded-2xl border border-[var(--border)] bg-white px-5 py-3 font-semibold">Copy link</button></section> : null}
      {plans.error || create.error ? <p role="alert" className="text-red-700">{(plans.error || create.error)?.message}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {(plans.data ?? []).map((plan) => (
          <Link key={plan.id} href={`/plans/${plan.id}`} className="glass rounded-[2rem] p-6 transition-transform hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold">{plan.title}</h2><span className="capitalize text-emerald-700">{plan.status}</span></div>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{plan.location_label} · {plan.participants.length}/8 people</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
