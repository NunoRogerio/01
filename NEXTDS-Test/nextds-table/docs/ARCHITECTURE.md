# How the table is built

A map of `src/DataTable.jsx` for developers who adapt the table. Names below are the ones in the code, so you can search for them.

## One component, plain React

- `DataTable` is a single function component with hooks (`useState`, `useMemo`, `useEffect`, `useLayoutEffect`). No state library, no CSS-in-JS, no runtime dependency besides React 18+.
- All styles are in `src/styles.css`. Every class starts with `hvt-`. Colours, radii and fonts are CSS variables (the NEXT library tokens), set on `.hvt-root`; the theme is `data-theme="dawn" | "wicked"` on the same element.
- The table is mostly **uncontrolled**: it takes `initial…` props (sort, filter model, page size) and reports changes through `on…Change` callbacks. If your app needs to own a piece of state (for example the sort, to keep it in the URL), that is the place to change the code: replace the `useState` for it with the prop.

## The file, top to bottom

| Section (search for it) | What it holds |
| --- | --- |
| `icons` | The icons from the Figma library, as inline SVG. |
| `Filter model helpers` | `OPERATORS` per column type, `itemIsComplete`, `applyItem` (one condition against one row). Add an operator here. |
| `Filter panel pieces` | `MultiSelect`, `ValueControl`, `FilterRow`, `FilterPanel` (MUI-style rows), `CheckList`, `capList` (long value lists). |
| `MenuButton` | Every dropdown and menu of the table (More options, rows per page, Table Density…). |
| `FilterGroupPanel` | The Group-style filter panel: columns on the left, conditions on the right, Apply / Cancel; it can be dragged off its button. |
| `QuickFilter` | The search field: suggestions and recent searches. |
| `ColumnsList`, `ColumnsConfig` | Configure Columns, "Latest" (one list) and "Legacy" (Visible / Hidden lists). |
| `EditPanel`, `Reveal`, `Banner` | Add / edit row panel, the open/close animation wrapper, messages above the rows. |
| `DataTable` | The component. Inside, in order: props and defaults; state; the filter panel and its animations; the data pipeline; selection; column reorder; column resize; custom scroll bars and fixed columns; automatic column layout; maximize; More options; row editing; then the JSX. |

## Data flow

```
rows (prop) ──► localRows (state; edits apply here)
                   │
   client mode:    ▼
   processed = search (quickFilterValues, matched against each cell's text)
             → filters (activeItems, applyItem, logicOperator)
             → sort (number / status rank / text with numeric collation)
   visible  = the current page of processed
   server mode:
   processed = localRows as given (the server already searched, filtered, sorted and paged)
   queryKey  = page + pageSize + sort + filters + search; when it changes, onQueryChange(query) is called
```

- Search matches the **text** of a cell: `format(value)` when the column has `format`, otherwise `String(value)`. Filters and sorting use the **value**.
- `optionsOf(column)` gives the values offered in a filter: `column.options` if set, otherwise every distinct value in `localRows`. In server mode always pass `options`.
- Selection keeps row `id`s in a `Set`; `onSelectionChange(ids)` reports them.
- Row editing (`editable`) changes `localRows` and reports through `onRowsChange(nextRows, { type, row })`. In server mode, save on your side and pass the new page back.

## Where to make common changes

| You want to… | Change |
| --- | --- |
| Show a cell differently (link, icon, bar, two fields) | Column `render(row, value)`, no code change needed. |
| A new column type (date, size in TB…) | Add its operators to `OPERATORS`, its comparison to `applyItem`, its sort to the `processed` sort, its input to `ValueControl`. Store dates as ISO strings or timestamps so sorting works. |
| Rename words in the UI (or translate) | Labels are plain strings in the JSX ("Filters", "Clear All", "Apply"…). Collect them into one object if you need translations. |
| Own the sort / page / filters from the app | Turn the matching `useState` in `DataTable` into a prop (controlled), keep the `on…Change` callback. |
| Change colours, spacing, radius | CSS variables in `styles.css` (`--component-containerradius`, `--hvt-row-h`, `--page-background`…), or the `tokens` prop. |
| Export to a file | `onExport(format, rows)` receives the filtered rows; create the file in your app. |

## Behaviour reference

`source/Table.jsx` is the Table Workbench file: the same table plus the workbench screen that switches every option. Open the Workbench (or run `npm run demo`) to see a behaviour, then find it in `src/DataTable.jsx` by the comment next to it: most behaviours carry a short comment explaining the rule (for example why a panel folds into its button, or why the first column aligns left).
