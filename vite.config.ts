import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Islands, not a single-page app.
 *
 * The marketing pages stay static HTML: they must render with no JavaScript for
 * crawlers, for reduced-motion visitors, and because the deploy is a tarball of
 * files rather than a server. React is mounted only where a component will grow
 * — starting with the network trinity, whose whole point is that adding a
 * company should be a one-line data change.
 *
 * Filenames are unhashed on purpose: the HTML that references them is
 * hand-written, so a hash would have to be threaded into every page on every
 * build. Cache busting is the deploy's job (the docroot is replaced wholesale).
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'assets/build',
    emptyOutDir: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        trinity: 'src/islands/trinity.tsx',
        'business-evolution': 'src/islands/business-evolution.tsx'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
