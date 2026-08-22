import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card, Field } from "@/components/ui";
import { MutationFeedback } from "@/components/mutation-feedback";
import { api } from "@/lib/api";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";
import { colors } from "@/theme";

export default function ReviewScreen() {
  const [restaurant, setRestaurant] = useState("");
  const [review, setReview] = useState("");
  const save = useRecoverableMutation({
    mutationFn: (body: { restaurant_name: string; review_text: string; rating: number }, idempotencyKey) =>
      api.post("/api/v1/reviews", body, { idempotencyKey }),
    onSuccess: () => { setRestaurant(""); setReview(""); },
  });
  const analyze = useRecoverableMutation({
    mutationFn: async (_variables: undefined, _idempotencyKey: string) => {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (result.canceled) return null;
      const asset = result.assets[0];
      const form = new FormData();
      form.append("image", { uri: asset.uri, name: asset.fileName ?? "dish.jpg", type: asset.mimeType ?? "image/jpeg" } as unknown as Blob);
      return api.post<{ dish: string; cuisine: string }>("/api/v1/food/analyze", form);
    },
  });
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: "800" }}>Remember what worked</Text>
        <Field value={restaurant} onChangeText={(value) => { save.reset(); setRestaurant(value); }} placeholder="Restaurant" />
        <Field value={review} onChangeText={(value) => { save.reset(); setReview(value); }} placeholder="What did you like?" multiline style={{ minHeight: 100, textAlignVertical: "top" }} />
        <MutationFeedback failure={save.failure} canRetry={save.canRetry} retryLabel="Retry saving review" onRetry={save.retry} onDismiss={save.reset} />
        <Button label="Save review" onPress={() => save.submit({ restaurant_name: restaurant, review_text: review, rating: 5 })} loading={save.isPending} disabled={!restaurant || !review || save.canRetry} />
      </Card>
      <Card>
        <Text selectable style={{ color: colors.muted }}>Photo analysis is ephemeral. The image bytes are validated, analyzed, and never persisted.</Text>
        {analyze.data ? <Text selectable style={{ color: colors.ink }}>{analyze.data.dish} · {analyze.data.cuisine}</Text> : null}
        <MutationFeedback failure={analyze.failure} canRetry={analyze.canRetry} retryLabel="Choose photo and retry" onRetry={analyze.retry} onDismiss={analyze.reset} />
        <Button label="Analyze a dish photo" onPress={() => analyze.submit(undefined)} loading={analyze.isPending} disabled={analyze.canRetry} />
      </Card>
    </ScrollView>
  );
}
