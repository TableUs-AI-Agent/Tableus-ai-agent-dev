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
type VerifiedUser = { id: string; email: string; email_confirmed_at: string };
const mockGetUser = jest.fn<() => Promise<{ data: { user: VerifiedUser | null }; error: Error | null }>>();
const mockSetItem = jest.fn<(key: string, value: string) => Promise<void>>();
const mockValidate = jest.fn<(input: { code: string; email: string }, options: { expectedSubject: string }) => Promise<{ redemption_token: string }>>();
const mockVerifyOtp = jest.fn<() => Promise<SessionResult>>();
const mockSendCode = jest.fn<() => Promise<{ error: Error | null }>>();
const mockRedeem = jest.fn<() => Promise<{ id: string; display_name: string; share_taste: boolean }>>();
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
    setItem: (key: string, value: string) => mockSetItem(key, value),
    getItem: (key: string) => mockGetItem(key),
    removeItem: (key: string) => mockRemoveItem(key),
  },
  supabase: { auth: {
    getUser: () => mockGetUser(),
    verifyOtp: () => mockVerifyOtp(),
    signInWithOtp: () => mockSendCode(),
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
jest.mock("@/lib/api", () => ({ api: { get: (path: string) => path.endsWith("/deletion") ? mockGetDeletion() : mockGetProfile(), post: (path: string, input: { code: string; email: string }, options: { expectedSubject: string }) => path.endsWith("/validate") ? mockValidate(input, options) : mockRedeem() } }));
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
  mockGetUser.mockReset().mockResolvedValue({ data: { user: { id: session.user.id, email: "local@example.test", email_confirmed_at: "2026-10-08T00:00:00Z" } }, error: null });
  mockSetItem.mockReset().mockResolvedValue(undefined);
  mockValidate.mockReset().mockResolvedValue({ redemption_token: "fresh-local-grant" });
  mockVerifyOtp.mockReset().mockResolvedValue({ data: { session }, error: null });
  mockSendCode.mockReset().mockResolvedValue({ error: null });
  mockRedeem.mockReset().mockResolvedValue(profile);
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

test("an ordinary unapproved returning sign-in remains unapproved when deletion status is 403", async () => {
  mockGetItem.mockResolvedValue(JSON.stringify({ version: 1, mode: "sign-in", email: "local@example.test", expiresAt: Date.now() + 60_000 }));
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

function storedJoin() {
  return JSON.stringify({ version: 1, mode: "join", email: "local@example.test", displayName: "Local", redemptionToken: "expired-local-grant", expiresAt: Date.now() + 60_000 });
}

test("cold restored verified signup reconciles a committed profile after its grant expires", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockRedeem.mockRejectedValueOnce(new ApiError("Expired", 400));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("approved");
  expect(mockSignOut).not.toHaveBeenCalled();
});

test("cold restored verified signup keeps its session and requests an invite after grant expiry", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockRedeem.mockRejectedValueOnce(new ApiError("Expired", 400));
  mockGetProfile.mockRejectedValue(new ApiError("Missing membership", 403));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("invite_required");
  expect(screen.getByLabelText("Invite code")).toBeTruthy();
  expect(screen.queryByLabelText("Email verification code")).toBeNull();
  expect(mockSignOut).not.toHaveBeenCalled();
});

async function reenterInvite(screen: Awaited<ReturnType<typeof renderAuth>>, name = false) {
  await act(async () => {
    fireEvent.changeText(screen.getByLabelText("Invite code"), " local-invite ");
    if (name) fireEvent.changeText(screen.getByLabelText("Display name"), "Local");
  });
  await act(async () => { fireEvent.press(screen.getByText("Continue with invite")); });
}

test("verified email survives API outage and expired validation without another OTP", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  mockRedeem.mockRejectedValueOnce(new ApiError("API unavailable", 503))
    .mockRejectedValueOnce(new ApiError("Expired", 400))
    .mockResolvedValue(profile);
  mockGetProfile.mockRejectedValue(new ApiError("Not joined", 403));
  const screen = await renderAuth();
  await act(async () => {
    fireEvent.changeText(screen.getByLabelText("Email verification code"), "12345678");
  });
  await act(async () => { fireEvent.press(screen.getByText("Verify and continue")); });
  expect(screen.getByTestId("phase").props.children).toBe("redeem_pending");
  expect(screen.queryByLabelText("Email verification code")).toBeNull();
  expect(mockValidate).not.toHaveBeenCalled();
  await act(async () => { fireEvent.press(screen.getByText("Retry profile approval")); });
  expect(screen.getByTestId("phase").props.children).toBe("invite_required");
  // Re-entry performs another reconciliation, then the normal validation path.
  mockRedeem.mockRejectedValueOnce(new ApiError("Expired", 400)).mockResolvedValue(profile);
  await reenterInvite(screen);
  expect(screen.getByTestId("phase").props.children).toBe("approved");
  expect(mockValidate).toHaveBeenCalledWith({ code: "local-invite", email: "local@example.test" }, { expectedSubject: session.user.id });
  expect(mockVerifyOtp).toHaveBeenCalledTimes(1);
  expect(mockSendCode).not.toHaveBeenCalled();
  expect(mockSignOut).not.toHaveBeenCalled();
  const saved = mockSetItem.mock.calls.map(([, value]) => JSON.parse(value));
  expect(saved.every((value) => value.subject === session.user.id && !("invite" in value) && !("otp" in value))).toBe(true);
});

test("lost committed response followed by expiry uses membership and never revalidates an invite", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockRedeem.mockRejectedValueOnce(new ApiError("Response lost", 0))
    .mockRejectedValueOnce(new ApiError("Expired", 400));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("redeem_pending");
  await act(async () => { fireEvent.press(screen.getByText("Retry profile approval")); });
  expect(screen.getByTestId("phase").props.children).toBe("approved");
  expect(mockGetProfile).toHaveBeenCalledTimes(1);
  expect(mockValidate).not.toHaveBeenCalled();
  expect(mockVerifyOtp).not.toHaveBeenCalled();
  expect(mockSignOut).not.toHaveBeenCalled();
});

test("restoration after transaction TTL expiry recovers only through a verified session and re-entered invite", async () => {
  mockGetItem.mockResolvedValue(JSON.stringify({ ...JSON.parse(storedJoin()), expiresAt: Date.now() - 1 }));
  mockGetProfile.mockRejectedValue(new ApiError("Not joined", 403));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("invite_required");
  expect(mockRedeem).not.toHaveBeenCalled();
  expect(mockRemoveItem).toHaveBeenCalledWith(authTransactionKey);
  await reenterInvite(screen, true);
  expect(screen.getByTestId("phase").props.children).toBe("approved");
  expect(mockSendCode).not.toHaveBeenCalled();
  expect(mockVerifyOtp).not.toHaveBeenCalled();
  expect(mockValidate.mock.calls[0][0].email).toBe("local@example.test");
});

for (const changed of [
  { id: session.user.id, email: "other@example.test", email_confirmed_at: "confirmed" },
  { id: "another-profile", email: "local@example.test", email_confirmed_at: "confirmed" },
  { id: session.user.id, email: "local@example.test", email_confirmed_at: "" },
]) {
  test(`join rejects mismatched or unverified Auth identity ${JSON.stringify(changed)}`, async () => {
    mockGetItem.mockResolvedValue(storedJoin());
    mockGetUser.mockResolvedValue({ data: { user: changed }, error: null });
    const screen = await renderAuth();
    expect(screen.getByTestId("phase").props.children).toBe("redeem_pending");
    expect(screen.getByTestId("auth-error").props.children).toMatch(/does not match your verified email/);
    expect(mockRedeem).not.toHaveBeenCalled();
    expect(mockGetProfile).not.toHaveBeenCalled();
    expect(mockValidate).not.toHaveBeenCalled();
  });
}

test("stored subject binding refuses a switched account even with the same email", async () => {
  mockGetItem.mockResolvedValue(JSON.stringify({ ...JSON.parse(storedJoin()), subject: "original-profile" }));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("redeem_pending");
  expect(mockRedeem).not.toHaveBeenCalled();
  expect(mockGetProfile).not.toHaveBeenCalled();
});

test("Auth lookup outage retains signup and offers a sanitized explicit retry", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockGetUser.mockRejectedValueOnce(new Error("private Auth detail"));
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("redeem_pending");
  expect(screen.queryByText(/private Auth detail/)).toBeNull();
  expect(mockRedeem).not.toHaveBeenCalled();
  await act(async () => { fireEvent.press(screen.getByText("Retry profile approval")); });
  expect(screen.getByTestId("phase").props.children).toBe("approved");
});

test("pending deletion takes precedence over expired-invite recovery", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockRedeem.mockRejectedValue(new ApiError("Deletion requested", 409));
  mockGetProfile.mockRejectedValue(new ApiError("No profile", 403));
  mockGetDeletion.mockResolvedValue({ status: "pending", needs_attention: false, requested_at: "2026-10-08T00:00:00Z", completed_at: null, next_retry_at: null, last_error_code: null });
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("deletion");
  expect(screen.queryByText("Continue with invite")).toBeNull();
  expect(mockValidate).not.toHaveBeenCalled();
  expect(mockSignOut).not.toHaveBeenCalled();
});

for (const status of [404, 409, 429, 503, 0]) {
  test(`invite re-entry refusal or uncertainty ${status} keeps recovery explicit`, async () => {
    mockGetItem.mockResolvedValue(storedJoin());
    mockRedeem.mockRejectedValue(new ApiError("Expired", 400));
    mockGetProfile.mockRejectedValue(new ApiError("No profile", 403));
    mockValidate.mockRejectedValue(new ApiError("Invite unavailable", status));
    const screen = await renderAuth();
    await reenterInvite(screen);
    expect(screen.getByTestId("phase").props.children).toBe("invite_required");
    expect(mockValidate).toHaveBeenCalledTimes(1);
    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(mockSendCode).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });
}

test("a late validation error cannot overwrite a switched account", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockRedeem.mockRejectedValue(new ApiError("Expired", 400));
  mockGetProfile.mockRejectedValue(new ApiError("No profile", 403));
  let rejectLate!: (error: Error) => void;
  mockValidate.mockImplementationOnce(() => new Promise((_, reject) => { rejectLate = reject; }));
  const screen = await renderAuth();
  await reenterInvite(screen);
  const other = { user: { id: "another-profile" }, access_token: "other-local-token" } as Session;
  mockGetSession.mockResolvedValue({ data: { session: other }, error: null });
  mockGetItem.mockResolvedValue(null);
  mockGetProfile.mockResolvedValue({ ...profile, id: other.user.id });
  await act(async () => {
    mockAuthListener("SIGNED_OUT", null);
    mockAuthListener("SIGNED_IN", other);
    jest.advanceTimersByTime(0);
  });
  await act(async () => { rejectLate(new ApiError("Old-account refusal", 404)); });
  expect(screen.getByTestId("phase").props.children).toBe("approved");
  expect(screen.getByTestId("profile").props.children).toBe(other.user.id);
  expect(screen.getByTestId("auth-error").props.children).toBe("");
});

test("explicit recovery start-over preserves the session when local sign-out fails", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockRedeem.mockRejectedValue(new ApiError("Expired", 400));
  mockGetProfile.mockRejectedValue(new ApiError("No profile", 403));
  const screen = await renderAuth();
  mockSignOut.mockResolvedValueOnce({ error: new Error("private refusal") });
  await act(async () => { fireEvent.press(screen.getByLabelText("Start authentication again")); });
  expect(screen.getByTestId("phase").props.children).toBe("invite_required");
  expect(screen.getByTestId("auth-error").props.children).toMatch(/Could not sign out on this device/);
  expect(mockSignOut).toHaveBeenCalledWith({ scope: "local" });
});

test("Auth removal during interrupted signup still opens durable deletion recovery", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("Auth identity removed") });
  mockGetDeletion.mockResolvedValue({ status: "completed", needs_attention: false, requested_at: "2026-10-08T00:00:00Z", completed_at: "2026-10-08T00:01:00Z", next_retry_at: null, last_error_code: null });
  const screen = await renderAuth();
  expect(screen.getByTestId("phase").props.children).toBe("deletion");
  expect(screen.getByTestId("deletion-status").props.children).toBe("completed");
  expect(mockRedeem).not.toHaveBeenCalled();
  expect(mockValidate).not.toHaveBeenCalled();
});

test("a hung Auth identity lookup offers retry without redeeming or replaying OTP", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockGetUser.mockImplementationOnce(() => new Promise(() => {}));
  const screen = await renderAuth();
  await act(async () => { jest.advanceTimersByTime(15_000); });
  expect(screen.getByTestId("phase").props.children).toBe("redeem_pending");
  expect(mockRedeem).not.toHaveBeenCalled();
  expect(mockSignOut).not.toHaveBeenCalled();
  expect(mockVerifyOtp).not.toHaveBeenCalled();
});

test("a late successful invite validation cannot redeem for a switched account", async () => {
  mockGetItem.mockResolvedValue(storedJoin());
  mockRedeem.mockRejectedValue(new ApiError("Expired", 400));
  mockGetProfile.mockRejectedValue(new ApiError("No profile", 403));
  let resolveLate!: (value: { redemption_token: string }) => void;
  mockValidate.mockImplementationOnce(() => new Promise((resolve) => { resolveLate = resolve; }));
  const screen = await renderAuth();
  await reenterInvite(screen);
  const oldRedeems = mockRedeem.mock.calls.length;
  const oldSaves = mockSetItem.mock.calls.length;
  const other = { user: { id: "another-profile" }, access_token: "other-local-token" } as Session;
  mockGetSession.mockResolvedValue({ data: { session: other }, error: null });
  mockGetItem.mockResolvedValue(null);
  mockGetProfile.mockResolvedValue({ ...profile, id: other.user.id });
  await act(async () => {
    mockAuthListener("SIGNED_OUT", null); mockAuthListener("SIGNED_IN", other); jest.advanceTimersByTime(0);
  });
  await act(async () => { resolveLate({ redemption_token: "old-subject-grant" }); });
  expect(screen.getByTestId("profile").props.children).toBe(other.user.id);
  expect(mockRedeem).toHaveBeenCalledTimes(oldRedeems);
  expect(mockSetItem).toHaveBeenCalledTimes(oldSaves);
});
