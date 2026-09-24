import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { ApiError } from "@tableus/api-client";
import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";

import AuthScreen from "../../app/auth";
import { authTransactionKey } from "@/lib/auth-transaction";
import { AuthProvider, useAuth } from "@/providers/auth-provider";

type SessionResult = { data: { session: Session | null }; error: Error | null };
const mockGetSession = jest.fn<() => Promise<SessionResult>>();
const mockGetProfile = jest.fn<() => Promise<{ id: string; display_name: string; share_taste: boolean }>>();
const mockGetDeletion = jest.fn<() => Promise<{ status: "pending" | "completed"; needs_attention: boolean; requested_at: string; completed_at: string | null; next_retry_at: string | null; last_error_code: string | null }>>();
const mockGetItem = jest.fn<(key: string) => Promise<string | null>>();
const mockRemoveItem = jest.fn<(key: string) => Promise<void>>();
const mockSignOut = jest.fn<(options?: { scope: string }) => Promise<{ error: Error | null }>>();
let mockAuthListener: (event: AuthChangeEvent, session: Session | null) => void;

jest.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  secureAuthStorage: {
    getItem: (key: string) => mockGetItem(key),
    removeItem: (key: string) => mockRemoveItem(key),
  },
  supabase: { auth: {
    getSession: () => mockGetSession(),
    onAuthStateChange: (listener: typeof mockAuthListener) => {
      mockAuthListener = listener;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    },
    signOut: (options?: { scope: string }) => mockSignOut(options),
    startAutoRefresh: jest.fn(),
    stopAutoRefresh: jest.fn(),
  } },
}));
jest.mock("@/lib/api", () => ({ api: { get: (path: string) => path.endsWith("/deletion") ? mockGetDeletion() : mockGetProfile(), post: jest.fn() } }));
jest.mock("@/lib/telemetry", () => ({ captureTelemetry: jest.fn() }));
jest.mock("expo-router", () => ({ useLocalSearchParams: () => ({ mode: "sign-in" }) }));

const session = { user: { id: "returning-profile" }, access_token: "local-test-token" } as Session;
const profile = { id: "returning-profile", display_name: "Returning user", share_taste: false };
const clients: QueryClient[] = [];

function Harness() {
  const auth = useAuth();
  return <><Text testID="phase">{auth.phase}</Text><Text testID="auth-error">{auth.error}</Text><Text testID="profile">{auth.profile?.id ?? "none"}</Text><Text testID="deletion-status">{auth.deletionStatus?.status ?? "none"}</Text><Pressable onPress={() => void auth.refreshDeletionStatus()}><Text>Refresh deletion</Text></Pressable><Pressable onPress={() => void auth.signOut()}><Text>Device sign out</Text></Pressable><AuthScreen /></>;
}

async function renderAuth() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  return render(<QueryClientProvider client={client}><AuthProvider><Harness /></AuthProvider></QueryClientProvider>);
}

beforeEach(() => {
  jest.useFakeTimers();
  mockGetSession.mockReset().mockResolvedValue({ data: { session }, error: null });
  mockGetProfile.mockReset().mockResolvedValue(profile);
  mockGetDeletion.mockReset().mockRejectedValue(new ApiError("No request", 404));
  mockGetItem.mockReset().mockResolvedValue(null);
  mockRemoveItem.mockReset().mockResolvedValue(undefined);
  mockSignOut.mockReset().mockResolvedValue({ error: null });
});

test("cold restore opens deletion recovery without restoring private profile", async () => {
  mockGetProfile.mockRejectedValueOnce(new ApiError("Approved profile missing", 403));
  mockGetDeletion.mockResolvedValueOnce({ status: "pending", needs_attention: true, requested_at: "2026-09-24T00:00:00Z", completed_at: null, next_retry_at: null, last_error_code: "rejected" });
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("deletion");
  expect(screen.getByTestId("deletion-status").props.children).toBe("pending");
  expect(screen.getByTestId("profile").props.children).toBe("none");
  expect(mockSignOut).not.toHaveBeenCalled();
});

test("an ordinary unapproved session remains unapproved when deletion status is 403", async () => {
  mockGetProfile.mockRejectedValueOnce(new ApiError("Approved profile missing", 403));
  mockGetDeletion.mockRejectedValueOnce(new ApiError("Invite required", 403));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("signed_out");
  expect(screen.getByTestId("deletion-status").props.children).toBe("none");
});

test("deletion status network uncertainty preserves session and gives recovery guidance", async () => {
  mockGetProfile.mockRejectedValueOnce(new ApiError("Approved profile missing", 403));
  mockGetDeletion.mockRejectedValueOnce(new ApiError("Network unavailable", 0));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("restore_failed");
  expect(screen.getByTestId("auth-error").props.children).toMatch(/Could not confirm account status/);
  expect(mockSignOut).not.toHaveBeenCalled();
});

test("a different signed-in subject exits deletion recovery and restores its own profile", async () => {
  mockGetProfile.mockRejectedValueOnce(new ApiError("Approved profile missing", 403));
  mockGetDeletion.mockResolvedValueOnce({ status: "completed", needs_attention: false, requested_at: "2026-09-24T00:00:00Z", completed_at: "2026-09-24T00:01:00Z", next_retry_at: null, last_error_code: null });
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("deletion");
  const other = { user: { id: "another-profile" }, access_token: "another-token" } as Session;
  mockGetSession.mockResolvedValue({ data: { session: other }, error: null });
  mockGetProfile.mockResolvedValue({ id: "another-profile", display_name: "Another", share_taste: false });
  await act(async () => { mockAuthListener("SIGNED_OUT", null); mockAuthListener("SIGNED_IN", other); jest.advanceTimersByTime(0); });
  expect(screen.getByTestId("phase").props.children).toBe("approved");
  expect(screen.getByTestId("profile").props.children).toBe("another-profile");
  expect(screen.getByTestId("deletion-status").props.children).toBe("none");
});

test("a late profile read cannot reopen private routes after deletion session expires", async () => {
  mockGetProfile.mockRejectedValueOnce(new ApiError("Approved profile missing", 403));
  mockGetDeletion.mockResolvedValueOnce({ status: "pending", needs_attention: false, requested_at: "2026-09-24T00:00:00Z", completed_at: null, next_retry_at: null, last_error_code: null });
  const screen = await renderAuth();
  mockGetDeletion.mockRejectedValueOnce(new ApiError("No request", 404));
  let resolveLate!: (value: typeof profile) => void;
  mockGetProfile.mockImplementationOnce(() => new Promise((resolve) => { resolveLate = resolve; }));
  await act(async () => { fireEvent.press(screen.getByText("Refresh deletion")); });
  await act(async () => { mockAuthListener("SIGNED_OUT", null); resolveLate(profile); });
  expect(screen.getByTestId("phase").props.children).toBe("deletion");
  expect(screen.getByTestId("profile").props.children).toBe("none");
});

test("failed local sign-out preserves a known pending deletion outcome", async () => {
  mockGetProfile.mockRejectedValueOnce(new ApiError("Approved profile missing", 403));
  mockGetDeletion.mockResolvedValueOnce({ status: "pending", needs_attention: false, requested_at: "2026-09-24T00:00:00Z", completed_at: null, next_retry_at: null, last_error_code: null });
  mockSignOut.mockResolvedValueOnce({ error: new Error("provider failed") });
  const screen = await renderAuth();
  await act(async () => { fireEvent.press(screen.getByText("Device sign out")); });
  expect(screen.getByTestId("phase").props.children).toBe("deletion");
  expect(screen.getByTestId("deletion-status").props.children).toBe("pending");
  expect(screen.getByTestId("auth-error").props.children).toBe("Could not sign out on this device. Reconnect and try again.");
});

afterEach(async () => {
  await cleanup();
  for (const client of clients.splice(0)) client.clear();
  jest.useRealTimers();
});

test("a hung session read offers retry and late results cannot approve a profile", async () => {
  let resolveSession!: (result: SessionResult) => void;
  mockGetSession.mockImplementationOnce(() => new Promise((resolve) => { resolveSession = resolve; }));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("loading");
  expect(screen.queryByText("Email me a code")).toBeNull();
  await act(async () => { jest.advanceTimersByTime(15_000); });
  expect(screen.getByTestId("phase").props.children).toBe("restore_failed");
  expect(screen.getByText("Retry session restoration")).toBeTruthy();
  expect(mockSignOut).not.toHaveBeenCalled();
  expect(mockRemoveItem).not.toHaveBeenCalled();

  await act(async () => { resolveSession({ data: { session }, error: null }); });
  expect(mockGetProfile).not.toHaveBeenCalled();
  expect(screen.getByTestId("phase").props.children).toBe("restore_failed");

  await act(async () => { fireEvent.press(screen.getByText("Retry session restoration")); });
  expect(screen.getByTestId("phase").props.children).toBe("approved");
  expect(screen.getByTestId("profile").props.children).toBe(profile.id);
  expect(mockGetSession).toHaveBeenCalledTimes(2);
});

test("rejected session reads preserve a pending invite for an explicit retry", async () => {
  const pending = JSON.stringify({ version: 1, mode: "join", email: "local@example.test", displayName: "Local", redemptionToken: "local-test-redemption", expiresAt: Date.now() + 60_000 });
  mockGetItem.mockResolvedValue(pending);
  mockGetSession.mockRejectedValueOnce(new Error("private SDK detail"))
    .mockResolvedValue({ data: { session: null }, error: null });
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("restore_failed");
  expect(screen.queryByText(/private SDK detail/)).toBeNull();
  expect(mockRemoveItem).not.toHaveBeenCalled();
  expect(mockSignOut).not.toHaveBeenCalled();
  await act(async () => { fireEvent.press(screen.getByText("Retry session restoration")); });
  expect(screen.getByTestId("phase").props.children).toBe("pending_verification");
  expect(screen.getByLabelText("Email verification code")).toBeTruthy();
  expect(mockGetItem).toHaveBeenCalledWith(authTransactionKey);
});

test("a storage stall or SDK error result is recoverable without clearing credentials", async () => {
  mockGetItem.mockImplementationOnce(() => new Promise(() => {}));
  mockGetSession.mockResolvedValue({ data: { session: null }, error: new Error("private SDK detail") });
  const screen = await renderAuth();
  await act(async () => { jest.advanceTimersByTime(15_000); });
  expect(screen.getByTestId("phase").props.children).toBe("restore_failed");
  await act(async () => { fireEvent.press(screen.getByText("Retry session restoration")); });
  expect(screen.getByTestId("phase").props.children).toBe("restore_failed");
  expect(mockSignOut).not.toHaveBeenCalled();
  expect(mockRemoveItem).not.toHaveBeenCalled();
});

test("sign-out supersedes a pending profile restoration", async () => {
  let resolveProfile!: (result: typeof profile) => void;
  mockGetProfile.mockImplementationOnce(() => new Promise((resolve) => { resolveProfile = resolve; }));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("redeem_pending");
  await act(async () => { mockAuthListener("SIGNED_OUT", null); });
  await act(async () => { resolveProfile(profile); });
  expect(screen.getByTestId("phase").props.children).toBe("signed_out");
  expect(screen.getByTestId("profile").props.children).toBe("none");
});


test("device sign-out uses local scope, clears local private state and leaves other sessions alone", async () => {
  const sessions = new Set(["this-device", "other-device"]);
  mockSignOut.mockImplementation(async (options) => {
    if (options?.scope === "local") sessions.delete("this-device");
    else sessions.clear();
    return { error: null };
  });
  const screen = await renderAuth();
  const client = clients[clients.length - 1];
  client.setQueryData(["private-plan"], { title: "Cached dinner" });
  await act(async () => { fireEvent.press(screen.getByText("Device sign out")); });
  expect(mockSignOut).toHaveBeenCalledWith({ scope: "local" });
  expect([...sessions]).toEqual(["other-device"]);
  expect(mockRemoveItem).toHaveBeenCalledWith(authTransactionKey);
  expect(client.getQueryData(["private-plan"])).toBeUndefined();
  expect(screen.getByTestId("phase").props.children).toBe("signed_out");
  expect(screen.getByTestId("profile").props.children).toBe("none");
});


test("a rejected local sign-out keeps the session and cache available for retry", async () => {
  mockSignOut.mockResolvedValueOnce({ error: new Error("private provider failure") });
  const screen = await renderAuth();
  const client = clients[clients.length - 1];
  client.setQueryData(["private-plan"], { title: "Cached dinner" });
  await act(async () => { fireEvent.press(screen.getByText("Device sign out")); });
  expect(screen.getByTestId("phase").props.children).toBe("approved");
  expect(client.getQueryData(["private-plan"])).toEqual({ title: "Cached dinner" });
  expect(screen.getByTestId("auth-error").props.children).toBe("Could not sign out on this device. Reconnect and try again.");
  expect(screen.queryByText(/private provider failure/)).toBeNull();
  await act(async () => { fireEvent.press(screen.getByText("Device sign out")); });
  expect(mockSignOut).toHaveBeenCalledTimes(2);
  expect(screen.getByTestId("phase").props.children).toBe("signed_out");
  expect(client.getQueryData(["private-plan"])).toBeUndefined();
});
