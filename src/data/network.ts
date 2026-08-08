/**
 * The network graph — the single place a company is described.
 *
 * Adding a founding company or a network brand is an entry here and nothing
 * else. Country palettes and map silhouettes live in `countries.ts`, so a new
 * country needs one entry there rather than an edit to any component.
 */
import type { CountryCode } from './countries'

export type Relationship = 'founding' | 'network-brand'

export interface NetworkEntity {
  /** Stable id — used for React keys and deep links. */
  id: string
  name: string
  /** Short form for tight layouts; falls back to `name`. */
  shortName?: string
  country: CountryCode
  url: string
  /**
   * One verified sentence, in the company's own terms.
   * Leave undefined rather than inventing one — Easy Q2C has no descriptor
   * because easyq2c.com could not be reached to verify it.
   */
  descriptor?: string
  relationship: Relationship
}

export const FOUNDING: NetworkEntity[] = [
  {
    id: 'brahmexa',
    name: 'Brahmexa LLC',
    country: 'USA',
    url: 'https://brahmexa.com/',
    descriptor:
      'AI lab making agentic automation accessible to small businesses and underserved communities.',
    relationship: 'founding',
  },
  {
    id: 'inducer',
    name: 'Inducer Solutions LLC',
    country: 'CAN',
    url: 'https://www.inducersolutions.com/',
    descriptor:
      'Agentic AI, autonomous multi-agent systems, MCP-powered context intelligence and AIOps.',
    relationship: 'founding',
  },
  {
    id: 'jsi',
    name: 'JSI Software Solutions',
    country: 'IND',
    url: 'https://jsisoftwaresolutions.com/',
    descriptor:
      'Smart interactive boards, computer labs and AI datacenter services for schools and enterprises.',
    relationship: 'founding',
  },
]
