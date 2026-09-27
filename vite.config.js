import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH lets the same build run at a domain root ("/") or under a
// GitHub Pages project path such as "/dev/" (see `npm run build:gh`).
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  base: pricess.env.VITE_BASE_PATH || "/shadhinnandi",
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
