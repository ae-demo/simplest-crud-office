// spec: tests/validation/test-plan.md § AC-012-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-012-a: an Admin can set a request's status to approved", async ({ page }) => {
  const description = `AC012a approve me ${Date.now()}`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await ensureGuestAccount(page, "AC012a Guest fixture", GUEST.email);

  // 1. Sign in as Guest, submit a request.
  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  await page.getByRole("button", { name: "Submit" }).click();

  // 2. Sign in as Admin, open the request.
  await signIn(page, target("admin-webapp"), ADMIN);
  await page.getByRole("link", { name: "Requests" }).click();
  await page.getByRole("row", { name: new RegExp(description) }).click();

  // 3. Click Approve.
  await page.getByRole("button", { name: "Approve" }).click();

  // Assert: the request's status badge updates to "approved".
  await expect(page.getByText("approved", { exact: true })).toBeVisible();
});
