// spec: tests/validation/test-plan.md § AC-012-c
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-012-c: an Admin can set a request's status to resolved", async ({ page }) => {
  const description = `AC012c resolve me ${Date.now()}`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await ensureGuestAccount(page, "AC012c Guest fixture", GUEST.email);

  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  await page.getByRole("button", { name: "Submit" }).click();

  await signIn(page, target("admin-webapp"), ADMIN);
  await page.getByRole("link", { name: "Requests" }).click();
  await page.getByRole("row", { name: new RegExp(description) }).click();

  // A request moves open -> approved -> resolved (specs/design/domain-model.md).
  await page.getByRole("button", { name: "Approve" }).click();
  await page.getByRole("button", { name: "Resolve" }).click();

  // Assert: the request's status badge updates to "resolved".
  await expect(page.getByText("resolved", { exact: true })).toBeVisible();
});
