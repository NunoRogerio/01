# Changelog

## 0.1.4 — 2026-10-20

- Menu titles (the section name at level 1, the back row at level 2) are 12px, the size of the category labels (Storage, Virtualization…).

## 0.1.3 — 2026-10-20

- Fix: the collapse / expand button did not respond in 0.1.1 and 0.1.2 (the list of sections covered it).

## 0.1.2 — 2026-10-20

- Menu pages: with nothing selected in the menu, the selection appears on press; with a page already selected, the selection moves on release: the new page's block opens while the old one closes (the select animation in reverse).

## 0.1.1 — 2026-10-20

- The bar's selection is one card that travels (0.3 s, no bounce) from the previous section to the new one, under the icons, when a page in another section is chosen.

## 0.1.0 — 2026-10-19

- First release, cut from the Workbench (Navigation page). Before, the same components were in `@nextds/table` 0.5.0.
- `Navigation`: the vertical bar (VSP 360 structure by default: Dashboard, Inventory, Analytics, Protection, Orchestration, Monitoring, Administration), drill-down menus in the bar, categories, 2nd level with a back row, external pages, collapsed bar (77px), tooltips where a label is hidden.
- `AppHeader`: Hitachi logo, app name, Help, Apps, account initials.
- `VSP360_NAVIGATION`, `navPathLabels`; types; themes Dawn and Wicked.
