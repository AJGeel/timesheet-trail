import { resolve } from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig, type PluginOption } from "vite";

import { buildTargets } from "./buildTarget.ts";
import manifest from "./src/manifest.ts";

const root = resolve(import.meta.dirname, "src");
const outDir = resolve(
  import.meta.dirname,
  process.env.BUILD_TARGET === buildTargets.firefox
    ? "dist/firefox"
    : "dist/chromium",
);

/** Writes the manifest for the current BUILD_TARGET into the build. */
const emitManifest = (): PluginOption => ({
  generateBundle() {
    this.emitFile({
      fileName: "manifest.json",
      source: JSON.stringify(manifest, null, 2),
      type: "asset",
    });
  },
  name: "emit-manifest",
});

export default defineConfig({
  build: {
    outDir,
    rollupOptions: {
      input: {
        popup: resolve(root, "pages", "popup", "index.html"),
      },
      output: {
        entryFileNames: (chunk) => `src/pages/${chunk.name}/index.js`,
      },
    },
    sourcemap: process.env.__DEV__ === "true",
  },
  plugins: [react(), emitManifest()],
  resolve: {
    alias: { "@/src": root },
  },
});
