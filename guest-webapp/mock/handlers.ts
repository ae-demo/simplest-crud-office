import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/office-api";

type Asset = components["schemas"]["Asset"];
type Request = components["schemas"]["Request"];
type RequestInput = components["schemas"]["RequestInput"];

// The caller this mock speaks for. Seeded rows not owned by this id would
// never show up under /me/... — there is nobody else to compare against in
// this app (guest-webapp never calls the every-row endpoints), but the shape
// is kept for consistency with the pattern every mock follows.
export const mockCaller = {
  userId: "mock-guest-1",
  username: "test-guest",
};

// Held in module scope, not "the server": any full page load (a reload, a
// typed URL) re-runs this module and restores the seed. Only in-app
// navigation carries a change forward.
let assets: Asset[] = [
  {
    id: "asset-1",
    name: "Standing Desk",
    category: "Furniture",
    status: "in-use",
    condition: "good",
    location: "3rd floor",
    assignedToId: mockCaller.userId,
  },
  {
    id: "asset-2",
    name: "Laptop - Dell XPS",
    category: "Electronics",
    status: "in-use",
    condition: "good",
    location: "3rd floor",
    assignedToId: mockCaller.userId,
  },
];

let requests: Request[] = [
  {
    id: "req-1",
    type: "new-equipment",
    status: "open",
    description: "Need a second monitor",
    requestedById: mockCaller.userId,
    assetId: null,
  },
  {
    id: "req-2",
    type: "issue",
    status: "resolved",
    description: "Chair armrest broken",
    requestedById: mockCaller.userId,
    assetId: "asset-1",
  },
];

let nextRequestId = 3;

export const handlers = [
  // The caller's own assigned assets — the path says so. Nothing here checks
  // assets:read: a caller who does not hold it was refused by
  // mock/authz/gateway.ts and never reaches this handler.
  http.get("/api/me/assets", () =>
    HttpResponse.json({ count: assets.length, next: null, previous: null, data: assets }),
  ),

  http.get("/api/me/requests", () =>
    HttpResponse.json({ count: requests.length, next: null, previous: null, data: requests }),
  ),

  http.post("/api/me/requests", async ({ request }) => {
    const input = (await request.json()) as RequestInput;
    if (!input?.type || !input?.description) {
      return HttpResponse.json(
        { code: 400, message: "type and description are required" },
        { status: 400 },
      );
    }
    const created: Request = {
      id: `req-${String(nextRequestId)}`,
      type: input.type,
      status: "open",
      description: input.description,
      requestedById: mockCaller.userId,
      assetId: input.assetId ?? null,
    };
    nextRequestId += 1;
    requests = [...requests, created];
    return HttpResponse.json(created, { status: 201 });
  }),
];
