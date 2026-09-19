# Validation report

- **Issue:** #8
- **Commit:** e0d8e06d96b684a916ef3094e69f22f636935f8b
- **Generated:** 2026-09-19T10:54:20.173Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 21 | 21 | 0 | 0 |
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
| AC-008-a | A signed-in Guest sees only the assets assigned to them, not the whole inventory | ✅ pass | `tests/e2e/specs/AC-008-a.spec.ts` | — |
| AC-009-a | A Guest can submit a new-equipment request with a description | ✅ pass | `tests/e2e/specs/AC-009-a.spec.ts` | — |
| AC-009-b | A Guest can submit an issue request against one of their assigned assets | ✅ pass | `tests/e2e/specs/AC-009-b.spec.ts` | — |
| AC-009-c | A newly submitted request starts in the open status | ✅ pass | `tests/e2e/specs/AC-009-c.spec.ts` | — |
| AC-010-a | A signed-in Guest can see the current status of each request they raised | ✅ pass | `tests/e2e/specs/AC-010-a.spec.ts` | — |
| AC-010-b | A Guest cannot see another Guest's requests | ✅ pass | `tests/e2e/specs/AC-010-b.spec.ts` | — |
| AC-011-a | An Admin can view a list of every request raised by every Guest | ✅ pass | `tests/e2e/specs/AC-011-a.spec.ts` | — |
| AC-012-a | An Admin can set a request's status to approved | ✅ pass | `tests/e2e/specs/AC-012-a.spec.ts` | — |
| AC-012-b | An Admin can set a request's status to rejected | ✅ pass | `tests/e2e/specs/AC-012-b.spec.ts` | — |
| AC-012-c | An Admin can set a request's status to resolved | ✅ pass | `tests/e2e/specs/AC-012-c.spec.ts` | — |
| AC-012-d | The Guest who raised a request sees its updated status after an Admin changes it | ✅ pass | `tests/e2e/specs/AC-012-d.spec.ts` | — |

