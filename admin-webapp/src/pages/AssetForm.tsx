// wireframes.dsl: screen AssetForm "Create or edit an asset record"
//   heading "Asset Details"
//   input Name | input Category | select Status | input Condition |
//   input Location | select Assigned To
//   row: right | button Cancel -> AssetInventory | button Save primary -> AssetInventory
//
// One page serves both routes SCREEN_ROUTES declares for it: /assets/new
// (create, reached from "Add Asset") and /assets/:assetId/edit (reached from
// AssetDetail's "Edit"). office-api has no GET /assets/{id}, so an edit visit
// is handed its row via router state from AssetDetail; a direct/reloaded visit
// re-fetches GET /assets and finds it by id — the same fallback AssetDetail
// itself uses.
import {
  Button,
  Form,
  MenuItem,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { officeApi } from "../api";
import type { components } from "../generated/office-api";

type Asset = components["schemas"]["Asset"];
type GuestAccount = components["schemas"]["GuestAccount"];
const STATUS_OPTIONS = ["available", "in-use", "retired"] as const;

interface FormState {
  name: string;
  category: string;
  status: Asset["status"];
  condition: string;
  location: string;
  assignedToId: string;
}

const EMPTY: FormState = {
  name: "",
  category: "",
  status: "available",
  condition: "",
  location: "",
  assignedToId: "",
};

export function AssetFormPage(): ReactElement {
  const { assetId } = useParams<{ assetId: string }>();
  const isEdit = Boolean(assetId);
  const navigate = useNavigate();
  const location = useLocation();
  const stateAsset = (location.state as { asset?: Asset } | null)?.asset;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [guests, setGuests] = useState<GuestAccount[]>([]);
  const [loading, setLoading] = useState(isEdit && !stateAsset);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void officeApi
      .GET("/guest-accounts", { params: { query: { limit: 100 } } })
      .then((res) => setGuests(res.data?.data ?? []));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    if (stateAsset) {
      applyAsset(stateAsset);
      return;
    }
    // No router state — a direct link or a reload. Refetch the list and find
    // the row by id: office-api declares no GET /assets/{id}.
    let live = true;
    void officeApi.GET("/assets", { params: { query: { limit: 100 } } }).then((res) => {
      if (!live) return;
      const found = res.data?.data.find((a) => a.id === assetId);
      if (found) applyAsset(found);
      else setError("This asset could not be found.");
      setLoading(false);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  function applyAsset(asset: Asset): void {
    setForm({
      name: asset.name,
      category: asset.category,
      status: asset.status,
      condition: asset.condition,
      location: asset.location ?? "",
      assignedToId: asset.assignedToId ?? "",
    });
    setLoading(false);
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      name: form.name,
      category: form.category,
      status: form.status,
      condition: form.condition,
      location: form.location || undefined,
      assignedToId: form.assignedToId || null,
    };
    const res =
      isEdit && assetId
        ? await officeApi.PUT("/assets/{assetId}", { params: { path: { assetId } }, body })
        : await officeApi.POST("/assets", { body });
    setSaving(false);
    if (res.error) {
      setError("Could not save this asset. Check the fields and try again.");
      return;
    }
    navigate("/assets");
  }

  if (loading) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Asset Details</PageTitle.Header>
        </PageTitle>
        <Typography>Loading…</Typography>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Asset Details</PageTitle.Header>
      </PageTitle>

      <form onSubmit={(event) => void handleSubmit(event)}>
        <Form.Section>
          <Form.Stack>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="Name"
              value={form.name}
              required
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <TextField
              label="Category"
              value={form.category}
              required
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            />
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as Asset["status"] })}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Condition"
              value={form.condition}
              required
              onChange={(event) => setForm({ ...form, condition: event.target.value })}
            />
            <TextField
              label="Location"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
            />
            <TextField
              select
              label="Assigned To"
              value={form.assignedToId}
              onChange={(event) => setForm({ ...form, assignedToId: event.target.value })}
            >
              <MenuItem value="">—</MenuItem>
              {guests.map((guest) => (
                <MenuItem key={guest.id} value={guest.id}>
                  {guest.name}
                </MenuItem>
              ))}
            </TextField>
          </Form.Stack>
        </Form.Section>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate("/assets")}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            Save
          </Button>
        </Stack>
      </form>
    </PageContent>
  );
}
