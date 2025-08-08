import path from 'path';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'brotliCompress' }),
    compression({ algorithm: 'gzip' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          mammoth: ['mammoth'],
          papaparse: ['papaparse'],
          xenova: ['@xenova/transformers'],
          recharts: ['recharts'],
          radix: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
          ],
        },
      },
    },
  },
});
