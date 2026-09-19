import { useEffect, useState, type JSX } from "react";
import {
  Chip,
  ListingTable,
  PageContent,
  PageTitle,
} from "@wso2/oxygen-ui";
import { officeApi } from "../api";
import type { components } from "../generated/office-api";

type Asset = components["schemas"]["Asset"];

const STATUS_COLOR: Record<Asset["status"], "success" | "warning" | "default"> = {
  available: "success",
  "in-use": "warning",
  retired: "default",
};

/** F1 — the equipment currently assigned to the signed-in Guest. */
export function MyAssetsPage(): JSX.Element {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    officeApi
      .GET("/me/assets", {})
      .then(({ data, error: apiError }) => {
        if (!live) return;
        if (apiError) {
          setError("Could not load your assets.");
          return;
        }
        setAssets(data?.data ?? []);
      })
      .catch(() => {
        if (live) setError("Could not load your assets.");
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>My Assets</PageTitle.Header>
      </PageTitle>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Name</ListingTable.Cell>
              <ListingTable.Cell>Category</ListingTable.Cell>
              <ListingTable.Cell>Status</ListingTable.Cell>
              <ListingTable.Cell>Condition</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {assets?.map((asset) => (
              <ListingTable.Row key={asset.id}>
                <ListingTable.Cell>{asset.name}</ListingTable.Cell>
                <ListingTable.Cell>{asset.category}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Chip label={asset.status} color={STATUS_COLOR[asset.status]} size="small" />
                </ListingTable.Cell>
                <ListingTable.Cell>{asset.condition}</ListingTable.Cell>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
        {assets?.length === 0 ? (
          <ListingTable.EmptyState
            title="No assets assigned"
            description={error ?? "You have no equipment assigned to you yet."}
          />
        ) : null}
      </ListingTable.Container>
    </PageContent>
  );
}
