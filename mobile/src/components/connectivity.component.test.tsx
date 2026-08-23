import { afterEach, expect, jest, test } from "@jest/globals";
import { onlineManager, QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { ConnectivityBanner } from "@/components/connectivity-banner";

jest.mock("@/providers/connectivity-provider", () => ({
  useConnectivity: () => ({ isOnline: false, override: "offline" }),
}));

afterEach(() => onlineManager.setOnline(true));

test("offline banner is globally accessible and explicitly says writes are not queued", async () => {
  const result = await render(<ConnectivityBanner />);
  const alert = result.getByRole("alert");
  expect(alert.props.accessibilityLiveRegion).toBe("assertive");
  expect(result.getByTestId("connectivity-banner-safe-area").props.edges).toEqual({
    top: "additive",
    right: "off",
    bottom: "off",
    left: "off",
  });
  expect(result.getByLabelText("Offline. Changes are not sent or queued.")).toBe(alert);
  expect(result.getByText("Offline. Changes are not sent or queued.")).not.toBeNull();
});

test("session-memory cached reads remain renderable while offline", async () => {
  const query = jest.fn(async () => "Network plan");
  const client = new QueryClient({ defaultOptions: { queries: { retry: 0, networkMode: "online" } } });
  client.setQueryData(["cached-plan"], "Cached dinner plan");
  onlineManager.setOnline(false);
  function CachedRead() {
    const result = useQuery({ queryKey: ["cached-plan"], queryFn: query, enabled: false });
    return <Text>{result.data}</Text>;
  }
  const result = await render(
    <QueryClientProvider client={client}><CachedRead /></QueryClientProvider>,
  );
  expect(result.getByText("Cached dinner plan")).not.toBeNull();
  expect(query).not.toHaveBeenCalled();
  await result.unmount();
  client.clear();
});
