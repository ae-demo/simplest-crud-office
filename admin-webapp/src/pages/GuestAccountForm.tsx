import { useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  FormControlLabel,
  PageContent,
  PageTitle,
  Switch,
  TextField,
} from "@wso2/oxygen-ui";
import { officeApi } from "../api";
import { Can } from "../authz/gates";

// wireframes.dsl draws only a "Provision Guest" flow reaching this screen
// fresh each time — create-only, faithful to the DSL. No edit path is built:
// the DSL never draws one.
export function GuestAccountFormPage(): JSX.Element {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => name.trim() !== "" && email.trim() !== "", [name, email]);

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      await officeApi.POST("/guest-accounts", { body: { name, email, active } });
      navigate("/guest-accounts");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContent maxWidth={640}>
      <PageTitle>
        <PageTitle.Header>Provision Guest Account</PageTitle.Header>
      </PageTitle>

      <Form.Section>
        <Form.Stack spacing={2}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <FormControlLabel
            control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
            label="Active"
          />
        </Form.Stack>
      </Form.Section>

      <Form.Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate("/guest-accounts")}>
          Cancel
        </Button>
        <Can op="POST /guest-accounts">
          <Button variant="contained" disabled={!canSubmit || saving} onClick={() => void handleSave()}>
            Save
          </Button>
        </Can>
      </Form.Stack>
    </PageContent>
  );
}
