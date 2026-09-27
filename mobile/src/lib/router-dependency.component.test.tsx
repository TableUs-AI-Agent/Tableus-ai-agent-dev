import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { ApiError } from "@tableus/api-client";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { LocalRouteParamsContext } from "expo-router/build/Route";
import { extractExpoPathFromURL } from "expo-router/build/fork/extractPathFromURL";
import { getStateFromPath as getNativeStateFromPath } from "expo-router/build/fork/getStateFromPath";
import { NavigationRouteContext } from "expo-router/build/react-navigation/core/NavigationProvider";
import { getStateFromPath } from "expo-router/build/react-navigation/core/getStateFromPath";

import { redirectSystemPath } from "../../app/+native-intent";
import JoinPlanScreen from "../../app/join/[id]";
import { pendingJoinStore } from "@/lib/pending-join";

const mockPost = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockGet = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockUseAuth = jest.fn<() => { approved: boolean; subject: string | null }>();

jest.mock("expo-router", () => ({
  ...jest.requireActual<typeof import("expo-router/build/hooks/useLocalSearchParams")>("expo-router/build/hooks/useLocalSearchParams"),
  ...jest.requireActual<typeof import("expo-router/build/react-navigation/core/useRoute")>("expo-router/build/react-navigation/core/useRoute"),
  router: { replace: (...args: unknown[]) => mockReplace(...args), push: (...args: unknown[]) => mockPush(...args) },
}));
jest.mock("@/lib/api", () => ({ api: {
  post: (...args: unknown[]) => mockPost(...args),
  get: (...args: unknown[]) => mockGet(...args),
} }));
jest.mock("@/lib/supabase", () => ({ isSupabaseConfigured: true }));
jest.mock("@/providers/auth-provider", () => ({ useAuth: () => mockUseAuth() }));

const planId = "123e4567-e89b-42d3-a456-426614174000";
const token = "Abc_def-0123456789GhijkLMN_opQRSTuvWxyZ";

beforeEach(() => {
  mockUseAuth.mockReturnValue({ approved: true, subject: "actor-a" });
  pendingJoinStore.clear();
  pendingJoinStore.setSubject("actor-a");
  mockPost.mockReset().mockRejectedValue(new ApiError("Synthetic failure", 503));
  mockGet.mockReset().mockRejectedValue(new ApiError("Not a participant", 403));
  mockReplace.mockClear();
  mockPush.mockClear();
});
afterEach(async () => { await cleanup(); pendingJoinStore.clear(); pendingJoinStore.setSubject(null); });

function nativeRoute(url: string) {
  const sanitized = redirectSystemPath({ path: url, initial: true });
  const path = extractExpoPathFromURL([], sanitized);
  const state = getNativeStateFromPath(path, { screens: { "join/[id]": "join/:id", auth: "auth" } });
  const route = state?.routes[0];
  if (!route) throw new Error("Native link did not route");
  return { route: { ...route, key: "private-link-fixture" }, sanitized };
}

async function mount(url: string) {
  const { route, sanitized } = nativeRoute(url);
  const tree = (
    <NavigationRouteContext.Provider value={route}>
      <LocalRouteParamsContext.Provider value={route.params ?? {}}>
        <JoinPlanScreen />
      </LocalRouteParamsContext.Provider>
    </NavigationRouteContext.Provider>
  );
  const screen = await render(tree);
  return { screen, route, sanitized, tree };
}

test.each(["?", "#"])("%s link routes only an opaque handle and joins on explicit press", async (delimiter) => {
  mockPost.mockResolvedValueOnce({ id: planId });
  const { screen, route, sanitized } = await mount(`https://links.table-us.com/join/${planId}${delimiter}token=${token}`);
  expect(sanitized).toMatch(new RegExp(`^/join/${planId}\\?pending=`));
  expect(sanitized).not.toContain(token);
  expect(route.params).not.toHaveProperty("token");
  expect(mockPost).not.toHaveBeenCalled();
  await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Join this plan" })); });
  expect(mockPost).toHaveBeenCalledWith(`/api/v1/plans/${planId}/join`, { share_token: token }, expect.objectContaining({ expectedSubject: "actor-a" }));
  expect(mockReplace).toHaveBeenCalledWith({ pathname: "/plans/[id]", params: { id: planId } });
  expect(pendingJoinStore.getSnapshot()).toBeNull();
});

const decoderCases = [
  { label: "encoded delimiters", encoded: "a%2Bb%2Fc%3D%26token%3Dvalue%23fragment", expected: "a+b/c=&token=value#fragment" },
  { label: "plus and space", encoded: "plus+space%20and%2Bliteral%2Bplus_token", expected: "plus space and+literal+plus_token" },
  { label: "literal escaped percent", encoded: "literal%252F%252B%2526%25FF%2520_padding", expected: "literal%2F%2B%26%FF%20_padding" },
  { label: "Unicode", encoded: "%E6%9D%B1%E4%BA%AC%20%2F%20caf%C3%A9_abcdefghijklmnop", expected: "東京 / café_abcdefghijklmnop" },
];
test.each(["https://links.table-us.com/join", "tableus://join"].flatMap((origin) =>
  ["?", "#"].flatMap((delimiter) => decoderCases.map((value) => ({ ...value, origin, delimiter }))),
))("$origin $delimiter preserves $label through native route and Join JSON", async ({ origin, delimiter, encoded, expected }) => {
  const { screen, sanitized, route } = await mount(`${origin}/${planId}${delimiter}token=${encoded}`);
  expect(sanitized).not.toContain("token=");
  expect(route.params).not.toHaveProperty("token");
  await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Join this plan" })); });
  expect(mockPost).toHaveBeenCalledWith(`/api/v1/plans/${planId}/join`, { share_token: expected }, expect.objectContaining({ expectedSubject: "actor-a" }));
});

test.each(["https://links.table-us.com/join", "tableus://join"].flatMap((origin) => [
  { origin, label: "duplicate query", suffix: `?token=${token}&token=${token}` },
  { origin, label: "conflicting query and fragment", suffix: `?token=${token}#token=${token}` },
  { origin, label: "malformed UTF-8", suffix: "#token=%FF%41" },
  { origin, label: "trailing escape", suffix: "?token=trailing%" },
  { origin, label: "short secret", suffix: "#token=short" },
]))("$origin rejects $label before a Join write", async ({ origin, suffix }) => {
  const { screen, sanitized } = await mount(`${origin}/${planId}${suffix}`);
  expect(sanitized).toBe("/join/invalid");
  expect(screen.queryByRole("button", { name: "Join this plan" })).toBeNull();
  expect(mockPost).not.toHaveBeenCalled();
});

test("lost join response checks provider-free membership before navigating", async () => {
  const { screen, sanitized } = await mount(`tableus://join/${planId}?token=${token}`);
  expect(sanitized).toMatch(/pending=/);
  expect(pendingJoinStore.getSnapshot()?.subject).toBe("actor-a");
  expect(mockUseAuth()).toEqual({ approved: true, subject: "actor-a" });
  expect(screen.queryByRole("button", { name: "Join this plan" })).toBeTruthy();
  await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Join this plan" })); });
  expect(screen.getByRole("button", { name: "Check membership" })).toBeTruthy();
  mockGet.mockResolvedValueOnce({ updated_at: "synthetic" });
  await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Check membership" })); });
  expect(mockGet).toHaveBeenCalledWith(`/api/v1/plans/${planId}/revision`, { expectedSubject: "actor-a" });
  expect(mockPost).toHaveBeenCalledTimes(1);
  expect(mockReplace).toHaveBeenCalledWith({ pathname: "/plans/[id]", params: { id: planId } });
});

test("nonmembership requires approval check and an explicit retry", async () => {
  const { screen } = await mount(`tableus://join/${planId}?token=${token}`);
  await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Join this plan" })); });
  mockGet.mockRejectedValueOnce(new ApiError("Not a participant", 403)).mockResolvedValueOnce({ id: "actor-a" });
  await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Check membership" })); });
  expect(mockGet).toHaveBeenNthCalledWith(2, "/api/v1/me", { expectedSubject: "actor-a" });
  expect(mockPost).toHaveBeenCalledTimes(1);
  mockPost.mockResolvedValueOnce({ id: planId });
  await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Retry joining plan" })); });
  expect(mockPost).toHaveBeenCalledTimes(2);
  expect(mockPost.mock.calls[1]?.[2]).toEqual(mockPost.mock.calls[0]?.[2]);
});

test("subject switch clears the link and ignores a late join success", async () => {
  let complete!: (value: unknown) => void;
  mockPost.mockImplementationOnce(() => new Promise((resolve) => { complete = resolve; }));
  const { screen } = await mount(`tableus://join/${planId}#token=${token}`);
  await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Join this plan" })); });
  await act(async () => { mockUseAuth.mockReturnValue({ approved: true, subject: "actor-b" }); pendingJoinStore.setSubject("actor-b"); complete({ id: planId }); });
  expect(pendingJoinStore.getSnapshot()).toBeNull();
  expect(mockReplace).not.toHaveBeenCalled();
});

test("remount after an uncertain response requires membership reconciliation", async () => {
  const first = await mount(`tableus://join/${planId}#token=${token}`);
  await act(async () => { fireEvent.press(first.screen.getByRole("button", { name: "Join this plan" })); });
  expect(first.screen.getByRole("button", { name: "Check membership" })).toBeTruthy();
  await first.screen.unmount();
  const second = await mount(first.sanitized);
  expect(second.screen.getByRole("button", { name: "Check membership" })).toBeTruthy();
  expect(second.screen.queryByRole("button", { name: "Join this plan" })).toBeNull();
  expect(mockPost).toHaveBeenCalledTimes(1);
});

test("a new private link replaces a failed flow and presents a fresh Join action", async () => {
  const first = await mount(`tableus://join/${planId}#token=${token}`);
  await act(async () => { fireEvent.press(first.screen.getByRole("button", { name: "Join this plan" })); });
  const replacementToken = "Replacement_0123456789GhijkLMN_opQRSTuvWxyZ";
  let replacement!: ReturnType<typeof nativeRoute>;
  await act(async () => { replacement = nativeRoute(`tableus://join/${planId}#token=${replacementToken}`); });
  await first.screen.rerender(
    <NavigationRouteContext.Provider value={replacement.route}>
      <LocalRouteParamsContext.Provider value={replacement.route.params ?? {}}>
        <JoinPlanScreen />
      </LocalRouteParamsContext.Provider>
    </NavigationRouteContext.Provider>,
  );
  expect(first.screen.getByRole("button", { name: "Join this plan" })).toBeTruthy();
  expect(first.screen.queryByRole("button", { name: "Check membership" })).toBeNull();
});

test("the real router decoder retains encoded plus and malformed bytes without leaking a capability route", () => {
  const valid = getStateFromPath("/join?token=a%2Bb%2Fc%3D", { screens: { join: "join" } });
  expect(valid?.routes[0].params).toEqual({ token: "a+b/c=" });
  const malformed = getStateFromPath("/join?token=%FF%41", { screens: { join: "join" } });
  expect(malformed?.routes[0].params).toEqual({ token: "%FFA" });
});

test("signed-out link waits for approval and retains only the handle in native navigation", async () => {
  mockUseAuth.mockReturnValue({ approved: false, subject: null });
  pendingJoinStore.setSubject(null);
  const { screen, sanitized } = await mount(`tableus://join/${planId}#token=${token}`);
  expect(sanitized).not.toContain(token);
  expect(mockPost).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "Sign in to join" }));
  expect(mockPush).toHaveBeenCalledWith({ pathname: "/auth", params: { mode: "sign-in" } });
  expect(pendingJoinStore.getSnapshot()?.subject).toBeNull();
});
