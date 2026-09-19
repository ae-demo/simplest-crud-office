import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { Plus } from "@wso2/oxygen-ui-icons-react";
import { officeApi } from "../api";
import { Can } from "../authz/gates";
import type { components } from "../generated/office-api";

type GuestAccount = components["schemas"]["GuestAccount"];

// wireframes.dsl: table "Name | Email | Active" carries no `-> Screen` arrow,
// so rows are not clickable here (unlike AssetInventory / RequestQueue).
export function GuestAccountsPage(): JSX.Element {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<GuestAccount[] | null>(null);

  useEffect(() => {
    let live = true;
    void officeApi.GET("/guest-accounts", { params: { query: {} } }).then(({ data }) => {
      if (live && data) setAccounts(data.data);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Guest Accounts</PageTitle.Header>
        <PageTitle.Actions>
          <Can op="POST /guest-accounts">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate("/guest-accounts/new")}
            >
              Provision Guest
            </Button>
          </Can>
        </PageTitle.Actions>
      </PageTitle>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Name</ListingTable.Cell>
              <ListingTable.Cell>Email</ListingTable.Cell>
              <ListingTable.Cell>Active</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {accounts === null ? null : accounts.length === 0 ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={3}>
                  <ListingTable.EmptyState
                    title="No guest accounts yet"
                    description="Provision the first guest account."
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : (
              accounts.map((account) => (
                <ListingTable.Row key={account.id}>
                  <ListingTable.Cell>{account.name}</ListingTable.Cell>
                  <ListingTable.Cell>{account.email}</ListingTable.Cell>
                  <ListingTable.Cell>
                    <Chip
                      label={account.active ? "Yes" : "No"}
                      color={account.active ? "success" : "default"}
                      size="small"
                    />
                  </ListingTable.Cell>
                </ListingTable.Row>
              ))
            )}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
