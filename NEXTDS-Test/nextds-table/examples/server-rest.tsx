// Server mode against a REST API: one page at a time, any number of rows.
import { useCallback, useRef, useState } from "react";
import { DataTable, type TableColumn, type TableQuery, type TableError } from "@nextds/table";
import "@nextds/table/styles.css";
import { toRow, toSearchParams, type ApiSystem, type SystemRow } from "./adapter";

const columns: TableColumn<SystemRow>[] = [
  { key: "health", title: "Health", type: "singleSelect", options: ["Normal", "Warning", "Critical"], // server mode: give the options,
    status: { Normal: "positive", Warning: "warning", Critical: "negative" } },                     // the table only sees one page
  { key: "name", title: "System" },
  { key: "model", title: "Model", tag: true },
  { key: "site", title: "Site" },
  { key: "usedPct", title: "Used", type: "number", align: "right", format: (v) => `${v}%` },
];

export function SystemsTable() {
  const [rows, setRows] = useState<SystemRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TableError | null>(null);
  const last = useRef<AbortController | null>(null);
  const lastQuery = useRef<TableQuery | null>(null);

  const load = useCallback(async (q: TableQuery) => {
    lastQuery.current = q;
    last.current?.abort();                    // only the latest request counts
    const ctrl = new AbortController();
    last.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/systems?${toSearchParams(q)}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body: { items: ApiSystem[]; total: number } = await res.json();
      setRows(body.items.map(toRow));
      setTotal(body.total);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError({ message: "The systems could not be loaded.", onRetry: () => lastQuery.current && load(lastQuery.current) });
    } finally {
      if (last.current === ctrl) setLoading(false);
    }
  }, []);

  return (
    <DataTable<SystemRow>
      title="Storage Systems"
      columns={columns}
      dataMode="server"
      rows={rows}
      rowCount={total}
      loading={loading}
      error={error}
      onQueryChange={load}
      emptyState={{ title: "No systems", message: "Systems you add show here." }}
    />
  );
}
