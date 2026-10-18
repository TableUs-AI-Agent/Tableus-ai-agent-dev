"use client";

import type { Plan } from "@tableus/api-client";
import { useIsMutating } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { pickCardImage, type CardPick } from "../lib/pick-card-image";
import { photoUrl } from "../lib/plan-links";
import { webApiOrigin } from "../lib/runtime-config";
import { useMe } from "../lib/session";

const TabletopScene = dynamic(
  () => import("./tabletop-scene").then((module) => module.DiscoverTabletopScene),
  {
    ssr: false,
    // A quiet stand-in for the planet while the 3D code loads.
    loading: () => (
      <div aria-hidden="true" className="flex h-full w-full items-end justify-center">
        <div className="h-[55%] w-[60%] rounded-t-full bg-sage/50" />
      </div>
    ),
  },
);

/** Everything the 3D table needs. The mobile app sends the same shape to /embed/table. */
export type TableState = {
  people: { id: string; name: string }[];
  meId: string | null;
  /** `rank` is the viewer's ranking of a pick while voting (0 = first choice). */
  picks: (CardPick & { rank?: number })[];
  chosenId: string | null;
  selectedId: string | null;
  searching: boolean;
};

const faceKey = (pick: CardPick, chosen: boolean) => `${pick.id}:${chosen}:${pick.photo ?? ""}`;

export function TableScene({ state, onPick, fade = true }: { state: TableState; onPick?: (pickId: string) => void; fade?: boolean }) {
  // Stable identities keep the scene from re-seating everyone on each poll.
  const peopleKey = JSON.stringify([state.people, state.meId]);
  const { currentUser, friends } = useMemo(() => {
    const [people, meId] = JSON.parse(peopleKey) as [TableState["people"], string | null];
    const seated = people.map((person) => ({ ...person, avatar: "" }));
    const me = seated.find((person) => person.id === meId) ?? null;
    return { currentUser: me, friends: seated.filter((person) => person.id !== me?.id) };
  }, [peopleKey]);
  const picksKey = JSON.stringify([state.picks, state.chosenId]);
  // Card faces are drawn on a canvas once their photos load. They're kept by pick,
  // so changing a vote re-badges the cards without redrawing or re-dealing them.
  const [faces, setFaces] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    const [picks, chosenId] = JSON.parse(picksKey) as [TableState["picks"], string | null];
    Promise.all(picks.map(async (pick) => [faceKey(pick, pick.id === chosenId), await pickCardImage(pick, pick.id === chosenId)] as const))
      .then((drawn) => {
        if (!cancelled) setFaces((current) => ({ ...current, ...Object.fromEntries(drawn) }));
      });
    return () => { cancelled = true; };
  }, [picksKey]);
  const restaurants = useMemo(() => {
    const [picks, chosenId] = JSON.parse(picksKey) as [TableState["picks"], string | null];
    if (!picks.every((pick) => faces[faceKey(pick, pick.id === chosenId)])) return [];
    return picks.map((pick) => ({
      id: pick.id,
      name: pick.name,
      photo_url: faces[faceKey(pick, pick.id === chosenId)],
      rank: pick.rank,
    }));
  }, [picksKey, faces]);
  return (
    <TabletopScene
      fade={fade}
      currentUser={currentUser}
      friends={friends}
      phase={state.searching ? "searching" : restaurants.length ? "results" : "idle"}
      restaurants={state.searching ? [] : restaurants}
      selectedRestaurantId={state.selectedId}
      celebrateId={state.chosenId}
      onRestaurantSelect={(restaurant) => onPick?.(restaurant.id ?? "")}
    />
  );
}

/**
 * The plan's 3D table: everyone in the plan sits at it as a character, the
 * planet spins while picks are found, and the four picks orbit as cards. While
 * voting, `ranking` badges the viewer's top three on the cards.
 */
export function TableView({ plan, ranking = [], onPick }: { plan: Plan; ranking?: string[]; onPick?: (candidateId: string) => void }) {
  const me = useMe();
  const searching = useIsMutating({ mutationKey: ["suggest", plan.id] }) > 0;
  const state = useMemo<TableState>(() => ({
    people: plan.participants.map((person) => ({ id: person.profile_id, name: person.display_name })),
    meId: me.data?.id ?? null,
    picks: plan.candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.place.name,
      cuisine: candidate.place.cuisine,
      price_level: candidate.place.price_level,
      reasoning: candidate.reasoning,
      photo: photoUrl(candidate.place, webApiOrigin()),
      photo_credits: (candidate.place.photo_credits ?? []).map((credit) => credit.name),
      rank: plan.status === "voting" && ranking.includes(candidate.id) ? ranking.indexOf(candidate.id) : undefined,
    })),
    chosenId: plan.finalized_candidate_id,
    selectedId: plan.finalized_candidate_id,
    searching,
  }), [plan, ranking, me.data?.id, searching]);

  return (
    <div className="relative left-1/2 h-[360px] w-screen max-w-4xl -translate-x-1/2 [mask-image:linear-gradient(to_bottom,black_78%,transparent)] sm:h-[480px]">
      <TableScene state={state} onPick={onPick} />
    </div>
  );
}
