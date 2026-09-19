// spec: tests/validation/test-plan.md § AC-012-d
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-012-d: the Guest who raised a request sees its updated status after an Admin changes it", async ({ page }) => {
  const description = `AC012d watch my status ${Date.now()}`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await ensureGuestAccount(page, "AC012d Guest fixture", GUEST.email);

  // 1. Sign in as Guest, submit a request.
  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  await page.getByRole("button", { name: "Submit" }).click();

  // 2. Sign in as Admin, approve it.
  await signIn(page, target("admin-webapp"), ADMIN);
  await page.getByRole("link", { name: "Requests" }).click();
  await page.getByRole("row", { name: new RegExp(description) }).click();
  await page.getByRole("button", { name: "Approve" }).click();

  // 3. Sign in as Guest again, reload My Requests.
  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();

  // Assert: the request's status now reads "approved".
  await expect(page.getByRole("row", { name: new RegExp(`${description}.*approved`) })).toBeVisible();
});
