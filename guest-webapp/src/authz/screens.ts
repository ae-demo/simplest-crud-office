// THIS IS THE ONLY FILE THAT KNOWS ABOUT SCREENS. See thunder-authentication
// §5 — a screen is gated on the operation it LOADS, and that operation's scope
// is already in openapi.yaml, projected into ./operations.gen.ts.
//
// guest-webapp has one role, Guest, and every screen sits behind the sign-in
// gate (wireframes.dsl draws no public flow). RequestDetail has no dedicated
// GET in office-api's contract — there is no `GET /me/requests/{id}` — so it is
// gated on the same operation that populates it: the page either receives the
// row via router state from MyRequests, or (a direct visit / reload) refetches
// `GET /me/requests` and finds the row by id. Naming that operation here keeps
// the rail, the route guard and the page's own data fetch in step.
//
// THE ORDER OF THIS TABLE IS THE RAIL'S ORDER: My Assets, then My Requests, per
// wireframes.dsl's sidebar ("My Assets -> MyAssets | My Requests -> MyRequests")
// and its flow order (F1 My assets, F2 Raise and track a request). RequestForm
// and RequestDetail are reached from MyRequests, not from the rail.

import { canCall } from "./core";
import { OPERATIONS, isOperationKey, type OperationKey } from "./operations.gen";

export interface ScreenRoute {
  readonly key: string;
  readonly label: string;
  readonly path: string;
  readonly loads: OperationKey | null;
  readonly public?: boolean;
}

export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  { key: "myassets", label: "My Assets", path: "/assets", loads: "GET /me/assets" },
  { key: "myrequests", label: "My Requests", path: "/requests", loads: "GET /me/requests" },
  // A form that only writes names the operation its submit makes.
  { key: "requestform", label: "New Request", path: "/requests/new", loads: "POST /me/requests" },
  // No dedicated GET exists for one request; gated on the same list operation
  // MyRequests loads (see the file header).
  { key: "requestdetail", label: "Request Details", path: "/requests/:id", loads: "GET /me/requests" },
];

for (const screen of SCREEN_ROUTES) {
  if (screen.loads !== null && !isOperationKey(screen.loads)) {
    throw new Error(
      `src/authz/screens.ts: screen "${screen.label}" loads "${screen.loads}", which ` +
        `no contract declares. Re-run \`npm run gen\`, or name the operation the ` +
        `way openapi.yaml spells it.`,
    );
  }
}

export function reachableScreens(
  scopes: ReadonlySet<string>,
  signedIn: boolean,
): readonly ScreenRoute[] {
  return SCREEN_ROUTES.filter((screen) => {
    if (screen.public) return true;
    if (screen.loads === null) return signedIn;
    return canCall(OPERATIONS[screen.loads], scopes, signedIn);
  });
}

export function hasScopedReach(scopes: ReadonlySet<string>, signedIn: boolean): boolean {
  return reachableScreens(scopes, signedIn).some((screen) => !screen.public && screen.loads !== null);
}
