/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: false,
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
  },
});
