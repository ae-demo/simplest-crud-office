// spec: tests/validation/test-plan.md § AC-008-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN, GUEST } from "../lib/auth";
import { ensureGuestAccount } from "../lib/fixtures";

test("AC-008-a: a signed-in Guest sees only the assets assigned to them, not the whole inventory", async ({ page }) => {
  const stamp = Date.now();
  const myAssetName = `AC008a Mine ${stamp}`;
  const otherAssetName = `AC008a NotMine ${stamp}`;
  // 1. As Admin, ensure a guest account matches the Guest login's identity,
  // assign one asset to it, and leave another unassigned.
  await signIn(page, target("admin-webapp"), ADMIN);
  const guestName = await ensureGuestAccount(page, "AC008a Guest fixture", GUEST.email);

  await page.getByRole("link", { name: "Assets" }).click();

  await page.getByRole("button", { name: "Add Asset" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(otherAssetName);
  await page.getByRole("textbox", { name: "Category" }).fill("Monitor");
  await page.getByRole("textbox", { name: "Condition" }).fill("Fair");
  await page.getByRole("button", { name: "Save" }).click();

  await page.getByRole("button", { name: "Add Asset" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(myAssetName);
  await page.getByRole("textbox", { name: "Category" }).fill("Laptop");
  await page.getByRole("textbox", { name: "Condition" }).fill("New");
  await page.getByRole("combobox", { name: "Assigned To" }).click();
  await page.getByRole("option", { name: guestName, exact: true }).click();
  await page.getByRole("button", { name: "Save" }).click();

  // 2-3. Sign in as Guest, go to My Assets.
  await signIn(page, target("guest-webapp"), GUEST);

  // Assert: sees the assigned asset, not the unassigned/other one.
  await expect(page.getByRole("cell", { name: myAssetName })).toBeVisible();
  await expect(page.getByRole("cell", { name: otherAssetName })).toHaveCount(0);
});
