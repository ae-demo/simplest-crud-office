// spec: tests/validation/test-plan.md § AC-010-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-010-a: a signed-in Guest can see the current status of each request they raised", async ({ page }) => {
  const description = `AC010a printer jammed ${Date.now()}`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await ensureGuestAccount(page, "AC010a Guest fixture", GUEST.email);

  // 1-2. Sign in as Guest, submit a request.
  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  await page.getByRole("button", { name: "Submit" }).click();

  // 3. Go to My Requests.
  await page.getByRole("link", { name: "My Requests" }).click();

  // Assert: the request row shows status "open".
  await expect(page.getByRole("row", { name: new RegExp(`${description}.*open`) })).toBeVisible();
});
