import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/office-api";
import { authorizationHeader, classifyResponse, ForbiddenError } from "./authz/client";

// Same-origin: nginx in this pod reverse-proxies /api to office-api through the
// API gateway (OFFICE_API_GATEWAY_URL, preferred) or directly (OFFICE_API_URL).
// There is no browser-visible API host — see react-webapp's Same-origin API
// proxy section.
export const officeApi = createClient<paths>({ baseUrl: "/api" });

// The 401 rule lives in src/authz/client.ts and nowhere else: this client adds
// NOTHING of its own about authorization, it only attaches the bearer and
// hands every response to classifyResponse().
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const header = await authorizationHeader();
    if (header) request.headers.set("Authorization", header);
    return request;
  },
  async onResponse({ response }) {
    if ((await classifyResponse(response.status)) === "forbidden") {
      throw new ForbiddenError(response.status);
    }
    return response;
  },
};

officeApi.use(authMiddleware);
