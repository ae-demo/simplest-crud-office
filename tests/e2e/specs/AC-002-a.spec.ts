// spec: tests/validation/test-plan.md § AC-002-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN } from "../lib/auth";

test("AC-002-a: an Admin can create a new guest account with a name and email", async ({ page }) => {
  const name = `AC002a Guest ${Date.now()}`;
  const email = `ac002a-${Date.now()}@test-users.invalid`;

  // 1. Sign in as Admin
  await signIn(page, target("admin-webapp"), ADMIN);
  // 2. Go to Guest Accounts
  await page.getByRole("link", { name: "Guest Accounts" }).click();
  // 3. Click "Provision Guest"
  await page.getByRole("button", { name: "Provision Guest" }).click();
  // 4. Fill Name + Email
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  // 5. Click Save
  await page.getByRole("button", { name: "Save" }).click();

  // Assert: navigates back to the guest accounts list with no error
  await expect(page).toHaveURL(/\/guest-accounts$/);
  await expect(page.getByRole("cell", { name: email })).toBeVisible();
});
