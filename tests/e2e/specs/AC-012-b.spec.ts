// spec: tests/validation/test-plan.md § AC-012-b
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-012-b: an Admin can set a request's status to rejected", async ({ page }) => {
  const description = `AC012b reject me ${Date.now()}`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await ensureGuestAccount(page, "AC012b Guest fixture", GUEST.email);

  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  await page.getByRole("button", { name: "Submit" }).click();

  await signIn(page, target("admin-webapp"), ADMIN);
  await page.getByRole("link", { name: "Requests" }).click();
  await page.getByRole("row", { name: new RegExp(description) }).click();

  await page.getByRole("button", { name: "Reject" }).click();

  // Assert: the request's status badge updates to "rejected".
  await expect(page.getByText("rejected", { exact: true })).toBeVisible();
});
