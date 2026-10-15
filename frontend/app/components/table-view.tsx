"use client";

import type { Plan } from "@tableus/api-client";
import { useIsMutating } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { pickCardImage, type CardPick } from "../lib/pick-card-image";
import { useMe } from "../lib/session";

const TabletopScene = dynamic(
  () => import("./tabletop-scene").then((module) => module.DiscoverTabletopScene),
  { ssr: false, loading: () => <div className="h-full w-full" aria-hidden="true" /> },
);

/** Everything the 3D table needs. The mobile app sends the same shape to /embed/table. */
export type TableState = {
  people: { id: string; name: string }[];
  meId: string | null;
  picks: CardPick[];
  chosenId: string | null;
  selectedId: string | null;
  searching: boolean;
};

export function TableScene({ state, onPick, fade = true }: { state: TableState; onPick?: (pickId: string) => void; fade?: boolean }) {
  const people = state.people.map((person) => ({ ...person, avatar: "" }));
  const currentUser = people.find((person) => person.id === state.meId) ?? null;
  const friends = people.filter((person) => person.id !== currentUser?.id);
  const restaurants = useMemo(
    () => (typeof document === "undefined" ? [] : state.picks.map((pick) => ({
      id: pick.id,
      name: pick.name,
      photo_url: pickCardImage(pick, pick.id === state.chosenId),
    }))),
    [state.picks, state.chosenId],
  );
  return (
    <TabletopScene
      fade={fade}
      currentUser={currentUser}
      friends={friends}
      phase={state.searching ? "searching" : restaurants.length ? "results" : "idle"}
      restaurants={state.searching ? [] : restaurants}
      selectedRestaurantId={state.selectedId}
      onRestaurantSelect={(restaurant) => onPick?.(restaurant.id ?? "")}
    />
  );
}

/**
 * The plan's 3D table: everyone in the plan sits at it as a character, the
 * planet spins while picks are found, and the four picks orbit as cards.
 */
export function TableView({ plan, onPick }: { plan: Plan; onPick?: (candidateId: string) => void }) {
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
    })),
    chosenId: plan.finalized_candidate_id,
    selectedId: plan.finalized_candidate_id ?? plan.my_vote?.[0] ?? null,
    searching,
  }), [plan, me.data?.id, searching]);

  return (
    <div className="relative left-1/2 h-[360px] w-screen max-w-4xl -translate-x-1/2 [mask-image:linear-gradient(to_bottom,black_78%,transparent)] sm:h-[480px]">
      <TableScene state={state} onPick={onPick} />
    </div>
  );
}
