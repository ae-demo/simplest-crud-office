import { Page } from "@playwright/test";

export interface Credentials {
  username: string;
  password: string;
  // The Thunder identity's email claim, which office-api matches against a
  // GuestAccount.email to resolve "the caller's identity" — confirmed live by
  // decoding the access token issued at sign-in.
  email: string;
}

export const ADMIN: Credentials = {
  username: process.env.AEP_E2E_ADMIN_USERNAME!,
  password: process.env.AEP_E2E_ADMIN_PASSWORD!,
  email: `${process.env.AEP_E2E_ADMIN_USERNAME}@test-users.invalid`,
};

export const GUEST: Credentials = {
  username: process.env.AEP_E2E_GUEST_USERNAME!,
  password: process.env.AEP_E2E_GUEST_PASSWORD!,
  email: `${process.env.AEP_E2E_GUEST_USERNAME}@test-users.invalid`,
};

export const GUEST2: Credentials = {
  username: process.env.AEP_E2E_GUEST2_USERNAME!,
  password: process.env.AEP_E2E_GUEST2_PASSWORD!,
  email: `${process.env.AEP_E2E_GUEST2_USERNAME}@test-users.invalid`,
};

// Signs in through the shared Thunder IDP: navigating to any protected route
// of either webapp redirects here, and a successful sign-in lands back on the
// app's default route. Each webapp keeps its own per-origin session, so
// revisiting an app already signed in to AS THE SAME IDENTITY (e.g. Admin ->
// Guest -> Admin again) lands straight past the sign-in form — tolerate that
// rather than hang waiting for a field that won't render.
//
// This does NOT work for switching to a DIFFERENT identity on the SAME
// origin (e.g. Guest -> Guest2 on guest-webapp) — that needs a fresh browser
// context so the old identity's session can't leak through; see
// lib/fixtures.ts's `asNewSession`.
export async function signIn(page: Page, appUrl: string, creds: Credentials) {
  await page.goto(appUrl);
  const username = page.getByRole("textbox", { name: "Username" });
  const onSignInPage = await username
    .waitFor({ state: "visible", timeout: 5_000 })
    .then(() => true)
    .catch(() => false);
  if (!onSignInPage) {
    return;
  }
  await username.fill(creds.username);
  await page.getByRole("textbox", { name: "Password" }).fill(creds.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  // The IDP redirect chain (flow steps, oauth2 callback, token exchange)
  // lands back on the app's own origin — wait for that before returning,
  // otherwise a caller's very next action races the redirect.
  await page.waitForURL((url) => url.origin === new URL(appUrl).origin, { timeout: 15_000 });
}
