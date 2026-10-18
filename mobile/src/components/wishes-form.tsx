import type { Constraints } from "@tableus/api-client";
import type { SFSymbol } from "expo-symbols";
import { useState, type ReactNode } from "react";
import { Text, useWindowDimensions, View } from "react-native";

import { radius, space, tiles, usePalette } from "@/theme";

import { Chip, Field, IconTile, PressScale } from "./ui";

const CUISINES = ["Italian", "Japanese", "Mexican", "Chinese", "Thai", "Indian", "Korean", "Vietnamese", "Mediterranean", "American", "French", "Middle Eastern"];
const DIETARY = ["Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "Dairy-free", "Nut allergy"];
const BUDGET = ["Cheap", "Moderate", "Pricey", "Splurge"];

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

function Group({ title, icon, tint, children }: { title: string; icon: SFSymbol; tint: string; children: ReactNode }) {
  const palette = usePalette();
  return (
    <View style={{ gap: space.sm + space.xs }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm + 2 }}>
        <IconTile name={icon} color={tint} size={26} />
        <Text accessibilityRole="header" style={{ flex: 1, fontSize: 17, fontWeight: "700", color: palette.text }}>{title}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>{children}</View>
    </View>
  );
}

/** The wishes a person brings to one plan. The parent renders the save action. */
export function WishesForm({ initial, onChange }: { initial: Constraints; onChange: (wishes: Constraints) => void }) {
  const palette = usePalette();
  // Four budget tiles in a row only fit their labels at standard text sizes; larger text gets two rows.
  const twoRows = useWindowDimensions().fontScale > 1.3;
  const [wishes, setWishes] = useState<Constraints>({
    cuisines: initial.cuisines ?? [],
    dietary_notes: initial.dietary_notes ?? [],
    max_price_level: initial.max_price_level ?? null,
    notes: initial.notes ?? "",
  });
  const set = (patch: Partial<Constraints>) => {
    const next = { ...wishes, ...patch };
    setWishes(next);
    onChange(next);
  };
  const cuisines = wishes.cuisines ?? [];
  const dietary = wishes.dietary_notes ?? [];

  return (
    <View style={{ gap: space.xl }}>
      <Field
        label="In your own words"
        icon="text.quote"
        multiline
        maxLength={500}
        placeholder="Something light, quiet enough to talk, near the train"
        defaultValue={initial.notes ?? ""}
        onChangeText={(notes) => set({ notes })}
        hint="Pip reads this together with everyone else’s wishes."
      />
      <Group title="In the mood for" icon="fork.knife" tint={tiles.radicchio}>
        {CUISINES.map((item) => (
          <Chip key={item} label={item} selected={cuisines.includes(item)} onPress={() => set({ cuisines: toggle(cuisines, item) })} />
        ))}
      </Group>
      <Group title="Needs" icon="leaf.fill" tint={tiles.bottle}>
        {DIETARY.map((item) => (
          <Chip key={item} label={item} selected={dietary.includes(item)} onPress={() => set({ dietary_notes: toggle(dietary, item) })} />
        ))}
      </Group>
      <Group title="Spend up to" icon="dollarsign" tint={tiles.butter}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm, width: "100%" }}>
          {[1, 2, 3, 4].map((level) => {
            const selected = wishes.max_price_level === level;
            return (
              <View key={level} style={twoRows ? { width: "48%", flexGrow: 1 } : { flex: 1 }}>
                <PressScale
                  onPress={() => set({ max_price_level: selected ? null : level })}
                  accessibilityLabel={`Up to ${BUDGET[level - 1].toLowerCase()}, ${"$".repeat(level)}`}
                  accessibilityState={{ selected }}
                  style={{
                    alignItems: "center", gap: 2, paddingVertical: 10, borderRadius: radius.input, borderCurve: "continuous",
                    borderWidth: 1, borderColor: selected ? palette.accent : palette.border,
                    backgroundColor: selected ? palette.accent : palette.surface,
                  }}
                >
                  <Text style={{ fontSize: 17, fontWeight: "700", color: selected ? palette.onAccent : palette.text }}>{"$".repeat(level)}</Text>
                  <Text style={{ fontSize: 12, color: selected ? palette.onAccent : palette.secondary }}>{BUDGET[level - 1]}</Text>
                </PressScale>
              </View>
            );
          })}
        </View>
      </Group>
    </View>
  );
}
