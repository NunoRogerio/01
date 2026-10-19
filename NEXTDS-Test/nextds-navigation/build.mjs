// Builds dist/ from src/: ES and CommonJS modules, the types and the styles.
// Needs TypeScript (npm i -D typescript); the package itself has no runtime dependencies besides React.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import ts from "typescript";

const compile = (file, module) => ts.transpileModule(readFileSync(`src/${file}`, "utf8"), {
  fileName: file,
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2019, module, esModuleInterop: true },
}).outputText;

mkdirSync("dist", { recursive: true });
const client = '"use client";\n'; // the navigation uses state and effects: a client component in Next.js
writeFileSync("dist/index.js", client + compile("Navigation.jsx", ts.ModuleKind.ESNext));
writeFileSync("dist/index.cjs", client + compile("Navigation.jsx", ts.ModuleKind.CommonJS));
copyFileSync("src/index.d.ts", "dist/index.d.ts");
copyFileSync("src/styles.css", "dist/styles.css");
console.log("dist/ built");
