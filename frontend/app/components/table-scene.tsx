"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero: four people's wishes around one table, and the place that fits all
 * of them landing in the middle. One orchestrated sequence on load; reduced
 * motion shows the finished table.
 */
const WISHES = [
  { name: "Maya", wish: "Vegetarian, please", seat: "left-[2%] top-[9%]" },
  { name: "Jon", wish: "Under $30 each", seat: "right-[1%] top-[16%]" },
  { name: "Ari", wish: "Not sushi again", seat: "left-[0%] bottom-[16%]" },
  { name: "Sam", wish: "Somewhere we can sit outside", seat: "right-[3%] bottom-[7%]" },
];

const REASON = "Vegetarian plates to share and a leafy patio, at a price that works for everyone.";

export function TableScene() {
  const ref = useRef<HTMLElement>(null);
  // Without JavaScript the finished table shows. With it, the scene waits until
  // it is on screen so phones, where it sits below the fold, still see it play.
  const [stage, setStage] = useState<"static" | "waiting" | "play">("static");

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStage("play");
        observer.disconnect();
      } else {
        setStage((current) => (current === "static" ? "waiting" : current));
      }
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <figure ref={ref} data-stage={stage} className="table-scene relative mx-auto mb-14 aspect-square w-full max-w-[34rem] sm:mb-0" aria-label="Four friends' wishes, and the place that fits all of them">
      <div className="absolute inset-[13%] rounded-full border-[3px] border-bottle bg-bottle" />
      <div className="absolute inset-[13%] rounded-full [background:repeating-radial-gradient(circle,transparent_0_22px,rgba(242,246,238,0.06)_22px_23px)]" />

      <div className="table-plate absolute inset-[27%] flex flex-col items-center justify-center rounded-full border-[3px] border-bottle bg-butter p-[6%] text-center">
        <p className="display text-[1.75rem] sm:text-[2.75rem]">Garden Mezze</p>
        <p className="mt-1 text-sm font-semibold">Mediterranean, $$</p>
        <p className="mt-2 hidden text-sm leading-snug sm:block">{REASON}</p>
      </div>

      {WISHES.map((item, index) => (
        <div
          key={item.name}
          className={`table-wish absolute ${item.seat} flex max-w-[58%] items-center gap-2 rounded-full border-2 border-bottle bg-white py-1.5 pl-1.5 pr-3.5 text-[0.8125rem] font-semibold leading-tight shadow-[3px_3px_0_var(--color-bottle)] sm:max-w-[48%] sm:text-base`}
          style={{ animationDelay: `${150 + index * 260}ms` }}
        >
          <span aria-hidden="true" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-bold">
            {item.name[0]}
          </span>
          <span><span className="sr-only">{item.name}: </span>{item.wish}</span>
        </div>
      ))}

      <figcaption className="table-plate absolute inset-x-0 -bottom-14 text-center text-sm sm:hidden">{REASON}</figcaption>

      <style>{`
        .table-scene[data-stage="waiting"] :is(.table-wish, .table-plate) { opacity: 0; }
        .table-scene[data-stage="play"] .table-wish { animation: wish-in 420ms cubic-bezier(.2,.9,.3,1.3) both; }
        .table-scene[data-stage="play"] .table-plate { animation: plate-in 640ms cubic-bezier(.2,.9,.3,1.15) 1400ms both; }
        @keyframes wish-in { from { opacity: 0; transform: translateY(10px) scale(.92); } }
        @keyframes plate-in { from { opacity: 0; transform: scale(.4) rotate(-8deg); } }
      `}</style>
    </figure>
  );
}
