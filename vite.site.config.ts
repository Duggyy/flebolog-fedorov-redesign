import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-dafedorov",
    // dist-dafedorov содержит не только артефакты Vite, но и всю медиатеку
    // (images/ ~600 файлов, videos/). Полная очистка папки их сносит, поэтому
    // выключаем emptyOutDir, а устаревшие бандлы убирает scripts/prepare-dist.mjs
    // (запускается в build:site перед vite build).
    emptyOutDir: false,
  },
}));
