// wireframes.dsl: screen RequestQueue "Every guest request awaiting action"
//   heading "Requests"
//   table "Requested By | Type | Description | Status" -> RequestReview
//
// GET /requests has no requester NAME, only requestedById — filled from one
// extra request to GET /guest-accounts, joined on id.
import { Chip, ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { officeApi } from "../api";
import type { components } from "../generated/office-api";

type Request = components["schemas"]["Request"];

const STATUS_COLOR: Record<Request["status"], "warning" | "success" | "error" | "default"> = {
  open: "warning",
  approved: "success",
  rejected: "error",
  resolved: "default",
};

export function RequestQueuePage(): JSX.Element {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [nameById, setNameById] = useState<Record<string, string>>({});

  useEffect(() => {
    let live = true;
    void Promise.all([
      officeApi.GET("/requests", { params: { query: {} } }),
      officeApi.GET("/guest-accounts", { params: { query: {} } }),
    ]).then(([requestsRes, guestsRes]) => {
      if (!live) return;
      if (requestsRes.data) setRequests(requestsRes.data.data);
      const byId: Record<string, string> = {};
      for (const guest of guestsRes.data?.data ?? []) byId[guest.id] = guest.name;
      setNameById(byId);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Requests</PageTitle.Header>
      </PageTitle>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Requested By</ListingTable.Cell>
              <ListingTable.Cell>Type</ListingTable.Cell>
              <ListingTable.Cell>Description</ListingTable.Cell>
              <ListingTable.Cell>Status</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {requests !== null && requests.length === 0 && (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={4}>
                  <ListingTable.EmptyState
                    title="No requests"
                    description="Guest requests will appear here once submitted."
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            )}
            {(requests ?? []).map((request) => (
              <ListingTable.Row
                key={request.id}
                clickable
                onClick={() => navigate(`/requests/${request.id}`, { state: { request } })}
              >
                <ListingTable.Cell>{nameById[request.requestedById] ?? request.requestedById}</ListingTable.Cell>
                <ListingTable.Cell>{request.type}</ListingTable.Cell>
                <ListingTable.Cell>{request.description || "—"}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Chip label={request.status} size="small" color={STATUS_COLOR[request.status]} />
                </ListingTable.Cell>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
