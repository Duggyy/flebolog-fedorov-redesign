import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  publicDir: "public-clinicbase",
  server: {
    host: "::",
    port: 8081,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    {
      name: "clinicbase-dev-entry",
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          if (
            request.url === "/" ||
            request.url?.startsWith("/login") ||
            request.url?.startsWith("/doctor-db") ||
            request.url?.startsWith("/doctor-admin")
          ) {
            request.url = "/clinicbase.html";
          }
          next();
        });
      },
    },
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-clinicbase",
    // См. комментарий в vite.site.config.ts: полная очистка папки сборки
    // упирается в защиту от массового удаления и роняет сборку, успев удалить
    // часть файлов. Устаревшие бандлы убирает scripts/prepare-dist.mjs.
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "clinicbase.html"),
      },
    },
  },
}));
