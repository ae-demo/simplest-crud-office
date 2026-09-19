import type { JSX } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  AppShell as OxygenAppShell,
  ColorSchemeToggle,
  Divider,
  Footer,
  Header,
  Sidebar,
  UserMenu,
} from "@wso2/oxygen-ui";
import { ClipboardList, LayoutList, LogOut } from "@wso2/oxygen-ui-icons-react";
import { APP_NAME } from "../appName";
import { Can, useAuthz } from "../authz/gates";
import { signOut } from "../authz/session";
import { SCREEN_ROUTES } from "../authz/screens";

const myAssets = SCREEN_ROUTES.find((s) => s.key === "myassets")!;
const myRequests = SCREEN_ROUTES.find((s) => s.key === "myrequests")!;

/**
 * The signed-in app shell — the sample's AppLayout. Every gated screen renders
 * inside it. Navigation lives ONLY in the sidebar (wireframes.dsl draws
 * `navbar "Office"` — the brand only — and `sidebar "My Assets -> MyAssets |
 * My Requests -> MyRequests"` on every screen).
 */
export function AppShell(): JSX.Element {
  const { pathname } = useLocation();
  const { username } = useAuthz();

  const activeItem = pathname.startsWith(myRequests.path) ? myRequests.key : myAssets.key;

  return (
    <OxygenAppShell>
      <OxygenAppShell.Navbar>
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
              <UserMenu.Trigger name={username || "Guest"} />
              <UserMenu.Header name={username || "Guest"} email={username} />
              <UserMenu.Logout icon={<LogOut />} onClick={() => void signOut()} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </OxygenAppShell.Navbar>

      <OxygenAppShell.Sidebar>
        <Sidebar activeItem={activeItem}>
          <Sidebar.Nav>
            <Sidebar.Category>
              <Can op={myAssets.loads!}>
                <Sidebar.Item id={myAssets.key} link={<Link to={myAssets.path} />}>
                  <Sidebar.ItemIcon>
                    <LayoutList />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>{myAssets.label}</Sidebar.ItemLabel>
                </Sidebar.Item>
              </Can>
              <Can op={myRequests.loads!}>
                <Sidebar.Item id={myRequests.key} link={<Link to={myRequests.path} />}>
                  <Sidebar.ItemIcon>
                    <ClipboardList />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>{myRequests.label}</Sidebar.ItemLabel>
                </Sidebar.Item>
              </Can>
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </OxygenAppShell.Sidebar>

      <OxygenAppShell.Main>
        <Outlet />
      </OxygenAppShell.Main>

      <OxygenAppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </OxygenAppShell.Footer>
    </OxygenAppShell>
  );
}
