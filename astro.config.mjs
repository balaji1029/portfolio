import { defineConfig } from "astro/config";

// One codebase, two deploy targets:
//   GitHub Pages:  SITE_BASE=/            (default)
//   CSE homepage:  SITE_BASE=/~balaji/    (npm run build:cse)
export default defineConfig({
  site: process.env.SITE_URL ?? "https://balaji1029.github.io",
  base: process.env.SITE_BASE ?? "/",
  outDir: process.env.OUT_DIR ?? "dist",
  trailingSlash: "ignore",
  build: { format: "directory" },
});
