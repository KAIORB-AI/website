import { useLayoutEffect, useRef, useState } from 'react'
import { CountryOrb } from './CountryOrb'
import { FOUNDING } from '../data/network'

interface Point { x: number; y: number }

export function Trinity() {
  const wrap = useRef<HTMLDivElement>(null)
  const orbs = useRef<Array<HTMLDivElement | null>>([])
  const [pts, setPts] = useState<Point[] | null>(null)
  const [centre, setCentre] = useState<Point | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const box = wrap.current?.getBoundingClientRect()
      if (!box) return
      const found = orbs.current.map((el) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }
      })
      if (found.some((p) => !p)) return
      const p = found as Point[]
      setPts(p)
      setCentre({
        x: (p[0].x + p[1].x + p[2].x) / 3,
        y: (p[0].y + p[1].y + p[2].y) / 3,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (wrap.current) ro.observe(wrap.current)
    window.addEventListener('resize', measure)
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {})
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  return (
    <div className="k-trinity" ref={wrap}>
      {pts && centre && (
        <svg className="k-trinity-edges" aria-hidden="true">
          <polygon
            points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#f2c56d"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            opacity="0.6"
          />
          <g className="k-trinity-core" transform={`translate(${centre.x} ${centre.y})`}>
            <circle r="22" fill="url(#coreGradTri)" />
            <circle r="28" fill="none" stroke="#f2c56d" strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
            <text textAnchor="middle" dy="4" fill="#14100a" fontSize="10" fontWeight="800" fontFamily="Space Grotesk">KAI</text>
          </g>
          <defs>
            <radialGradient id="coreGradTri" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffeec2" />
              <stop offset="60%" stopColor="#eebc61" />
              <stop offset="100%" stopColor="#b07d24" />
            </radialGradient>
          </defs>
        </svg>
      )}

      {FOUNDING.map((e, i) => (
        <a
          key={e.id}
          className={`k-world k-world-${i}`}
          href={e.url}
          rel="noopener"
          data-slug={e.id}
          data-name={e.name}
          data-url={e.url}
        >
          <div className="k-world-orb" ref={(el) => { orbs.current[i] = el }}>
            <CountryOrb country={e.country} idSuffix={`-t${i}`} size={88} />
          </div>
          <div className="k-world-info">
            <span className="k-world-name">{e.name}</span>
            {e.descriptor && <span className="k-world-desc">{e.descriptor}</span>}
            <span className="k-world-link">{new URL(e.url).hostname.replace(/^www\./, '')} ↗</span>
          </div>
        </a>
      ))}
    </div>
  )
}
