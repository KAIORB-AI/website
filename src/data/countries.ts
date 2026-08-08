/**
 * Country identity for the network orbs.
 *
 * Each country renders as its own map silhouette filled with its flag colours,
 * sitting inside a neutral ring. Filling the map with the flag — rather than
 * drawing a white map over flag stripes — is what keeps it legible: there is no
 * band the silhouette can disappear against, in either theme.
 *
 * The paths are deliberately simplified. At 76px a survey-accurate coastline is
 * noise; these are the few features that make each shape recognisable at a
 * glance (Florida and the Gulf, Hudson Bay, the taper to Kanyakumari).
 * Adding a country means one entry here — no component changes.
 */
export type CountryCode = 'USA' | 'CAN' | 'IND' | 'AUS'

export interface Country {
  code: CountryCode
  name: string
  /** Silhouette in a 0 0 100 100 viewBox. */
  path: string
  /** Flag bands as gradient stops. `axis` is the direction the bands run. */
  flag: { axis: 'x' | 'y'; stops: Array<{ at: number; color: string }> }
}

/** Hard stops, so the gradient renders as flag bands rather than a blur. */
function bands(axis: 'x' | 'y', colors: string[]): Country['flag'] {
  const stops: Array<{ at: number; color: string }> = []
  const step = 1 / colors.length
  colors.forEach((color, i) => {
    stops.push({ at: i * step, color })
    stops.push({ at: (i + 1) * step, color })
  })
  return { axis, stops }
}

export const COUNTRIES: Record<CountryCode, Country> = {
  USA: {
    code: 'USA',
    name: 'United States',
    // Angular west coast, the northern border, Florida and the Gulf dip.
    path:
      'M6,40 L9,31 L16,26 L24,24 L34,23 L48,22 L60,21 L68,23 L72,27 L78,24 L85,23 ' +
      'L92,27 L94,34 L90,41 L85,45 L80,48 L79,56 L81,66 L77,70 L73,62 L68,54 ' +
      'L60,52 L55,58 L50,64 L46,57 L40,52 L32,49 L22,46 L13,44 Z',
    flag: bands('y', ['#B22234', '#FFFFFF', '#B22234', '#FFFFFF', '#3C3B6E']),
  },
  CAN: {
    code: 'CAN',
    name: 'Canada',
    // The V descending from the top edge is Hudson Bay. Canada is far wider
    // than it is tall, so the path is centred on y=45 rather than sitting high
    // in the box — otherwise the silhouette floats above the middle of its orb.
    path:
      'M4,58 L7,44 L14,33 L24,25 L34,21 L42,24 L46,34 L50,44 L54,34 L58,24 ' +
      'L68,21 L78,25 L88,33 L94,44 L96,56 L88,62 L78,65 L68,62 L58,67 L48,70 ' +
      'L38,67 L28,70 L18,66 L10,63 Z',
    flag: bands('x', ['#D80621', '#FFFFFF', '#D80621']),
  },
  IND: {
    code: 'IND',
    name: 'India',
    // Broad in the north, tapering to a point in the south.
    path:
      'M30,14 L38,10 L46,13 L54,10 L62,13 L70,11 L76,16 L80,24 L76,32 L72,40 ' +
      'L66,52 L60,66 L54,80 L50,90 L46,78 L40,64 L34,50 L28,38 L24,28 L26,20 Z',
    flag: bands('y', ['#FF9933', '#FFFFFF', '#138808']),
  },
  AUS: {
    code: 'AUS',
    name: 'Australia',
    path:
      'M14,44 L20,34 L30,28 L40,26 L48,30 L56,26 L66,28 L76,32 L84,40 L86,50 ' +
      'L80,60 L70,66 L58,70 L52,78 L48,70 L38,68 L28,62 L18,54 Z',
    flag: bands('x', ['#00008B', '#FFFFFF', '#00008B']),
  },
}
