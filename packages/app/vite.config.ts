import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**', '**/node_modules/**', '**/.git/**'],
    },
  },
  resolve: {
    alias: {
      // All @/ imports resolve to client package src (since app wraps client)
      '@': path.resolve(__dirname, '../client/src'),
      '@client': path.resolve(__dirname, '../client/src'),
      '@app': path.resolve(__dirname, './src'),
      // Prevent node Sentry code from entering the browser bundle
      '@sentry/node': path.resolve(__dirname, './src/mocks/empty-module.ts'),
      '@sentry/node-core': path.resolve(__dirname, './src/mocks/empty-module.ts'),
    },
    // Ensure a single React instance
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['buffer', 'process', '@elizaos/core', '@elizaos/api-client'],
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 2200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@elizaos')) {
              return 'elizaos-vendor';
            }
            if (id.includes('@tauri-apps')) {
              return 'tauri-vendor';
            }
          }
        },
      },
    },
  },
  define: {
    // Define globals for browser compatibility
    'process.env': JSON.stringify({}),
    'process.browser': true,
    global: 'globalThis',
  },
}));
