import { COUNTRIES, type CountryCode } from '../data/countries'

interface Props {
  country: CountryCode
  /** Diameter in px. */
  size?: number
  /** Rendered once per country per page; ids must not collide across orbs. */
  idSuffix?: string
}

/**
 * A country as an orbital body: its map, filled with its flag, inside the
 * flattened elliptical ring that the KAI247 mark uses.
 */
export function CountryOrb({ country, size = 76, idSuffix = '' }: Props) {
  const c = COUNTRIES[country]
  const gid = `flag-${c.code}${idSuffix}`
  const clip = `clip-${c.code}${idSuffix}`
  const isX = c.flag.axis === 'x'

  return (
    <span className="k-orb" style={{ width: size, height: size }}>
      <span className="k-orb-ring" aria-hidden="true" />
      <svg viewBox="0 0 100 100" width={size} height={size} role="img"
           aria-label={`${c.name} — map outline in the national flag colours`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2={isX ? '1' : '0'} y2={isX ? '0' : '1'}>
            {c.flag.stops.map((s, i) => (
              <stop key={i} offset={`${s.at * 100}%`} stopColor={s.color} />
            ))}
          </linearGradient>
          <clipPath id={clip}>
            <circle cx="50" cy="50" r="46" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <circle cx="50" cy="50" r="46" className="k-orb-disc" />
          {/* The map is the flag: no band for the silhouette to vanish against. */}
          <path d={c.path} fill={`url(#${gid})`} stroke="rgba(15,23,42,.28)" strokeWidth="1.1"
                strokeLinejoin="round" />
        </g>
        <circle cx="50" cy="50" r="46" className="k-orb-edge" />
      </svg>
      <span className="k-orb-code">{c.code}</span>
    </span>
  )
}
