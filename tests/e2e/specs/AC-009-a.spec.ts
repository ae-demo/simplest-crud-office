// spec: tests/validation/test-plan.md § AC-009-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-009-a: a Guest can submit a new-equipment request with a description", async ({ page }) => {
  const description = `AC009a need a new keyboard ${Date.now()}`;

  // Ensure the guest account matching the Guest login exists.
  await signIn(page, target("admin-webapp"), ADMIN);
  await ensureGuestAccount(page, "AC009a Guest fixture", GUEST.email);

  // 1-2. Sign in as Guest, go to My Requests -> New Request.
  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  // 3. Leave Type at "new-equipment", fill Description.
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  // 4. Submit.
  await page.getByRole("button", { name: "Submit" }).click();

  // Assert: the request appears in My Requests with the submitted description.
  await expect(page.getByRole("cell", { name: description })).toBeVisible();
});
