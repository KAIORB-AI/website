import { renderToStaticMarkup } from 'react-dom/server'
import { BusinessEvolution } from '../components/BusinessEvolution'

export function businessEvolutionHtml(): string {
  return renderToStaticMarkup(<BusinessEvolution />)
}
