import type { Constraints } from "@tableus/api-client";
import { useState } from "react";
import { Text, View } from "react-native";

import { space, usePalette } from "@/theme";

import { Button, Chip, Field } from "./ui";

const CUISINES = ["Italian", "Japanese", "Mexican", "Chinese", "Thai", "Indian", "Korean", "Vietnamese", "Mediterranean", "American", "French", "Middle Eastern"];
const DIETARY = ["Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "Dairy-free", "Nut allergy"];

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

const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((value) => value !== item) : [...list, item];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const palette = usePalette();
  return (
    <View style={{ gap: space.sm }}>
      <Text style={{ fontSize: 15, fontWeight: "600", color: palette.text }}>{title}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>{children}</View>
    </View>
  );
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

  return (
    <View style={{ gap: space.lg }}>
      <Field
        label="In your own words"
        multiline
        maxLength={500}
        placeholder="Something light, quiet enough to talk, near the train"
        defaultValue={initial.notes ?? ""}
        onChangeText={setNotes}
      />
      <Group title="In the mood for">
        {CUISINES.map((item) => (
          <Chip key={item} label={item} selected={cuisines.includes(item)} onPress={() => setCuisines(toggle(cuisines, item))} />
        ))}
      </Group>
      <Group title="Needs">
        {DIETARY.map((item) => (
          <Chip key={item} label={item} selected={dietary.includes(item)} onPress={() => setDietary(toggle(dietary, item))} />
        ))}
      </Group>
      <Group title="Spend up to">
        {[1, 2, 3, 4].map((level) => (
          <Chip key={level} label={"$".repeat(level)} selected={price === level} onPress={() => setPrice(price === level ? null : level)} />
        ))}
      </Group>
      <Button
        label={submitLabel}
        busy={busy}
        onPress={() => onSave({ cuisines, dietary_notes: dietary, max_price_level: price, notes: notes.trim() })}
      />
    </View>
  );
}
