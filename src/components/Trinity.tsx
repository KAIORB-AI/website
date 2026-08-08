import { useLayoutEffect, useRef, useState } from 'react'
import { CountryOrb } from './CountryOrb'
import { FOUNDING } from '../data/network'

interface Point { x: number; y: number }

/**
 * The founding trinity as a triangle.
 *
 * Deliberately point-DOWN. An upward triangle puts one country at the apex, and
 * an apex reads as rank — which is wrong for three companies that deliver as
 * one network. Pointing down leaves the top edge flat: two countries sit level
 * with each other, the third sits below, and no country occupies the centre.
 * The centre belongs to KAI247 itself.
 *
 * The connecting edges are measured from the rendered orbs rather than
 * hard-coded percentages, so they stay attached at any width or font size.
 */
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
    // Web fonts land after first paint and move the labels, which moves the orbs.
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
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="3 9"
          />
          <g className="k-trinity-core" transform={`translate(${centre.x} ${centre.y})`}>
            <ellipse rx="19" ry="9.5" fill="none" stroke="currentColor" strokeWidth="1.6"
                     transform="rotate(-24)" />
            <circle r="6.5" className="k-trinity-core-dot" />
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
            <CountryOrb country={e.country} idSuffix={`-t${i}`} />
          </div>
          <span className="k-world-name">{e.name}</span>
          {e.descriptor && <span className="k-world-desc">{e.descriptor}</span>}
          <span className="k-world-link">{new URL(e.url).hostname.replace(/^www\./, '')} ↗</span>
        </a>
      ))}
    </div>
  )
}
