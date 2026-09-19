// wireframes.dsl: screen AssetDetail "One asset's full record"
//   heading <asset name>
//   text Category / Status / Condition / Location / Assigned To
//   row: right | button Edit -> AssetForm | button Delete danger -> AssetInventory
//
// office-api has no GET /assets/{id}. This screen is reached from
// AssetInventory's table with the row carried as router state; a direct link
// or a reload re-fetches GET /assets and finds the row by id — the fallback
// AssetForm's edit path also uses. src/authz/screens.ts gates this screen's
// only entry point (AssetInventory) on GET /assets, so `loads: null` here is
// correct: any caller who reached this page already passed that gate.
import {
  Button,
  PageContent,
  PageTitle,
  Stack,
  Typography,
} from "@wso2/oxygen-ui";
import { Pencil, Trash2 } from "@wso2/oxygen-ui-icons-react";
import { useEffect, useState, type ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { officeApi } from "../api";
import { Can } from "../authz/gates";
import type { components } from "../generated/office-api";

type Asset = components["schemas"]["Asset"];
type GuestAccount = components["schemas"]["GuestAccount"];

export function AssetDetailPage(): ReactElement {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateAsset = (location.state as { asset?: Asset } | null)?.asset;

  const [asset, setAsset] = useState<Asset | null>(stateAsset ?? null);
  const [assignedToName, setAssignedToName] = useState<string | null>(null);
  const [loading, setLoading] = useState(!stateAsset);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (stateAsset) return;
    let live = true;
    void officeApi.GET("/assets", { params: { query: { limit: 100 } } }).then((res) => {
      if (!live) return;
      const found = res.data?.data.find((a) => a.id === assetId);
      if (found) setAsset(found);
      else setError("This asset could not be found.");
      setLoading(false);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  useEffect(() => {
    if (!asset?.assignedToId) return;
    let live = true;
    void officeApi.GET("/guest-accounts", { params: { query: { limit: 100 } } }).then((res) => {
      if (!live) return;
      const guest = res.data?.data.find((g: GuestAccount) => g.id === asset.assignedToId);
      setAssignedToName(guest?.name ?? null);
    });
    return () => {
      live = false;
    };
  }, [asset?.assignedToId]);

  async function handleDelete(): Promise<void> {
    if (!assetId) return;
    setDeleting(true);
    const res = await officeApi.DELETE("/assets/{assetId}", { params: { path: { assetId } } });
    setDeleting(false);
    if (res.error) {
      setError("Could not delete this asset.");
      return;
    }
    navigate("/assets");
  }

  if (loading) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Asset Detail</PageTitle.Header>
        </PageTitle>
        <Typography>Loading…</Typography>
      </PageContent>
    );
  }

  if (!asset) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Asset Detail</PageTitle.Header>
        </PageTitle>
        <Typography color="error">{error ?? "This asset could not be found."}</Typography>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>{asset.name}</PageTitle.Header>
        <PageTitle.Actions>
          <Can op="PUT /assets/{assetId}">
            <Button
              variant="outlined"
              startIcon={<Pencil size={18} />}
              onClick={() => navigate(`/assets/${asset.id}/edit`, { state: { asset } })}
            >
              Edit
            </Button>
          </Can>
          <Can op="DELETE /assets/{assetId}">
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={18} />}
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          </Can>
        </PageTitle.Actions>
      </PageTitle>

      {error && <Typography color="error">{error}</Typography>}

      <Stack spacing={1}>
        <Typography>Category: {asset.category}</Typography>
        <Typography>Status: {asset.status}</Typography>
        <Typography>Condition: {asset.condition}</Typography>
        <Typography>Location: {asset.location || "—"}</Typography>
        <Typography>Assigned To: {asset.assignedToId ? assignedToName ?? "…" : "—"}</Typography>
      </Stack>
    </PageContent>
  );
}
