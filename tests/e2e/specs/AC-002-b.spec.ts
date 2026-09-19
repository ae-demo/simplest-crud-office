// spec: tests/validation/test-plan.md § AC-002-b
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN } from "../lib/auth";

test("AC-002-b: a newly provisioned guest account appears in the Admin's list of guest accounts", async ({ page }) => {
  const name = `AC002b Guest ${Date.now()}`;
  const email = `ac002b-${Date.now()}@test-users.invalid`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await page.getByRole("link", { name: "Guest Accounts" }).click();
  await page.getByRole("button", { name: "Provision Guest" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("button", { name: "Save" }).click();

  // Assert: the guest-accounts table shows a row for the new account
  const row = page.getByRole("row", { name: new RegExp(`${name}.*${email}`) });
  await expect(row).toBeVisible();
});
