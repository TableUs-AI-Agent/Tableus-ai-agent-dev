import { ApiError } from "@tableus/api-client";
import { afterAll, afterEach, beforeAll, beforeEach, expect, jest, test } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { MutationFeedback } from "@/components/mutation-feedback";
import { Button } from "@/components/ui";
import { useRecoverableMutation } from "@/lib/recoverable-mutation";

let mockOnline = true;
jest.mock("@/providers/connectivity-provider", () => ({
  useConnectivity: () => ({ isOnline: mockOnline, override: "system" }),
}));

const clients: QueryClient[] = [];
const originalConsoleError = console.error;
let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

async function renderHarness(write: (value: string, key: string) => Promise<string>) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: 0, gcTime: 0 } } });
  clients.push(client);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<Harness write={write} />, { wrapper: Wrapper });
}

function Harness({ write }: { write: (value: string, key: string) => Promise<string> }) {
  const [draft, setDraft] = useState("original");
  const mutation = useRecoverableMutation({ mutationFn: write });
  return (
    <View>
      <TextInput
        accessibilityLabel="Draft"
        value={draft}
        onChangeText={(value) => {
          mutation.reset();
          setDraft(value);
        }}
      />
      <Button label="Save" onPress={() => mutation.submit(draft)} />
      <Text>{mutation.isSuccess ? "Saved" : "Not saved"}</Text>
      <MutationFeedback
        failure={mutation.failure}
        canRetry={mutation.canRetry}
        retryLabel="Retry save"
        onRetry={mutation.retry}
        onDismiss={mutation.reset}
      />
    </View>
  );
}

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation((message, ...args) => {
    if (String(message).includes("testing environment is not configured to support act")) return;
    originalConsoleError(message, ...args);
  });
});
afterAll(() => consoleErrorSpy.mockRestore());
beforeEach(() => { mockOnline = true; });
afterEach(() => {
  for (const client of clients.splice(0)) client.clear();
});

test("known offline preserves the draft, sends nothing, and never auto-dispatches", async () => {
  mockOnline = false;
  const write = jest.fn(async () => "ok");
  const result = await renderHarness(write);
  fireEvent.press(result.getByText("Save"));
  expect(await result.findByText(/not sent or queued/i)).not.toBeNull();
  expect(result.getByLabelText("Draft").props.value).toBe("original");
  expect(write).not.toHaveBeenCalled();

  mockOnline = true;
  await result.rerender(<Harness write={write} />);
  expect(write).not.toHaveBeenCalled();
  fireEvent.press(result.getByText("Retry save"));
  await waitFor(() => expect(write).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(result.getByText("Saved")).not.toBeNull());
});

test("ambiguous retry reuses one key and an edited payload starts a new key", async () => {
  const write = jest
    .fn<(value: string, key: string) => Promise<string>>()
    .mockRejectedValueOnce(new ApiError("network", 0, "network"))
    .mockResolvedValue("ok");
  const result = await renderHarness(write);
  fireEvent.press(result.getByText("Save"));
  expect(await result.findByText(/may have completed/i)).not.toBeNull();
  const firstKey = write.mock.calls[0][1];
  fireEvent.press(result.getByText("Retry save"));
  await waitFor(() => expect(write).toHaveBeenCalledTimes(2));
  expect(write.mock.calls[1]).toEqual(["original", firstKey]);
  await waitFor(() => expect(result.getByText("Saved")).not.toBeNull());

  fireEvent.changeText(result.getByLabelText("Draft"), "edited");
  await waitFor(() => expect(result.getByLabelText("Draft").props.value).toBe("edited"));
  fireEvent.press(result.getByText("Save"));
  await waitFor(() => expect(write).toHaveBeenCalledTimes(3));
  expect(write.mock.calls[2][0]).toBe("edited");
  expect(write.mock.calls[2][1]).not.toBe(firstKey);
});

test("terminal validation errors offer dismissal but no retry", async () => {
  const write = jest.fn(async () => { throw new ApiError("Invalid constraints", 422, "validation"); });
  const result = await renderHarness(write);
  fireEvent.press(result.getByText("Save"));
  expect(await result.findByText("Invalid constraints")).not.toBeNull();
  expect(result.queryByText("Retry save")).toBeNull();
  fireEvent.press(result.getByText("Dismiss message"));
  await waitFor(() => expect(result.queryByText("Invalid constraints")).toBeNull());
});
