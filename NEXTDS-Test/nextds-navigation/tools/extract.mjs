// Cuts the package source out of the Workbench file.
//   node tools/extract.mjs [path/to/Table.jsx]     (default: source/Table.jsx)
// Writes src/Navigation.jsx (Navigation, AppHeader and what they use) and src/styles.css (NEXT tokens, Hitachi Sans, their styles).
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2] || "source/Table.jsx";
const src = readFileSync(file, "utf8");
const lines = src.split("\n");
const must = (cond, what) => { if (!cond) throw new Error(`extract: ${what} not found in ${file}`); };

// 1. the navigation block, between its markers
const a = src.indexOf("/* ==== @nextds/navigation: start"), b = src.indexOf("/* ==== @nextds/navigation: end ==== */");
must(a > 0 && b > a, "the navigation block markers");
const block = src.slice(src.indexOf("\n", a) + 1, b).trimEnd();

// 2. the helpers it shares with the table: keyboard focus and tooltips
const fn = (name) => {
  const i = lines.findIndex((l) => l.startsWith(`function ${name}(`));
  must(i >= 0, `function ${name}`);
  const j = lines.findIndex((l, k) => k > i && l === "}");
  return lines.slice(i, j + 1).join("\n");
};
const kbd = lines.find((l) => l.startsWith("let kbdTracking"));
must(kbd, "let kbdTracking");
const helpers = [kbd, ...["trackKeyboardFocus", "useTips", "TipBubble"].map(fn)].join("\n");

// 3. styles: fonts and tokens (Dawn, Wicked), tooltips, keyboard-only focus, and the navigation's own rules
const ci = src.indexOf("const CSS = `"), cj = src.indexOf("`;", ci);
must(ci >= 0 && cj > ci, "const CSS");
const css = src.slice(ci + "const CSS = `".length, cj).split("\n");
const w = css.findIndex((l) => l.startsWith('.hvt-root[data-theme="wicked"],.hvt-scope[data-theme="wicked"]{'));
must(w > 0, "the Wicked tokens");
const wEnd = css.findIndex((l, k) => k > w && l.startsWith("}"));
const base = css.slice(0, wEnd + 1).filter((l) => !l.startsWith("/* Hitachi Sans embedded") && !l.startsWith("   @font-face rules"));
const picked = [];
for (let k = wEnd + 1; k < css.length; k++) {
  const l = css[k];
  const want = l.startsWith(".hvt-tip") || l.startsWith(".hvt-scope *{") || l.includes(":root:not([data-hvt-kbd]) :is(.hvt-root,.hvt-scope,.hvs) :focus-visible");
  if (!want) continue;
  picked.push(l);
  while (!css[k].trimEnd().endsWith("}") && k + 1 < css.length) picked.push(css[++k]); // a rule on several lines
}
const navAt = css.findIndex((l) => l.startsWith("/* ---------- Navigation and AppHeader"));
must(navAt > 0, "the navigation styles");
const styles = [...base, ...picked, ...css.slice(navAt)].join("\n").trim();

const header = `/* @nextds/navigation — the NEXT Design System navigation for React: the vertical bar with drill-down menus, and the app header.
 * Generated from the Workbench (NEXTDS-Test/Table.jsx). Edit the workbench, then run npm run extract and npm run build.
 */
import { useState, useRef, useEffect, useLayoutEffect } from "react";

/* ---------- shared with the table: keyboard-only focus rings and tooltips ---------- */
`;
writeFileSync("src/Navigation.jsx", header + helpers + "\n\n" + block + "\n");
writeFileSync("src/styles.css", "/* @nextds/navigation styles: NEXT tokens (Dawn and Wicked), Hitachi Sans, the navigation and the app header. Import once. */\n" + styles + "\n");
console.log(`src/Navigation.jsx and src/styles.css written from ${file}`);
