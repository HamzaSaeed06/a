import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = process.env.PORT || "5173";
const apiPort = process.env.API_PORT || "3001";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: Number(port),
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
      "/uploads": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
      "/socket.io": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    port: Number(port),
    host: "0.0.0.0",
  },
});
