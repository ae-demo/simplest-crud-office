// spec: tests/validation/test-plan.md § AC-007-b
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";

test("AC-007-b: an unauthenticated visitor to the guest app is redirected to sign in", async ({ page }) => {
  // 1. Navigate to guest-webapp root with no session
  await page.goto(target("guest-webapp"));
  // Assert: redirected to the shared IDP's sign-in page
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});
