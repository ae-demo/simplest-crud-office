// spec: tests/validation/test-plan.md § AC-010-b
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST, GUEST2 } from "../lib/auth";
import { ensureGuestAccount, asNewSession } from "../lib/fixtures";

test("AC-010-b: a Guest cannot see another Guest's requests", async ({ page, browser }) => {
  const description = `AC010b guest1 only request ${Date.now()}`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await ensureGuestAccount(page, "AC010b Guest1 fixture", GUEST.email);
  await ensureGuestAccount(page, "AC010b Guest2 fixture", GUEST2.email);

  // 1. Sign in as Guest1, submit a request with a unique description.
  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  await page.getByRole("button", { name: "Submit" }).click();

  // Confirm the precondition: Guest1's own request was actually created.
  await page.getByRole("link", { name: "My Requests" }).click();
  await expect(page.getByRole("cell", { name: description })).toBeVisible();

  // 2-3. Sign in as Guest2 in a fresh session (same origin as Guest1, so a
  // shared page/context would carry Guest1's session through), go to My
  // Requests.
  const guest2Page = await asNewSession(browser, target("guest-webapp"), GUEST2);
  await guest2Page.getByRole("link", { name: "My Requests" }).click();

  // Assert: Guest2's list does not contain Guest1's description.
  await expect(guest2Page.getByRole("cell", { name: description })).toHaveCount(0);
});
