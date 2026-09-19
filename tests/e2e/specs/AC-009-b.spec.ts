// spec: tests/validation/test-plan.md § AC-009-b
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-009-b: a Guest can submit an issue request against one of their assigned assets", async ({ page }) => {
  const stamp = Date.now();
  const assetName = `AC009b Asset ${stamp}`;
  const description = `AC009b broken screen ${stamp}`;
  // As Admin, ensure the guest account and an asset assigned to it.
  await signIn(page, target("admin-webapp"), ADMIN);
  const guestName = await ensureGuestAccount(page, "AC009b Guest fixture", GUEST.email);
  await page.getByRole("link", { name: "Assets" }).click();
  await page.getByRole("button", { name: "Add Asset" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(assetName);
  await page.getByRole("textbox", { name: "Category" }).fill("Laptop");
  await page.getByRole("textbox", { name: "Condition" }).fill("New");
  await page.getByRole("combobox", { name: "Assigned To" }).click();
  await page.getByRole("option", { name: guestName, exact: true }).click();
  await page.getByRole("button", { name: "Save" }).click();

  // 1-2. Sign in as Guest, go to My Requests -> New Request.
  await signIn(page, target("guest-webapp"), GUEST);
  await page.getByRole("link", { name: "My Requests" }).click();
  await page.getByRole("button", { name: "New Request" }).click();
  // 3. Select Type "issue", pick the Related Asset.
  await page.getByRole("combobox", { name: /^Type/ }).click();
  await page.getByRole("option", { name: "issue" }).click();
  await page.getByRole("combobox", { name: "Related Asset (optional)" }).click();
  await page.getByRole("option", { name: assetName }).click();
  // 4. Fill Description.
  await page.getByRole("textbox", { name: "Description" }).fill(description);
  // 5. Submit.
  await page.getByRole("button", { name: "Submit" }).click();

  // Assert: the request appears in My Requests, type "issue".
  await expect(page.getByRole("row", { name: new RegExp(`issue.*${description}`) })).toBeVisible();
});
