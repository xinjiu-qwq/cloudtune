import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite dev server must not open the browser; Tauri owns the window.
// Fixed port + strict so Tauri's devUrl always matches.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  // Relative asset paths are required: the production app is served from
  // Tauri's custom protocol (tauri://localhost), where absolute /assets
  // URLs fail to resolve and the window renders blank.
  base: "./",
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_ENV_"],
  build: {
    target: "esnext",
    outDir: "dist",
  },
});
