// wireframes.dsl: screen RequestReview "Approve, reject or resolve one request"
//   heading "Request from <name>"
//   text Type / Description
//   badge <status>
//   row: right | button Reject danger -> RequestQueue | button Approve primary -> RequestQueue
//
// office-api has no GET /requests/{id}: reached from RequestQueue's table with
// the row carried as router state; a direct link or a reload re-fetches
// GET /requests and finds it by id. src/authz/screens.ts gates this screen's
// only entry point (RequestQueue) on GET /requests, so `loads: null` here is
// correct — the Approve/Reject buttons name their own operation via <Can>.
//
// The wireframe draws only Reject/Approve; "resolved" is a status the API
// also accepts (RequestStatusUpdate) but no button in this screen sets it, so
// none is built here — resolving a request is not a control this wireframe
// draws.
import { Button, Chip, PageContent, PageTitle, Stack, Typography } from "@wso2/oxygen-ui";
import { useEffect, useState, type JSX } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { officeApi } from "../api";
import { Can } from "../authz/gates";
import type { components } from "../generated/office-api";

type Request = components["schemas"]["Request"];

const STATUS_COLOR: Record<Request["status"], "warning" | "success" | "error" | "default"> = {
  open: "warning",
  approved: "success",
  rejected: "error",
  resolved: "default",
};

export function RequestReviewPage(): JSX.Element {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateRequest = (location.state as { request?: Request } | null)?.request;

  const [request, setRequest] = useState<Request | null>(stateRequest ?? null);
  const [requesterName, setRequesterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(!stateRequest);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (stateRequest) return;
    let live = true;
    void officeApi.GET("/requests", { params: { query: {} } }).then((res) => {
      if (!live) return;
      setRequest(res.data?.data.find((r) => r.id === requestId) ?? null);
      setLoading(false);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    if (!request) return;
    let live = true;
    void officeApi.GET("/guest-accounts", { params: { query: {} } }).then((res) => {
      if (!live) return;
      const guest = res.data?.data.find((g) => g.id === request.requestedById);
      setRequesterName(guest?.name ?? null);
    });
    return () => {
      live = false;
    };
  }, [request]);

  async function setStatus(status: "approved" | "rejected"): Promise<void> {
    if (!requestId) return;
    setUpdating(true);
    try {
      await officeApi.PUT("/requests/{requestId}/status", {
        params: { path: { requestId } },
        body: { status },
      });
      navigate("/requests");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Request Review</PageTitle.Header>
        </PageTitle>
        <Typography>Loading…</Typography>
      </PageContent>
    );
  }

  if (!request) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Request Review</PageTitle.Header>
        </PageTitle>
        <Typography color="error">This request could not be found.</Typography>
      </PageContent>
    );
  }

  return (
    <PageContent maxWidth={640}>
      <PageTitle>
        <PageTitle.Header>Request from {requesterName ?? request.requestedById}</PageTitle.Header>
        <PageTitle.Actions>
          <Chip label={request.status} color={STATUS_COLOR[request.status]} />
        </PageTitle.Actions>
      </PageTitle>

      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography>Type: {request.type}</Typography>
        <Typography>Description: {request.description || "—"}</Typography>
      </Stack>

      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Can op="PUT /requests/{requestId}/status">
          <Button
            variant="outlined"
            color="error"
            disabled={updating}
            onClick={() => void setStatus("rejected")}
          >
            Reject
          </Button>
        </Can>
        <Can op="PUT /requests/{requestId}/status">
          <Button variant="contained" disabled={updating} onClick={() => void setStatus("approved")}>
            Approve
          </Button>
        </Can>
      </Stack>
    </PageContent>
  );
}
