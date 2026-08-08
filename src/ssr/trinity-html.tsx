import { renderToStaticMarkup } from 'react-dom/server'
import { Trinity } from '../components/Trinity'

/**
 * The trinity as static HTML.
 *
 * useLayoutEffect never runs on the server, so the measured triangle edges are
 * absent here — the orbs, names, descriptors and links are all present. That is
 * exactly the right split: everything a crawler or a no-JS visitor needs is in
 * the HTML, and the only thing the client adds is geometry it has to measure.
 */
export function trinityHtml(): string {
  return renderToStaticMarkup(<Trinity />)
}
