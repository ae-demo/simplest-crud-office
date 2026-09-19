// The signed-in app chrome — every gated screen renders inside it. One rail,
// reproducing the wireframes' `navbar "Office Admin"` + `sidebar "Assets ->
// AssetInventory | Guest Accounts -> GuestAccounts | Requests -> RequestQueue"`
// that repeats on every screen. Each item is wrapped in <Can> so a caller
// holding fewer scopes than Admin's full set (there is only one role here, but
// the rule is the same one every app follows) sees only what they can reach.
import {
  AppShell,
  Divider,
  Footer,
  Header,
  Sidebar,
  UserMenu,
  ColorSchemeToggle,
} from "@wso2/oxygen-ui";
import { ClipboardList, LogOut, Package, Users } from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { APP_NAME } from "../appName";
import { Can, useAuthz } from "../authz/gates";
import { signOut } from "../authz/session";

function activeIdFor(pathname: string): string {
  if (pathname.startsWith("/guest-accounts")) return "guest-accounts";
  if (pathname.startsWith("/requests")) return "requests";
  return "assets";
}

export function AppShellLayout(): JSX.Element {
  const { pathname } = useLocation();
  const { username } = useAuthz();
  const name = username || "Admin";

  return (
    <AppShell>
      <AppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>{APP_NAME}</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={name} showName />
              <UserMenu.Header name={name} email={username} role="Admin" />
              <UserMenu.Item icon={<LogOut />} label="Sign out" onClick={() => void signOut()} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar activeItem={activeIdFor(pathname)}>
          <Sidebar.Nav>
            <Sidebar.Category>
              <Can op="GET /assets">
                <Sidebar.Item id="assets" link={<Link to="/assets" />}>
                  <Sidebar.ItemIcon>
                    <Package />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>Assets</Sidebar.ItemLabel>
                </Sidebar.Item>
              </Can>
              <Can op="GET /guest-accounts">
                <Sidebar.Item id="guest-accounts" link={<Link to="/guest-accounts" />}>
                  <Sidebar.ItemIcon>
                    <Users />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>Guest Accounts</Sidebar.ItemLabel>
                </Sidebar.Item>
              </Can>
              <Can op="GET /requests">
                <Sidebar.Item id="requests" link={<Link to="/requests" />}>
                  <Sidebar.ItemIcon>
                    <ClipboardList />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>Requests</Sidebar.ItemLabel>
                </Sidebar.Item>
              </Can>
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </AppShell.Footer>
    </AppShell>
  );
}
