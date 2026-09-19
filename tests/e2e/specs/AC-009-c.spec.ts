// spec: tests/validation/test-plan.md § AC-009-c
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-009-c: a newly submitted request starts in the open status", async ({ page }) => {
  const description = `AC009c need a monitor ${Date.now()}`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await ensureGuestAccount(page, "AC009c Guest fixture", GUEST.email);

  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  await page.getByRole("button", { name: "Submit" }).click();

  // Assert: the new request's status column reads "open".
  await expect(page.getByRole("row", { name: new RegExp(`${description}.*open`) })).toBeVisible();
});
