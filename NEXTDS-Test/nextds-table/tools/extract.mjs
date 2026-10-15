// Cuts the package source out of the Table Workbench file.
//   node tools/extract.mjs [path/to/Table.jsx]     (default: source/Table.jsx)
// Writes src/DataTable.jsx (the table component) and src/styles.css (its styles, Hitachi Sans embedded).
// Only needed when you take a newer Table.jsx from the workbench; to change the table, you can also edit src/ directly.
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2] || "source/Table.jsx";
const lines = readFileSync(file, "utf8").split("\n");
const must = (cond, what) => { if (!cond) throw new Error(`extract: ${what} not found in ${file}`); };

// 1. the table ends where the workbench screen starts
const cut = lines.findIndex((l, i) => l.startsWith("/* ----") && (lines[i + 1] || "").includes("Customizer screen"));
must(cut > 0, "the 'Customizer screen' section");
let comp = lines.slice(0, cut).join("\n");

// 2. the CSS string becomes styles.css
const i = comp.indexOf("const CSS = `"), j = comp.indexOf("`;", i);
must(i >= 0 && j > i, "const CSS");
let css = comp.slice(i + "const CSS = `".length, j);
comp = comp.slice(0, i) + '/* styles: see styles.css (import "@nextds/table/styles.css" once in the app) */' + comp.slice(j + 2);
css = css.replace(/\/\* Hitachi Sans embedded[^*]*\*\/\s*/, "/* Hitachi Sans (regular, semibold, bold), embedded so the table looks right without extra setup */\n");

// 3. no runtime CSS injection: the app imports styles.css
must(comp.split("      <style>{CSS}</style>\n").length === 2, "<style>{CSS}</style>");
comp = comp.replace("      <style>{CSS}</style>\n", "");

// 4. no demo data as defaults
comp = comp.replace("  columns: columnsProp = DEFAULT_COLUMNS,\n  rows = DEFAULT_ROWS,", "  columns: columnsProp = NO_ROWS,\n  rows = NO_ROWS,");
comp = comp.replace('  initialSort = { key: "name", dir: "asc" },', "  initialSort = null,");
const k = comp.indexOf("/* ---------- sample data ---------- */"), m = comp.indexOf("const EMPTY_MODEL");
must(k >= 0 && m > k, "the sample data block");
comp = comp.slice(0, k) + "const NO_ROWS = [];\n" + comp.slice(m);

// 5. constants that live with the workbench but the table needs
const extra = ["const MAX_PAGE_ROWS", "const STEP5"].map((n) => { const l = lines.find((x) => x.startsWith(n)); must(l, n); return l; });
comp = comp.replace("const NO_ROWS = [];", "const NO_ROWS = [];\n" + extra.join("\n"));

const header = `/* @nextds/table — the NEXT Design System table for React.
 * Generated from the Table Workbench (NEXTDS-Test/Table.jsx). Edit the workbench, then rebuild.
 */
`;
writeFileSync("src/DataTable.jsx", header + comp + "\n");
writeFileSync("src/styles.css", "/* @nextds/table styles: tokens of the NEXT library (Dawn and Wicked) and the table. Import once. */\n" + css.trim() + "\n");
console.log(`src/DataTable.jsx and src/styles.css written from ${file}`);
