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
    // (images/ ~610 файлов, videos/): полная очистка папки их сносит. Остатки
    // прошлых сборок убирает scripts/clean-dist.mjs — он идёт ПОСЛЕ vite build
    // в build:site и удаляет только файлы, недостижимые от index.html.
    emptyOutDir: false,
  },
}));
