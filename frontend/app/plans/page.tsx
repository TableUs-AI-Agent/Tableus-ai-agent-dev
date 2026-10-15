"use client";

import type { PlanSummary, ResolvedLocation } from "@tableus/api-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AppShell, LoadError, Loading } from "../components/app-shell";
import { GoogleMapsAttribution } from "../components/google-maps-attribution";
import { api, errorMessage } from "../lib/api";
import { useMe } from "../lib/session";

const STATUS: Record<PlanSummary["status"], string> = {
  collecting: "Collecting wishes",
  voting: "Voting",
  finalized: "Decided",
};

export default function PlansPage() {
  return <AppShell><Plans /></AppShell>;
}

function Plans() {
  const me = useMe();
  const plans = useQuery({ queryKey: ["plans"], queryFn: api.listPlans });
  const canCreate = me.data?.can_create_plans ?? false;

  return (
    <>
      <h1 className="display mt-4 text-6xl">Your plans</h1>
      {canCreate ? <NewPlan /> : (
        <p className="mt-4 rounded-[20px] border-2 border-sage bg-white p-5">
          Starting plans is invite-only for now. When a friend sends you a plan link, open it to join.
        </p>
      )}
      <section aria-labelledby="list" className="mt-12">
        <h2 id="list" className="text-xl font-bold">All plans</h2>
        {plans.isPending ? <Loading /> : plans.isError ? <LoadError onRetry={() => plans.refetch()} /> : plans.data.length === 0 ? (
          <p className="mt-3 text-moss">Nothing here yet. Plans you start or join show up here.</p>
        ) : (
          <ul className="mt-3 divide-y-2 divide-sage border-y-2 border-sage">
            {plans.data.map((plan) => (
              <li key={plan.id}>
                <Link href={`/plans/${plan.id}`} className="flex items-center justify-between gap-4 py-4 hover:bg-white/60">
                  <span>
                    <span className="block text-lg font-bold">{plan.title}</span>
                    <span className="block text-sm text-moss">{plan.location_label}</span>
                  </span>
                  <span className="shrink-0 text-right text-sm">
                    <span className={`block font-semibold ${plan.status === "finalized" ? "" : "text-radicchio"}`}>{STATUS[plan.status]}</span>
                    <span className="block text-moss">{plan.participant_count} {plan.participant_count === 1 ? "person" : "people"}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function NewPlan() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<ResolvedLocation | null>(null);

  const find = useMutation({ mutationFn: (text: string) => api.resolveLocation(text), onSuccess: setLocation });
  const create = useMutation({
    mutationFn: (place: ResolvedLocation) => api.createPlan({
      title: title.trim() || "Dinner",
      location_label: place.label,
      location_place_id: place.place_id,
    }),
    onSuccess: (created) => router.push(`/plans/${created.plan.id}`),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (location) create.mutate(location);
    else if (query.trim().length >= 2) find.mutate(query.trim());
  }

  const error = find.error ?? create.error;
  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-[20px] border-2 border-bottle bg-white p-5">
      <h2 className="text-xl font-bold">Start a plan</h2>
      <label className="block">
        <span className="mb-1 block font-semibold">What&apos;s the occasion?</span>
        <input className="field" placeholder="Friday dinner" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block">
        <span className="mb-1 block font-semibold">Where should we look?</span>
        <input
          className="field"
          placeholder="Neighborhood, city or ZIP code"
          value={location ? location.label : query}
          readOnly={Boolean(location)}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {location ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <button type="button" className="btn btn-text" onClick={() => setLocation(null)}>Change location</button>
          {location.data_provider === "google_maps" ? <GoogleMapsAttribution /> : null}
        </div>
      ) : null}
      {error ? <p role="alert" className="text-radicchio">{errorMessage(error)}</p> : null}
      <button className="btn btn-primary w-full" disabled={find.isPending || create.isPending || (!location && query.trim().length < 2)}>
        {location ? (create.isPending ? "Starting…" : "Start plan") : find.isPending ? "Looking…" : "Find this place"}
      </button>
    </form>
  );
}
