import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { handleCallback } from "../authz/session";

/**
 * The one registered redirect URI, serving both the redirect leg and the
 * silent-renew leg (thunder-authentication §"That ONE registered URI serves
 * BOTH legs"). `handleCallback()` calls `signinCallback()`, which dispatches
 * on the stored `request_type` — never `signinRedirectCallback()`, which
 * would leave a silent renew's hidden iframe waiting out its full timeout.
 */
export function CallbackPage(): JSX.Element {
  const [done, setDone] = useState(false);

  useEffect(() => {
    void handleCallback().finally(() => setDone(true));
  }, []);

  if (!done) {
    return (
      <main>
        <p>Signing you in…</p>
      </main>
    );
  }
  return <Navigate to="/" replace />;
}
