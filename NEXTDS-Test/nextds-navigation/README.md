# @nextds/navigation

The NEXT Design System navigation for React, as designed for VSP 360:

- `Navigation`: the vertical bar. 271px open, 77px collapsed. A section with pages opens its drill-down menu inside the bar (the bar drops to its icons meanwhile); pages can sit in categories (Storage, Virtualization…) and drill down to a 2nd level with a back row.
- `AppHeader`: the 56px header. Hitachi logo, a rule, the app name; at the right Help, Apps and the account.
- Themes Dawn and Wicked, Hitachi Sans embedded, TypeScript types, keyboard support (Tab, Enter, Esc), tooltips wherever a label is hidden.
- React 18 or newer. No other runtime dependency.

## Install

The package is delivered as a file. Keep it in the project (for example in `vendor/`) and install it:

```bash
npm install ./vendor/nextds-navigation-0.1.0.tgz
```

To update, replace the file and run the same command with the new version.

## Use

Import the styles once (for example in your app's entry file), then build the app's frame:

```tsx
import { useState } from "react";
import { AppHeader, Navigation, navPathLabels, type NavPath } from "@nextds/navigation";
import "@nextds/navigation/styles.css";

export function AppShell() {
  const [page, setPage] = useState<NavPath>(["dashboard"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppHeader app="VSP 360" initials="NR" />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Navigation value={page} onNavigate={setPage} />
        <main style={{ flex: 1, overflow: "auto" }}>{navPathLabels(page).join(" › ")}</main>
      </div>
    </div>
  );
}
```

`Navigation` takes the full height of its row: put it in a flex row that has a height (as above).

## The selected page: a path

The navigation does not route by itself. It tells you which page was chosen, as a path from the section key down:

| Page | Path |
| --- | --- |
| Dashboard | `["dashboard"]` |
| Inventory › Storage › Block | `["inventory", "Storage", "Block"]` |
| Analytics › Capacity › Storage › Block | `["analytics", "Capacity", "Storage", "Block"]` |
| Analytics › Insights | `["analytics", "Insights"]` |
| Inventory › Switches (after a rule, no category) | `["inventory", "", "Switches"]` |

- Controlled: `value` + `onNavigate` (connect them to your router; `examples/routes.ts` maps paths to URLs and back).
- Not controlled: `defaultValue`, and read the choice in `onNavigate`.
- `navPathLabels(path)` gives the labels for a breadcrumb or a page title: `["Analytics", "Capacity", "Storage", "Block"]`.

## Your own menus

`items` defaults to `VSP360_NAVIGATION`, the VSP 360 structure as designed. Pass your own for another product:

```ts
const items: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },                    // a page itself (no menu)
  { key: "inventory", label: "Inventory", icon: "inventory", menu: {              // pages in categories
      groups: [["Storage", ["Block", "Object"]], [null, ["Switches"]]] } },     // null: after a rule, no label
  { key: "analytics", label: "Analytics", icon: "analytics", menu: { items: [    // a list of pages
      { label: "Capacity", groups: [["Storage", ["Block", "File"]]] },          // drills down to a 2nd level
      { label: "Reporting" },
      { label: "Ansible", external: true },                                    // opens outside: calls onExternal
  ] } },
];
```

Built-in icons: `dashboard`, `inventory`, `analytics`, `protection`, `orchestration`, `monitoring`, `administration`. Or pass your own 16px element as `icon` (it takes the text colour: use `currentColor`). See `examples/own-menu.tsx`.

## Props

### Navigation

| Prop | Default | What it does |
| --- | --- | --- |
| `items` | `VSP360_NAVIGATION` | The sections and their menus. |
| `value`, `defaultValue`, `onNavigate` | first section | The selected page (a path). |
| `onExternal` | | A page marked `external` was clicked (it never takes the selection). |
| `collapsed`, `defaultCollapsed`, `onCollapsedChange` | `false` | 271px open or 77px collapsed. The button at the top right of the bar toggles it. |
| `theme` | `"dawn"` | `"dawn"` or `"wicked"`. |
| `className`, `style` | | On the root element. |

### AppHeader

| Prop | Default | What it does |
| --- | --- | --- |
| `app` | `"VSP 360"` | The app name after the Hitachi logo. |
| `initials` | `"AC"` | The account's initials in the avatar. Pass the signed-in user's. |
| `onHelp`, `onApps`, `onAccount` | | The three actions at the right. |
| `theme`, `className`, `style` | `"dawn"` | Look; on the root element. |

The full list, with types, is in `dist/index.d.ts`.

## How it behaves

- **Sections with pages** open their menu inside the bar; the bar shows its icons only while a menu is open. The menu stays open after a page is chosen. Clicking the section again, or Esc, closes it.
- **2nd level**: a page with a caret drills down; the back row (‹ and the name) returns. The level slides in from the right going down and from the left going back. No bounce.
- **Choosing a page**: the selection moves to the page on press and is confirmed on release; moving off while pressed puts it back (as in the NEXT dropdowns).
- **Collapsed bar**: a section with pages opens the bar with its menu. Esc or a click outside before choosing folds it back; once a page is chosen, the bar stays open.
- **Tooltips** wherever a label is hidden (collapsed bar, header actions), after 0.5 s; on keyboard focus too.
- **Focus rings** only with the keyboard (Tab), never with the mouse.
- **Reduced motion**: no slides or fades.

## Theme and styles

`theme="dawn"` (default) or `theme="wicked"`. The colours are NEXT tokens as CSS variables (`--nav-accent`, `--nav-selected`, `--nav-bar`, `--nav-panel`, `--nav-logo`, `--nav-avatar`, and the library tokens such as `--content-primary`, `--border-default`); override any of them in your CSS on `.hvn-root`.

The **Hitachi Sans** font (regular, semibold, bold) is embedded in `styles.css`. If the app also uses `@nextds/table`, both style sheets carry the same tokens and font: import both, nothing clashes.

## A starting point for your app

```bash
tar -xzf nextds-navigation-0.1.0.tgz && cd package   # the file from the React Package button (Navigation page)
npm install          # dev tools only: esbuild, React, TypeScript
npm run demo         # http://localhost:5174: header, bar, Dawn / Wicked
```

The demo imports from `src/`, so a change in `src/Navigation.jsx` or `src/styles.css` shows on reload. `npm run build` writes `dist/`.

| Path | What it is |
| --- | --- |
| `src/Navigation.jsx` | Navigation, AppHeader and what they use (the file to edit). |
| `src/styles.css` | NEXT tokens (Dawn and Wicked), Hitachi Sans, the navigation's styles. |
| `src/index.d.ts` | The TypeScript types. |
| `build.mjs` | Builds `dist/` from `src/`. |
| `source/Table.jsx` | The Workbench file the package was cut from: exact reference for every behaviour. |
| `tools/extract.mjs` | Cuts `src/` out of a Workbench file (`npm run extract`). |
| `demo/` | A small app on `src/` (`npm run demo`). |
| `examples/` | App shell, routes ↔ paths, your own menus. |
| `docs/ARCHITECTURE.md` | Map of the code. |

To take a newer Workbench file: replace `source/Table.jsx` (GitHub, NunoRogerio/01, `NEXTDS-Test/Table.jsx`), then `npm run extract` and `npm run build`. The extract overwrites `src/`, so keep your own changes in a branch, or make them in the Workbench.

The build compiles JSX with TypeScript's transpiler (ES2019, ES modules and CommonJS) and adds `"use client"`; it does not bundle or minify.

## Next.js

The components are client components (`"use client"` is in `dist/`). Import `@nextds/navigation/styles.css` in `app/layout.tsx` (App Router) or `pages/_app.tsx`.

## Versions

See `CHANGELOG.md`.
