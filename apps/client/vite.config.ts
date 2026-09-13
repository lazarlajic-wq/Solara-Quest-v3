import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@solara/shared": fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url)),
      "@solara/content": fileURLToPath(new URL("../../packages/content/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
