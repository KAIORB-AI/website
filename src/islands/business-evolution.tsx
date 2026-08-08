import { createRoot } from 'react-dom/client'
import { BusinessEvolution } from '../components/BusinessEvolution'

/**
 * Mounts the BusinessEvolution island into any `[data-island="business-evolution"]` element.
 */
document.querySelectorAll<HTMLElement>('[data-island="business-evolution"]').forEach((el) => {
  el.innerHTML = ''
  createRoot(el).render(<BusinessEvolution />)
})
