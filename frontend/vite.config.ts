import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '^/(thumbnail|thumbnails|explore|open|upload|authenticate|total)': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: { chunkSizeWarningLimit: 1024 }
});
