import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/

export default defineConfig({
  base: "/",
  assetsInclude: ['public'],
  plugins: [react()],
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  publicDir: 'public',
  server: {
    
    port: 3000,
    strictPort: true,
    host: true, // Cambiado de true a 'localhost'
    origin: "http://0.0.0.0:3000",
    proxy: {
      "/api": {
        target: "http://backend:5000", // Utiliza el nombre del servicio 'backend' en lugar de 'localhost'
      },
    },
    
  },
  
});
