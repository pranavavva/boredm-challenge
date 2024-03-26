import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://0.0.0.0:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
      "/ws": {
        target: "ws://0.0.0.0:5000",
        ws: true,
      },
    },
  },
});
