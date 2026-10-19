// The app's frame: the header on top, the bar on the left, the page on the right.
// The selected page is a path; keep it in your router (here: state) and render the page from it.
import { useState } from "react";
import { AppHeader, Navigation, navPathLabels, type NavPath } from "@nextds/navigation";
import "@nextds/navigation/styles.css";

export function AppShell({ theme = "dawn" }: { theme?: "dawn" | "wicked" }) {
  const [page, setPage] = useState<NavPath>(["dashboard"]);
  const [collapsed, setCollapsed] = useState(false);
  const labels = navPathLabels(page);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppHeader app="VSP 360" initials="NR" theme={theme} onHelp={() => window.open("/help")} />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Navigation theme={theme} value={page} onNavigate={setPage} collapsed={collapsed} onCollapsedChange={setCollapsed}
                    onExternal={(path) => path[path.length - 1] === "Ansible" && window.open("https://your-ansible-url", "_blank")} />
        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {labels.length > 1 && <div>{labels.slice(0, -1).join(" › ")}</div>}
          <h1>{labels[labels.length - 1]}</h1>
        </main>
      </div>
    </div>
  );
}
