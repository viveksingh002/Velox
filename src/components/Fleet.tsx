'use client'

import { useEffect, useRef } from 'react'

export default function Fleet() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.fleet-card')
    if (!cards) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fleet-card--visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .fleet-section {
          padding: 8rem 2.5rem;
          background: #050508;
          border-top: 1px solid rgba(255,255,255,0.04);
          position: relative;
        }
        .fleet-inner { max-width: 1100px; margin: 0 auto; }
        .fleet-label {
          font-size: 11px; color: #0071e3; letter-spacing: 3px;
          margin-bottom: 0.75rem; display: flex; align-items: center;
          gap: 10px; font-weight: 800;
        }
        .fleet-label::before { content:''; width:30px; height:1px; background:#0071e3; }
        .fleet-title {
          font-size: clamp(38px,5vw,64px); font-weight: 800; letter-spacing: -3px;
          line-height: 1; margin-bottom: 0.75rem; text-transform: uppercase; color: #fff;
        }
        .fleet-title em {
          font-style: italic; font-weight: 200;
          background: linear-gradient(135deg,#5ac8fa,#0071e3);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .fleet-sub {
          font-size: 16px; color: rgba(255,255,255,0.5); max-width: 400px;
          line-height: 1.7; font-weight: 400; margin-bottom: 4rem;
        }
        .fleet-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto; gap: 16px;
        }
        .fleet-card {
          border-radius: 24px; padding: 3rem; position: relative;
          overflow: hidden; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          opacity: 0; transform: translateY(32px);
          transition: opacity 0.6s cubic-bezier(0.4,0,0.2,1),
            transform 0.6s cubic-bezier(0.4,0,0.2,1),
            border-color 0.4s, box-shadow 0.4s;
        }
        .fleet-card--visible { opacity: 1; transform: translateY(0); }
        .fleet-card:nth-child(2) { transition-delay: 0.1s; }
        .fleet-card:nth-child(3) { transition-delay: 0.2s; }
        .fleet-card:nth-child(4) { transition-delay: 0.3s; }
        .fleet-card::before {
          content:''; position:absolute; inset:0; opacity:0;
          transition: opacity 0.4s; border-radius:24px;
          background: radial-gradient(circle at 30% 40%, rgba(0,113,227,0.15), transparent 60%);
        }
        .fleet-card:hover { transform: translateY(-6px) !important; border-color: rgba(0,113,227,0.3); box-shadow: 0 30px 80px rgba(0,0,0,0.4); }
        .fleet-card:hover::before { opacity: 1; }
        .fleet-card--big { grid-row: 1/3; background: linear-gradient(145deg,#0a0a14,#111128); }
        .fleet-card--wide { grid-column: 1/3; display: flex; justify-content: space-between; align-items: center; gap: 3rem; }
        .fleet-card-num { font-size:11px; color:rgba(255,255,255,0.25); letter-spacing:3px; margin-bottom:2rem; font-weight:700; }

        /* SVG icon wrapper */
        .fleet-icon-wrap {
          width: 72px; height: 72px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 18px;
          margin-bottom: 1.5rem;
          position: relative;
          transition: transform 0.4s;
        }
        .fleet-card:hover .fleet-icon-wrap { transform: translateX(6px) scale(1.06); }
        .fleet-icon-wrap svg { width: 44px; height: 44px; }

        /* icon bg glow per card */
        .fleet-icon-wrap--bike { background: rgba(90,200,250,0.1); box-shadow: 0 0 24px rgba(90,200,250,0.15); }
        .fleet-icon-wrap--car  { background: rgba(0,113,227,0.1);  box-shadow: 0 0 24px rgba(0,113,227,0.15); }
        .fleet-icon-wrap--suv  { background: rgba(167,139,250,0.1); box-shadow: 0 0 24px rgba(167,139,250,0.15); }
        .fleet-icon-wrap--truck{ background: rgba(255,255,255,0.06); box-shadow: 0 0 20px rgba(255,255,255,0.06); }

        .fleet-card h3 { font-size:26px; font-weight:700; letter-spacing:-1px; color:#fff; margin-bottom:0.4rem; }
        .fleet-card p  { font-size:14px; color:rgba(255,255,255,0.5); line-height:1.6; max-width:280px; }
        .fleet-price   { font-size:28px; font-weight:200; color:#fff; letter-spacing:-1px; margin-top:2rem; }
        .fleet-price b { font-size:13px; font-weight:400; color:rgba(255,255,255,0.4); }
        .fleet-cta {
          display:inline-flex; align-items:center; gap:6px; margin-top:1.5rem;
          font-size:12px; letter-spacing:0.5px; cursor:pointer; transition:gap 0.2s;
          font-weight:600; background:none; border:none; padding:0;
        }
        .fleet-cta:hover { gap: 10px; }

        /* BG watermark SVG */
        .fleet-bg-svg {
          position:absolute; right:-10px; bottom:-10px;
          width:140px; height:140px; opacity:0.04;
          pointer-events:none; transition:transform 0.4s;
        }
        .fleet-card:hover .fleet-bg-svg { transform: scale(1.1) rotate(-5deg); }
        .fleet-wide-bg-svg { width:130px; height:130px; opacity:0.04; flex-shrink:0; }

        @media (max-width:768px) {
          .fleet-section { padding:5rem 1.25rem; }
          .fleet-grid { grid-template-columns:1fr; }
          .fleet-card--big { grid-row:auto; }
          .fleet-card--wide { grid-column:auto; flex-direction:column; align-items:flex-start; gap:0; }
          .fleet-wide-bg-svg { display:none; }
          .fleet-card { padding:2rem; }
        }
      `}</style>

      <section id="fleet" className="fleet-section" ref={sectionRef}>
        <div className="fleet-inner">
          <div className="fleet-label">OUR FLEET</div>
          <h2 className="fleet-title">The right vehicle<br /><em>for every moment.</em></h2>
          <p className="fleet-sub">Handpicked. Verified. Insured. Every vehicle meets the highest standard.</p>

          <div className="fleet-grid">

            {/* 01 — Bike */}
            <div className="fleet-card fleet-card--big">
              <div className="fleet-card-num">01 — QUICK</div>
              <div className="fleet-icon-wrap fleet-icon-wrap--bike">
                {/* Scooter / motorbike SVG */}
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="34" r="7" stroke="#5ac8fa" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="37" cy="34" r="7" stroke="#5ac8fa" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="11" cy="34" r="2.5" fill="#5ac8fa" opacity="0.5"/>
                  <circle cx="37" cy="34" r="2.5" fill="#5ac8fa" opacity="0.5"/>
                  {/* body */}
                  <path d="M11 34 L20 20 L28 20 L37 27" stroke="#5ac8fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 20 L24 14 L30 14 L32 20" stroke="#5ac8fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* handlebar */}
                  <path d="M30 14 L34 12 M30 14 L30 18" stroke="#5ac8fa" strokeWidth="1.8" strokeLinecap="round"/>
                  {/* seat */}
                  <path d="M20 20 L28 20" stroke="#5ac8fa" strokeWidth="2.5" strokeLinecap="round"/>
                  {/* exhaust */}
                  <path d="M11 34 L8 32" stroke="#5ac8fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
              <h3>Bikes &amp; Scooters</h3>
              <p>Swift, nimble, urban-perfect. Zero wait, pure freedom through every lane.</p>
              <div className="fleet-price">₹49 <b>/hr</b></div>
              <button className="fleet-cta" style={{ color: '#5ac8fa' }}>
                Book now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              {/* watermark */}
              <svg className="fleet-bg-svg" viewBox="0 0 48 48" fill="none">
                <circle cx="11" cy="34" r="7" stroke="#5ac8fa" strokeWidth="2"/>
                <circle cx="37" cy="34" r="7" stroke="#5ac8fa" strokeWidth="2"/>
                <path d="M11 34 L20 20 L28 20 L37 27" stroke="#5ac8fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20 L24 14 L30 14 L32 20" stroke="#5ac8fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* 02 — Car */}
            <div className="fleet-card">
              <div className="fleet-card-num">02 — COMFORT</div>
              <div className="fleet-icon-wrap fleet-icon-wrap--car">
                {/* Sedan SVG */}
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="26" width="40" height="10" rx="3" stroke="#0071e3" strokeWidth="2"/>
                  <path d="M10 26 L15 16 L33 16 L38 26" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* windows */}
                  <path d="M16 26 L19 18 L29 18 L32 26" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                  <line x1="24" y1="18" x2="24" y2="26" stroke="#0071e3" strokeWidth="1.2" opacity="0.5"/>
                  {/* wheels */}
                  <circle cx="13" cy="36" r="4.5" stroke="#0071e3" strokeWidth="2"/>
                  <circle cx="35" cy="36" r="4.5" stroke="#0071e3" strokeWidth="2"/>
                  <circle cx="13" cy="36" r="1.8" fill="#0071e3" opacity="0.4"/>
                  <circle cx="35" cy="36" r="1.8" fill="#0071e3" opacity="0.4"/>
                  {/* headlight */}
                  <rect x="37" y="28" width="4" height="3" rx="1" fill="#0071e3" opacity="0.7"/>
                  <rect x="7" y="28" width="4" height="3" rx="1" fill="#0071e3" opacity="0.4"/>
                </svg>
              </div>
              <h3>Cars &amp; Sedans</h3>
              <p>City comfort, every commute.</p>
              <div className="fleet-price">₹249 <b>/hr</b></div>
              <button className="fleet-cta" style={{ color: '#5ac8fa' }}>
                Explore
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <svg className="fleet-bg-svg" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="26" width="40" height="10" rx="3" stroke="#0071e3" strokeWidth="2"/>
                <path d="M10 26 L15 16 L33 16 L38 26" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="13" cy="36" r="4.5" stroke="#0071e3" strokeWidth="2"/>
                <circle cx="35" cy="36" r="4.5" stroke="#0071e3" strokeWidth="2"/>
              </svg>
            </div>

            {/* 03 — SUV */}
            <div className="fleet-card">
              <div className="fleet-card-num">03 — PREMIUM</div>
              <div className="fleet-icon-wrap fleet-icon-wrap--suv">
                {/* SUV SVG — taller, boxier */}
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="24" width="42" height="12" rx="3" stroke="#a78bfa" strokeWidth="2"/>
                  <path d="M8 24 L11 13 L37 13 L40 24" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* windows: 3 panes */}
                  <rect x="12" y="15" width="8" height="9" rx="1.5" stroke="#a78bfa" strokeWidth="1.4" opacity="0.55"/>
                  <rect x="22" y="15" width="8" height="9" rx="1.5" stroke="#a78bfa" strokeWidth="1.4" opacity="0.55"/>
                  <rect x="32" y="15" width="4" height="9" rx="1.5" stroke="#a78bfa" strokeWidth="1.4" opacity="0.55"/>
                  {/* wheels */}
                  <circle cx="12" cy="36" r="5" stroke="#a78bfa" strokeWidth="2"/>
                  <circle cx="36" cy="36" r="5" stroke="#a78bfa" strokeWidth="2"/>
                  <circle cx="12" cy="36" r="2" fill="#a78bfa" opacity="0.4"/>
                  <circle cx="36" cy="36" r="2" fill="#a78bfa" opacity="0.4"/>
                  {/* lights */}
                  <rect x="38" y="26" width="4" height="4" rx="1" fill="#a78bfa" opacity="0.7"/>
                  <rect x="6"  y="26" width="4" height="4" rx="1" fill="#a78bfa" opacity="0.35"/>
                  {/* roof rack lines */}
                  <line x1="13" y1="13" x2="35" y2="13" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>SUVs &amp; Vans</h3>
              <p>Space, power, and pure prestige.</p>
              <div className="fleet-price">₹499 <b>/hr</b></div>
              <button className="fleet-cta" style={{ color: '#5ac8fa' }}>
                Explore
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <svg className="fleet-bg-svg" viewBox="0 0 48 48" fill="none">
                <rect x="3" y="24" width="42" height="12" rx="3" stroke="#a78bfa" strokeWidth="2"/>
                <path d="M8 24 L11 13 L37 13 L40 24" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="36" r="5" stroke="#a78bfa" strokeWidth="2"/>
                <circle cx="36" cy="36" r="5" stroke="#a78bfa" strokeWidth="2"/>
              </svg>
            </div>

            {/* 04 — Truck wide */}
            <div className="fleet-card fleet-card--wide">
              <div>
                <div className="fleet-card-num">04 — HEAVY</div>
                <div className="fleet-icon-wrap fleet-icon-wrap--truck">
                  {/* Truck SVG */}
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* cargo box */}
                    <rect x="2" y="16" width="28" height="18" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
                    {/* cab */}
                    <path d="M30 24 L30 34 L46 34 L46 28 L42 20 L30 20 Z" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinejoin="round"/>
                    {/* cab window */}
                    <path d="M32 22 L32 28 L44 28 L41 22 Z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" opacity="0.5" strokeLinejoin="round"/>
                    {/* wheels */}
                    <circle cx="10" cy="34" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
                    <circle cx="22" cy="34" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
                    <circle cx="39" cy="34" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
                    <circle cx="10" cy="34" r="2" fill="rgba(255,255,255,0.25)"/>
                    <circle cx="22" cy="34" r="2" fill="rgba(255,255,255,0.25)"/>
                    <circle cx="39" cy="34" r="2" fill="rgba(255,255,255,0.25)"/>
                    {/* headlight */}
                    <rect x="43" y="28" width="3" height="3" rx="0.5" fill="rgba(255,255,255,0.5)"/>
                    {/* cargo lines */}
                    <line x1="10" y1="16" x2="10" y2="34" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                    <line x1="18" y1="16" x2="18" y2="34" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                  </svg>
                </div>
                <h3>Trucks &amp; Cargo</h3>
                <p>Industrial strength. Verified drivers. For every load, every distance across India.</p>
                <div className="fleet-price">₹999 <b>/hr</b></div>
                <button className="fleet-cta" style={{ color: '#5ac8fa' }}>
                  Get a quote
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
              {/* wide card watermark */}
              <svg className="fleet-wide-bg-svg" viewBox="0 0 48 48" fill="none">
                <rect x="2" y="16" width="28" height="18" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
                <path d="M30 24 L30 34 L46 34 L46 28 L42 20 L30 20 Z" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="10" cy="34" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
                <circle cx="22" cy="34" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
                <circle cx="39" cy="34" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
              </svg>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}