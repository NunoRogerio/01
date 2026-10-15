// Builds dist/ from src/: an ES module, a CommonJS module, the types and the styles.
// Needs TypeScript (npm i -D typescript); the package itself has no runtime dependencies besides React.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import ts from "typescript";

const src = readFileSync("src/DataTable.jsx", "utf8");
const banner = '"use client";\n'; // the table uses state and effects: a client component in Next.js
const build = (module) => ts.transpileModule(src, {
  fileName: "DataTable.jsx",
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2019, module, esModuleInterop: true },
}).outputText;

mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.js", banner + build(ts.ModuleKind.ESNext));
writeFileSync("dist/index.cjs", banner + build(ts.ModuleKind.CommonJS));
copyFileSync("src/index.d.ts", "dist/index.d.ts");
copyFileSync("src/styles.css", "dist/styles.css");
console.log("dist/ built");
