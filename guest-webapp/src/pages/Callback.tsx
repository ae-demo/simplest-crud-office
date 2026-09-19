import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { handleCallback } from "../authz/session";
import { APP_NAME } from "../appName";

/**
 * The ONE registered redirect URI, serving both the redirect leg and the
 * silent-renew leg (thunder-authentication). Renders from the callback promise
 * SETTLING, never from a value.
 */
export function CallbackPage(): JSX.Element {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let live = true;
    void handleCallback().finally(() => {
      if (live) setDone(true);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!done) {
    return (
      <main>
        <h1>{APP_NAME}</h1>
        <p>Signing you in…</p>
      </main>
    );
  }

  return <Navigate to="/" replace />;
}
