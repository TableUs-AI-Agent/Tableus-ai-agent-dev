"use client";

import type { Candidate, PlaceDetails } from "@tableus/api-client";
import { type ReactNode, useState } from "react";

import { mapsUrl, photoUrl, price } from "../lib/plan-links";
import { webApiOrigin } from "../lib/runtime-config";

const ORDINAL = ["1st", "2nd", "3rd"];

export function PickCard({ id, candidate, rank, winner = false, onToggle, footer }: {
  id?: string;
  candidate: Candidate;
  rank?: number;
  winner?: boolean;
  onToggle?: () => void;
  footer?: ReactNode;
}) {
  const { place } = candidate;
  const [broken, setBroken] = useState(false);
  const photo = broken ? null : photoUrl(place, webApiOrigin());
  const body = (
    <>
      {photo ? (
        // A redirect to Google's image host, so Next's optimizer can't help here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" loading="lazy" onError={() => setBroken(true)} className="block aspect-[16/9] w-full border-b-2 border-bottle bg-sage/45 object-cover" />
      ) : (
        <span aria-hidden className="display block border-b-2 border-sage bg-sage/45 px-5 pb-3 pt-6 text-[2.75rem] leading-none text-bottle/30">{place.cuisine}</span>
      )}
      <span className="block p-5">
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
          <span className="mt-3 block text-sm">
            {place.address}.{" "}
            <a href={mapsUrl(place)} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">Open in Google Maps</a>
          </span>
        ) : null}
        {footer}
      </span>
    </>
  );
  const credit = photo ? <PhotoCredit place={place} /> : null;
  const frame = `block w-full overflow-hidden rounded-[20px] border-2 text-left ${winner ? "border-bottle bg-butter" : rank !== undefined ? "border-bottle bg-white shadow-[4px_4px_0_var(--color-bottle)]" : "border-sage bg-white"}`;
  if (!onToggle) return <article id={id} className={`${frame} relative scroll-mt-24`}>{body}{credit}</article>;
  // The credit link sits beside the button, not inside it, so both stay usable.
  return (
    <div className="relative">
      <button id={id} type="button" className={`${frame} scroll-mt-24 transition-transform hover:border-bottle active:translate-y-px`} aria-pressed={rank !== undefined} onClick={onToggle}>
        {body}
      </button>
      {credit}
    </div>
  );
}

/** Google requires each photo's authors to be shown, linked where it gives a link. */
function PhotoCredit({ place }: { place: PlaceDetails }) {
  const credits = place.photo_credits ?? [];
  if (!credits.length) return null;
  return (
    <span className="absolute right-3 top-3 max-w-[70%] truncate rounded-full bg-bottle/75 px-2.5 py-0.5 text-xs text-white">
      Photo:{" "}
      {credits.map((credit, index) => (
        <span key={`${credit.name}-${index}`}>
          {index ? ", " : ""}
          {credit.uri ? <a href={credit.uri} target="_blank" rel="noreferrer" className="underline underline-offset-2">{credit.name}</a> : credit.name}
        </span>
      ))}
    </span>
  );
}
