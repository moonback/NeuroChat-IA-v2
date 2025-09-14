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
  define: {
    // Variables d'environnement pour PWA
    __PWA_VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
    __PWA_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
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
    // Optimisations PWA
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Générer des noms de fichiers avec hash pour le cache busting
    assetsDir: 'assets',
    sourcemap: false,
  },
  // Configuration pour le développement PWA
  server: {
    https: false, // PWA fonctionne en HTTP local
    host: true,
    port: 3000,
  },
  // Optimisations pour PWA
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom'],
  },
});
