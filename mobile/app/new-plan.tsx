import type { ResolvedLocation } from "@tableus/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

import { Body, Button, ErrorText, Field, Screen } from "@/components/ui";
import { useKeys } from "@/lib/session";
import { api, errorMessage } from "@/lib/api";

export default function NewPlan() {
  const keys = useKeys();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<ResolvedLocation | null>(null);

  const find = useMutation({ mutationFn: () => api.resolveLocation(query.trim()), onSuccess: setLocation });
  const create = useMutation({
    mutationFn: (place: ResolvedLocation) => api.createPlan({
      title: title.trim() || "Dinner",
      location_label: place.label,
      location_place_id: place.place_id,
    }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: keys.plans });
      queryClient.setQueryData(keys.plan(created.plan.id), created.plan);
      // The sheet closes and the new plan opens on top of the list.
      router.dismiss();
      router.push(`/plan/${created.plan.id}`);
    },
  });
  const error = find.error ?? create.error;

  return (
    <Screen>
      <Field label="What's the occasion?" placeholder="Friday dinner" maxLength={120} onChangeText={setTitle} />
      {location ? (
        <>
          <Field label="Where should we look?" value={location.label} editable={false} />
          <Button kind="quiet" label="Change location" onPress={() => setLocation(null)} />
          {location.data_provider === "google_maps" ? <Body muted>Location from Google Maps</Body> : null}
        </>
      ) : (
        <Field label="Where should we look?" placeholder="Neighborhood, city or ZIP code" onChangeText={setQuery} returnKeyType="search" onSubmitEditing={() => query.trim().length >= 2 && find.mutate()} />
      )}
      {error ? <ErrorText>{errorMessage(error)}</ErrorText> : null}
      {location ? (
        <Button label="Start plan" busy={create.isPending} onPress={() => create.mutate(location)} />
      ) : (
        <Button label="Find this place" busy={find.isPending} disabled={query.trim().length < 2} onPress={() => find.mutate()} />
      )}
    </Screen>
  );
}
