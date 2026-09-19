// spec: tests/validation/test-plan.md § AC-001-b
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";

test("AC-001-b: an unauthenticated visitor to the admin app is redirected to sign in", async ({ page }) => {
  // 1. Navigate to admin-webapp root with no session
  await page.goto(target("admin-webapp"));
  // Assert: redirected to the shared IDP's sign-in page
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});
