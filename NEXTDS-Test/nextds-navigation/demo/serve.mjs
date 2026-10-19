// npm run demo: bundles demo/main.jsx (with the navigation from src/) and serves it on http://localhost:5174, rebuilding on every save.
import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: ["demo/main.jsx"], bundle: true, outdir: "demo/out", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"' }, sourcemap: true, logLevel: "info",
});
await ctx.watch();
const { port } = await ctx.serve({ servedir: "demo", port: 5174 });
console.log(`Demo on http://localhost:${port}`);
