"use client";

import type { Constraints } from "@tableus/api-client";
import { useState, type FormEvent } from "react";

const CUISINES = ["Italian", "Japanese", "Mexican", "Chinese", "Thai", "Indian", "Korean", "Vietnamese", "Mediterranean", "American", "French", "Middle Eastern"];
const DIETARY = ["Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "Dairy-free", "Nut allergy"];
const PRICES = [1, 2, 3, 4];

function toggle(list: string[], item: string) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

export function readWishes(raw: Record<string, unknown> | undefined): Constraints {
  const value = raw ?? {};
  return {
    cuisines: Array.isArray(value.cuisines) ? value.cuisines.map(String) : [],
    dietary_notes: Array.isArray(value.dietary_notes) ? value.dietary_notes.map(String) : [],
    max_price_level: typeof value.max_price_level === "number" ? value.max_price_level : null,
    notes: typeof value.notes === "string" ? value.notes : "",
  };
}

export function hasWishes(raw: Record<string, unknown> | undefined): boolean {
  const wishes = readWishes(raw);
  return Boolean(wishes.cuisines?.length || wishes.dietary_notes?.length || wishes.max_price_level || wishes.notes?.trim());
}

export function WishesForm({ initial, busy, submitLabel, onSave }: {
  initial: Constraints;
  busy: boolean;
  submitLabel: string;
  onSave: (wishes: Constraints) => void;
}) {
  const [cuisines, setCuisines] = useState(initial.cuisines ?? []);
  const [dietary, setDietary] = useState(initial.dietary_notes ?? []);
  const [price, setPrice] = useState<number | null>(initial.max_price_level ?? null);
  const [notes, setNotes] = useState(initial.notes ?? "");

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave({ cuisines, dietary_notes: dietary, max_price_level: price, notes: notes.trim() });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <label className="block">
        <span className="mb-1 block font-semibold">In your own words</span>
        <textarea
          className="field min-h-24"
          maxLength={500}
          placeholder="Something light, quiet enough to talk, not too far from the train"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <fieldset>
        <legend className="mb-2 font-semibold">In the mood for <span className="font-normal text-moss">(any you like)</span></legend>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((item) => (
            <button key={item} type="button" className="chip" aria-pressed={cuisines.includes(item)} onClick={() => setCuisines(toggle(cuisines, item))}>{item}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-semibold">Needs</legend>
        <div className="flex flex-wrap gap-2">
          {DIETARY.map((item) => (
            <button key={item} type="button" className="chip" aria-pressed={dietary.includes(item)} onClick={() => setDietary(toggle(dietary, item))}>{item}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-semibold">Spend up to</legend>
        <div className="flex flex-wrap gap-2">
          {PRICES.map((level) => (
            <button key={level} type="button" className="chip min-w-14 justify-center" aria-pressed={price === level} onClick={() => setPrice(price === level ? null : level)}>
              {"$".repeat(level)}
            </button>
          ))}
        </div>
      </fieldset>
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Saving…" : submitLabel}</button>
    </form>
  );
}
