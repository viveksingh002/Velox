'use client'

import { useEffect, useRef, useState } from 'react'

const plans = [
  {
    id: 'bike',
    tag: 'QUICK',
    name: 'Bike',
    desc: 'Urban rides, zero hassle.',
    price: '₹49',
    per: '/hr',
    featured: false,
    delay: '0s',
    color: '#5ac8fa',
    glowColor: 'rgba(90,200,250,0.5)',
    features: ['Instant unlock', 'GPS tracking', 'Helmet included'],
  },
  {
    id: 'car',
    tag: 'COMFORT',
    name: 'Car',
    desc: 'The everyday essential.',
    price: '₹249',
    per: '/hr',
    featured: true,
    badge: 'MOST POPULAR',
    delay: '0.1s',
    color: '#0071e3',
    glowColor: 'rgba(0,113,227,0.7)',
    features: ['AC included', 'Fuel covered', 'Insurance', '24/7 support'],
  },
  {
    id: 'suv',
    tag: 'PREMIUM',
    name: 'SUV',
    desc: 'Space and power combined.',
    price: '₹499',
    per: '/hr',
    featured: false,
    delay: '0.2s',
    color: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.5)',
    features: ['7-seater option', 'Premium interiors', 'Insurance', 'Priority support'],
  },
  {
    id: 'truck',
    tag: 'HEAVY',
    name: 'Truck',
    desc: 'Built for serious cargo.',
    price: '₹999',
    per: '/hr',
    featured: false,
    delay: '0.3s',
    color: 'rgba(255,255,255,0.65)',
    glowColor: 'rgba(255,255,255,0.2)',
    features: ['Verified drivers', 'Load tracking', 'Cargo insurance', 'Pan-India routes'],
  },
]

/* ── Inline SVG icons ── */
function BikeIcon({ color }: { color: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
      <circle cx="11" cy="34" r="7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="37" cy="34" r="7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="11" cy="34" r="2.5" fill={color} opacity="0.5"/>
      <circle cx="37" cy="34" r="2.5" fill={color} opacity="0.5"/>
      <path d="M11 34 L20 20 L28 20 L37 27" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20 L24 14 L30 14 L32 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30 14 L34 12 M30 14 L30 18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 20 L28 20" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M11 34 L8 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

function CarIcon({ color }: { color: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="26" width="40" height="10" rx="3" stroke={color} strokeWidth="2"/>
      <path d="M10 26 L15 16 L33 16 L38 26" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 26 L19 18 L29 18 L32 26" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      <line x1="24" y1="18" x2="24" y2="26" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <circle cx="13" cy="36" r="4.5" stroke={color} strokeWidth="2"/>
      <circle cx="35" cy="36" r="4.5" stroke={color} strokeWidth="2"/>
      <circle cx="13" cy="36" r="1.8" fill={color} opacity="0.4"/>
      <circle cx="35" cy="36" r="1.8" fill={color} opacity="0.4"/>
      <rect x="37" y="28" width="4" height="3" rx="1" fill={color} opacity="0.7"/>
      <rect x="7"  y="28" width="4" height="3" rx="1" fill={color} opacity="0.4"/>
    </svg>
  )
}

function SuvIcon({ color }: { color: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
      <rect x="3" y="24" width="42" height="12" rx="3" stroke={color} strokeWidth="2"/>
      <path d="M8 24 L11 13 L37 13 L40 24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="12" y="15" width="8"  height="9" rx="1.5" stroke={color} strokeWidth="1.4" opacity="0.55"/>
      <rect x="22" y="15" width="8"  height="9" rx="1.5" stroke={color} strokeWidth="1.4" opacity="0.55"/>
      <rect x="32" y="15" width="4"  height="9" rx="1.5" stroke={color} strokeWidth="1.4" opacity="0.55"/>
      <circle cx="12" cy="36" r="5" stroke={color} strokeWidth="2"/>
      <circle cx="36" cy="36" r="5" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="36" r="2" fill={color} opacity="0.4"/>
      <circle cx="36" cy="36" r="2" fill={color} opacity="0.4"/>
      <rect x="38" y="26" width="4" height="4" rx="1" fill={color} opacity="0.7"/>
      <rect x="6"  y="26" width="4" height="4" rx="1" fill={color} opacity="0.35"/>
      <line x1="13" y1="13" x2="35" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function TruckIcon({ color }: { color: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
      <rect x="2" y="16" width="28" height="18" rx="2" stroke={color} strokeWidth="2"/>
      <path d="M30 24 L30 34 L46 34 L46 28 L42 20 L30 20 Z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M32 22 L32 28 L44 28 L41 22 Z" stroke={color} strokeWidth="1.4" opacity="0.5" strokeLinejoin="round"/>
      <circle cx="10" cy="34" r="5" stroke={color} strokeWidth="2"/>
      <circle cx="22" cy="34" r="5" stroke={color} strokeWidth="2"/>
      <circle cx="39" cy="34" r="5" stroke={color} strokeWidth="2"/>
      <circle cx="10" cy="34" r="2" fill={color} opacity="0.3"/>
      <circle cx="22" cy="34" r="2" fill={color} opacity="0.3"/>
      <circle cx="39" cy="34" r="2" fill={color} opacity="0.3"/>
      <rect x="43" y="28" width="3" height="3" rx="0.5" fill={color} opacity="0.6"/>
      <line x1="10" y1="16" x2="10" y2="34" stroke={color} strokeWidth="1" opacity="0.2"/>
      <line x1="18" y1="16" x2="18" y2="34" stroke={color} strokeWidth="1" opacity="0.2"/>
    </svg>
  )
}

const iconMap: Record<string, (color: string) => JSX.Element> = {
  bike:  (c) => <BikeIcon color={c} />,
  car:   (c) => <CarIcon color={c} />,
  suv:   (c) => <SuvIcon color={c} />,
  truck: (c) => <TruckIcon color={c} />,
}

export default function Pricing() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .pricing-section {
          padding: 8rem 2.5rem;
          background: #020204;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .pricing-inner { max-width: 1100px; margin: 0 auto; }

        .pricing-header {
          text-align: center; margin-bottom: 4rem;
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .pricing-header--visible { opacity: 1; transform: none; }

        .pricing-label {
          font-size: 11px; color: #0071e3; letter-spacing: 3px;
          margin-bottom: 0.75rem; display: flex; align-items: center;
          justify-content: center; gap: 10px; font-weight: 800;
        }
        .pricing-label::before, .pricing-label::after {
          content: ''; width: 30px; height: 1px; background: #0071e3;
        }
        .pricing-title {
          font-size: clamp(36px,5vw,60px); font-weight: 800;
          letter-spacing: -3px; color: #fff; text-align: center;
          text-transform: uppercase; line-height: 1; margin-bottom: 0.75rem;
        }
        .pricing-title em {
          font-style: italic; font-weight: 200;
          background: linear-gradient(135deg,#5ac8fa,#0071e3);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .pricing-sub {
          font-size: 15px; color: rgba(255,255,255,0.45);
          max-width: 440px; margin: 0 auto; line-height: 1.7;
        }

        .pricing-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 14px;
        }

        .price-card {
          border-radius: 22px; padding: 2.2rem 1.8rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          cursor: pointer; position: relative; overflow: hidden;
          opacity: 0; transform: translateY(32px);
          transition: opacity 0.6s ease, transform 0.6s ease,
            border-color 0.35s, box-shadow 0.35s, background 0.35s;
        }
        .price-card--visible { opacity: 1; transform: translateY(0); }
        .price-card:hover {
          transform: translateY(-8px) !important;
          border-color: rgba(0,113,227,0.35);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
          background: rgba(255,255,255,0.05);
        }
        .price-card--featured {
          background: rgba(0,113,227,0.1);
          border-color: rgba(0,113,227,0.35);
          box-shadow: 0 0 40px rgba(0,113,227,0.12);
        }
        .price-card--featured:hover {
          background: rgba(0,113,227,0.16) !important;
          box-shadow: 0 24px 80px rgba(0,113,227,0.3) !important;
        }
        .price-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg,transparent,#0071e3,transparent);
          transform: scaleX(0); transition: transform 0.4s;
        }
        .price-card:hover::after { transform: scaleX(1); }
        .price-card--featured::after { transform: scaleX(1); opacity: 0.5; }

        .price-badge {
          position: absolute; top: -1px; right: 1.5rem;
          background: linear-gradient(135deg,#0071e3,#34aadc);
          color: #fff; font-size: 9px; letter-spacing: 0.5px;
          padding: 5px 12px; border-radius: 0 0 10px 10px; font-weight: 800;
        }

        /* Icon box */
        .price-icon-wrap {
          width: 64px; height: 64px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 16px;
          margin-bottom: 1.2rem;
          transition: transform 0.35s;
          position: relative;
        }
        .price-card:hover .price-icon-wrap {
          transform: scale(1.1) translateY(-3px);
        }

        .price-tag {
          font-size: 10px; letter-spacing: 2.5px;
          color: rgba(255,255,255,0.3); margin-bottom: 1.4rem; font-weight: 800;
        }
        .price-name {
          font-size: 20px; font-weight: 700; letter-spacing: -0.5px;
          color: #fff; margin-bottom: 0.3rem;
        }
        .price-desc {
          font-size: 13px; color: rgba(255,255,255,0.4);
          margin-bottom: 1.5rem; line-height: 1.5;
        }
        .price-divider { height: 1px; background: rgba(255,255,255,0.07); margin-bottom: 1.5rem; }
        .price-from {
          font-size: 10px; color: rgba(255,255,255,0.28);
          letter-spacing: 0.5px; margin-bottom: 0.2rem; font-weight: 600;
        }
        .price-amount {
          font-size: 32px; font-weight: 200; color: #fff;
          letter-spacing: -1.5px; margin-bottom: 1.5rem;
        }
        .price-amount sub {
          font-size: 13px; color: rgba(255,255,255,0.35);
          vertical-align: middle; font-weight: 500;
        }

        .price-features { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.8rem; }
        .price-feature { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.45); }
        .price-feature-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #0071e3; flex-shrink: 0; opacity: 0.6;
        }
        .price-card--featured .price-feature { color: rgba(255,255,255,0.65); }
        .price-card--featured .price-feature-dot { opacity: 1; }

        .price-btn {
          width: 100%; padding: 11px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.25s;
          font-family: inherit; letter-spacing: 0.3px;
        }
        .price-btn:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.25); }
        .price-btn--featured {
          background: #0071e3; border-color: transparent; color: #fff;
          box-shadow: 0 0 20px rgba(0,113,227,0.35);
        }
        .price-btn--featured:hover { background: #0062c4; box-shadow: 0 0 35px rgba(0,113,227,0.55); color: #fff; }

        .pricing-note {
          text-align: center; margin-top: 2.5rem;
          font-size: 12px; color: rgba(255,255,255,0.2); letter-spacing: 0.3px;
        }
        .pricing-note span { color: #0071e3; }

        @media (max-width: 900px) {
          .pricing-section { padding: 5rem 1.25rem; }
          .pricing-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 540px) {
          .pricing-grid { grid-template-columns: 1fr; }
          .pricing-title { letter-spacing: -2px; }
        }
      `}</style>

      <section id="pricing" className="pricing-section" ref={sectionRef}>
        <div className="pricing-inner">

          <div className={`pricing-header ${visible ? 'pricing-header--visible' : ''}`}>
            <div className="pricing-label">PRICING</div>
            <h2 className="pricing-title"><em>Transparent.</em> Always.</h2>
            <p className="pricing-sub">No hidden fees. No surge pricing. What you see is exactly what you pay.</p>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`price-card ${plan.featured ? 'price-card--featured' : ''} ${visible ? 'price-card--visible' : ''}`}
                style={{ transitionDelay: visible ? plan.delay : '0s' }}
                onMouseEnter={() => setHovered(plan.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {plan.badge && <div className="price-badge">{plan.badge}</div>}

                <div className="price-tag">{plan.tag}</div>

                {/* Premium SVG icon box */}
                <div
                  className="price-icon-wrap"
                  style={{
                    background: `${plan.color}12`,
                    boxShadow: hovered === plan.id
                      ? `0 0 28px ${plan.glowColor}33`
                      : `0 0 16px ${plan.glowColor}1a`,
                  }}
                >
                  {iconMap[plan.id](
                    hovered === plan.id || plan.featured ? plan.color : plan.color
                  )}
                </div>

                <div className="price-name">{plan.name}</div>
                <div className="price-desc">{plan.desc}</div>

                <div className="price-divider" />

                <div className="price-from">FROM</div>
                <div className="price-amount">{plan.price}<sub>{plan.per}</sub></div>

                <div className="price-features">
                  {plan.features.map((f) => (
                    <div className="price-feature" key={f}>
                      <div
                        className="price-feature-dot"
                        style={{ background: plan.color }}
                      />
                      {f}
                    </div>
                  ))}
                </div>

                <button className={`price-btn ${plan.featured ? 'price-btn--featured' : ''}`}>
                  {plan.featured ? 'Get started' : 'Choose plan'}
                </button>
              </div>
            ))}
          </div>

          <p className="pricing-note">
            All prices exclude GST · <span>Free cancellation</span> up to 30 min before pickup
          </p>
        </div>
      </section>
    </>
  )
}