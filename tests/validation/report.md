# Validation report

- **Issue:** #8
- **Commit:** 0732c8137748809980a0f5d0f546d179b352f30f
- **Generated:** 2026-09-19T10:21:07.143Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 21 | 10 | 11 | 0 |
| manual (human checklist) | 0 | — | — | — |
| scenario (not validated) | 0 | — | — | — |

## E2E results

| Criterion | Must | Status | Spec | Notes |
|---|---|---|---|---|
| AC-001-a | An Admin can sign in through the shared identity provider and reach the admin app | ✅ pass | `tests/e2e/specs/AC-001-a.spec.ts` | — |
| AC-001-b | An unauthenticated visitor to the admin app is redirected to sign in | ✅ pass | `tests/e2e/specs/AC-001-b.spec.ts` | — |
| AC-002-a | An Admin can create a new guest account with a name and email | ✅ pass | `tests/e2e/specs/AC-002-a.spec.ts` | — |
| AC-002-b | A newly provisioned guest account appears in the Admin's list of guest accounts | ✅ pass | `tests/e2e/specs/AC-002-b.spec.ts` | — |
| AC-003-a | An Admin can create a new asset record with name, category, status, condition and location | ✅ pass | `tests/e2e/specs/AC-003-a.spec.ts` | — |
| AC-004-a | An Admin can view a list showing every asset in inventory, regardless of who it is assigned to | ✅ pass | `tests/e2e/specs/AC-004-a.spec.ts` | — |
| AC-005-a | An Admin can change an existing asset's status, condition, location or assigned owner and the change is saved | ✅ pass | `tests/e2e/specs/AC-005-a.spec.ts` | — |
| AC-006-a | An Admin can delete an asset record and it no longer appears in the inventory list | ✅ pass | `tests/e2e/specs/AC-006-a.spec.ts` | — |
| AC-007-a | A provisioned Guest can sign in through the shared identity provider and reach the guest app | ✅ pass | `tests/e2e/specs/AC-007-a.spec.ts` | — |
| AC-007-b | An unauthenticated visitor to the guest app is redirected to sign in | ✅ pass | `tests/e2e/specs/AC-007-b.spec.ts` | — |
| AC-008-a | A signed-in Guest sees only the assets assigned to them, not the whole inventory | ❌ fail | `tests/e2e/specs/AC-008-a.spec.ts` | healed ×1 |
| AC-009-a | A Guest can submit a new-equipment request with a description | ❌ fail | `tests/e2e/specs/AC-009-a.spec.ts` | — |
| AC-009-b | A Guest can submit an issue request against one of their assigned assets | ❌ fail | `tests/e2e/specs/AC-009-b.spec.ts` | healed ×1 |
| AC-009-c | A newly submitted request starts in the open status | ❌ fail | `tests/e2e/specs/AC-009-c.spec.ts` | — |
| AC-010-a | A signed-in Guest can see the current status of each request they raised | ❌ fail | `tests/e2e/specs/AC-010-a.spec.ts` | — |
| AC-010-b | A Guest cannot see another Guest's requests | ❌ fail | `tests/e2e/specs/AC-010-b.spec.ts` | healed ×1 |
| AC-011-a | An Admin can view a list of every request raised by every Guest | ❌ fail | `tests/e2e/specs/AC-011-a.spec.ts` | healed ×1 |
| AC-012-a | An Admin can set a request's status to approved | ❌ fail | `tests/e2e/specs/AC-012-a.spec.ts` | — |
| AC-012-b | An Admin can set a request's status to rejected | ❌ fail | `tests/e2e/specs/AC-012-b.spec.ts` | — |
| AC-012-c | An Admin can set a request's status to resolved | ❌ fail | `tests/e2e/specs/AC-012-c.spec.ts` | — |
| AC-012-d | The Guest who raised a request sees its updated status after an Admin changes it | ❌ fail | `tests/e2e/specs/AC-012-d.spec.ts` | — |

## Failures

### AC-008-a — A signed-in Guest sees only the assets assigned to them, not the whole inventory

Spec: `tests/e2e/specs/AC-008-a.spec.ts`
Location: `AC-008-a.spec.ts:7`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('cell', { name: 'AC008a Mine 1789812949396' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('cell', { name: 'AC008a Mine 1789812949396' })

```

### AC-009-a — A Guest can submit a new-equipment request with a description

Spec: `tests/e2e/specs/AC-009-a.spec.ts`
Location: `AC-009-a.spec.ts:7`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('cell', { name: 'AC009a need a new keyboard 1789812972983' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('cell', { name: 'AC009a need a new keyboard 1789812972983' })

```

### AC-009-b — A Guest can submit an issue request against one of their assigned assets

Spec: `tests/e2e/specs/AC-009-b.spec.ts`
Location: `AC-009-b.spec.ts:7`

```
Test timeout of 30000ms exceeded.
```

### AC-009-c — A newly submitted request starts in the open status

Spec: `tests/e2e/specs/AC-009-c.spec.ts`
Location: `AC-009-c.spec.ts:7`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row', { name: /AC009c need a monitor 1789813028494.*open/ })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row', { name: /AC009c need a monitor 1789813028494.*open/ })

```

### AC-010-a — A signed-in Guest can see the current status of each request they raised

Spec: `tests/e2e/specs/AC-010-a.spec.ts`
Location: `AC-010-a.spec.ts:7`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row', { name: /AC010a printer jammed 1789813050621.*open/ })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row', { name: /AC010a printer jammed 1789813050621.*open/ })

```

### AC-010-b — A Guest cannot see another Guest's requests

Spec: `tests/e2e/specs/AC-010-b.spec.ts`
Location: `AC-010-b.spec.ts:7`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('cell', { name: 'AC010b guest1 only request 1789813073714' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('cell', { name: 'AC010b guest1 only request 1789813073714' })

```

### AC-011-a — An Admin can view a list of every request raised by every Guest

Spec: `tests/e2e/specs/AC-011-a.spec.ts`
Location: `AC-011-a.spec.ts:7`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('cell', { name: 'AC011a admin should see this 1789813097032' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('cell', { name: 'AC011a admin should see this 1789813097032' })

```

### AC-012-a — An Admin can set a request's status to approved

Spec: `tests/e2e/specs/AC-012-a.spec.ts`
Location: `AC-012-a.spec.ts:7`

```
Test timeout of 30000ms exceeded.
```

### AC-012-b — An Admin can set a request's status to rejected

Spec: `tests/e2e/specs/AC-012-b.spec.ts`
Location: `AC-012-b.spec.ts:7`

```
Test timeout of 30000ms exceeded.
```

### AC-012-c — An Admin can set a request's status to resolved

Spec: `tests/e2e/specs/AC-012-c.spec.ts`
Location: `AC-012-c.spec.ts:7`

```
Test timeout of 30000ms exceeded.
```

### AC-012-d — The Guest who raised a request sees its updated status after an Admin changes it

Spec: `tests/e2e/specs/AC-012-d.spec.ts`
Location: `AC-012-d.spec.ts:7`

```
Test timeout of 30000ms exceeded.
```

## Healing log

| Criterion | Classification | Change | Commit |
|---|---|---|---|
| AC-008-a | setup/session (fixture race) | ensureGuestAccount used Locator.count() right after a click, which doesn't wait for the guest-accounts list fetch to resolve — it always read the pre-fetch DOM and concluded "not found", then tried to select a never-created option in the Assigned To combobox and timed out. Rewrote ensureGuestAccount to await the list's GET response directly and match by email in the JSON, returning the account's real name. | `pending` |
| AC-009-b | setup/session (fixture race) | Same ensureGuestAccount race as AC-008-a. | `pending` |
| AC-011-a | timing | signIn() clicked Sign In and returned immediately, before the IDP redirect chain (flow steps, oauth2 callback, token exchange) landed back on the app's origin; the next action then raced that redirect. Added a page.waitForURL() back to the app's origin at the end of signIn(). | `pending` |
| AC-010-b | setup/session (identity leak) | Guest2's sign-in reused the same page/context as Guest1 on the same origin (guest-webapp); the per-origin session would have carried Guest1's identity through instead of switching. Added lib/fixtures.ts's asNewSession() to give Guest2 an isolated browser context, and benefits from the same signIn() timing fix as AC-011-a. | `pending` |

