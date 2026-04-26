import { build } from "esbuild";

await build({
  entryPoints: ["dist/src/cli/dispatch.js"],
  outfile: "dist/hook-pack-dispatch.mjs",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  sourcemap: false,
  packages: "bundle"
});
