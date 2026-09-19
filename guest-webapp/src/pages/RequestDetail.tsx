import { useEffect, useState, type JSX } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Chip, PageContent, PageTitle, Stack, Typography } from "@wso2/oxygen-ui";
import { officeApi } from "../api";
import type { components } from "../generated/office-api";

type Request = components["schemas"]["Request"];

const STATUS_COLOR: Record<Request["status"], "warning" | "info" | "error" | "success"> = {
  open: "warning",
  approved: "info",
  rejected: "error",
  resolved: "success",
};

/**
 * F2, last stop — one of the Guest's own requests and its current status.
 *
 * office-api's contract has no `GET /me/requests/{id}` — only the list
 * operation. Reached from MyRequests, the row rides router state and needs no
 * extra call; reached directly (a reload, a typed or bookmarked URL) this
 * refetches `GET /me/requests` — the same operation the screen is gated on —
 * and finds the row by id.
 */
export function RequestDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateRequest = (location.state as { request?: Request } | null)?.request;

  const [request, setRequest] = useState<Request | null>(stateRequest ?? null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (stateRequest) return;
    let live = true;
    officeApi
      .GET("/me/requests", {})
      .then(({ data }) => {
        if (!live) return;
        const found = data?.data.find((r) => r.id === id) ?? null;
        setRequest(found);
        if (!found) setNotFound(true);
      })
      .catch(() => {
        if (live) setNotFound(true);
      });
    return () => {
      live = false;
    };
    // Only re-run if the id in the URL changes; stateRequest is a one-time seed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Request Details</PageTitle.Header>
      </PageTitle>

      {request ? (
        <Stack spacing={2}>
          <Typography>Type: {request.type}</Typography>
          <Typography>Description: {request.description}</Typography>
          <Chip label={request.status} color={STATUS_COLOR[request.status]} size="small" sx={{ width: "fit-content" }} />
        </Stack>
      ) : notFound ? (
        <Typography color="text.secondary">This request could not be found among yours.</Typography>
      ) : (
        <Typography color="text.secondary">Loading…</Typography>
      )}
    </PageContent>
  );
}
