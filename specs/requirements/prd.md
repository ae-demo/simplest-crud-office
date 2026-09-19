# simplest-crud-office — PRD

## Problem Statement

Office managers today track equipment and employee requests informally — spreadsheets, email threads, or verbal check-ins — with no shared, authoritative record of what equipment exists, who holds it, or what employees are waiting on. This makes inventory easy to lose track of and requests easy to drop.

## Solution

A simple office-management system with two web apps sharing one sign-in: an Admin app for managing the full equipment inventory and employee accounts, and a Guest app where employees see their own assigned equipment and submit requests. Nothing here talks to any service outside the system itself.

## Actors

- **Admin**: office manager, signed in through the shared IDP. Manages the full asset inventory (create, view, update, delete) and provisions Guest accounts. Reviews and resolves Guest requests.
- **Guest**: an office employee, signed in through the shared IDP with an account an Admin provisioned. Sees only the assets assigned to them and their own requests; submits new requests and tracks their status.

## User Stories

1. As an Admin, I want to sign in through the shared IDP, so that I can access the admin app securely.
2. As an Admin, I want to provision Guest accounts, so that employees can access the guest app.
3. As an Admin, I want to create asset records, so that the office inventory is tracked from the start.
4. As an Admin, I want to view the full list of assets, so that I can see everything in inventory at a glance.
5. As an Admin, I want to update an asset record, so that I can keep its details current — reassigning it, changing its status, or fixing its info.
6. As an Admin, I want to delete an asset record, so that retired or disposed items no longer appear in inventory.
7. As a Guest, I want to sign in through the shared IDP, so that I can access the guest app.
8. As a Guest, I want to view the assets currently assigned to me, so that I know what equipment I'm responsible for.
9. As a Guest, I want to submit a request, so that Admin can act on something I need (new equipment or an issue with something I already have).
10. As a Guest, I want to view the status of my own requests, so that I know whether they've been addressed.
11. As an Admin, I want to view all Guest requests, so that I can see what needs action across the office.
12. As an Admin, I want to update a request's status, so that the Guest who raised it knows the outcome.

## Product Decisions

- **Sign-in**: both the Guest app and the Admin app authenticate through the shared platform IDP (Thunder SSO) — one identity, two apps.
- **Guest accounts are provisioned by Admin**, not self-service — an employee cannot sign up on their own; an Admin must create their account first.
- **No external integrations**: the system makes no API calls to anything outside itself — no email, no third-party inventory or ticketing service. All data lives in this system alone.
- **Asset record fields**: name, category, status (e.g. in use, available, retired), condition, location, and assigned owner.
- **Guest request has a type**: either "new equipment" or "issue with an assigned asset".
- **Request status values**: open, approved, rejected, resolved.
- **Single Admin role**: every Admin account has identical permissions — no finer-grained admin tiers.

## Out of Scope

- Guest self-registration (accounts are always Admin-provisioned).
- Email or push notifications when a request's status changes.
- Multi-step or multi-approver workflows on requests — a single status field is all that changes.
- Multi-office or multi-location inventory — one shared inventory only.
- Any integration with an external asset-management, ticketing, or identity service other than the shared platform IDP.

## Open Questions

None at this time.

