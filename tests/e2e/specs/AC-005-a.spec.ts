// spec: tests/validation/test-plan.md § AC-005-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN } from "../lib/auth";

test("AC-005-a: an Admin can change an existing asset's status, condition, location or assigned owner and the change is saved", async ({ page }) => {
  const stamp = Date.now();
  const assetName = `AC005a Asset ${stamp}`;
  const guestName = `AC005a Guest ${stamp}`;

  await signIn(page, target("admin-webapp"), ADMIN);

  // Provision a guest to assign the asset to
  await page.getByRole("link", { name: "Guest Accounts" }).click();
  await page.getByRole("button", { name: "Provision Guest" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(guestName);
  await page.getByRole("textbox", { name: "Email" }).fill(`ac005a-${stamp}@test-users.invalid`);
  await page.getByRole("button", { name: "Save" }).click();

  // Create the asset (defaults: status available, no location, unassigned)
  await page.getByRole("link", { name: "Assets" }).click();
  await page.getByRole("button", { name: "Add Asset" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(assetName);
  await page.getByRole("textbox", { name: "Category" }).fill("Laptop");
  await page.getByRole("textbox", { name: "Condition" }).fill("New");
  await page.getByRole("button", { name: "Save" }).click();

  // Open it and edit status, condition, location, assigned owner
  await page.getByRole("row", { name: new RegExp(assetName) }).click();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("combobox", { name: /^Status/ }).click();
  await page.getByRole("option", { name: "in-use" }).click();
  await page.getByRole("textbox", { name: "Condition" }).fill("Good");
  await page.getByRole("textbox", { name: "Location" }).fill("HQ-Floor3");
  await page.getByRole("combobox", { name: "Assigned To" }).click();
  await page.getByRole("option", { name: guestName, exact: true }).click();
  await page.getByRole("button", { name: "Save" }).click();

  // Assert: the list row reflects all four new values
  const row = page.getByRole("row", {
    name: new RegExp(`${assetName}.*in-use.*Good.*HQ-Floor3.*${guestName}`),
  });
  await expect(row).toBeVisible();
});
