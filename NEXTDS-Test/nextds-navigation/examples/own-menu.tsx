// Another product's navigation: your own sections, icons and menus. Built-in icon names:
// dashboard, inventory, analytics, protection, orchestration, monitoring, administration; or pass a 16px element.
import { Navigation, type NavItem } from "@nextds/navigation";

const items: NavItem[] = [
  { key: "home", label: "Home", icon: "dashboard" },
  { key: "assets", label: "Assets", icon: "inventory", menu: { groups: [["Storage", ["Arrays", "Pools"]], [null, ["Switches"]]] } },
  { key: "reports", label: "Reports", icon: <MyReportIcon />, menu: { items: [{ label: "Daily" }, { label: "Monthly", items: [{ label: "Usage" }, { label: "Cost" }] }] } },
];

export const MyNav = () => <Navigation items={items} defaultValue={["home"]} />;
function MyReportIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"><rect x="2.5" y="1.5" width="11" height="13" rx="1" /></svg>; }
