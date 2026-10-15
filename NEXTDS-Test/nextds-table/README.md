# @nextds/table

The NEXT Design System table for React. Search, filters (Group or MUI style), sorting, column reorder, resize and pinning, selection, expandable rows, add / edit / delete, pagination and scroll, themes Dawn and Wicked.

- React 18 or newer. No other runtime dependency.
- TypeScript types included.
- Data in the browser (client mode) or page by page from your API (server mode).

## Install

The package is delivered as a file. Keep it in the project (for example in `vendor/`) and install it:

```bash
npm install ./vendor/nextds-table-0.4.1.tgz
```

To update, replace the file and run the same command with the new version.

## Use

Import the styles once (for example in your app's entry file), then use the table:

```tsx
import { DataTable, type TableColumn } from "@nextds/table";
import "@nextds/table/styles.css";

const columns: TableColumn[] = [
  { key: "health", title: "Health", type: "singleSelect", options: ["Normal", "Warning", "Critical"],
    status: { Normal: "positive", Warning: "warning", Critical: "negative" } },
  { key: "name", title: "System" },
  { key: "model", title: "Model", tag: true },
  { key: "used", title: "Used", type: "number", align: "right", format: (v) => `${v}%` },
];

export function Systems({ rows }) {
  return <DataTable title="Storage Systems" columns={columns} rows={rows} />;
}
```

Every row needs a unique `id`.

## Try it with the sample data

`@nextds/table/sample` has 48 made-up VSP storage systems (the same data as the Table Workbench) and a small in-memory server.

```tsx
import { DataTable } from "@nextds/table";
import { storageSystems } from "@nextds/table/sample";
import "@nextds/table/styles.css";

export default function Demo() {
  return <DataTable {...storageSystems} />;
}
```

Server mode against the in-memory server (it answers after 400 ms, like an API):

```tsx
import { useState } from "react";
import { DataTable } from "@nextds/table";
import { storageSystemsColumns, fetchSample } from "@nextds/table/sample";

export default function ServerDemo() {
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  return (
    <DataTable
      title="Storage Systems"
      columns={storageSystemsColumns}
      dataMode="server"
      rows={data.rows}
      rowCount={data.total}
      loading={loading}
      onQueryChange={async (q) => { setLoading(true); setData(await fetchSample(q)); setLoading(false); }}
    />
  );
}
```

## Every feature, switched on

All the features of the Table Workbench are in the package. The Workbench controls are props: turn on what the screen needs.

```tsx
<DataTable
  {...storageSystems}
  selectable            // check boxes and the selection bar (Edit, Delete)
  expandable            // rows open to show their details
  editable              // Add, edit and delete rows (with the add button in the header)
  showFilterBar         // the filter bar with the added filters
  showMaximize          // maximize button
  showMoreOptions       // export, Configure Columns, density, advanced options
  scrollbarHorizontal   // sideways scroll, fixed columns
  pinnedColumns={["health"]}
  filterUi="group"      // or "rows" (MUI style)
  density="comfortable" // "balanced", "compact"
  theme="dawn"          // "wicked"
/>
```

| Workbench control | Prop |
| --- | --- |
| Theme | `theme` |
| Header: Title, Search, Filter, Filter bar, Button, Maximize, More options | `showTitle`, `searchEnabled`, `showFilterButton` + `filterUi`, `showFilterBar`, `editable` + `showAdd`, `showMaximize`, `showMoreOptions` |
| Density | `density` |
| Row: Selectable, Expandable, Action, More Actions | `selectable`, `expandable`, `rowView`, `rowMenu` |
| Column Config | `columnConfig` |
| Pagination | `showPagination`, `scrollbarHorizontal`, `scrollbarVertical`, `visibleRows` |
| State: Loading, Empty state, Error | `loading`, `rows={[]}` + `emptyState`, `error` |

Only the Workbench itself stays out: its control bar, the layout grid and the width and height handles (in an app the table takes the width of its container), and the Tags and Search pages.

## Data from your API (server mode)

With `dataMode="server"` the table does not filter, sort or page by itself. It calls `onQueryChange` when it opens and every time the page, page size, sort, filters or search change. You fetch that page and pass it back as `rows`, with the total in `rowCount`.

```tsx
import { useState } from "react";
import { DataTable, type TableQuery } from "@nextds/table";

export function Systems() {
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const load = async (q: TableQuery) => {
    setLoading(true);
    const res = await fetch("/api/systems/search", { method: "POST", body: JSON.stringify(q) });
    const { rows, total } = await res.json();
    setData({ rows, total });
    setLoading(false);
  };

  return (
    <DataTable
      title="Storage Systems"
      columns={columns}
      dataMode="server"
      rows={data.rows}
      rowCount={data.total}
      loading={loading}
      onQueryChange={load}
    />
  );
}
```

The query the table sends:

```json
{
  "page": 2,
  "pageSize": 10,
  "sort": { "field": "used", "direction": "desc" },
  "filterModel": {
    "items": [{ "id": 10003, "field": "health", "operator": "isAnyOf", "value": ["Warning", "Critical"] }],
    "logicOperator": "and",
    "quickFilterValues": ["amsterdam"],
    "quickFilterLogicOperator": "and"
  }
}
```

- `page` starts at 1.
- `filterModel` has the shape of the MUI X Data Grid filter model. Operators by column type are listed in the types (`FilterItem.operator`).
- `quickFilterValues` are the words typed in the search field. Your API decides which fields they search.
- In server mode give each filterable column its `options`: the table only sees one page, so it cannot list every value by itself.
- If two requests overlap, keep only the answer to the latest one.
- Selecting all rows selects the rows on the page.

## Theme and styles

`theme="dawn"` (default) or `theme="wicked"`. The colours are the NEXT library tokens (v6.3.2.1) as CSS variables on the table; override any of them with the `tokens` prop or in your CSS:

```tsx
<DataTable theme="wicked" tokens={{ "--component-containerradius": "4px" }} … />
```

The table uses the **Hitachi Sans** font (regular, semibold, bold). The font is embedded in `styles.css`, so nothing else is needed. If the app already loads Hitachi Sans, the browser uses the same family name for both.

## Main props

| Prop | Default | What it does |
| --- | --- | --- |
| `columns`, `rows` | | The data. |
| `dataMode`, `rowCount`, `onQueryChange` | `"client"` | Server mode, see above. |
| `loading`, `error`, `emptyState` | | Skeleton rows, error banner, texts when there is no data. |
| `title`, `showTitle` | | The header title. |
| `searchEnabled`, `searchMode`, `searchRecent` | `true`, `"persistent"` | The search field. |
| `filterUi` | `"group"` | `"group"` or `"rows"` (MUI style). |
| `showFilterBar`, `initialFilterModel`, `onFilterModelChange` | | The filter bar and the filters. |
| `initialSort` | none | `{ key, dir }`. |
| `showPagination`, `initialPageSize`, `pageSizeOptions` | `true`, `5` | Pages. |
| `scrollbarHorizontal`, `scrollbarVertical`, `visibleRows` | | Scroll instead of, or with, pages. |
| `pinnedColumns`, `columnReorder`, `columnResize` | | Fixed columns, drag to reorder, resize. |
| `selectable`, `onSelectionChange`, `onBulkAction` | | Check boxes and the selection bar (Edit, Delete). |
| `expandable`, `renderDetail` | | Rows that open to show details. |
| `rowView`, `onView`, `rowMenu`, `onMore` | `true` | The View button and the row menu (…). |
| `editable`, `onRowsChange` | `false` | Add, edit and delete rows. |
| `showMaximize`, `showMoreOptions` | `false` | Maximize, and the More options menu (export, columns, density). |
| `density`, `theme`, `tokens` | `"comfortable"`, `"dawn"` | Look. |

The full list, with types, is in `dist/index.d.ts`.

## A starting point for your app

This package is the reference for how the NEXT table looks and behaves. Your team will adapt it to its own screens and data; everything needed to do that is inside.

### Run it and change it

```bash
tar -xzf nextds-table-0.4.1.tgz && cd package   # or unzip nextds-table.zip
npm install          # dev tools only: esbuild, React, TypeScript
npm run demo         # http://localhost:5173: client mode, server mode, custom cells, Dawn / Wicked
```

The demo imports the table straight from `src/`, so a change in `src/DataTable.jsx` or `src/styles.css` shows on reload. When you are done, `npm run build` writes `dist/`.

### Your data

- **Rows are flat objects with a unique `id`.** Map your API records to rows in one adapter function: flatten nested fields, rename the id, turn codes into the words users see, keep numbers as numbers and show units with `format`. See `examples/adapter.ts`.
- **Custom cells:** a column's `render(row, value)` draws anything (links, icons, bars, two fields in one cell). Search, filters and sorting keep using the value. See `examples/custom-cells.tsx`.
- **Server data:** `dataMode="server"` + `onQueryChange`: the table asks for one page at a time with sort, filters (MUI X filter model) and search. `examples/server-rest.tsx` shows a REST call that cancels stale requests and shows errors with Retry; `toSearchParams` in `examples/adapter.ts` maps the query to URL parameters.
- **Data size:** client mode keeps every row in the browser and handles tens of thousands of rows (in our test with 50,000 rows, search and sort answered in about 0.15 s; measure on your own target devices). Filter value lists show at most 200 values plus the checked ones, with search for the rest. When the data lives on a server, or grows past that, use server mode.

### Know the code

`docs/ARCHITECTURE.md` maps `src/DataTable.jsx`: its sections, the data flow, and where to make the common changes (new column types, controlled state, labels, theming).

## Source and build

The package carries its source, so your team can change the table or use it as an exact reference.

| Path | What it is |
| --- | --- |
| `src/DataTable.jsx` | The table component (the file to edit). |
| `src/styles.css` | Its styles: NEXT tokens (Dawn and Wicked), the table, Hitachi Sans embedded. |
| `src/index.d.ts`, `src/sample.d.ts` | The TypeScript types. |
| `src/sample.js` | The sample data and the in-memory server. |
| `build.mjs` | Builds `dist/` from `src/`. |
| `source/Table.jsx` | The Table Workbench file the package was cut from: the table plus the workbench screen. Exact reference for every behaviour. |
| `tools/extract.mjs` | Cuts `src/DataTable.jsx` and `src/styles.css` out of a Workbench `Table.jsx`. |
| `demo/` | A small app on `src/` (`npm run demo`). |
| `examples/` | Adapter, server mode over REST, custom cells. |
| `docs/ARCHITECTURE.md` | Map of the code. |

To rebuild after a change in `src/`:

```bash
npm install        # dev tools only (TypeScript compiles the build)
npm run build      # writes dist/
```

To take a newer Workbench file: replace `source/Table.jsx` (from GitHub, NunoRogerio/01, `NEXTDS-Test/Table.jsx`), then `npm run extract` and `npm run build`. The extract overwrites `src/DataTable.jsx` and `src/styles.css`, so keep your own changes in a branch, or make them in the Workbench file instead.

The build compiles JSX with TypeScript's transpiler (ES2019, ES modules and CommonJS) and adds `"use client"`; it does not bundle or minify. Your app's bundler takes it from there.

## Next.js

The table is a client component: the build already starts with `"use client"`.

## Versions

See `CHANGELOG.md`. The version number follows semver: a new minor version adds features, a new major version can change props.
