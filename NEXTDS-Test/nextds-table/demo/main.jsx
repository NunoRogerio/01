// The demo imports the table straight from src/, so every change you make there shows on reload.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { DataTable } from "../src/DataTable.jsx";
import { storageSystems, storageSystemsColumns, fetchSample } from "../src/sample.js";
import "../src/styles.css";

function ClientDemo({ theme }) {
  // client mode: the table searches, filters, sorts and pages the rows it is given
  return <DataTable {...storageSystems} theme={theme} selectable expandable editable showFilterBar showMaximize showMoreOptions scrollbarHorizontal />;
}

function ServerDemo({ theme }) {
  // server mode: the table asks for each page; fetchSample answers like an API, after 400 ms
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  return (
    <DataTable theme={theme} title="Storage Systems (server mode)" columns={storageSystemsColumns} dataMode="server"
               rows={data.rows} rowCount={data.total} loading={loading} showFilterBar
               onQueryChange={async (q) => { setLoading(true); setData(await fetchSample(q)); setLoading(false); }} />
  );
}

function CustomCellsDemo({ theme }) {
  const columns = storageSystemsColumns.map((c) => (c.key === "name" ? { ...c, render: (row) => <a href="#" onClick={(e) => e.preventDefault()}>{row.name}</a> } : c));
  return <DataTable {...storageSystems} theme={theme} title="Custom cells" columns={columns} />;
}

const DEMOS = [["Client", ClientDemo], ["Server", ServerDemo], ["Custom cells", CustomCellsDemo]];
function Demo() {
  const [i, setI] = useState(0);
  const [theme, setTheme] = useState("dawn");
  const View = DEMOS[i][1];
  return (
    <>
      <nav>
        {DEMOS.map(([name], k) => <button key={name} aria-pressed={k === i} onClick={() => setI(k)}>{name}</button>)}
        <button aria-pressed={theme === "wicked"} onClick={() => setTheme((t) => (t === "dawn" ? "wicked" : "dawn"))}>Wicked theme</button>
      </nav>
      <div style={{ background: theme === "wicked" ? "#101010" : "transparent", padding: theme === "wicked" ? 16 : 0 }}>
        <View key={`${i}-${theme}`} theme={theme} />
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<Demo />);
