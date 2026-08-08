import { createRoot } from 'react-dom/client'
import { Trinity } from '../components/Trinity'

/**
 * Mounts the trinity into any `[data-island="trinity"]` element.
 *
 * The element ships with a static server-rendered fallback inside it, so the
 * page is complete and crawlable before this file loads — and stays complete if
 * it never does. Mounting replaces that fallback with the measured version.
 */
document.querySelectorAll<HTMLElement>('[data-island="trinity"]').forEach((el) => {
  el.innerHTML = ''
  createRoot(el).render(<Trinity />)
})
