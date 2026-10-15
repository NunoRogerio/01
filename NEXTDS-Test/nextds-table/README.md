# @nextds/table

The NEXT Design System table for React. Search, filters (Group or MUI style), sorting, column reorder, resize and pinning, selection, expandable rows, add / edit / delete, pagination and scroll, themes Dawn and Wicked.

- React 18 or newer. No other runtime dependency.
- TypeScript types included.
- Data in the browser (client mode) or page by page from your API (server mode).

## Install

The package is delivered as a file. Keep it in the project (for example in `vendor/`) and install it:

```bash
npm install ./vendor/nextds-table-0.1.0.tgz
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

The table uses the **Hitachi Sans** font and falls back to the system font when the app does not load it. The font files are not in the package: load them in the app as you do today.

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

## Next.js

The table is a client component: the build already starts with `"use client"`.

## Versions

See `CHANGELOG.md`. The version number follows semver: a new minor version adds features, a new major version can change props.
