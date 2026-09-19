// The office-api client. Same-origin `/api`: nginx in this pod reverse-proxies
// to the sibling's gateway address (see nginx/15-aep-api-proxy.sh). Generated
// types come from the committed OpenAPI contract — never hand-written shapes.
//
// Authorization is NOT this module's job: the middleware below calls straight
// into src/authz/client.ts's authorizationHeader()/classifyResponse(), which
// hold the one 401 rule the whole app shares. Nothing here decides what an
// unauthorized answer means.
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/office-api";
import { authorizationHeader, classifyResponse, ForbiddenError } from "./authz/client";

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

export const officeApi = createClient<paths>({ baseUrl: "/api" });
officeApi.use(authMiddleware);
