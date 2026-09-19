// What window._env_ holds in mock mode — exactly the keys the platform emits
// for this component: the four USER_AUTH_* OIDC keys. No sibling API URL: the
// office-api sibling is same-origin `/api`, never a browser key.
export const mockEnv = {
  USER_AUTH_CLIENT_ID: "mock-client",
  USER_AUTH_ISSUER: "https://mock-idp.test",
  USER_AUTH_SCOPES:
    "openid profile email group ou guest-accounts:manage assets:read-all assets:manage requests:read-all requests:manage",
  USER_AUTH_RESOURCE: "https://mock-idp.test/resources/mock-project",
};
