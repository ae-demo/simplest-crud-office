// spec: tests/validation/test-plan.md § AC-001-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, ADMIN } from "../lib/auth";

test("AC-001-a: an Admin can sign in through the shared IDP and reach the admin app", async ({ page }) => {
  // 1-3. Navigate to admin-webapp, fill credentials, sign in
  await signIn(page, target("admin-webapp"), ADMIN);
  // Assert: lands on the admin app shell
  await expect(page.getByRole("heading", { name: "Asset Inventory" })).toBeVisible();
});
