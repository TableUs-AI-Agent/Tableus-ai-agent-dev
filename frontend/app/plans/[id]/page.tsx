"use client";

import type { Plan, PlanRevision } from "@tableus/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { v1Api } from "../../lib/v1-api";
import { createCanonicalJoinUrl } from "../../lib/links";
import { GoogleMapsAttribution } from "../../components/google-maps-attribution";
import { useUser } from "../../context/user-context";

export default function PlanPage() {
  const { currentUser, userState, userError } = useUser();
  if (userState === "loading") return <p className="p-8" role="status">Loading plan…</p>;
  if (userState === "signed_out") return <PlanRecovery message="Sign in to view this TableUs plan." />;
  if (userState === "error") return <PlanRecovery message={userError || "Unable to connect to TableUs."} retry />;
  if (!currentUser) return <PlanRecovery message="Unable to load your approved TableUs profile." retry />;
  return <PlanPageContent key={currentUser.id} subject={currentUser.id} />;
}

function PlanRecovery({ message, retry = false }: { message: string; retry?: boolean }) {
  return (
    <main className="mx-auto flex min-h-full max-w-xl items-center px-6 py-16">
      <section className="glass w-full space-y-4 rounded-[2rem] p-8">
        <h1 className="text-3xl font-bold">Plan unavailable</h1>
        <p role="alert" className="text-red-700">{message}</p>
        {retry
          ? <button type="button" onClick={() => window.location.reload()} className="rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-white">Retry</button>
          : <Link href="/invite?mode=sign-in" className="inline-flex rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-white">Sign in</Link>}
      </section>
    </main>
  );
}

function PlanPageContent({ subject }: { subject: string }) {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const key = useMemo(() => ["plan", subject, id] as const, [subject, id]);
  const revisionKey = useMemo(() => ["plan-revision", subject, id] as const, [subject, id]);
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("group-friendly dinner");
  const [ranking, setRanking] = useState<string[]>([]);
  const plan = useQuery({ queryKey: key, queryFn: () => v1Api.get<Plan>(`/api/v1/plans/${id}`) });
  const revision = useQuery({
    queryKey: revisionKey,
    queryFn: () => v1Api.get<PlanRevision>(`/api/v1/plans/${id}/revision`),
    refetchInterval: 30_000,
    enabled: true,
  });
  useEffect(() => {
    if (revision.data?.updated_at && plan.data?.updated_at && revision.data.updated_at !== plan.data.updated_at) {
      void queryClient.refetchQueries({ queryKey: key, exact: true });
    }
  }, [key, plan.data?.updated_at, queryClient, revision.data?.updated_at]);
  const mutation = (path: string, body: unknown, method: "post" | "put" | "patch" = "post") => ({
    mutationFn: () => v1Api[method]<Plan>(`/api/v1/plans/${id}/${path}`, body),
    onSuccess: (data: Plan) => {
      queryClient.setQueryData(key, data);
      queryClient.setQueryData<PlanRevision>(revisionKey, { updated_at: data.updated_at });
    },
  });
  const constraints = useMutation(mutation("constraints", { notes, cuisines: [], dietary_notes: [] }, "patch"));
  const recommend = useMutation(mutation("recommendations", { query }));
  const vote = useMutation(mutation("vote", { ranking }, "put"));
  const finalize = useMutation(mutation("finalize", {}));
  const reopen = useMutation(mutation("reopen", {}));
  const rotate = useMutation({
    mutationFn: () => v1Api.post<{ share_token: string }>(`/api/v1/plans/${id}/share-token/rotate`, {}),
    onSuccess: ({ share_token }) => navigator.clipboard.writeText(createCanonicalJoinUrl(id, share_token)),
  });
  const current = plan.data;
  const error = plan.error || constraints.error || recommend.error || vote.error || finalize.error || reopen.error;

  function selectCandidate(candidateId: string) {
    setRanking((previous) => previous.includes(candidateId) ? previous.filter((item) => item !== candidateId) : previous.length < 3 ? [...previous, candidateId] : previous);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-5 py-10 md:px-10">
      {error ? <p role="alert" className="text-red-700">{error.message}</p> : null}
      {current ? <>
        <header className="glass rounded-[2rem] p-7"><h1 className="text-4xl font-bold">{current.title}</h1><p className="mt-3 text-[var(--muted-foreground)]">{current.location_label} · {current.participants.length}/8 people · <span className="capitalize">{current.status}</span></p><p className="mt-2 text-sm text-[var(--muted-foreground)]">{current.participants.map((person) => person.display_name).join(", ")}</p>{current.viewer_is_organizer ? <button onClick={() => rotate.mutate()} className="mt-4 rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold">Copy a fresh private join link</button> : null}</header>
        {current.status === "collecting" ? <section className="glass space-y-4 rounded-[2rem] p-6"><h2 className="text-xl font-bold">Set the table</h2><textarea className="min-h-24 w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Budget, vibe, dietary notes…"/><button className="rounded-2xl border border-[var(--border)] bg-white px-5 py-3 font-semibold" onClick={() => constraints.mutate()}>Save my constraints</button><input className="w-full rounded-2xl border border-[var(--border)] bg-white p-4" value={query} onChange={(event) => setQuery(event.target.value)}/><button className="rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-white disabled:opacity-50" disabled={current.participants.length < 2 || recommend.isPending} onClick={() => recommend.mutate()}>Find four options</button>{current.participants.length < 2 ? <p className="text-sm text-[var(--muted-foreground)]">Share the private join link with a second invite-approved diner first.</p> : null}</section> : null}
        <section className="grid gap-4 sm:grid-cols-2">{current.candidates.map((candidate) => { const position = ranking.indexOf(candidate.id); const chosen = current.finalized_candidate_id === candidate.id; return <button key={candidate.id} onClick={() => current.status === "voting" && selectCandidate(candidate.id)} className="glass rounded-[2rem] p-6 text-left"><div className="flex justify-between gap-4"><h2 className="text-xl font-bold">{candidate.place.name}</h2><span className="font-semibold text-[var(--accent)]">{chosen ? "Chosen" : position >= 0 ? `#${position + 1}` : `${candidate.vote_score} pts`}</span></div><p className="mt-2 text-sm text-[var(--muted-foreground)]">{candidate.place.cuisine} · {"$".repeat(candidate.place.price_level)} · {candidate.place.rating.toFixed(1)}</p><p className="mt-3 text-sm text-[var(--muted-foreground)]">{candidate.reasoning}</p>{candidate.place.data_provider === "google_maps" ? <GoogleMapsAttribution className="mt-1" /> : null}</button>; })}</section>
        {current.status === "voting" ? <section className="glass flex flex-wrap gap-3 rounded-[2rem] p-6"><button disabled={ranking.length !== 3} onClick={() => vote.mutate()} className="rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-white disabled:opacity-50">Submit top three</button>{current.viewer_is_organizer ? <button onClick={() => finalize.mutate()} className="rounded-2xl border border-[var(--border)] bg-white px-5 py-3 font-semibold">Finalize current winner</button> : null}</section> : null}
        {current.status === "finalized" && current.viewer_is_organizer ? <button onClick={() => reopen.mutate()} className="rounded-2xl border border-[var(--border)] bg-white px-5 py-3 font-semibold">Reopen voting</button> : null}
      </> : null}
    </div>
  );
}
