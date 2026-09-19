// The keys the platform actually emits for this component, and only those:
// this app's own USER_AUTH_* OIDC keys. No sibling API URL — office-api lives
// at same-origin /api (react-webapp's Same-origin API proxy).
export const mockEnv = {
  USER_AUTH_CLIENT_ID: "mock-client",
  USER_AUTH_ISSUER: "https://mock-idp.test",
  // The OIDC scopes are `group` and `ou`, SINGULAR, plus the project's catalog
  // handles — exactly as the platform requests them.
  USER_AUTH_SCOPES:
    "openid profile email group ou assets:read requests:read requests:submit",
  USER_AUTH_RESOURCE: "https://mock-idp.test/resources/mock-project",
};
