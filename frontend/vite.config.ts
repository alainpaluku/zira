import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/lib/hero-icons-compat": path.resolve(__dirname, "./packages/ui/src/lib/hero-icons-compat.tsx"),
      "@zira/ui/lib/hero-icons-compat": path.resolve(__dirname, "./packages/ui/src/lib/hero-icons-compat.tsx"),
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./packages/shared/src"),
      "@ui": path.resolve(__dirname, "./packages/ui/src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    outDir: "dist",
  },
});
