import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/

export default defineConfig({
  base: "/",
  assetsInclude: ["public"],
  plugins: [react()],
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  publicDir: "public",
  server: {
    port: 3000,
    strictPort: true,
    host: true, // Cambiado de true a 'localhost'
    origin: "http://localhost:3000",
  },
});
