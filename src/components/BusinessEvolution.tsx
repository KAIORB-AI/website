import { useState, useEffect } from 'react'

export interface BusinessCategory {
  id: string
  name: string
  actionText: string
  microCopy: string
  capabilities: string[]
  disclaimer?: string
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    actionText: 'Run a restaurant?',
    microCopy: 'Grow it. Focus on your food and hospitality — KaiOrb strengthens local discovery and customer engagement around your business.',
    capabilities: ['Hosting', 'REACH', 'COMET', 'ORBIT', 'AI', 'Utilities'],
  },
  {
    id: 'landscaping',
    name: 'Landscaping & Lawn Care',
    actionText: 'Own a landscaping business?',
    microCopy: 'Grow it. KaiOrb helps property owners across your city find your services 24×7.',
    capabilities: ['Hosting', 'REACH', 'COMET', 'AI', 'Utilities'],
  },
  {
    id: 'urgent-care',
    name: 'Urgent Care & Dental',
    actionText: 'Operate an urgent care or medical practice?',
    microCopy: 'Strengthen it. KaiOrb supports the digital and administrative business infrastructure around your patient care.',
    capabilities: ['Hosting', 'REACH', 'AI', 'Utilities'],
    disclaimer: 'Supports business infrastructure (web presence, discovery & utilities). Does not provide clinical, diagnostic, or regulatory compliance systems.',
  },
  {
    id: 'retail',
    name: 'Retail Store & Boutique',
    actionText: 'Run a retail store?',
    microCopy: 'Reach farther. Connect local foot traffic with seamless online catalog discovery.',
    capabilities: ['Hosting', 'REACH', 'E-Commerce', 'AI', 'Utilities'],
  },
  {
    id: 'construction',
    name: 'Construction & Trades',
    actionText: 'Build homes, plumbing, or HVAC?',
    microCopy: 'Find more customers. Streamline project inquiries, quote requests, and local reputation.',
    capabilities: ['Hosting', 'REACH', 'SEO', 'AI', 'Utilities'],
  },
  {
    id: 'events',
    name: 'Event Business & Venue',
    actionText: 'Organize events & entertainment?',
    microCopy: 'Fill more seats. Streamline ticketing, venue promotion, and audience reach.',
    capabilities: ['Hosting', 'REACH', 'ORBIT', 'COMET', 'AI'],
  },
  {
    id: 'professional',
    name: 'Legal, Accounting & Consulting',
    actionText: 'Provide professional services?',
    microCopy: 'Strengthen client engagement. Support client intake, document workflows, and local presence.',
    capabilities: ['Hosting', 'REACH', 'AI', 'Utilities'],
    disclaimer: 'Supports business web presence and client intake workflows. Does not provide legal or financial advice.',
  },
  {
    id: 'anything',
    name: 'Whatever You Build',
    actionText: 'Whatever you do.',
    microCopy: 'You shouldn\'t have to build everything around it. KaiOrb evolves the rest.',
    capabilities: ['Hosting', 'REACH', 'ORBIT', 'COMET', 'AI', 'Utilities', 'Global Network'],
  },
]

const ALL_CAPABILITIES = ['Hosting', 'REACH', 'ORBIT', 'COMET', 'E-Commerce', 'SEO', 'AI', 'Utilities', 'Global Network']

export function BusinessEvolution() {
  const [activeIdx, setActiveIdx] = useState(0)

  // Gently auto-cycle categories if user hasn't selected manually
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % BUSINESS_CATEGORIES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const current = BUSINESS_CATEGORIES[activeIdx]

  return (
    <div className="k-business-evolution-stage">
      {/* WHAT DO YOU DO? Header */}
      <div className="k-biz-header">
        <span className="kicker">WHAT DO YOU DO?</span>
        <h2>{current.actionText}</h2>
        <p className="k-biz-microcopy">{current.microCopy}</p>
        {current.disclaimer && (
          <p className="k-biz-disclaimer">ℹ️ {current.disclaimer}</p>
        )}
      </div>

      {/* Category Pills Selector */}
      <div className="k-biz-pills">
        {BUSINESS_CATEGORIES.map((cat, i) => {
          const isActive = i === activeIdx
          return (
            <button
              key={cat.id}
              type="button"
              className={`k-biz-pill ${isActive ? 'active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Spatial Orbital Diagram: YOUR BUSINESS at Center */}
      <div className="k-biz-diagram" role="img" aria-label="Diagram showing KaiOrb capability nodes surrounding YOUR BUSINESS.">
        <svg viewBox="0 0 700 480" className="k-biz-svg">
          <defs>
            <radialGradient id="bizCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffeec2" />
              <stop offset="60%" stopColor="#eebc61" />
              <stop offset="100%" stopColor="#b07d24" />
            </radialGradient>
          </defs>

          {/* Surrounding Capability Ring */}
          <circle cx="350" cy="240" r="170" fill="none" stroke="var(--line)" strokeDasharray="4 8" strokeWidth="1.5" />
          <circle cx="350" cy="240" r="110" fill="none" stroke="var(--line)" strokeWidth="1" opacity="0.4" />

          {/* Lines connecting YOUR BUSINESS to active capabilities */}
          {ALL_CAPABILITIES.map((cap, i) => {
            const angle = (i * 2 * Math.PI) / ALL_CAPABILITIES.length - Math.PI / 2
            const capX = 350 + 170 * Math.cos(angle)
            const capY = 240 + 170 * Math.sin(angle)
            const isCapActive = current.capabilities.includes(cap)

            return (
              <g key={cap}>
                <line
                  x1="350"
                  y1="240"
                  x2={capX}
                  y2={capY}
                  stroke={isCapActive ? 'var(--gold)' : 'var(--line)'}
                  strokeWidth={isCapActive ? '1.8' : '1'}
                  strokeDasharray={isCapActive ? 'none' : '3 6'}
                  opacity={isCapActive ? 0.8 : 0.25}
                />
                <circle
                  cx={capX}
                  cy={capY}
                  r={isCapActive ? '20' : '14'}
                  fill={isCapActive ? 'var(--surface)' : 'var(--bg0)'}
                  stroke={isCapActive ? 'var(--gold)' : 'var(--line)'}
                  strokeWidth={isCapActive ? '2' : '1'}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={capX}
                  y={capY + 32}
                  textAnchor="middle"
                  fill={isCapActive ? 'var(--ink)' : 'var(--mut)'}
                  fontSize={isCapActive ? '13' : '11'}
                  fontWeight={isCapActive ? '700' : '400'}
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {cap}
                </text>
              </g>
            )
          })}

          {/* CENTER NODE: YOUR BUSINESS (Not KaiOrb) */}
          <g className="k-biz-center-node">
            <circle cx="350" cy="240" r="62" fill="url(#bizCoreGrad)" style={{ filter: 'drop-shadow(0 0 24px rgba(242,197,109,0.4))' }} />
            <circle cx="350" cy="240" r="70" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="3 5" />
            <text x="350" y="235" textAnchor="middle" fill="#14100a" fontSize="13" fontWeight="900" fontFamily="Space Grotesk">
              YOUR BUSINESS
            </text>
            <text x="350" y="254" textAnchor="middle" fill="#2d2212" fontSize="9" fontWeight="600" fontFamily="Inter">
              Your Brand Stays Yours
            </text>
          </g>
        </svg>
      </div>

      {/* Narrative Flow Step Cards */}
      <div className="k-biz-flow-grid">
        <div className="k-biz-flow-step">
          <span className="k-biz-flow-num">01</span>
          <h4>You Know Your Business</h4>
          <p>You know your craft, your service, and your local customers.</p>
        </div>
        <div className="k-biz-flow-step">
          <span className="k-biz-flow-num">02</span>
          <h4>Don't Build Everything Around It</h4>
          <p>Hosting, growth, AI, and digital capabilities arrive without technical complexity.</p>
        </div>
        <div className="k-biz-flow-step">
          <span className="k-biz-flow-num">03</span>
          <h4>Your Brand Stays Yours</h4>
          <p>Keep your name, look, and ownership. More capabilities arrive as KaiOrb evolves 24×7.</p>
        </div>
      </div>
    </div>
  )
}
