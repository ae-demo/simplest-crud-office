// Mock office-api, for admin-webapp's own screens. The contract is
// specs/design/components/office-api/openapi.yaml — the same document
// src/generated/office-api.ts came from. Whether an operation may be called
// at all is mock/authz/gateway.ts's answer, read from that same contract; this
// file only owns each path's REACH, exactly as the real service would.
//
// State lives in MODULE SCOPE, not a server: any full page load (reload, a
// typed/opened URL, a link that leaves the SPA) re-runs this module and puts
// the seed data back. Only in-app navigation carries a change forward.
//
// Admin holds guest-accounts:manage, assets:read-all, assets:manage,
// requests:read-all and requests:manage — every operation this app's screens
// call is an every-row operation (none of office-api's `/me/…` paths), so no
// handler here resolves rows against a caller identity.
//
// Seed rows mirror wireframes.dsl's example data 1:1 (wireframes/scripts/seed.mjs),
// so the mock screen agrees with the rendered wireframe by construction.
import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/office-api";

type Asset = components["schemas"]["Asset"];
type GuestAccount = components["schemas"]["GuestAccount"];
type Request = components["schemas"]["Request"];

let guestAccounts: GuestAccount[] = [
  { id: "guest-1", name: "Jane Doe", email: "jane@acme.com", active: true },
  { id: "guest-2", name: "Sam Lee", email: "sam@acme.com", active: true },
];

let assets: Asset[] = [
  {
    id: "asset-1",
    name: "Standing Desk",
    category: "Furniture",
    status: "in-use",
    condition: "good",
    location: "3rd Floor",
    assignedToId: "guest-1",
  },
  {
    id: "asset-2",
    name: "Laptop - Dell XPS",
    category: "Electronics",
    status: "available",
    condition: "good",
    location: "Storage",
    assignedToId: null,
  },
  {
    id: "asset-3",
    name: "Office Chair",
    category: "Furniture",
    status: "retired",
    condition: "worn",
    location: "",
    assignedToId: null,
  },
];

let requests: Request[] = [
  {
    id: "request-1",
    type: "new-equipment",
    status: "open",
    description: "Need a second monitor",
    requestedById: "guest-1",
    assetId: null,
  },
  {
    id: "request-2",
    type: "issue",
    status: "open",
    description: "Laptop battery not charging",
    requestedById: "guest-2",
    assetId: "asset-1",
  },
  {
    id: "request-3",
    type: "issue",
    status: "resolved",
    description: "Chair armrest broken",
    requestedById: "guest-1",
    assetId: null,
  },
];

let nextAssetId = assets.length + 1;
let nextGuestId = guestAccounts.length + 1;

export const handlers = [
  // -- guest accounts ---------------------------------------------------------
  http.get("/api/guest-accounts", () =>
    HttpResponse.json({ count: guestAccounts.length, next: null, previous: null, data: guestAccounts }),
  ),

  http.post("/api/guest-accounts", async ({ request }) => {
    const input = (await request.json()) as { name?: string; email?: string; active?: boolean };
    if (!input?.name || !input?.email) {
      return HttpResponse.json({ code: 400, message: "name and email are required" }, { status: 400 });
    }
    const created: GuestAccount = {
      id: `guest-${nextGuestId++}`,
      name: input.name,
      email: input.email,
      active: input.active ?? true,
    };
    guestAccounts = [...guestAccounts, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/guest-accounts/:accountId", async ({ request, params }) => {
    const input = (await request.json()) as { name?: string; email?: string; active?: boolean };
    const idx = guestAccounts.findIndex((g) => g.id === params.accountId);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: "no such guest account" }, { status: 404 });
    }
    const updated: GuestAccount = { ...guestAccounts[idx], ...input } as GuestAccount;
    guestAccounts = guestAccounts.map((g) => (g.id === updated.id ? updated : g));
    return HttpResponse.json(updated);
  }),

  http.delete("/api/guest-accounts/:accountId", ({ params }) => {
    const before = guestAccounts.length;
    guestAccounts = guestAccounts.filter((g) => g.id !== params.accountId);
    return before === guestAccounts.length
      ? HttpResponse.json({ code: 404, message: "no such guest account" }, { status: 404 })
      : new HttpResponse(null, { status: 204 });
  }),

  // -- assets -------------------------------------------------------------
  http.get("/api/assets", ({ request }) => {
    const status = new URL(request.url).searchParams.get("status");
    const data = status ? assets.filter((a) => a.status === status) : assets;
    return HttpResponse.json({ count: data.length, next: null, previous: null, data });
  }),

  http.post("/api/assets", async ({ request }) => {
    const input = (await request.json()) as Partial<Asset>;
    if (!input?.name || !input?.category || !input?.status || !input?.condition) {
      return HttpResponse.json(
        { code: 400, message: "name, category, status and condition are required" },
        { status: 400 },
      );
    }
    const created: Asset = {
      id: `asset-${nextAssetId++}`,
      name: input.name,
      category: input.category,
      status: input.status,
      condition: input.condition,
      location: input.location ?? "",
      assignedToId: input.assignedToId ?? null,
    };
    assets = [...assets, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/assets/:assetId", async ({ request, params }) => {
    const input = (await request.json()) as Partial<Asset>;
    const idx = assets.findIndex((a) => a.id === params.assetId);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: "no such asset" }, { status: 404 });
    }
    const updated: Asset = { ...assets[idx], ...input, id: assets[idx].id };
    assets = assets.map((a) => (a.id === updated.id ? updated : a));
    return HttpResponse.json(updated);
  }),

  http.delete("/api/assets/:assetId", ({ params }) => {
    const before = assets.length;
    assets = assets.filter((a) => a.id !== params.assetId);
    return before === assets.length
      ? HttpResponse.json({ code: 404, message: "no such asset" }, { status: 404 })
      : new HttpResponse(null, { status: 204 });
  }),

  // -- requests -------------------------------------------------------------
  http.get("/api/requests", ({ request }) => {
    const status = new URL(request.url).searchParams.get("status");
    const data = status ? requests.filter((r) => r.status === status) : requests;
    return HttpResponse.json({ count: data.length, next: null, previous: null, data });
  }),

  http.put("/api/requests/:requestId/status", async ({ request, params }) => {
    const input = (await request.json()) as { status?: Request["status"] };
    const idx = requests.findIndex((r) => r.id === params.requestId);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: "no such request" }, { status: 404 });
    }
    if (!input?.status) {
      return HttpResponse.json({ code: 400, message: "status is required" }, { status: 400 });
    }
    const updated: Request = { ...requests[idx], status: input.status };
    requests = requests.map((r) => (r.id === updated.id ? updated : r));
    return HttpResponse.json(updated);
  }),
];
