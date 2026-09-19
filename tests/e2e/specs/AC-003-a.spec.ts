// spec: tests/validation/test-plan.md § AC-003-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN } from "../lib/auth";

test("AC-003-a: an Admin can create a new asset record with name, category, status, condition and location", async ({ page }) => {
  const name = `AC003a Asset ${Date.now()}`;

  // 1. Sign in as Admin
  await signIn(page, target("admin-webapp"), ADMIN);
  // 2. Go to Assets
  await page.getByRole("link", { name: "Assets" }).click();
  // 3. Click "Add Asset"
  await page.getByRole("button", { name: "Add Asset" }).click();
  // 4. Fill Name, Category, Condition, Location (Status defaults to "available")
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Category" }).fill("Laptop");
  await page.getByRole("textbox", { name: "Condition" }).fill("New");
  await page.getByRole("textbox", { name: "Location" }).fill("HQ-Floor2");
  // 5. Click Save
  await page.getByRole("button", { name: "Save" }).click();

  // Assert: the new asset appears in the inventory with all five fields
  const row = page.getByRole("row", { name: new RegExp(`${name}.*Laptop.*available.*New.*HQ-Floor2`) });
  await expect(row).toBeVisible();
});
