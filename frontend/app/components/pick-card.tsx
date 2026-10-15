import type { Candidate } from "@tableus/api-client";
import type { ReactNode } from "react";

import { mapsUrl, price } from "../lib/plan-links";

const ORDINAL = ["1st", "2nd", "3rd"];

export function PickCard({ candidate, rank, winner = false, onToggle, footer }: {
  candidate: Candidate;
  rank?: number;
  winner?: boolean;
  onToggle?: () => void;
  footer?: ReactNode;
}) {
  const { place } = candidate;
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="block">
          <span className="display mb-1.5 block text-[2rem]">{place.name}</span>
          <span className={`block text-sm font-semibold ${winner ? "" : "text-moss"}`}>
            {place.cuisine}, {price(place.price_level)}{place.rating ? `, ${place.rating.toFixed(1)} stars` : ""}
          </span>
        </span>
        {rank !== undefined ? (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-butter px-3 py-1 text-sm font-bold">Your {ORDINAL[rank]}</span>
        ) : null}
      </span>
      <span className="mt-3 block">{candidate.reasoning}</span>
      {winner ? (
        <p className="mt-3 text-sm">
          {place.address}.{" "}
          <a href={mapsUrl(place)} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">Open in Google Maps</a>
        </p>
      ) : null}
      {footer}
    </>
  );
  const frame = `block w-full rounded-[20px] border-2 p-5 text-left ${winner ? "border-bottle bg-butter" : rank !== undefined ? "border-bottle bg-white shadow-[4px_4px_0_var(--color-bottle)]" : "border-sage bg-white"}`;
  if (!onToggle) return <article className={frame}>{body}</article>;
  return (
    <button type="button" className={`${frame} transition-transform hover:border-bottle active:translate-y-px`} aria-pressed={rank !== undefined} onClick={onToggle}>
      {body}
    </button>
  );
}
