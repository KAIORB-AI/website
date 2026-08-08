import { COUNTRIES, type CountryCode } from '../data/countries'

interface Props {
  country: CountryCode
  /** Diameter in px. */
  size?: number
  /** Rendered once per country per page; ids must not collide across orbs. */
  idSuffix?: string
}

/**
  A country as a clean orbital body: embedded country map filled with flag gradients,
  sitting inside a clean, glowing radial disc.
 */
export function CountryOrb({ country, size = 88, idSuffix = '' }: Props) {
  const c = COUNTRIES[country]
  const gid = `flag-${c.code}${idSuffix}`
  const clip = `clip-${c.code}${idSuffix}`
  const discGradId = `disc-${c.code}${idSuffix}`
  const isX = c.flag.axis === 'x'

  return (
    <span className="k-orb" style={{ width: size, height: size }}>
      <span className="k-orb-ring" aria-hidden="true" />
      <svg viewBox="0 0 100 100" width={size} height={size} role="img"
           aria-label={`${c.name} — map outline in national flag colours`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2={isX ? '1' : '0'} y2={isX ? '0' : '1'}>
            {c.flag.stops.map((s, i) => (
              <stop key={i} offset={`${s.at * 100}%`} stopColor={s.color} />
            ))}
          </linearGradient>
          <radialGradient id={discGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="70%" stopColor="#f8fafc" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.9" />
          </radialGradient>
          <clipPath id={clip}>
            <circle cx="50" cy="50" r="46" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          {/* Luminous clean white/slate disc background — never black */}
          <circle cx="50" cy="50" r="46" fill={`url(#${discGradId})`} />
          {/* Embedded country map filled with flag gradient */}
          <path d={c.path} fill={`url(#${gid})`} stroke="rgba(15, 23, 42, 0.4)" strokeWidth="1.2" strokeLinejoin="round" />
        </g>
        {/* Outer glowing gold ring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="#f2c56d" strokeWidth="2.5" />
      </svg>
      <span className="k-orb-code">{c.code}</span>
    </span>
  )
}
