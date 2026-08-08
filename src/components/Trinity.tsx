import { useLayoutEffect, useRef, useState } from 'react'
import { CountryOrb } from './CountryOrb'
import { FOUNDING } from '../data/network'

interface Point { x: number; y: number }

/**
 * The founding trinity as a 3D Tall Pyramid.
 *
 * KAI sits at the top apex peak of the pyramid, with the 3 founding country orbs
 * (USA, Canada, India) forming the 3D base vertices. Luminous 3D facets and golden
 * connecting edges visually unite the three continents under one central intelligence name.
 */
export function Trinity() {
  const wrap = useRef<HTMLDivElement>(null)
  const orbs = useRef<Array<HTMLDivElement | null>>([])
  const [pts, setPts] = useState<Point[] | null>(null)
  const [centre, setCentre] = useState<Point | null>(null)
  const [apex, setApex] = useState<Point | null>(null)

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
      const cX = (p[0].x + p[1].x + p[2].x) / 3
      const minY = Math.min(p[0].y, p[1].y, p[2].y)
      setCentre({ x: cX, y: (p[0].y + p[1].y + p[2].y) / 3 })
      // Apex peak sitting 80px above the highest base vertex
      setApex({ x: cX, y: Math.max(10, minY - 90) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (wrap.current) ro.observe(wrap.current)
    window.addEventListener('resize', measure)
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {})
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  return (
    <div className="k-trinity k-pyramid-stage" ref={wrap}>
      {pts && apex && centre && (
        <svg className="k-trinity-edges" aria-hidden="true">
          <defs>
            <linearGradient id="pyrFacetLeft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2c56d" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#d9a13f" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="pyrFacetRight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffeec2" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#eebc61" stopOpacity="0.08" />
            </linearGradient>
            <radialGradient id="kaiApexGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffeec2" />
              <stop offset="55%" stopColor="#eebc61" />
              <stop offset="100%" stop-color="#b07d24" />
            </radialGradient>
          </defs>

          {/* 3D Pyramid Facets */}
          <polygon
            points={`${apex.x},${apex.y} ${pts[0].x},${pts[0].y} ${pts[1].x},${pts[1].y}`}
            fill="url(#pyrFacetLeft)"
            stroke="#f2c56d"
            strokeWidth="1.6"
            strokeDasharray="4 6"
          />
          <polygon
            points={`${apex.x},${apex.y} ${pts[1].x},${pts[1].y} ${pts[2].x},${pts[2].y}`}
            fill="url(#pyrFacetRight)"
            stroke="#f2c56d"
            strokeWidth="1.6"
            strokeDasharray="4 6"
          />

          {/* Base Edge Connections */}
          <polygon
            points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#f2c56d"
            strokeWidth="1.4"
            strokeDasharray="3 7"
            opacity="0.5"
          />
          <line x1={apex.x} y1={apex.y} x2={pts[2].x} y2={pts[2].y} stroke="#f2c56d" strokeWidth="1.8" />

          {/* 3D KAI Pyramid Apex Peak Node */}
          <g className="k-trinity-apex" transform={`translate(${apex.x} ${apex.y})`}>
            <circle r="34" fill="none" stroke="#f2c56d" strokeWidth="1.2" strokeDasharray="3 5" opacity="0.6" />
            <circle r="26" fill="url(#kaiApexGrad)" style={{ filter: 'drop-shadow(0 0 14px rgba(242,197,109,0.5))' }} />
            <text textAnchor="middle" dy="5" fill="#14100a" fontSize="13" fontWeight="900" fontFamily="Space Grotesk" letterSpacing="0.05em">KAI</text>
          </g>
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
