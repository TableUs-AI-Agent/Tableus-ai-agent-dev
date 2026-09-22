// Keep the legacy decoder checks separate from the native entry pipeline below.
import { afterEach, expect, jest, test } from "@jest/globals";
import { ApiError } from "@tableus/api-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { LocalRouteParamsContext } from "expo-router/build/Route";
import { extractExpoPathFromURL } from "expo-router/build/fork/extractPathFromURL";
import { getStateFromPath as getNativeStateFromPath } from "expo-router/build/fork/getStateFromPath";
import { NavigationRouteContext } from "expo-router/build/react-navigation/core/NavigationProvider";
import { getStateFromPath } from "expo-router/build/react-navigation/core/getStateFromPath";

import { redirectSystemPath } from "../../app/+native-intent";
import JoinPlanScreen from "../../app/join/[id]";

const mockPost = jest.fn<(path: string, body: unknown) => Promise<never>>(async () => {
  throw new ApiError("Synthetic validation response", 422, "validation_error");
});
// Keep the real parameter hooks; the Expo barrel also starts an unrelated HMR runtime.
jest.mock("expo-router", () => ({
  ...jest.requireActual<typeof import("expo-router/build/hooks/useLocalSearchParams")>("expo-router/build/hooks/useLocalSearchParams"),
  ...jest.requireActual<typeof import("expo-router/build/react-navigation/core/useRoute")>("expo-router/build/react-navigation/core/useRoute"),
  router: { replace: jest.fn(), push: jest.fn() },
}));
jest.mock("@/lib/api", () => ({ api: { post: (path: string, body: unknown) => mockPost(path, body) } }));
jest.mock("@/providers/auth-provider", () => ({ useAuth: () => ({ approved: true }) }));
jest.mock("@/providers/connectivity-provider", () => ({ useConnectivity: () => ({ isOnline: true }) }));

const planId = "123e4567-e89b-42d3-a456-426614174000";
const clients: QueryClient[] = [];
afterEach(async () => {
  await cleanup();
  for (const client of clients.splice(0)) client.clear();
});

function nativeRoute(url: string, initial = true) {
  const path = extractExpoPathFromURL([], redirectSystemPath({ path: url, initial }));
  const state = getNativeStateFromPath(path, { screens: { "join/[id]": "join/:id", auth: "auth" } });
  const route = state?.routes[0];
  if (!route) throw new Error("Native URL did not produce a route");
  return { ...route, key: "native-link-fixture" };
}

async function renderJoin(url: string, initial = true) {
  const route = nativeRoute(url, initial);
  return renderJoinRoute(route);
}

async function renderJoinRoute(route: ReturnType<typeof nativeRoute>) {
  expect(route.name).toBe("join/[id]");
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: 0 } } });
  clients.push(client);
  return render(
    <NavigationRouteContext.Provider value={route}>
      <LocalRouteParamsContext.Provider value={route.params ?? {}}>
        <QueryClientProvider client={client}><JoinPlanScreen /></QueryClientProvider>
      </LocalRouteParamsContext.Provider>
    </NavigationRouteContext.Provider>,
  );
}

async function submitJoin(screen: Awaited<ReturnType<typeof renderJoin>>) {
  await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Join this plan" })); });
  await screen.findByText("Synthetic validation response");
  expect(mockPost).toHaveBeenCalledTimes(1);
}

test("cold native custom-scheme join preserves the observed encoded plus at the API boundary", async () => {
  const screen = await renderJoin(`tableus://join/${planId}?token=a%2Bb%2Fc%3D`);
  await submitJoin(screen);
  expect(mockPost).toHaveBeenCalledWith(`/api/v1/plans/${planId}/join`, { share_token: "a+b/c=" });
});

test("the join hook must not decode literal percent escapes a second time", async () => {
  const url = `https://links.table-us.com/join/${planId}?token=literal%252Ftoken`;
  expect(nativeRoute(url).params).toEqual({ id: planId, token: "literal%2Ftoken" });
  const screen = await renderJoin(url);
  await submitJoin(screen);
  expect(mockPost).toHaveBeenCalledWith(`/api/v1/plans/${planId}/join`, { share_token: "literal%2Ftoken" });
});

test.each(["tableus:///join", "tableus:/join", "/join"])("%s also preserves encoded tokens", async (origin) => {
  const screen = await renderJoin(`${origin}/${planId}?token=a%2Bb%252Fc`);
  await submitJoin(screen);
  expect(mockPost).toHaveBeenCalledWith(`/api/v1/plans/${planId}/join`, { share_token: "a+b%2Fc" });
});

const origins = ["tableus://join", "https://links.table-us.com/join"];
const validTokens = [
  ["issued URL-safe alphabet", "Abc_def-0123456789GhijkLMN_opQRSTuvWxyZ", "Abc_def-0123456789GhijkLMN_opQRSTuvWxyZ"],
  ["encoded delimiters", "a%2Bb%2Fc%3D%26token%3Dvalue%23fragment", "a+b/c=&token=value#fragment"],
  ["Unicode", "%E6%9D%B1%E4%BA%AC%20%2F%20caf%C3%A9", "東京 / café"],
  ["plus versus space", "a+b%20c%2Bd", "a b c+d"],
  ["literal escaped bytes", "literal%252F%252B%2526%25FF%2520", "literal%2F%2B%26%FF%20"],
  ["literal percent", "100%25", "100%"],
];
test.each(origins.flatMap((origin) => validTokens.map(([label, query, expected]) => ({ origin, label, query, expected }))))(
  "warm $origin preserves $label through the real join hook and API boundary",
  async ({ origin, query, expected }) => {
    const screen = await renderJoin(`${origin}/${planId}?token=${query}`, false);
    expect(mockPost).not.toHaveBeenCalled();
    await submitJoin(screen);
    expect(mockPost).toHaveBeenCalledWith(`/api/v1/plans/${planId}/join`, { share_token: expected });
  },
);

const invalidLinks = [
  ["missing token", `${planId}`],
  ["empty token", `${planId}?token=`],
  ["bare token", `${planId}?token`],
  ["duplicate token", `${planId}?token=first&token=second`],
  ["encoded duplicate key", `${planId}?token=first&%74oken=second`],
  ["invalid UTF-8", `${planId}?token=%FF%41`],
  ["incomplete UTF-8", `${planId}?token=%E2%82`],
  ["encoded surrogate", `${planId}?token=%ED%A0%80`],
  ["trailing percent", `${planId}?token=trailing%`],
  ["invalid escape", `${planId}?token=%GG`],
  ["literal surrogate", `${planId}?token=\uD800`],
  ["invalid UUID", "not-a-uuid?token=synthetic"],
  ["encoded separator", `${planId}%2Fextra?token=synthetic`],
  ["extra path segment", `${planId}/extra?token=synthetic`],
];
test.each(origins.flatMap((origin) => invalidLinks.map(([label, suffix]) => ({ origin, label, suffix }))))(
  "$origin rejects $label before any join write",
  async ({ origin, suffix }) => {
    const screen = await renderJoin(`${origin}/${suffix}`);
    expect(screen.getByText("This private link is invalid, expired, or has been rotated.")).toBeTruthy();
    const button = screen.getByRole("button", { name: "Join this plan" });
    expect(button).toBeDisabled();
    await act(async () => { fireEvent.press(button); });
    expect(mockPost).not.toHaveBeenCalled();
  },
);

test("duplicate params also fail closed on direct route navigation without native intent", async () => {
  const screen = await renderJoinRoute({
    key: "direct-route-fixture", name: "join/[id]", params: { id: planId, token: ["first", "second"] },
  });
  expect(screen.getByRole("button", { name: "Join this plan" })).toBeDisabled();
  expect(mockPost).not.toHaveBeenCalled();
});

test("router decodes auth/share query values with the patched upstream decoder", () => {
  const state = getStateFromPath("/join?token=a%2Bb%2Fc%3D&name=Jos%C3%A9", {
    screens: { join: "join" },
  });
  expect(state?.routes[0].params).toEqual({ token: "a+b/c=", name: "José" });
});

test("router preserves malformed bytes while decoding valid sequences", () => {
  const state = getStateFromPath("/join?token=%FF%41%FF%41", { screens: { join: "join" } });
  expect(state?.routes[0].params).toEqual({ token: "%FFA%FFA" });
});
