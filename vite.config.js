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
      avif: { quality: 90 },
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
      },
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$ /, /\.(gz)$/],
      include: [/\.(html|xml|css|json|js|mjs|svg|yaml|yml|toml|avif)$/i],
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$ /, /\.(gz)$/],
      include: [/\.(html|xml|css|json|js|mjs|svg|yaml|yml|toml|avif)$/i],
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
