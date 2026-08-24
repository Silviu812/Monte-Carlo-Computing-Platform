import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const backendTarget = "http://localhost:5000"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/login": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/logout": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/authorize": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
