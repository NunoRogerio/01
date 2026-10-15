// Custom cells: `render` draws the cell; the row's value at `key` still drives search, filters and sorting.
import { DataTable, type TableColumn } from "@nextds/table";
import { storageSystems, type StorageSystemRow } from "@nextds/table/sample";
import "@nextds/table/styles.css";

const columns: TableColumn<StorageSystemRow>[] = storageSystems.columns.map((c) =>
  c.key === "name"
    ? { ...c, render: (row) => <a href={`/systems/${row.id}`}>{row.name}</a> }   // a link
    : c.key === "usedPct"
      ? { ...c, render: (row, v) => (                                              // a small bar next to the number
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 48, height: 4, borderRadius: 2, background: "var(--border-default)" }}>
              <span style={{ display: "block", width: `${v}%`, height: "100%", borderRadius: 2, background: "var(--content-primary)" }} />
            </span>
            {v}%
          </span>
        ) }
      : c,
);

export function CustomCells() {
  return <DataTable {...storageSystems} columns={columns} />;
}
