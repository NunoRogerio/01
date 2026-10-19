// The demo imports the navigation straight from src/, so every change you make there shows on reload.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { AppHeader, Navigation, navPathLabels } from "../src/Navigation.jsx";
import "../src/styles.css";

function Demo() {
  const [theme, setTheme] = useState("dawn");
  const [page, setPage] = useState(["dashboard"]);
  const labels = navPathLabels(page);
  return (
    <div className="hvt-scope" data-theme={theme} style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--page-background)", color: "var(--content-primary)", fontFamily: '"Hitachi Sans", system-ui, sans-serif' }}>
      <AppHeader theme={theme} initials="NR" />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Navigation theme={theme} value={page} onNavigate={setPage} onExternal={(p) => alert(`${p.at(-1)} opens outside the app`)} />
        <main style={{ flex: 1, padding: 24 }}>
          <button onClick={() => setTheme(theme === "dawn" ? "wicked" : "dawn")}>Theme: {theme}</button>
          <p>{labels.slice(0, -1).join(" › ")}</p>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>{labels.at(-1)}</h1>
        </main>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<Demo />);
