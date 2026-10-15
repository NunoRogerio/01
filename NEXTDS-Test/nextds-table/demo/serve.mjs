// npm run demo: bundles demo/main.jsx (with the table from src/) and serves it on http://localhost:5173, rebuilding on every save.
import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: ["demo/main.jsx"],
  bundle: true,
  outdir: "demo/out",
  jsx: "automatic",
  loader: { ".js": "jsx" },
  define: { "process.env.NODE_ENV": '"development"' },
  sourcemap: true,
  logLevel: "info",
});
await ctx.watch();
const { port } = await ctx.serve({ servedir: "demo", port: 5173 });
console.log(`Demo on http://localhost:${port}`);
