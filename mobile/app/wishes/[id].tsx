import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView } from "react-native";

import { Body, Centered, ErrorText, Screen } from "@/components/ui";
import { readWishes, WishesForm } from "@/components/wishes-form";
import { api, errorMessage } from "@/lib/api";
import { useKeys, useMe } from "@/lib/session";
import { usePalette } from "@/theme";

export default function Wishes() {
  const keys = useKeys();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const palette = usePalette();
  const queryClient = useQueryClient();
  const me = useMe();
  const plan = useQuery({ queryKey: keys.plan(id), queryFn: () => api.getPlan(id) });
  const save = useMutation({
    mutationFn: (wishes: Parameters<typeof api.saveConstraints>[1]) => api.saveConstraints(id, wishes),
    onSuccess: (next) => {
      queryClient.setQueryData(keys.plan(id), next);
      queryClient.invalidateQueries({ queryKey: keys.plans });
      router.back();
    },
  });

  if (!plan.data) return <Centered><ActivityIndicator color={palette.text} /></Centered>;
  const mine = plan.data.participants.find((person) => person.profile_id === me.data?.id);
  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <Screen>
        {plan.data.status === "voting" ? (
          <Body>Saving clears the current picks and everyone’s votes, so the group can get new ones.</Body>
        ) : null}
        <WishesForm initial={readWishes(mine?.constraints)} busy={save.isPending} submitLabel="Save my wishes" onSave={(wishes) => save.mutate(wishes)} />
        {save.isError ? <ErrorText>{errorMessage(save.error)}</ErrorText> : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
