// Routing structure prescribed by thunder-authentication's App.example.tsx:
// NoAccess sits ABOVE the shell route and replaces it; Forbidden sits INSIDE
// the shell; every gated route is wrapped in <RequireOperation> with the
// operation taken from SCREEN_ROUTES; /callback sits outside the provider.
// This app declares no public screen (wireframes.dsl draws every screen with
// `role "Admin"`), so nothing is routed above the sign-in guard.
import { useEffect, type ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  AuthzProvider,
  Forbidden,
  NoAccess,
  RequireOperation,
  useAuthz,
  useScopes,
} from "./authz/gates";
import { SCREEN_ROUTES, reachableScreens, hasScopedReach, type ScreenRoute } from "./authz/screens";
import { setForbiddenNavigator } from "./authz/client";
import { signIn } from "./authz/session";
import { AppShellLayout } from "./shell/AppShell";
import { APP_NAME } from "./appName";
import { CallbackPage } from "./pages/Callback";
import { AssetInventoryPage } from "./pages/AssetInventory";
import { AssetFormPage } from "./pages/AssetForm";
import { AssetDetailPage } from "./pages/AssetDetail";
import { GuestAccountsPage } from "./pages/GuestAccounts";
import { GuestAccountFormPage } from "./pages/GuestAccountForm";
import { RequestQueuePage } from "./pages/RequestQueue";
import { RequestReviewPage } from "./pages/RequestReview";

const PAGE_BY_KEY: Record<string, ReactElement> = {
  "asset-inventory": <AssetInventoryPage />,
  "asset-form-new": <AssetFormPage />,
  "asset-form-edit": <AssetFormPage />,
  "asset-detail": <AssetDetailPage />,
  "guest-accounts": <GuestAccountsPage />,
  "guest-account-form": <GuestAccountFormPage />,
  "request-queue": <RequestQueuePage />,
  "request-review": <RequestReviewPage />,
};

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <ForbiddenWiring />
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route
          path="*"
          element={
            <AuthzProvider fallback={<Splash />}>
              <SignedIn />
            </AuthzProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function ForbiddenWiring(): null {
  const navigate = useNavigate();
  useEffect(() => {
    setForbiddenNavigator(() => navigate("/forbidden", { replace: true }));
  }, [navigate]);
  return null;
}

function Splash(): ReactElement {
  return (
    <main>
      <h1>{APP_NAME}</h1>
      <p>Checking your session…</p>
    </main>
  );
}

function SignedIn(): ReactElement {
  const { signedIn } = useAuthz();
  const scopes = useScopes();

  useEffect(() => {
    if (!signedIn) void signIn();
  }, [signedIn]);

  if (!signedIn) return <Splash />;

  const reachable = reachableScreens(scopes, signedIn);

  if (!hasScopedReach(scopes, signedIn)) return <NoAccess appName={APP_NAME} />;

  const landing = (
    reachable.find((s: ScreenRoute) => !s.public && s.loads !== null) ?? reachable[0]
  ).path;

  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route index element={<Navigate to={landing} replace />} />
        {SCREEN_ROUTES.map((screen) => {
          const page = PAGE_BY_KEY[screen.key];
          if (screen.loads === null) {
            return <Route key={screen.key} path={screen.path} element={page} />;
          }
          return (
            <Route
              key={screen.key}
              element={<RequireOperation op={screen.loads} screen={screen.label} />}
            >
              <Route path={screen.path} element={page} />
            </Route>
          );
        })}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<Navigate to={landing} replace />} />
      </Route>
    </Routes>
  );
}
