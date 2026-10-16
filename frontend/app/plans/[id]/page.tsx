"use client";

import type { Constraints, Plan } from "@tableus/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AppShell, Initials, LoadError, Loading } from "../../components/app-shell";
import { GoogleMapsAttribution } from "../../components/google-maps-attribution";
import { PickCard } from "../../components/pick-card";
import { TableView } from "../../components/table-view";
import { hasWishes, readWishes, WishesForm } from "../../components/wishes-form";
import { api, errorMessage } from "../../lib/api";
import { joinUrl } from "../../lib/plan-links";
import { useKeys, useMe } from "../../lib/session";

export default function PlanPage() {
  return <AppShell><PlanView /></AppShell>;
}

function usePlan(id: string) {
  const keys = useKeys();
  const queryClient = useQueryClient();
  const plan = useQuery({ queryKey: keys.plan(id), queryFn: () => api.getPlan(id) });
  const seen = useRef<string | null>(null);

  // Poll a cheap revision stamp and refetch only when someone else changed the plan.
  useEffect(() => {
    if (plan.data) seen.current = plan.data.updated_at;
  }, [plan.data]);
  useEffect(() => {
    const timer = window.setInterval(async () => {
      if (document.hidden) return;
      try {
        const { updated_at } = await api.planRevision(id);
        if (seen.current && updated_at !== seen.current) queryClient.invalidateQueries({ queryKey: keys.plan(id) });
      } catch {
        // The next tick will try again.
      }
    }, 8000);
    return () => window.clearInterval(timer);
  }, [id, queryClient, keys]);

  return plan;
}

function useUpdate(id: string) {
  const keys = useKeys();
  const queryClient = useQueryClient();
  return (next: Plan) => {
    queryClient.setQueryData(keys.plan(id), next);
    queryClient.invalidateQueries({ queryKey: keys.plans });
  };
}

function PlanView() {
  const { id } = useParams<{ id: string }>();
  const plan = usePlan(id);
  if (plan.isPending) return <Loading label="Loading plan" />;
  if (plan.isError) return <LoadError message={errorMessage(plan.error)} onRetry={() => plan.refetch()} />;
  const data = plan.data;

  return (
    <>
      <header className="mt-4">
        <h1 className="display text-6xl">{data.title}</h1>
        <p className="mt-1 text-moss">{data.location_label}</p>
      </header>
      <TableView
        plan={data}
        onPick={(candidateId) => document.getElementById(`pick-${candidateId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
      />
      <People plan={data} />
      {data.participants.length < 2 ? <Invite plan={data} first /> : null}
      {data.status === "collecting" ? <Collecting plan={data} /> : null}
      {data.status === "voting" ? <Voting key={data.candidates.map((item) => item.id).join()} plan={data} /> : null}
      {data.status === "finalized" ? <Decided plan={data} /> : null}
      {data.status !== "finalized" && data.participants.length >= 2 && data.participants.length < 8 ? <Invite plan={data} /> : null}
      {data.viewer_is_organizer ? <DeletePlan plan={data} /> : null}
    </>
  );
}

function People({ plan }: { plan: Plan }) {
  return (
    <section aria-label="Who's in" className="mt-6">
      <ul className="flex flex-wrap gap-x-4 gap-y-3">
        {plan.participants.map((person) => {
          const done = plan.status === "voting" ? person.has_voted : hasWishes(person.constraints);
          const note = plan.status === "voting"
            ? (person.has_voted ? "voted" : "still voting")
            : plan.status === "collecting" ? (done ? "added wishes" : "no wishes yet") : "";
          return (
            <li key={person.profile_id} className="flex items-center gap-2">
              <Initials name={person.display_name} highlight={done} />
              <span className="text-sm leading-tight">
                <span className="block font-semibold">{person.display_name}{person.is_organizer ? " (organizer)" : ""}</span>
                {note ? <span className="block text-moss">{note}</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MyWishes({ plan, submitLabel, onSaved }: { plan: Plan; submitLabel: string; onSaved?: () => void }) {
  const me = useMe();
  const update = useUpdate(plan.id);
  const mine = plan.participants.find((person) => person.profile_id === me.data?.id);
  const save = useMutation({
    mutationFn: (wishes: Constraints) => api.saveConstraints(plan.id, wishes),
    onSuccess: (next) => { update(next); onSaved?.(); },
  });
  return (
    <>
      <WishesForm initial={readWishes(mine?.constraints)} busy={save.isPending} submitLabel={submitLabel} onSave={(wishes) => save.mutate(wishes)} />
      {save.isError ? <p role="alert" className="mt-3 text-radicchio">{errorMessage(save.error)}</p> : null}
      {save.isSuccess ? <p role="status" className="mt-3 text-moss">Saved. Your standing tastes from your account are included too.</p> : null}
    </>
  );
}

function Collecting({ plan }: { plan: Plan }) {
  const update = useUpdate(plan.id);
  const [request, setRequest] = useState("");
  const suggest = useMutation({
    mutationKey: ["suggest", plan.id],
    mutationFn: () => api.suggest(plan.id, request.trim()),
    onSuccess: update,
  });
  const enoughPeople = plan.participants.length >= 2;

  return (
    <>
      <section aria-labelledby="wishes" className="mt-10">
        <h2 id="wishes" className="text-2xl font-bold">What do you want?</h2>
        <p className="mb-5 mt-1 text-moss">Everyone in the plan can see these.</p>
        <MyWishes plan={plan} submitLabel="Save my wishes" />
      </section>

      <section aria-labelledby="suggest" className="mt-10 rounded-[20px] border-2 border-bottle bg-white p-5">
        <h2 id="suggest" className="text-2xl font-bold">Ready when everyone is</h2>
        {enoughPeople ? (
          <>
            <p className="mt-1">Anyone can ask for suggestions once the group has added their wishes.</p>
            <label className="mt-4 block">
              <span className="mb-1 block font-semibold">Anything else? <span className="font-normal text-moss">(optional)</span></span>
              <input className="field" maxLength={500} placeholder="Close to the theater, good for a birthday" value={request} onChange={(e) => setRequest(e.target.value)} />
            </label>
            {suggest.isError ? <p role="alert" className="mt-3 text-radicchio">{errorMessage(suggest.error)}</p> : null}
            <button type="button" className="btn btn-primary mt-4 w-full" disabled={suggest.isPending} onClick={() => suggest.mutate()}>
              {suggest.isPending ? "Finding places that work for everyone…" : "Get four picks"}
            </button>
          </>
        ) : (
          <p className="mt-1">Invite at least one more person with the link below, then get suggestions together.</p>
        )}
      </section>
    </>
  );
}

function Voting({ plan }: { plan: Plan }) {
  const update = useUpdate(plan.id);
  const [ranking, setRanking] = useState<string[]>(plan.my_vote ?? []);
  const [editing, setEditing] = useState(false);
  const vote = useMutation({ mutationFn: () => api.vote(plan.id, ranking), onSuccess: update });
  const finalize = useMutation({
    mutationFn: () => api.finalize(plan.id),
    onSuccess: (next) => {
      update(next);
      // Bring the table into view so everyone sees it celebrate the pick.
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });
  const saved = JSON.stringify(ranking) === JSON.stringify(plan.my_vote ?? []);
  const voters = plan.participants.filter((person) => person.has_voted).length;
  const leader = [...plan.candidates].sort((a, b) => b.vote_score - a.vote_score || a.rank - b.rank)[0];

  function toggle(candidateId: string) {
    setRanking((current) => current.includes(candidateId)
      ? current.filter((value) => value !== candidateId)
      : current.length < 3 ? [...current, candidateId] : current);
  }

  return (
    <>
      <section aria-labelledby="picks" className="mt-10">
        <h2 id="picks" className="text-2xl font-bold">Rank your top three</h2>
        <p className="mb-5 mt-1 text-moss">Tap in order of preference. Tap again to undo.</p>
        <div className="space-y-4">
          {plan.candidates.map((candidate) => {
            const position = ranking.indexOf(candidate.id);
            return (
              <PickCard
                key={candidate.id}
                id={`pick-${candidate.id}`}
                candidate={candidate}
                rank={position >= 0 ? position : undefined}
                onToggle={() => toggle(candidate.id)}
              />
            );
          })}
        </div>
        {plan.candidates.some((candidate) => candidate.place.data_provider === "google_maps") ? <GoogleMapsAttribution className="mt-2" /> : null}
        {vote.isError ? <p role="alert" className="mt-3 text-radicchio">{errorMessage(vote.error)}</p> : null}
        {saved && ranking.length === 3 ? (
          <p role="status" className="mt-5 rounded-lg border-2 border-bottle bg-white p-3 text-center font-semibold">
            Vote saved. Tap the picks to change it.
          </p>
        ) : (
          <button
            type="button"
            className="btn btn-primary mt-5 w-full"
            disabled={ranking.length !== 3 || vote.isPending}
            onClick={() => vote.mutate()}
          >
            {vote.isPending ? "Saving…" : ranking.length === 3 ? "Save my vote" : `Pick ${3 - ranking.length} more`}
          </button>
        )}
      </section>

      {plan.viewer_is_organizer && leader ? (
        <section aria-labelledby="decide" className="mt-8 rounded-[20px] border-2 border-bottle bg-white p-5">
          <h2 id="decide" className="text-2xl font-bold">Lock it in</h2>
          <p className="mt-1">
            {voters} of {plan.participants.length} voted. {voters ? `${leader.place.name} is in the lead.` : "Wait for votes, or decide now."}
          </p>
          {finalize.isError ? <p role="alert" className="mt-3 text-radicchio">{errorMessage(finalize.error)}</p> : null}
          <button type="button" className="btn btn-quiet mt-4 w-full" disabled={finalize.isPending} onClick={() => finalize.mutate()}>
            {finalize.isPending ? "Locking in…" : `Go with ${leader.place.name}`}
          </button>
        </section>
      ) : null}

      <section className="mt-8">
        {editing ? (
          <>
            <h2 className="text-2xl font-bold">Change your wishes</h2>
            <p className="mb-5 mt-1 text-radicchio">Saving clears these picks and everyone&apos;s votes so the group can get new ones.</p>
            <MyWishes plan={plan} submitLabel="Save and start over" onSaved={() => setEditing(false)} />
          </>
        ) : (
          <button type="button" className="btn btn-text" onClick={() => setEditing(true)}>None of these work? Change your wishes</button>
        )}
      </section>
    </>
  );
}

function Decided({ plan }: { plan: Plan }) {
  const update = useUpdate(plan.id);
  const reopen = useMutation({ mutationFn: () => api.reopen(plan.id), onSuccess: update });
  const winner = plan.candidates.find((candidate) => candidate.id === plan.finalized_candidate_id);
  return (
    <section aria-labelledby="decided" className="mt-10">
      <h2 id="decided" className="display text-5xl">You&apos;re going to</h2>
      <div className="mt-4">
        {winner ? <PickCard id={`pick-${winner.id}`} candidate={winner} winner /> : <p>The chosen place couldn&apos;t be loaded.</p>}
        {winner?.place.data_provider === "google_maps" ? <GoogleMapsAttribution className="mt-2" /> : null}
      </div>
      {plan.viewer_is_organizer ? (
        <>
          {reopen.isError ? <p role="alert" className="mt-3 text-radicchio">{errorMessage(reopen.error)}</p> : null}
          <button type="button" className="btn btn-quiet mt-6" disabled={reopen.isPending} onClick={() => reopen.mutate()}>
            Reopen voting
          </button>
        </>
      ) : null}
    </section>
  );
}

function Invite({ plan, first = false }: { plan: Plan; first?: boolean }) {
  const keys = useKeys();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  // Signed-in screens render only in the browser, where the link origin is known.
  const url = typeof window === "undefined" ? "" : joinUrl(plan.id, plan.share_token);
  const rotate = useMutation({
    mutationFn: () => api.newShareLink(plan.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.plan(plan.id) }),
  });

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section aria-labelledby="invite" className={first ? "mt-8 rounded-[20px] bg-bottle p-5 text-leaf" : "mt-12 border-t-2 border-sage pt-8"}>
      <h2 id="invite" className={first ? "text-2xl font-bold" : "text-xl font-bold"}>{first ? "Send this link to the group" : "Invite people"}</h2>
      <p className={first ? "mt-1" : "mt-1 text-moss"}>Anyone with this link can join, up to eight people.</p>
      <div className="mt-3 flex gap-2">
        <input className="field min-w-0 flex-1 text-sm" readOnly value={url} aria-label="Plan link" onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="btn btn-primary shrink-0" onClick={copy} disabled={!url}>{copied ? "Copied" : "Copy link"}</button>
      </div>
      {plan.viewer_is_organizer ? (
        <button type="button" className="btn btn-text mt-2 text-sm" disabled={rotate.isPending} onClick={() => rotate.mutate()}>
          Make a new link (the old one stops working)
        </button>
      ) : null}
    </section>
  );
}

function DeletePlan({ plan }: { plan: Plan }) {
  const keys = useKeys();
  const router = useRouter();
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => api.deletePlan(plan.id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: keys.plan(plan.id) });
      queryClient.invalidateQueries({ queryKey: keys.plans });
      router.replace("/plans");
    },
  });
  return (
    <div className="mt-10">
      <button
        type="button"
        className="btn btn-text text-sm text-radicchio"
        disabled={remove.isPending}
        onClick={() => { if (window.confirm(`Delete "${plan.title}" for everyone?`)) remove.mutate(); }}
      >
        Delete this plan
      </button>
      {remove.isError ? <p role="alert" className="text-radicchio">{errorMessage(remove.error)}</p> : null}
    </div>
  );
}
