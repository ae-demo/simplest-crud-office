// wireframes.dsl: screen AssetInventory
//   row: heading "Asset Inventory" | right | search "Search assets" |
//        button "Add Asset" primary -> AssetForm
//   table "Name | Category | Status | Condition | Location | Assigned To" -> AssetDetail
//
// GET /assets has no "assigned to" NAME, only assignedToId — filled from one
// extra request to GET /guest-accounts, joined on id (wireframes'
// implementing.md: a name column not in the list is filled from one more
// list request, never one per row).
import {
  Button,
  Chip,
  InputAdornment,
  ListingTable,
  PageContent,
  PageTitle,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { Plus, Search } from "@wso2/oxygen-ui-icons-react";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { officeApi } from "../api";
import { Can } from "../authz/gates";
import type { components } from "../generated/office-api";

type Asset = components["schemas"]["Asset"];

const STATUS_COLOR: Record<Asset["status"], "success" | "default" | "warning"> = {
  available: "success",
  "in-use": "default",
  retired: "warning",
};

export function AssetInventoryPage(): ReactElement {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [guestNameById, setGuestNameById] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void Promise.all([
      officeApi.GET("/assets", { params: { query: { limit: 100 } } }),
      officeApi.GET("/guest-accounts", { params: { query: { limit: 100 } } }),
    ])
      .then(([assetsRes, guestsRes]) => {
        if (!live) return;
        if (assetsRes.error || !assetsRes.data) throw new Error("assets");
        setAssets(assetsRes.data.data);
        const byId: Record<string, string> = {};
        for (const guest of guestsRes.data?.data ?? []) byId[guest.id] = guest.name;
        setGuestNameById(byId);
      })
      .catch(() => live && setError("Could not load the asset inventory."));
    return () => {
      live = false;
    };
  }, []);

  const rows = useMemo(() => {
    const list = assets ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((asset) => asset.name.toLowerCase().includes(q)) : list;
  }, [assets, query]);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Asset Inventory</PageTitle.Header>
        <PageTitle.Actions>
          <TextField
            placeholder="Search assets"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Can op="POST /assets">
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate("/assets/new")}>
              Add Asset
            </Button>
          </Can>
        </PageTitle.Actions>
      </PageTitle>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Name</ListingTable.Cell>
              <ListingTable.Cell>Category</ListingTable.Cell>
              <ListingTable.Cell>Status</ListingTable.Cell>
              <ListingTable.Cell>Condition</ListingTable.Cell>
              <ListingTable.Cell>Location</ListingTable.Cell>
              <ListingTable.Cell>Assigned To</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {assets !== null && rows.length === 0 && (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={6}>
                  <ListingTable.EmptyState
                    title="No assets yet"
                    description="Add the first asset to the inventory."
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            )}
            {rows.map((asset) => (
              <ListingTable.Row
                key={asset.id}
                clickable
                onClick={() => navigate(`/assets/${asset.id}`, { state: { asset } })}
              >
                <ListingTable.Cell>{asset.name}</ListingTable.Cell>
                <ListingTable.Cell>{asset.category}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Chip label={asset.status} size="small" color={STATUS_COLOR[asset.status]} />
                </ListingTable.Cell>
                <ListingTable.Cell>{asset.condition}</ListingTable.Cell>
                <ListingTable.Cell>{asset.location || "—"}</ListingTable.Cell>
                <ListingTable.Cell>
                  {asset.assignedToId ? guestNameById[asset.assignedToId] ?? "—" : "—"}
                </ListingTable.Cell>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
