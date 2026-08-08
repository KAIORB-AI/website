import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Server build of the islands, used only at build time by scripts/prerender.mjs
 * to bake the markup into the static HTML. Output is gitignored — it never ships.
 *
 * This is what stops the island and its no-JS fallback from drifting apart:
 * both come from the same component, so a change to Trinity.tsx updates the
 * crawlable HTML in the same commit.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    outDir: '.ssr',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        trinity: 'src/ssr/trinity-html.tsx',
        'business-evolution': 'src/ssr/business-evolution-html.tsx'
      },
      output: { entryFileNames: '[name].mjs', format: 'es' },
    },
  },
})
