import { defineConfig } from 'vite';
import { resolve } from 'path';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  base: '/',
  publicDir: 'public',
  plugins: [
    ViteImageOptimizer({
      png: { quality: 60 },
      jpeg: { quality: 90 },
      jpg: { quality: 90 },
      webp: { quality: 90 },
      gif: { optimizationLevel: 3, interlaced: true },      svg: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupIds: false,
                minifyStyles: false,
              },
            },
          },
        ],
      },      exclude: /\.avif$/i,
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    hmr: false,
  },
});
