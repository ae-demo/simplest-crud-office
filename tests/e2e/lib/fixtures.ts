import { Browser, Page } from "@playwright/test";
import { Credentials, signIn } from "./auth";

// A fresh, isolated browser context+page, signed in as `creds`. Use this
// instead of reusing an existing `page` when a spec needs to switch to a
// DIFFERENT identity on the SAME origin (e.g. Guest -> Guest2 on
// guest-webapp) — same-origin storage would otherwise carry the previous
// identity's session through and silently keep driving the old identity.
export async function asNewSession(browser: Browser, appUrl: string, creds: Credentials): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page, appUrl, creds);
  return page;
}

// The guest-webapp identifies a signed-in Guest by matching their Thunder
// email against a GuestAccount record (see specs/design/domain-model.md).
// Several specs need that record to exist for the roles-gate test login —
// ensure it rather than assume a prior spec or run created it.
//
// Returns the account's actual Name, which may differ from the requested
// one if a matching account (by email) already existed under another name —
// e.g. from an earlier run or another spec.
export async function ensureGuestAccount(page: Page, name: string, email: string): Promise<string> {
  // Locator.count() doesn't wait for the list's fetch to resolve, so wait for
  // the underlying GET to complete before checking whether the account is
  // already there — otherwise this races the fetch and always concludes
  // "not found", creating a duplicate on every call.
  const [response] = await Promise.all([
    page.waitForResponse((r) => /\/api\/guest-accounts(\?|$)/.test(r.url()) && r.request().method() === "GET"),
    page.getByRole("link", { name: "Guest Accounts" }).click(),
  ]);
  const { data } = await response.json();
  const match = data.find((account: { email: string }) => account.email === email);
  if (match) {
    return match.name;
  }
  await page.getByRole("button", { name: "Provision Guest" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("button", { name: "Save" }).click();
  return name;
}
