import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { URL, fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  // 📁 Explicitly set the root to the current directory
  root: './', 
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 🛡️ This prevents 404s when the browser looks for the wrong IP
    host: true, 
    // 🔄 Proxy API calls to your NestJS backend (Little Explorers API)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});