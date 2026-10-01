import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";

const owner = "38a5a097-2892-4f3a-9f5d-942e9825291b";
const other = "7b66cb96-03dc-4ecf-97f1-3049865c0f9b";
const tokenExpiry = Math.floor(Date.now() / 1000) + 3600;
const envelope = (data: unknown) => ({ data, meta: {} });
const failure = (status: number) => ({ status, json: { error: { code: `http_${status}`, message: "Account unavailable" }, request_id: "local-test" } });

function jwt(subject: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: subject, aud: "authenticated", exp: tokenExpiry })).toString("base64url");
  return `${header}.${payload}.local-test`;
}

function sessionData(subject: string) {
  return {
    access_token: jwt(subject),
    refresh_token: `local-refresh-${subject}`,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: tokenExpiry,
    user: {
      id: subject,
      aud: "authenticated",
      role: "authenticated",
      email: "local-test@example.test",
      email_confirmed_at: "2026-09-24T12:00:00Z",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      created_at: "2026-09-24T12:00:00Z",
    },
  };
}

async function sessionCookie(context: BrowserContext, subject: string) {
  const session = sessionData(subject);
  await context.addCookies([{
    name: "sb-127-auth-token",
    value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
    domain: "127.0.0.1",
    path: "/",
    sameSite: "Lax",
  }]);
}

async function localOnly(page: Page) {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && (url.port === "3401" || url.port === "8401")) return route.continue();
    return route.abort();
  });
  await page.route("http://127.0.0.1:8401/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/v1/user") return route.fulfill({ json: sessionData(owner).user });
    if (path === "/auth/v1/token") return route.fulfill({ status: 400, json: { error: "invalid_grant" } });
    return route.fulfill({ status: 404, json: { error: "not_found" } });
  });
}

for (const denialTiming of ["before redemption", "after profile refresh"] as const) {
  test(`signup opens Plans when the early membership denial arrives ${denialTiming}`, async ({ page }) => {
    await localOnly(page);
    await page.route("http://127.0.0.1:8401/auth/v1/otp", (route) => route.fulfill({ json: {} }));
    await page.route("http://127.0.0.1:8401/auth/v1/verify", (route) => route.fulfill({ json: sessionData(owner) }));
    let approved = false;
    let releaseRedemption!: () => void;
    const redemption = new Promise<void>((resolve) => { releaseRedemption = resolve; });
    let releaseDenial!: () => void;
    const denial = new Promise<void>((resolve) => { releaseDenial = resolve; });
    let markDenialStarted!: () => void;
    const denialStarted = new Promise<void>((resolve) => { markDenialStarted = resolve; });
    await page.route("**/api/v1/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/api/v1/access/validate") return route.fulfill({ json: envelope({ redemption_token: "local-redemption" }) });
      if (path === "/api/v1/access/redeem") {
        await redemption;
        approved = true;
        return route.fulfill({ json: envelope({ id: owner }) });
      }
      if (path === "/api/v1/me/deletion") {
        markDenialStarted();
        await denial;
        return route.fulfill(failure(404));
      }
      if (!approved) return route.fulfill(failure(403));
      if (path === "/api/v1/me") return route.fulfill({ json: envelope({ id: owner, display_name: "New member" }) });
      if (path === "/api/v1/connections" || path === "/api/v1/plans") return route.fulfill({ json: envelope([]) });
      return route.fulfill(failure(404));
    });
    await page.goto("/invite?mode=join");
    await page.getByLabel("Invite code", { exact: true }).fill("local-invite");
    await page.getByLabel("Display name").fill("New member");
    await page.getByLabel("Email address").fill("local-test@example.test");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByLabel("Email verification code").fill("12345678");
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await denialStarted;
    const finishDenial = async () => {
      const response = page.waitForResponse((candidate) => candidate.url().endsWith("/api/v1/me/deletion"));
      releaseDenial();
      await (await response).finished();
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    };
    if (denialTiming === "before redemption") await finishDenial();
    releaseRedemption();
    await expect(page).toHaveURL(/\/plans$/);
    await expect(page.getByRole("heading", { name: "Dinner plans", exact: true })).toBeVisible();
    if (denialTiming === "after profile refresh") await finishDenial();
    await expect(page.getByRole("heading", { name: "Dinner plans", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Plans unavailable" })).toHaveCount(0);
    await page.screenshot({ path: join(tmpdir(), `tableus-signup-${denialTiming.replaceAll(" ", "-")}.png`), fullPage: true });
  });
}

for (const recovery of ["retry", "reload"] as const) {
  test(`signup ${recovery} finishes after an outage without another OTP`, async ({ page }) => {
    await localOnly(page);
    let otpRequests = 0;
    let verifications = 0;
    let validations = 0;
    let redemptions = 0;
    let approved = false;
    await page.route("http://127.0.0.1:8401/auth/v1/otp", (route) => {
      otpRequests++;
      return route.fulfill({ json: {} });
    });
    await page.route("http://127.0.0.1:8401/auth/v1/verify", (route) => {
      verifications++;
      return route.fulfill({ json: sessionData(owner) });
    });
    await page.route("**/api/v1/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/api/v1/access/validate") {
        validations++;
        expect(route.request().postDataJSON()).toEqual({ code: "local-invite", email: "local-test@example.test" });
        return route.fulfill({ json: envelope({ redemption_token: `grant-${validations}` }) });
      }
      if (path === "/api/v1/access/redeem") {
        redemptions++;
        if (redemptions === 1) return route.fulfill(failure(503));
        if (route.request().postDataJSON().redemption_token === "grant-1") return route.fulfill(failure(400));
        approved = true;
        return route.fulfill({ json: envelope({ id: owner }) });
      }
      if (path === "/api/v1/me/deletion") return route.fulfill(failure(404));
      if (!approved) return route.fulfill(failure(403));
      if (path === "/api/v1/me") return route.fulfill({ json: envelope({ id: owner, display_name: "Recovery test" }) });
      if (path === "/api/v1/connections" || path === "/api/v1/plans") return route.fulfill({ json: envelope([]) });
      return route.fulfill(failure(404));
    });
    const begin = async () => {
      await page.getByLabel("Invite code", { exact: true }).fill("local-invite");
      await page.getByLabel("Display name").fill("Recovery test");
      await page.getByLabel("Email address").fill("local-test@example.test");
      await page.getByRole("button", { name: "Continue", exact: true }).click();
    };
    await page.goto("/invite?mode=join");
    await begin();
    await page.getByLabel("Email verification code").fill("12345678");
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await expect(page.getByRole("button", { name: "Retry and continue" })).toBeEnabled();
    await expect(page.getByLabel("Email verification code")).toHaveCount(0);
    await expect(page.getByLabel("Email address")).toBeDisabled();
    if (recovery === "reload") {
      await page.reload();
      await begin();
    } else {
      await page.getByRole("button", { name: "Retry and continue" }).click();
    }
    await expect(page.getByRole("heading", { name: "Dinner plans", exact: true })).toBeVisible();
    expect(otpRequests).toBe(1);
    expect(verifications).toBe(1);
    expect(validations).toBe(2);
    expect(redemptions).toBe(recovery === "retry" ? 3 : 2);
  });
}

test("cold missing profile restores pending deletion status", async ({ page, context }) => {
  await sessionCookie(context, owner);
  await localOnly(page);
  let statusReads = 0;
  await page.route("**/api/v1/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/v1/me/deletion") {
      statusReads += 1;
      return route.fulfill({ json: envelope({ status: "pending", requested_at: "2026-09-24T12:00:00Z", completed_at: null, next_retry_at: null, last_error_code: "retryable", needs_attention: false }) });
    }
    return route.fulfill(failure(403));
  });
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Account deletion in progress" })).toBeVisible();
  await expect(page.getByText("Your TableUs profile has been removed.")).toBeVisible();
  expect(statusReads).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: "Plans you organize" })).toHaveCount(0);
  await page.screenshot({ path: join(tmpdir(), "tableus-hosted-pending.png"), fullPage: true });
});

test("ordinary unapproved profile does not become deletion recovery", async ({ page, context }) => {
  await sessionCookie(context, owner);
  await localOnly(page);
  await page.route("**/api/v1/**", (route) => route.fulfill(failure(403)));
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Account unavailable" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /deletion/i })).toHaveCount(0);
});

test("sign-out after pending deletion keeps truthful status without account content", async ({ page, context }) => {
  await sessionCookie(context, owner);
  await localOnly(page);
  await page.route("**/api/v1/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/v1/me/deletion") return route.fulfill({ json: envelope({ status: "pending", requested_at: "2026-09-24T12:00:00Z", completed_at: null, next_retry_at: null, last_error_code: null, needs_attention: false }) });
    return route.fulfill(failure(403));
  });
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Account deletion in progress" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out here" }).click();
  await expect(page.getByRole("heading", { name: "Account deletion in progress" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Your session ended" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plans you organize" })).toHaveCount(0);
});

test("a later account session cannot receive an old deletion result", async ({ page, context }) => {
  await sessionCookie(context, owner);
  await localOnly(page);
  let releaseOld!: () => void;
  const oldStatus = new Promise<void>((resolve) => { releaseOld = resolve; });
  let markStarted!: () => void;
  const statusStarted = new Promise<void>((resolve) => { markStarted = resolve; });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const auth = route.request().headers().authorization ?? "";
    if (auth.includes(jwt(owner)) && path === "/api/v1/me/deletion") {
      markStarted();
      await oldStatus;
      return route.fulfill({ json: envelope({ status: "pending", requested_at: "2026-09-24T12:00:00Z", completed_at: null, next_retry_at: null, last_error_code: null, needs_attention: false }) });
    }
    if (auth.includes(jwt(other)) && path === "/api/v1/me") return route.fulfill({ json: envelope({ id: other, display_name: "Other", share_taste: false }) });
    if (auth.includes(jwt(other)) && path === "/api/v1/connections") return route.fulfill({ json: envelope([]) });
    if (auth.includes(jwt(other)) && path === "/api/v1/me/account-control") return route.fulfill({ json: envelope({ can_delete: true, organized_plan_count: 0, full_deletion_available: false }) });
    if (auth.includes(jwt(other)) && path === "/api/v1/me/organized-plans") return route.fulfill({ json: envelope([]) });
    return route.fulfill(failure(403));
  });
  await page.goto("/account");
  await statusStarted;
  await sessionCookie(context, other);
  await page.evaluate((session) => {
    const channel = new BroadcastChannel("sb-127-auth-token");
    channel.postMessage({ event: "SIGNED_IN", session });
    channel.close();
  }, sessionData(other));
  await expect(page.getByRole("heading", { name: "Other" })).toBeVisible();
  const oldResponse = page.waitForResponse((response) =>
    response.url().endsWith("/api/v1/me/deletion")
    && response.request().headers().authorization?.includes(jwt(owner)) === true,
  );
  releaseOld();
  await (await oldResponse).finished();
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(page.getByRole("heading", { name: "Other" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Account deletion in progress/ })).toHaveCount(0);
});
