'use client'

import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    num: '01',
    title: 'Choose your vehicle',
    desc: 'Browse our fleet, filter by type, budget, or location. Find your perfect match in seconds.',
  },
  {
    num: '02',
    title: 'Set your schedule',
    desc: 'Pick date, time, and pickup point. Instant confirmation — no calls, no waiting.',
  },
  {
    num: '03',
    title: 'Ride & track live',
    desc: 'Grab the keys and go. Track your journey in real time. Return completely hassle-free.',
  },
]

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Auto-cycle active step
  useEffect(() => {
    if (!visible) return
    const t = setInterval(() => {
      setActiveStep((s) => (s + 1) % steps.length)
    }, 2800)
    return () => clearInterval(t)
  }, [visible])

  return (
    <>
      <style>{`
        .how-section {
          padding: 8rem 2.5rem;
          background: #050508;
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .how-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }

        /* ── Left ── */
        .how-label {
          font-size: 11px;
          color: #0071e3;
          letter-spacing: 3px;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
        }
        .how-label::before {
          content: '';
          width: 30px;
          height: 1px;
          background: #0071e3;
        }

        .how-title {
          font-size: clamp(34px, 4vw, 54px);
          font-weight: 800;
          letter-spacing: -2.5px;
          line-height: 1;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          color: #fff;
        }
        .how-title em {
          font-style: italic;
          font-weight: 200;
          background: linear-gradient(135deg, #5ac8fa, #0071e3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .how-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          max-width: 380px;
          line-height: 1.7;
          margin-bottom: 3rem;
        }

        /* Steps */
        .how-steps { display: flex; flex-direction: column; gap: 0; }

        .how-step {
          display: flex;
          gap: 1.5rem;
          padding: 1.6rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: padding-left 0.3s, border-color 0.3s;
          position: relative;
        }
        .how-step:last-child { border-bottom: none; }
        .how-step:hover,
        .how-step--active {
          padding-left: 0.5rem;
        }
        .how-step--active {
          border-bottom-color: rgba(0,113,227,0.25) !important;
        }

        .step-num {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(0,113,227,0.1);
          border: 1px solid rgba(0,113,227,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: rgba(0,113,227,0.7);
          letter-spacing: 1px;
          transition: all 0.3s;
          font-weight: 700;
          flex-shrink: 0;
        }
        .how-step--active .step-num,
        .how-step:hover .step-num {
          background: rgba(0,113,227,0.22);
          border-color: rgba(0,113,227,0.5);
          color: #0071e3;
          box-shadow: 0 0 20px rgba(0,113,227,0.3);
        }

        .step-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 0.3rem;
          transition: color 0.3s;
        }
        .how-step--active .step-title { color: #fff; }

        .step-desc {
          font-size: 13.5px;
          color: rgba(255,255,255,0.35);
          line-height: 1.6;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease, opacity 0.3s;
          opacity: 0;
        }
        .how-step--active .step-desc {
          max-height: 80px;
          opacity: 1;
        }

        /* Progress bar */
        .step-progress {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(0,113,227,0.15);
          border-radius: 2px;
          overflow: hidden;
        }
        .step-progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: #0071e3;
          border-radius: 2px;
          height: 0%;
          transition: height 0s;
        }
        .how-step--active .step-progress-fill {
          height: 100%;
          transition: height 2.8s linear;
        }

        .how-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 2.5rem;
          padding: 14px 32px;
          background: #0071e3;
          color: #fff;
          border: none;
          border-radius: 980px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 0 28px rgba(0,113,227,0.4);
          font-family: inherit;
        }
        .how-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 50px rgba(0,113,227,0.6);
        }

        /* ── Right — Phone mockup ── */
        .phone-wrap {
          display: flex;
          justify-content: center;
          position: relative;
        }

        .phone-glow {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,113,227,0.15), transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .phone {
          width: 220px;
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          border-radius: 38px;
          padding: 12px;
          border: 1px solid rgba(255,255,255,0.13);
          position: relative;
          box-shadow:
            0 40px 100px rgba(0,0,0,0.6),
            0 0 0 1px rgba(255,255,255,0.04),
            0 0 80px rgba(0,113,227,0.12);
          animation: phoneFloat 6s ease-in-out infinite;
        }

        @keyframes phoneFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }

        .phone-notch {
          width: 60px;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          margin: 0 auto 12px;
        }

        .phone-screen {
          background: #08080d;
          border-radius: 28px;
          overflow: hidden;
          aspect-ratio: 0.47;
        }

        /* Map */
        .phone-map {
          height: 140px;
          background: linear-gradient(135deg, #0d1a2e, #0a2a4a);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .map-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,113,227,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,113,227,0.18) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .map-dot {
          width: 12px;
          height: 12px;
          background: #0071e3;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(0,113,227,0.8);
          position: relative;
          z-index: 1;
        }
        .map-dot::after {
          content: '';
          position: absolute;
          width: 30px;
          height: 30px;
          border: 2px solid rgba(0,113,227,0.4);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          animation: ping 2s infinite;
        }
        @keyframes ping {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
        }

        /* Phone UI */
        .phone-ui { padding: 14px; }
        .phone-ui-title {
          font-size: 11px;
          color: rgba(255,255,255,0.9);
          font-weight: 700;
          margin-bottom: 10px;
        }

        .phone-car-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          transition: background 0.2s;
        }
        .phone-car-card:hover {
          background: rgba(255,255,255,0.1);
        }
        .pcc-icon { font-size: 20px; }
        .pcc-info { flex: 1; }
        .pcc-name { font-size: 11px; color: #fff; font-weight: 600; margin-bottom: 2px; }
        .pcc-dist { font-size: 10px; color: rgba(255,255,255,0.38); }
        .pcc-price { font-size: 11px; color: #5ac8fa; font-weight: 600; }

        .phone-book-btn {
          width: 100%;
          padding: 10px;
          background: #0071e3;
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
          box-shadow: 0 4px 20px rgba(0,113,227,0.4);
          font-family: inherit;
          transition: transform 0.2s;
        }
        .phone-book-btn:hover { transform: translateY(-1px); }

        /* Reveal */
        .how-left, .how-right {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .how-left--visible { opacity: 1; transform: none; }
        .how-right--visible { opacity: 1; transform: none; transition-delay: 0.2s; }

        /* Responsive */
        @media (max-width: 900px) {
          .how-section { padding: 5rem 1.25rem; }
          .how-inner {
            grid-template-columns: 1fr;
            gap: 4rem;
          }
          .phone-wrap { order: -1; }
        }
      `}</style>

      <section id="how" className="how-section" ref={sectionRef}>
        <div className="how-inner">

          {/* Left — Steps */}
          <div className={`how-left ${visible ? 'how-left--visible' : ''}`}>
            <div className="how-label">HOW IT WORKS</div>
            <h2 className="how-title">
              Three steps.<br />
              <em>Zero friction.</em>
            </h2>
            <p className="how-sub">
              From search to ignition in under 60 seconds. No paperwork, no waiting.
            </p>

            <div className="how-steps">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`how-step ${activeStep === i ? 'how-step--active' : ''}`}
                  onClick={() => setActiveStep(i)}
                >
                  {/* Side progress bar */}
                  <div className="step-progress">
                    <div className="step-progress-fill" />
                  </div>

                  <div className="step-num">{step.num}</div>
                  <div>
                    <div className="step-title">{step.title}</div>
                    <div className="step-desc">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="how-btn">
              Start booking
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Right — Phone */}
          <div className={`phone-wrap how-right ${visible ? 'how-right--visible' : ''}`}>
            <div className="phone-glow" />
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-map">
                  <div className="map-grid" />
                  <div className="map-dot" />
                </div>
                <div className="phone-ui">
                  <div className="phone-ui-title">Nearby vehicles</div>
                  <div className="phone-car-card">
                    <span className="pcc-icon">🚗</span>
                    <div className="pcc-info">
                      <div className="pcc-name">Honda City</div>
                      <div className="pcc-dist">320m away</div>
                    </div>
                    <div className="pcc-price">₹249/hr</div>
                  </div>
                  <div className="phone-car-card">
                    <span className="pcc-icon">🚙</span>
                    <div className="pcc-info">
                      <div className="pcc-name">Hyundai Creta</div>
                      <div className="pcc-dist">510m away</div>
                    </div>
                    <div className="pcc-price">₹499/hr</div>
                  </div>
                  <button className="phone-book-btn">Book instantly →</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}