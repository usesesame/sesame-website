import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { shippedPackages } from './scripts/shipped-packages.mjs'

const websiteRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: websiteRoot,
  plugins: [svelte(), shippedPackages('client')],
  server: {
    port: 4173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
