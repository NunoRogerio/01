# Changelog

## 0.4.8 — 2026-10-15

- Comfortable density: the pagination bar is 32px tall (48px in Balanced, 40px in Compact).
- Comfortable and Balanced: the column titles row is 48px tall (was 56px); Compact keeps 40px.
- Search list: pressing a recent search or a suggestion selects it with the menus' select animation (its background opens from a line); releasing picks it.
- Focus rings show only for keyboard focus (Tab); a click or tap shows none, in text fields too. Tooltips open on focus only for keyboard focus.
- Header: every tool (search, filter, button, maximize, more options) 16px from the next.
- Balanced and Compact: the card sits 16px from the bottom edge, like the left and right (was 24px).
- Pagination: 4px between the arrows and the page field; the chosen values (rows per page, current page) are semibold in the text colour; "1 of 8" instead of "1 / 8".
- Rows per page: reads "[5] rows per page"; the number is a filled field like the page number (no caret, border on hover). The total row count is no longer shown in the pager.

## 0.4.7 — 2026-10-15

- Tooltips: every tooltip of the table is the NEXT tooltip (a small raised panel, 14px text), shown 0.5 s after the pointer rests on the element or at once on keyboard focus. Disabled buttons show theirs too.
- `info`: an information icon after the title, with its text as a tooltip. A header has a description or an info icon, not both (with both, the description wins).
- Status tags: the ! and the check are a little heavier, easier to read.
- Page number field: filled with the hover colour and no border at rest; the border shows on hover.
- Compact density: column titles row 40px.
- The pager is compact in every density: 12px text, 24px controls, arrows at full size; the bar is 48px (40px in Compact).

## 0.4.6 — 2026-10-15

- `description`: optional text at the right of the title.
- Buttons with the + icon drop the word "Add" ("+ Storage System", "+ Filter", "+ Condition"); `addLabel` can still say "Add …", the table shortens it.
- Compact density: the pager is compact too (12px text, 24px controls), and the column titles bar is 32px high (was 56px).
- No outline on the Filters button and the added filters (0.4.5).

## 0.4.5 — 2026-10-15

- The filter bar's Filters button and the added filters have no outline; only their hovers show.

## 0.4.4 — 2026-10-15

- The dragged column has 8px corners, a 3px outline all around and a subtle drop shadow.

## 0.4.3 — 2026-10-15

- With sideways scroll, the divider before the row actions looks like the titles' divider (1px, half the row height, centred) and always shows in the rows.

## 0.4.2 — 2026-10-15

- Single-choice menus (Table Density): when another item is pressed, the old selection closes with the same timing as the new one opens.

## 0.4.1 — 2026-10-15

- Filter chips: the hovers of the X and of the label fill the chip to its edges.
- Hovers on the filter bar (chips, Filters, Clear All) are white at 72%.

## 0.4.0 — 2026-10-15

- A starting point for adapting the table: `npm run demo` (a live demo on `src/`), `examples/` (data adapter, server mode over REST, custom cells), `docs/ARCHITECTURE.md` (map of the code).
- Column `render(row, value)` for custom cells.
- Long filter value lists show 200 values plus the checked ones, with search for the rest (opening a list of 50,000 values went from about 7 s to 0.1 s).

## 0.3.0 — 2026-10-15

- The source is in the package: `src/` (component, styles, types, sample), `build.mjs`, the Workbench file `source/Table.jsx` and `tools/extract.mjs`. `npm run build` and `npm run extract`.
- Table changes since 0.2.1: the filter bar's height and chips animate; the filter panel folds into the Filters button as it grows back; the dragged column is square and full height, with side lines and a soft inner shadow; single-choice menus (Table Density) move the selection when pressed.

## 0.2.1 — 2026-10-15

- A number column moved to the first place aligns left, like text and tags.

## 0.2.0 — 2026-10-15

- Hitachi Sans embedded in `styles.css`.
- `@nextds/table/sample`: 48 storage systems, `querySample` and `fetchSample` to try server mode without a backend.
- README: every feature switched on, and the Workbench controls with their props.

## 0.1.0 — 2026-10-15

First package of the table from the Table Workbench.

- Client mode (the table searches, filters, sorts and pages) and server mode (`dataMode="server"`, `rowCount`, `onQueryChange`).
- Filters in Group or MUI style, filter bar with chips, search with suggestions and recents.
- Column reorder, resize and pinning; Configure Columns (Latest and Legacy).
- Selection with bulk actions, expandable rows, add / edit / delete, maximize.
- Themes Dawn and Wicked from the NEXT library v6.3.2.1; styles in `styles.css`.
- TypeScript types.
