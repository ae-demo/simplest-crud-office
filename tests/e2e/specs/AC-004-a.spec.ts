// spec: tests/validation/test-plan.md § AC-004-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN } from "../lib/auth";

test("AC-004-a: an Admin can view a list showing every asset in inventory, regardless of who it is assigned to", async ({ page }) => {
  const stamp = Date.now();
  const guestName = `AC004a Guest ${stamp}`;
  const unassignedName = `AC004a Unassigned ${stamp}`;
  const assignedName = `AC004a Assigned ${stamp}`;

  await signIn(page, target("admin-webapp"), ADMIN);

  // Provision a guest to assign the second asset to
  await page.getByRole("link", { name: "Guest Accounts" }).click();
  await page.getByRole("button", { name: "Provision Guest" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(guestName);
  await page.getByRole("textbox", { name: "Email" }).fill(`ac004a-${stamp}@test-users.invalid`);
  await page.getByRole("button", { name: "Save" }).click();

  // Create an unassigned asset
  await page.getByRole("link", { name: "Assets" }).click();
  await page.getByRole("button", { name: "Add Asset" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(unassignedName);
  await page.getByRole("textbox", { name: "Category" }).fill("Monitor");
  await page.getByRole("textbox", { name: "Condition" }).fill("Fair");
  await page.getByRole("button", { name: "Save" }).click();

  // Create an asset assigned to the guest
  await page.getByRole("button", { name: "Add Asset" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(assignedName);
  await page.getByRole("textbox", { name: "Category" }).fill("Laptop");
  await page.getByRole("textbox", { name: "Condition" }).fill("Good");
  await page.getByRole("combobox", { name: "Assigned To" }).click();
  await page.getByRole("option", { name: guestName, exact: true }).click();
  await page.getByRole("button", { name: "Save" }).click();

  // Assert: the inventory list shows both, regardless of assignment
  await expect(page.getByRole("row", { name: new RegExp(unassignedName) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(`${assignedName}.*${guestName}`) })).toBeVisible();
});
