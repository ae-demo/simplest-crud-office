/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// admin-webapp's screens, adapted from thunder-authentication's
// screens.example.ts pattern. Every screen in specs/design/components/
// admin-webapp/wireframes.dsl sits behind the sign-in gate — the DSL declares
// no public flow — so no row here carries `public: true`.
//
// THIS IS THE ONLY FILE THAT KNOWS ABOUT SCREENS. Rail order (sidebar order):
// Assets -> Guest Accounts -> Requests, matching wireframes.dsl's
// `sidebar "Assets -> AssetInventory | Guest Accounts -> GuestAccounts |
// Requests -> RequestQueue"` on every screen.
//
// office-api has no single-resource GET for an asset, a guest account or a
// request. AssetDetail and RequestReview therefore load nothing of their own
// (`loads: null`): they are handed their row via router state from the list
// screen that already fetched it (AssetInventory / RequestQueue), with a
// refetch-and-find-by-id fallback for a direct link or a reload. Neither is in
// the rail, so the only way in is through the list screen's own
// <RequireOperation>, which already gates the one entry point; any signed-in
// caller who lands here may view it.
//
// AssetForm and GuestAccountForm serve create (and, for AssetForm, edit) from
// one page component reached by two routes. A form that only writes names the
// operation its submit makes: both name the CREATE operation, since "Add
// Asset" / "Provision Guest" are how the rail actually reaches them — the edit
// path's PUT is an implementation detail inside the page, not a second entry
// point the rail exposes.

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
  { key: "asset-inventory", label: "Assets", path: "/assets", loads: "GET /assets" },
  {
    key: "asset-form-new",
    label: "Add Asset",
    path: "/assets/new",
    loads: "POST /assets",
  },
  {
    key: "asset-form-edit",
    label: "Edit Asset",
    path: "/assets/:assetId/edit",
    loads: "POST /assets",
  },
  { key: "asset-detail", label: "Asset Detail", path: "/assets/:assetId", loads: null },
  {
    key: "guest-accounts",
    label: "Guest Accounts",
    path: "/guest-accounts",
    loads: "GET /guest-accounts",
  },
  {
    key: "guest-account-form",
    label: "Provision Guest",
    path: "/guest-accounts/new",
    loads: "POST /guest-accounts",
  },
  { key: "request-queue", label: "Requests", path: "/requests", loads: "GET /requests" },
  {
    key: "request-review",
    label: "Request Review",
    path: "/requests/:requestId",
    loads: null,
  },
];

// FAIL LOUDLY, at module load — a committed table that outlived its contract
// cannot become a screen nobody can reach and nobody notices.
for (const screen of SCREEN_ROUTES) {
  if (screen.loads !== null && !isOperationKey(screen.loads)) {
    throw new Error(
      `src/authz/screens.ts: screen "${screen.label}" loads "${screen.loads}", which ` +
        `no contract declares. Re-run \`npm run gen\`, or name the operation the ` +
        `way openapi.yaml spells it.`,
    );
  }
}

/** The screens a caller can actually open, in rail order. */
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

/** Does this caller reach anything their scopes actually earned them? */
export function hasScopedReach(scopes: ReadonlySet<string>, signedIn: boolean): boolean {
  return reachableScreens(scopes, signedIn).some(
    (screen) => !screen.public && screen.loads !== null,
  );
}

/** The rail: one row per screen a nav item should exist for. */
export const RAIL_SCREENS: readonly ScreenRoute[] = [
  SCREEN_ROUTES[0], // Assets
  SCREEN_ROUTES[4], // Guest Accounts
  SCREEN_ROUTES[6], // Requests
];
