import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { Plus } from "@wso2/oxygen-ui-icons-react";
import { officeApi } from "../api";
import { Can } from "../authz/gates";
import type { components } from "../generated/office-api";

type Request = components["schemas"]["Request"];

const STATUS_COLOR: Record<Request["status"], "warning" | "info" | "error" | "success"> = {
  open: "warning",
  approved: "info",
  rejected: "error",
  resolved: "success",
};

/** F2, first stop — the requests the signed-in Guest has raised. */
export function MyRequestsPage(): JSX.Element {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    officeApi
      .GET("/me/requests", {})
      .then(({ data, error: apiError }) => {
        if (!live) return;
        if (apiError) {
          setError("Could not load your requests.");
          return;
        }
        setRequests(data?.data ?? []);
      })
      .catch(() => {
        if (live) setError("Could not load your requests.");
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>My Requests</PageTitle.Header>
        <PageTitle.Actions>
          <Can op="POST /me/requests">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate("/requests/new")}
            >
              New Request
            </Button>
          </Can>
        </PageTitle.Actions>
      </PageTitle>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Type</ListingTable.Cell>
              <ListingTable.Cell>Description</ListingTable.Cell>
              <ListingTable.Cell>Status</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {requests?.map((request) => (
              <ListingTable.Row
                key={request.id}
                clickable
                onClick={() => navigate(`/requests/${request.id}`, { state: { request } })}
              >
                <ListingTable.Cell>{request.type}</ListingTable.Cell>
                <ListingTable.Cell>{request.description}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Chip label={request.status} color={STATUS_COLOR[request.status]} size="small" />
                </ListingTable.Cell>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
        {requests?.length === 0 ? (
          <ListingTable.EmptyState
            title="No requests yet"
            description={error ?? "Raise a request to see it tracked here."}
          />
        ) : null}
      </ListingTable.Container>
    </PageContent>
  );
}
