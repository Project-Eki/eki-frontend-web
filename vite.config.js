import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  server: {
    port: 3000,
    open: true, // This will automatically open your browser when you run the app
  
    proxy: {
    "/api": {
      target: "'http://127.0.0.1:8000'", // Change this to your backend server URL
      changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});