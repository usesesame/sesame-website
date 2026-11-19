import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { shippedPackages } from './scripts/shipped-packages.mjs'

const websiteRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: websiteRoot,
  plugins: [svelte(), shippedPackages('ssr')],
  build: {
    ssr: 'src/entry-server.ts',
    outDir: '.ssr',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: { entryFileNames: 'entry-server.js' },
    },
  },
})
