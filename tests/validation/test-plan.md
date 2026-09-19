# Validation test plan — issue #8

Explored live against the deployed environment (admin-webapp, guest-webapp,
office-api) with playwright-cli, signed in as the roles-gate test accounts
(`test-admin-2`, `test-guest`, `test-guest-2`). Source: `specs/design/components/*/openapi.yaml`,
`specs/design/domain-model.md`, `specs/design/flows/guest-request-lifecycle.md`.

**Root-cause finding surfaced during exploration**: `GET /me/assets`, `GET
/me/requests` and `POST /me/requests` on office-api all return `404 {"code":
404, "message":"no guest account matches the caller's identity"}` for the
signed-in Guest `test-guest`, even though a GuestAccount record exists whose
`email` exactly matches the JWT's `email` claim (`test-guest@test-users.invalid`,
confirmed via `GET /guest-accounts` as the Admin). Verified directly against
office-api (bypassing the webapp) with curl + the guest's own bearer token —
same 404, reproducible minutes apart. This blocks every Guest self-service
capability (REQ-008, REQ-009, REQ-010) and, transitively, every Admin
capability that needs a real Guest-submitted request to operate on
(REQ-011, REQ-012), since there is no other way to get a Request into the
system. Each affected criterion below is authored against the criterion's
intended flow and documents this as its failure cause.

## AC-001-a — Admin signs in and reaches the admin app

- Target: admin-webapp
- Steps: 1. Navigate to admin-webapp root. 2. Fill Username/Password with
  the Admin test account. 3. Click Sign In.
- Assert: page lands on the app shell showing heading "Asset Inventory".
- Source: live sign-in flow (default-idp `/gate/signin` form).

## AC-001-b — Unauthenticated visitor to admin app is redirected to sign in

- Target: admin-webapp
- Steps: 1. Navigate to admin-webapp root with no session.
- Assert: page lands on default-idp's Sign In heading.
- Source: live — confirmed via playwright-cli.

## AC-002-a — Admin creates a guest account with name + email

- Target: admin-webapp
- Steps: 1. Sign in as Admin. 2. Go to Guest Accounts. 3. Click "Provision
  Guest". 4. Fill Name + Email (unique per run). 5. Click Save.
- Assert: navigates back to /guest-accounts (no error shown).
- Source: live.

## AC-002-b — New guest account appears in the Admin's list

- Target: admin-webapp
- Steps: same as AC-002-a.
- Assert: the guest-accounts table shows a row with the new name + email.
- Source: live.

## AC-003-a — Admin creates an asset with name/category/status/condition/location

- Target: admin-webapp
- Steps: 1. Sign in as Admin. 2. Go to Assets. 3. Click "Add Asset". 4. Fill
  Name, Category, Condition, Location; leave Status at default "available".
  5. Click Save.
- Assert: navigates to /assets and the new row appears with all five fields.
- Source: live.

## AC-004-a — Admin views every asset regardless of assignment

- Target: admin-webapp
- Steps: 1. Sign in as Admin. 2. Create one unassigned asset and one asset
  assigned to a guest (via edit). 3. Go to Assets.
- Assert: both rows are visible in the same list.
- Source: live.

## AC-005-a — Admin updates an asset's status/condition/location/owner

- Target: admin-webapp
- Steps: 1. Sign in as Admin. 2. Create an asset. 3. Open it, click Edit.
  4. Change Status (available→in-use), Condition, Location, and Assigned To
  (pick a guest). 5. Save.
- Assert: the assets list row reflects all four new values.
- Source: live — confirmed the Status combobox options
  (available/in-use/retired) and the Assigned To combobox lists guest names.

## AC-006-a — Admin deletes an asset

- Target: admin-webapp
- Steps: 1. Sign in as Admin. 2. Create an asset. 3. Open it, click Delete.
- Assert: the asset's row no longer appears in /assets.
- Source: live — Delete has no confirmation dialog, removes immediately.

## AC-007-a — Guest signs in and reaches the guest app

- Target: guest-webapp
- Steps: 1. Navigate to guest-webapp root. 2. Sign in with the Guest test
  account.
- Assert: page lands on heading "My Assets".
- Source: live.

## AC-007-b — Unauthenticated visitor to guest app is redirected to sign in

- Target: guest-webapp
- Steps: 1. Navigate to guest-webapp root with no session.
- Assert: page lands on default-idp's Sign In heading.
- Source: live.

## AC-008-a — Guest sees only assets assigned to them

- Target: guest-webapp / admin-webapp
- Steps: 1. As Admin, assign one asset to Guest, leave another unassigned.
  2. Sign in as Guest. 3. Go to My Assets.
- Assert: the assigned asset's name is visible; the unassigned/other asset's
  name is not.
- **Known failure**: `GET /me/assets` 404s with "no guest account matches
  the caller's identity" — see root-cause note above. My Assets renders
  empty regardless of assignment.

## AC-009-a — Guest submits a new-equipment request with a description

- Target: guest-webapp
- Steps: 1. Sign in as Guest. 2. Go to My Requests → New Request. 3. Leave
  Type at "new-equipment", fill Description. 4. Submit.
- Assert: request appears in My Requests with the submitted description.
- **Known failure**: `POST /me/requests` 404s (same root cause) — submit
  never succeeds.

## AC-009-b — Guest submits an issue request against an assigned asset

- Target: guest-webapp
- Steps: 1. Sign in as Guest (with an asset assigned). 2. New Request.
  3. Select Type "issue", pick the Related Asset. 4. Fill Description.
  5. Submit.
- Assert: request appears in My Requests, type "issue".
- **Known failure**: same root cause — Related Asset list is itself
  populated from the broken `/me/assets`, and submit 404s regardless.

## AC-009-c — A newly submitted request starts in the open status

- Target: guest-webapp
- Steps: same as AC-009-a.
- Assert: the new request's status column reads "open".
- **Known failure**: same root cause — no request is ever created.

## AC-010-a — Guest sees the current status of each request they raised

- Target: guest-webapp
- Steps: 1. Sign in as Guest. 2. Submit a request. 3. Go to My Requests.
- Assert: the request row shows status "open".
- **Known failure**: same root cause.

## AC-010-b — Guest cannot see another Guest's requests

- Target: guest-webapp
- Steps: 1. Sign in as Guest, submit a request with a unique description.
  2. Sign in as Guest2. 3. Go to My Requests.
- Assert: Guest2's list does not contain Guest1's description.
- **Known failure**: blocked upstream — Guest1's submission 404s, so there
  is nothing to prove isolation against; the spec fails at setup.

## AC-011-a — Admin views a list of every request raised by every guest

- Target: admin-webapp / guest-webapp
- Steps: 1. Sign in as Guest, submit a request with a unique description.
  2. Sign in as Admin. 3. Go to Requests.
- Assert: the Admin's Requests list contains a row with that description.
- **Known failure**: blocked upstream — no request is ever created to list.

## AC-012-a/b/c — Admin sets a request's status to approved/rejected/resolved

- Target: admin-webapp / guest-webapp
- Steps: 1. Sign in as Guest, submit a request. 2. Sign in as Admin, open
  the request. 3. Click Approve (a), Reject (b), or — after approving —
  the resolve control (c).
- Assert: the request's status badge updates accordingly.
- Source: live UI confirmed Approve/Reject buttons on an open request's
  detail view (via temporary response mocking during exploration, never
  committed).
- **Known failure**: blocked upstream — no request is ever created to
  operate on.

## AC-012-d — Guest sees the updated status after Admin changes it

- Target: guest-webapp / admin-webapp
- Steps: 1. Sign in as Guest, submit a request. 2. Sign in as Admin,
  approve it. 3. Sign in as Guest again, reload My Requests.
- Assert: the request's status now reads "approved".
- **Known failure**: blocked upstream.
