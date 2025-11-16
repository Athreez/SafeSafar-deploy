import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  appType: "spa",
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  plugins: [react()]
});
