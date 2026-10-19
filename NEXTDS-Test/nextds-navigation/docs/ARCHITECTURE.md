# How the navigation is built

A map of `src/Navigation.jsx` for developers who adapt it. Names are the ones in the code.

## Plain React, one file

Function components with hooks; no state library, no CSS-in-JS. Styles are class names (`hvn-…`) in `src/styles.css`; colours are CSS variables (tokens) set on `.hvt-scope` for Dawn and `[data-theme="wicked"]` for Wicked.

## The parts, in file order

| Name | What it does |
| --- | --- |
| `trackKeyboardFocus`, `useTips`, `TipBubble` | Shared with the table: focus rings only after Tab; tooltips on any element with `data-tip` (and `data-tip-side="right"` to show it beside the element). |
| `NAV_ICONS` | The built-in 16px icons, kept at their place in the original drawing; `NavIcon` picks the 16px square with the `viewBox`. |
| `VSP360_NAVIGATION` | The default structure (sections, menus, categories, 2nd levels). |
| `navPathLabels` | Path → labels, for breadcrumbs and titles. |
| `NavPanel` | The drill-down menu: level 1 or the 2nd level (`sub`), the back row, categories (`groups`), the press/release selection and its animation. |
| `useNav` | The menu state: which section is open (`open`), the 2nd level, the temporary opening from the collapsed bar (`temp`). |
| `Navigation` | The bar: the collapse button, the sections, the open menu; controlled or not (`value`, `collapsed`); Esc and click-outside. |
| `AppHeader` | The header. |

## Common changes

- **Another structure**: pass `items` (see the README). No code change.
- **Routing**: keep `value` in your router; `examples/routes.ts` maps paths to URLs.
- **Colours and sizes**: tokens in `styles.css` (`--nav-*`); sizes are in the `.hvn-*` rules (bar 271px / 77px, items 32px every 48px, menu 186px at 68px from the left).
- **Labels and tooltips**: the tooltip texts are the labels; the header's are `Help`, `Apps`, `Account` in `AppHeader`.
