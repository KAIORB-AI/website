/**
 * Bakes island markup into the static pages.
 *
 * Every page that mounts an island carries the same component's server-rendered
 * output between HTML markers, so the page is complete before any JavaScript
 * loads and stays complete if it never does. Re-running this is idempotent: the
 * region between the markers is replaced wholesale.
 *
 * Fails loudly rather than silently leaving a page stale — a page that declares
 * an island but has no marker is a bug, not a no-op.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { trinityHtml } from '../.ssr/trinity.mjs'

const TARGETS = [{ file: 'network/index.html', island: 'trinity', render: trinityHtml }]

let changed = 0
for (const { file, island, render } of TARGETS) {
  const open = `<!-- island:${island} -->`
  const close = `<!-- /island:${island} -->`
  const src = readFileSync(file, 'utf8')
  const a = src.indexOf(open)
  const b = src.indexOf(close)
  if (a < 0 || b < 0) {
    console.error(`prerender: ${file} has no ${open} … ${close} markers`)
    process.exit(1)
  }
  const next = src.slice(0, a + open.length) + '\n' + render() + '\n' + src.slice(b)
  if (next !== src) {
    writeFileSync(file, next)
    changed++
    console.log(`prerender: ${file} ← ${island}`)
  } else {
    console.log(`prerender: ${file} already current`)
  }
}
console.log(`prerender: ${changed} file(s) updated`)
