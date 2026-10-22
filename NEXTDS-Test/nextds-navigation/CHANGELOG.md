# Changelog

## 0.1.14 — 2026-10-22

- The toggle chevron turns with an ease-in-out curve (0.3s).

## 0.1.13 — 2026-10-22

- New `toggle` prop: `"moving"` (default, as before) or `"fixed"`, where the collapse/expand icon stays in the icons' column with the bar expanded and the greeting sits right of it.

## 0.1.12 — 2026-10-22

- The collapse/expand icon sits 16px from the top of the bar (was 25px); the greeting follows it.

## 0.1.11 — 2026-10-22

- New collapse/expand icon (panel with a chevron). The chevron turns 180° with the bar: left when expanded (collapse), right when collapsed (expand).

## 0.1.10 — 2026-10-22

- Greeting in the normal text colour; it stays while a menu is open; a different sentence each time the bar collapses or expands.

## 0.1.9 — 2026-10-22

- The greeting uses the small text of the menu titles and categories (12px/18px): every sentence fits one line.

## 0.1.8 — 2026-10-22

- New `greeting` prop and `NAV_GREETINGS` export: a sentence left of the toggle introducing the menu (one of five, at random). Hidden when collapsed or with a menu open.

## 0.1.7 — 2026-10-22

- The rail section whose menu is open (not the current page) uses the hover state instead of the white selection card.

## 0.1.6 — 2026-10-22

- Collapse/expand icon mirrored: the panel line sits on the left, the side of the bar.

## 0.1.5 — 2026-10-20

- Back row of the 2nd level: half the space between the chevron and the name.

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
