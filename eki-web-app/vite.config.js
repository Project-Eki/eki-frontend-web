/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // PROXY HINT: 
      // If your Django backend is expecting '/api/v1/accounts/auth/register/' 
      // but your 'rewrite' is removing the prefix, the backend might be getting 
      // the wrong URL. If you get 404s, try removing the 'rewrite' line.
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api\/v1\/accounts/, ""), 
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    // Adding this helps Vitest handle the new Tailwind 4 engine during tests
    css: true, 
  },
});



// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),
//   tailwindcss(),
//   ],
//   server: {
//     port: 3000,
//     open: true, // This will automatically open your browser when you run the app
  
//     proxy: {
//       "/api/v1/accounts": {
//         target: "http://127.0.0.1:8000",
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api\/v1\/accounts/, ""),
//       },
//     },
//   },
//   test: {
//     environment: "jsdom",
//     globals: true,
//     setupFiles: "./src/setupTests.js",
//   },
// });
