// spec: tests/validation/test-plan.md § AC-011-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-011-a: an Admin can view a list of every request raised by every Guest", async ({ page }) => {
  const description = `AC011a admin should see this ${Date.now()}`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await ensureGuestAccount(page, "AC011a Guest fixture", GUEST.email);

  // 1. Sign in as Guest, submit a request with a unique description.
  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  await page.getByRole("button", { name: "Submit" }).click();

  // 2-3. Sign in as Admin, go to Requests.
  await signIn(page, target("admin-webapp"), ADMIN);
  await page.getByRole("link", { name: "Requests" }).click();

  // Assert: the Admin's Requests list contains a row with that description.
  await expect(page.getByRole("cell", { name: description })).toBeVisible();
});
