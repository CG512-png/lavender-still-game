import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: currentDir,
  base: "/lavender-still-game/",
  publicDir: path.resolve(currentDir, "../public"),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(currentDir, ".."),
    },
  },
  css: {
    postcss: path.resolve(currentDir, "../postcss.config.mjs"),
  },
  build: {
    outDir: path.resolve(currentDir, "../github-pages-dist"),
    emptyOutDir: true,
  },
});
