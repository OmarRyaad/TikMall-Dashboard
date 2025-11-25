import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // Transform SVGs to React components
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist", // ensure Netlify publishes the correct folder
    rollupOptions: {
      // optional: keep paths relative for SPA routing
      input: "/index.html",
    },
  },
});
