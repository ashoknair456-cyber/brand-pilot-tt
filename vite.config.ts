import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3200,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      }
    }
  },
  plugins: [react()],
  define: {
    'process.env': {}
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
