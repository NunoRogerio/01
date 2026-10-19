# Changelog

## 0.5.0 — 2026-10-19

- New: `Navigation` (the vertical bar with drill-down menus, VSP 360 structure by default), `AppHeader` (Hitachi logo, app name, help, apps, account), `VSP360_NAVIGATION` and `navPathLabels`. Their styles are in `styles.css`; types in `index.d.ts`. See the README, "Navigation and app header".

## 0.4.14 — 2026-10-19

- Navigation group labels (Storage, Virtualization, Hosts) use the placeholder text colour (--content-placeholder); the --nav-group-label token is gone.

## 0.4.13 — 2026-10-19

- More navigation tokens: --nav-bar (#f4f4f4, the header and rail background in the latest drawings; dark #2b2b2b), --nav-logo (#0c0c0c; dark #e6e6e6) and --nav-avatar (#e8e8e8; dark #424242). The table itself is unchanged.

## 0.4.12 — 2026-10-19

- New theme tokens for navigation: --nav-accent (#cc0000; dark #ff6b6b), --nav-selected (#ffffff; dark #424242), --nav-selected-shadow, --nav-panel (the drill-down panel, #fbfcfc at 70%) and --nav-group-label (#b3b3b3; dark #7d7d7d). The table itself is unchanged; the Workbench's new Navigation component uses them.

## 0.4.11 — 2026-10-19

- Status tags match the library tags (Status_Positive, Warning, Negative, Catastrophic, Info) exactly: the library icons at their own 16px, 7px in from the edge; the semibold label 28px in; 28px tall, 8px corners, 1px outline; the library colours.
- New status kind "catastrophic": #f1dfec fill, #921581 outline, icon and label (the dark theme uses a light magenta on a deep plum, until the library gives its own dark values).
- Pagination: the sliding rows stay inside the rows area; they never pass over the grey padding at the table's sides.

## 0.4.10 — 2026-10-19

- Pagination: changing page slides the rows sideways instead of stacking them. To a later page (Next, Last, a higher number typed) the rows slide out to the left and fade (0.16 s) and the new page's rows slide in from the right (0.22 s); to an earlier page the reverse. No bounce. Reduced motion: no movement.
- The first-render cascade of 0.4.9 stays.

## 0.4.9 — 2026-10-18

- Rows in motion: when the table first shows its rows, they start stacked at the top and spread down into their places in a quick cascade (0.3 s, no bounce).
- Pagination: rows stacked away on press and came back from a stack on release (replaced in 0.4.10).

## 0.4.8 — 2026-10-15

- Comfortable density: the pagination bar is 32px tall (48px in Balanced, 40px in Compact).
- Comfortable and Balanced: the column titles row is 48px tall (was 56px); Compact keeps 40px.
- Search list: pressing a recent search or a suggestion selects it with the menus' select animation (its background opens from a line); releasing picks it.
- Focus rings show only for keyboard focus (Tab); a click or tap shows none, in text fields too. Tooltips open on focus only for keyboard focus.
- Filter bar: an added filter shows its label first and the X after it ("Health: 2 / 3 ×"); the Filters button has no outline on hover, only the fill; hovering a filter's X or its label outlines the whole filter (2px) in the hover colour; the X keeps no fill while the label is hovered.
- Filter bar: removing a filter with its X slides it a little to the left and fades it out while its place closes; the filters after it move in. After the last one, "No filters applied" slides in from the left 0.2 s later.
- Columns: `viz` draws a micro chart in each cell from a list of numbers: "trend" (a line), "area" (a line over a soft fill) or "bar" (one horizontal bar of the latest value, 0 to `vizMax`), always with its metric on its left (the latest value, through `vizFormat`), right-aligned and the same width down the column. The Workbench shows it under Row › Viz, and every sample dataset has one by default (Storage systems a trendline, Pools an area, Volumes a bar of Used, Hosts an area, Alerts a trendline).
- Filter group panel: resizable by its edges and corners (right, bottom and their corner while joined to the Filters button; every edge once it floats). Over an edge a 64px bar shows where the pointer is, over a corner an L of 32px bars; 7px thick, in the colour of the column resize line. The size is kept when the panel opens again.
- Pagination: with one page only ("1 of 1", for example after a search) the pagination is off and the table ends with its rows; it comes back when there are more pages.
- Coloured areas (the filter bar, the add / edit panel, the information banner): every button hovers alike, white at 72% with no outline, as Clear All in the filter bar.
- Add panel: Apply is enabled only once every field is filled, and "All fields are mandatory." shows at its bottom left. Read-only columns (`editable: false`) and micro chart columns are not asked: their values come once the item exists, and a field-sized shape in a darker blue holds their place. Number fields have no up and down arrows.
- Header: the title starts 4px in from the left edge of the row area (20px from the table's edge, was 24px).
- Delete (row menu and bulk bar) is in the Critical red of the status tag.
- Dropdowns: the select animation has no overshoot (no bounce) in any dropdown.
- Menus inside the filter panels open over the page, not inside the panel's scroll area: every item shows, with no scroll inside a scroll (only a window too short scrolls the menu). The menu follows its button if the page scrolls. A menu as wide as its button joins it with square corners on both sides.
- Text fields: hover changes the fill only (the 1px border stays, as in the search field); while typing the field is white, as the search field.
- Page number field: no border when disabled (one page).
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
