// spec: tests/validation/test-plan.md § AC-007-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";
import { signIn, GUEST } from "../lib/auth";

test("AC-007-a: a provisioned Guest can sign in through the shared identity provider and reach the guest app", async ({ page }) => {
  // 1-2. Navigate to guest-webapp, sign in with the Guest test account
  await signIn(page, target("guest-webapp"), GUEST);
  // Assert: lands on the guest app shell
  await expect(page.getByRole("heading", { name: "My Assets" })).toBeVisible();
});
