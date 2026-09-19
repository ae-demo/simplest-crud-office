// spec: tests/validation/test-plan.md § AC-006-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN } from "../lib/auth";

test("AC-006-a: an Admin can delete an asset record and it no longer appears in the inventory list", async ({ page }) => {
  const assetName = `AC006a Asset ${Date.now()}`;

  await signIn(page, target("admin-webapp"), ADMIN);
  await page.getByRole("link", { name: "Assets" }).click();
  await page.getByRole("button", { name: "Add Asset" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(assetName);
  await page.getByRole("textbox", { name: "Category" }).fill("Monitor");
  await page.getByRole("textbox", { name: "Condition" }).fill("Fair");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("row", { name: new RegExp(assetName) })).toBeVisible();

  // Open it and delete
  await page.getByRole("row", { name: new RegExp(assetName) }).click();
  await page.getByRole("button", { name: "Delete" }).click();

  // Assert: no longer in the inventory list
  await expect(page.getByRole("row", { name: new RegExp(assetName) })).toHaveCount(0);
});
