import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  MenuItem,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { officeApi } from "../api";
import type { components } from "../generated/office-api";

type Asset = components["schemas"]["Asset"];
type RequestType = components["schemas"]["RequestInput"]["type"];

const REQUEST_TYPES: readonly RequestType[] = ["new-equipment", "issue"];

/**
 * F2, second stop — raise a new request. The "Related Asset" select is
 * populated from GET /me/assets: the guest's own assigned assets, the only
 * assets a Guest may read (never the full inventory).
 */
export function RequestFormPage(): JSX.Element {
  const navigate = useNavigate();
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [type, setType] = useState<RequestType>("new-equipment");
  const [assetId, setAssetId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    officeApi
      .GET("/me/assets", {})
      .then(({ data }) => {
        if (live) setMyAssets(data?.data ?? []);
      })
      .catch(() => {
        /* the select simply stays empty; not fatal to raising a request */
      });
    return () => {
      live = false;
    };
  }, []);

  async function submit(): Promise<void> {
    setSubmitting(true);
    setError(null);
    try {
      const { error: apiError } = await officeApi.POST("/me/requests", {
        body: {
          type,
          description,
          assetId: assetId || null,
        },
      });
      if (apiError) {
        setError("Could not submit your request. Check the details and try again.");
        return;
      }
      navigate("/requests");
    } catch {
      setError("Could not submit your request. Check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>New Request</PageTitle.Header>
      </PageTitle>

      <Form.Section>
        <Form.Stack>
          <TextField
            select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as RequestType)}
          >
            {REQUEST_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Related Asset (optional)"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {myAssets.map((asset) => (
              <MenuItem key={asset.id} value={asset.id}>
                {asset.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            multiline
            minRows={4}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error ? (
            <Stack sx={{ color: "error.main" }}>{error}</Stack>
          ) : null}

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/requests")}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={submitting || description.trim().length === 0}
              onClick={() => void submit()}
            >
              Submit
            </Button>
          </Stack>
        </Form.Stack>
      </Form.Section>
    </PageContent>
  );
}
