'use client'

import { useEffect, useRef } from 'react'

interface HeroProps {
  onSendPrompt?: (text: string) => void
  onOpenModal?: () => void
}

export default function Hero({ onSendPrompt, onOpenModal }: HeroProps) {
  const carRef = useRef<SVGSVGElement>(null)
  const reflectionRef = useRef<HTMLDivElement>(null)
  const headlightRef = useRef<SVGLineElement>(null)
  const taillightRef = useRef<SVGLineElement>(null)
  const frontBeamRef = useRef<SVGPathElement>(null)
  const rearBeamRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const car = carRef.current
    const reflection = reflectionRef.current
    const headlightIcon = headlightRef.current
    const taillightIcon = taillightRef.current
    const frontBeam = frontBeamRef.current
    const rearBeam = rearBeamRef.current

    if (!car) return

    let targetScrollY = window.scrollY
    let currentInterpolatedY = window.scrollY
    let lastInterpolatedY = window.scrollY
    let lightTimer: ReturnType<typeof setTimeout> | null = null
    let animFrame: number

    const lerpFactor = 0.065
    const horizontalScale = -0.6
    const scrollRange = 1000

    const updateCarPosition = () => {
      currentInterpolatedY += (targetScrollY - currentInterpolatedY) * lerpFactor

      const progress = Math.min(currentInterpolatedY / scrollRange, 1.4)
      const translateX = progress * (window.innerWidth * horizontalScale)
      const scale = 1 - progress * 0.12
      const opacity = 1 - Math.max(0, (progress - 1.0) * 4)

      car.style.transform = `translateX(${translateX}px) scale(${scale}) scaleX(-1)`
      car.style.opacity = String(opacity)

      if (reflection) {
        reflection.style.transform = `translateX(${translateX}px) scale(${scale}) scaleX(-1)`
        reflection.style.opacity = String(opacity * 0.7)
      }

      const delta = currentInterpolatedY - lastInterpolatedY

      if (Math.abs(delta) > 0.1) {
        if (delta > 0) {
          headlightIcon?.classList.add('light-active')
          taillightIcon?.classList.remove('light-active')
          frontBeam?.classList.add('light-active')
          rearBeam?.classList.remove('light-active')
        } else {
          taillightIcon?.classList.add('light-active')
          headlightIcon?.classList.remove('light-active')
          rearBeam?.classList.add('light-active')
          frontBeam?.classList.remove('light-active')
        }

        if (lightTimer) clearTimeout(lightTimer)
        lightTimer = setTimeout(() => {
          headlightIcon?.classList.remove('light-active')
          taillightIcon?.classList.remove('light-active')
          frontBeam?.classList.remove('light-active')
          rearBeam?.classList.remove('light-active')
        }, 150)
      } else {
        headlightIcon?.classList.remove('light-active')
        taillightIcon?.classList.remove('light-active')
        frontBeam?.classList.remove('light-active')
        rearBeam?.classList.remove('light-active')
      }

      lastInterpolatedY = currentInterpolatedY
      animFrame = requestAnimationFrame(updateCarPosition)
    }

    const onScroll = () => {
      targetScrollY = window.scrollY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    animFrame = requestAnimationFrame(updateCarPosition)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(animFrame)
      if (lightTimer) clearTimeout(lightTimer)
    }
  }, [])

  const handleSendPrompt = (text: string) => {
    onSendPrompt?.(text)
  }

  return (
    <>
      <style>{`
        .hero-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          padding-top: 100px;
          background:
            radial-gradient(ellipse 120% 80% at 50% 110%, rgba(0,113,227,0.15), transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(90,140,255,0.1), transparent),
            linear-gradient(160deg, #f0f4ff 0%, #eef3fe 40%, #f5f7fa 100%);
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(0,80,200,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,80,200,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
          -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black, transparent);
          mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black, transparent);
          animation: gridDrift 20s linear infinite;
        }

        @keyframes gridDrift {
          from { background-position: 0 0; }
          to { background-position: 60px 60px; }
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
        }

        .hero-orb-1 {
          width: 600px; height: 600px;
          background: rgba(0,113,227,0.12);
          bottom: -200px; left: 50%;
          transform: translateX(-50%);
          animation: orbPulse 6s ease-in-out infinite;
        }

        .hero-orb-2 {
          width: 350px; height: 350px;
          background: rgba(80,120,255,0.08);
          top: 10%; right: -50px;
          animation: orbDrift 9s ease-in-out infinite alternate;
        }

        .hero-orb-3 {
          width: 280px; height: 280px;
          background: rgba(0,150,220,0.07);
          top: 20%; left: -30px;
          animation: orbDrift 12s ease-in-out infinite;
        }

        @keyframes orbPulse {
          0%, 100% { opacity: .8; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
        }

        @keyframes orbDrift {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }

        .speed-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,113,227,0.4), transparent);
          pointer-events: none;
          animation: speedLine 3s linear infinite;
          opacity: 0;
        }

        @keyframes speedLine {
          0% { opacity: 0; transform: translateX(100%); }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-100%); }
        }

        .hero-content {
          position: relative;
          z-index: 10;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 980px;
          background: rgba(0,113,227,0.09);
          border: 1px solid rgba(0,113,227,0.22);
          font-size: 12px;
          color: rgba(0,60,150,0.85);
          letter-spacing: .5px;
          margin-bottom: 1.5rem;
          animation: fadeUp .6s .1s both;
          font-weight: 600;
        }

        .badge-dot {
          width: 7px; height: 7px;
          background: #0071e3;
          border-radius: 50%;
          box-shadow: 0 0 8px #0071e3;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(.8); }
        }

        .hero-h1 {
          font-size: clamp(60px, 9vw, 110px);
          font-weight: 900;
          letter-spacing: -5px;
          line-height: .95;
          margin-bottom: 1.5rem;
          animation: fadeUp .8s .25s both;
          text-transform: uppercase;
          background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-h1 span {
          display: block;
          font-style: italic;
          font-weight: 200;
          text-transform: none;
          letter-spacing: -3px;
          font-size: .85em;
          background: linear-gradient(135deg, #00aaff, #0071e3, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 18px;
          color: rgba(20,30,80,0.7);
          max-width: 480px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
          font-weight: 400;
          animation: fadeUp .8s .4s both;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          animation: fadeUp .8s .55s both;
        }

        .btn-glow {
          padding: 15px 36px;
          background: #0071e3;
          color: #fff;
          border: none;
          border-radius: 980px;
          font-size: 15px;
          cursor: pointer;
          font-weight: 600;
          transition: all .3s;
          box-shadow: 0 0 30px rgba(0,113,227,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
        }

        .btn-glow:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 0 60px rgba(0,113,227,0.6), inset 0 1px 0 rgba(255,255,255,0.15);
        }

        .btn-ghost {
          padding: 15px 36px;
          background: rgba(255,255,255,0.85);
          color: #111;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 980px;
          font-size: 15px;
          cursor: pointer;
          transition: all .25s;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
          font-weight: 500;
          font-family: inherit;
        }

        .btn-ghost:hover {
          background: rgba(255,255,255,1);
          border-color: rgba(0,113,227,0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }

        .hero-car-wrap {
          position: relative;
          z-index: 5;
          margin-top: 2rem;
          animation: fadeUp .9s .65s both;
          perspective: 1000px;
        }

        .hero-car-svg {
          width: min(700px, 90vw);
          filter: drop-shadow(0 40px 80px rgba(0,113,227,0.3)) drop-shadow(0 0 120px rgba(0,113,227,0.1));
          transform-origin: center;
          will-change: transform, opacity;
        }

        .headlight-path { transition: stroke-width .4s, filter .4s, opacity .4s; }
        .taillight-path { transition: stroke-width .4s, filter .4s, opacity .4s; }

        .light-active#frontBeam {
          opacity: 1 !important;
          filter: blur(25px) brightness(1.8) drop-shadow(0 0 45px rgba(0,113,227,0.9)) !important;
        }

        .light-active#rearBeam {
          opacity: 1 !important;
          filter: blur(20px) brightness(1.2) !important;
        }

        .light-active.headlight-line {
          stroke-width: 5 !important;
          opacity: 1 !important;
          filter: url(#extraglow) !important;
        }

        .light-active.taillight-line {
          stroke-width: 5 !important;
          opacity: 1 !important;
          filter: url(#extraglow) !important;
        }

        .car-reflection {
          width: min(500px, 70vw);
          height: 40px;
          background: radial-gradient(ellipse, rgba(0,113,227,0.25), transparent 70%);
          margin: 0 auto;
          filter: blur(15px);
          animation: reflectPulse 5s ease-in-out infinite;
          will-change: transform, opacity;
        }

        @keyframes reflectPulse {
          0%, 100% { opacity: .8; transform: scaleX(1); }
          50% { opacity: .5; transform: scaleX(.85); }
        }

        .scroll-hint {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 2;
          color: rgba(0,50,150,0.45);
          font-size: 11px;
          letter-spacing: 2px;
          animation: fadeUp 1s 1.2s both;
          font-weight: 700;
        }

        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(0,80,200,0.6), transparent);
          animation: scrollLineDrop 2s ease-in-out infinite;
        }

        @keyframes scrollLineDrop {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      <section id="hero" className="hero-section">
        {/* Background grid */}
        <div className="hero-grid" />

        {/* Orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Speed lines */}
        <div className="speed-line" style={{ top: '35%', width: '40%', right: '5%', animationDelay: '0s', animationDuration: '4s' }} />
        <div className="speed-line" style={{ top: '45%', width: '30%', right: '0%', animationDelay: '1.5s', animationDuration: '3.5s' }} />
        <div className="speed-line" style={{ top: '55%', width: '25%', left: '0%', animationDelay: '.8s', animationDuration: '5s', transform: 'scaleX(-1)' }} />

        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <div className="badge-dot" />
            Now live across India
          </div>

          {/* Headline */}
          <h1 className="hero-h1">
            Move<br />
            <span>like never before.</span>
          </h1>

          {/* Subtext */}
          <p className="hero-sub">
            Every vehicle, every journey — curated, verified, and delivered instantly to your fingertips.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <button className="btn-glow" onClick={() => {
  document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' })
}}>
              {/* Car icon using Unicode / inline SVG */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/>
                <path d="M19 17h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>
                <rect x="5" y="7" width="14" height="12" rx="2"/>
                <circle cx="8.5" cy="17" r="1.5"/>
                <circle cx="15.5" cy="17" r="1.5"/>
                <path d="M5 9h14"/>
              </svg>
              Explore fleet
            </button>
            <button className="btn-ghost" onClick={() => handleSendPrompt('How does Velox work?')}>
              See how it works
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* SVG Car */}
          <div className="hero-car-wrap">
            <svg
              ref={carRef}
              id="heroCar"
              className="hero-car-svg"
              viewBox="0 0 700 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: 'translateX(0px) scale(1) scaleX(-1)', opacity: 1 }}
            >
              <defs>
                <linearGradient id="headlightBeam" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="5%" stopColor="#0071e3" stopOpacity="1" />
                  <stop offset="25%" stopColor="#001a40" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#000814" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="taillightBeam" x1="1" x2="0" y1="0" y2="0">
                  <stop offset="0%" stopColor="#ff0000" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8b0000" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="bodyGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2a3a5c" />
                  <stop offset="50%" stopColor="#1a2540" />
                  <stop offset="100%" stopColor="#0d1520" />
                </linearGradient>
                <linearGradient id="roofGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1e2d50" />
                  <stop offset="100%" stopColor="#0d1828" />
                </linearGradient>
                <linearGradient id="glassGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#5ac8fa" stopOpacity=".25" />
                  <stop offset="100%" stopColor="#0071e3" stopOpacity=".1" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="12" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="extraglow">
                  <feGaussianBlur stdDeviation="25" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="softglow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Light Beams */}
              <path
                ref={frontBeamRef}
                id="frontBeam"
                className="headlight-path"
                d="M110 170 L-1800 -100 L-1800 450 Z"
                fill="url(#headlightBeam)"
                opacity="0"
                style={{ transition: 'opacity 0.4s, filter 0.4s', filter: 'blur(45px) brightness(2) saturate(2)' }}
              />
              <path
                ref={rearBeamRef}
                id="rearBeam"
                className="taillight-path"
                d="M600 170 L1000 100 L1000 240 Z"
                fill="url(#taillightBeam)"
                opacity="0"
                style={{ transition: 'opacity 0.4s, filter 0.4s', filter: 'blur(25px) brightness(1.8) saturate(2.5)' }}
              />

              {/* Ground shadow */}
              <ellipse cx="350" cy="225" rx="280" ry="12" fill="rgba(0,0,0,0.5)" />

              {/* Body lower */}
              <path d="M80 175 Q85 155 110 150 L590 150 Q615 155 620 175 L620 195 Q615 200 590 202 L110 202 Q85 200 80 195 Z" fill="url(#bodyGrad)" stroke="rgba(100,140,255,0.15)" strokeWidth="1" />
              <path d="M100 195 L600 195 L610 205 L90 205 Z" fill="#0a1020" stroke="rgba(100,140,255,0.08)" strokeWidth="1" />

              {/* Roof/cabin */}
              <path d="M220 150 Q230 110 260 95 L350 88 L440 95 Q470 110 480 150 Z" fill="url(#roofGrad)" stroke="rgba(100,140,255,0.12)" strokeWidth="1" />

              {/* Windshield */}
              <path d="M262 149 Q268 112 292 100 L350 95 L408 100 Q432 112 438 149 Z" fill="url(#glassGrad)" stroke="rgba(90,200,250,0.3)" strokeWidth="1" />
              <path d="M290 108 Q310 100 340 100 L330 130 Q310 128 295 132 Z" fill="rgba(255,255,255,0.07)" />

              {/* Side windows */}
              <path d="M222 149 Q228 120 248 108 L265 105 L262 149 Z" fill="url(#glassGrad)" stroke="rgba(90,200,250,0.2)" strokeWidth=".5" />
              <path d="M438 149 Q442 120 452 108 L472 105 L478 149 Z" fill="url(#glassGrad)" stroke="rgba(90,200,250,0.2)" strokeWidth=".5" />

              {/* Side Mirrors */}
              <path d="M255 135 Q245 135 240 142 L242 148 Q248 145 258 145 Z" fill="#0d1828" stroke="rgba(100,140,255,0.2)" strokeWidth="0.5" />
              <path d="M242 142 Q245 138 252 138 L252 144 Q248 144 242 142 Z" fill="url(#glassGrad)" opacity="0.6" />
              <path d="M445 135 Q455 135 460 142 L458 148 Q452 145 442 145 Z" fill="#0d1828" stroke="rgba(100,140,255,0.2)" strokeWidth="0.5" />
              <path d="M458 142 Q455 138 448 138 L448 144 Q452 144 458 142 Z" fill="url(#glassGrad)" opacity="0.6" />

              {/* Character lines */}
              <path d="M105 168 Q200 163 350 162 Q500 163 595 168" stroke="rgba(100,160,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M105 172 Q200 167 350 166 Q500 167 595 172" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

              {/* Door lines */}
              <line x1="310" y1="150" x2="310" y2="200" stroke="rgba(100,140,255,0.1)" strokeWidth="1" />
              <line x1="390" y1="150" x2="390" y2="200" stroke="rgba(100,140,255,0.1)" strokeWidth="1" />
              <rect x="320" y="170" width="18" height="4" rx="2" fill="rgba(150,180,255,0.25)" stroke="rgba(150,180,255,0.3)" strokeWidth=".5" />
              <rect x="400" y="170" width="18" height="4" rx="2" fill="rgba(150,180,255,0.25)" stroke="rgba(150,180,255,0.3)" strokeWidth=".5" />

              {/* Front light housing */}
              <path d="M100 160 Q92 163 88 170 Q88 178 95 180 L130 180 L130 160 Z" fill="#0d1828" stroke="rgba(90,200,250,0.15)" strokeWidth="1" />

              {/* Headlight */}
              <line
                ref={headlightRef}
                id="leftHeadlight"
                className="headlight-path headlight-line"
                x1="94" y1="170" x2="118" y2="168"
                stroke="#5ac8fa" strokeWidth="3" strokeLinecap="round"
                opacity=".5"
                filter="url(#glow)"
              />

              {/* Taillight */}
              <line
                ref={taillightRef}
                id="rightTaillight"
                className="taillight-path taillight-line"
                x1="582" y1="170" x2="606" y2="168"
                stroke="#EA4335" strokeWidth="3" strokeLinecap="round"
                opacity=".4"
                filter="url(#glow)"
              />

              {/* Wheels */}
              <circle cx="180" cy="200" r="30" fill="#0d1020" stroke="rgba(100,140,255,0.15)" strokeWidth="1" />
              <circle cx="180" cy="200" r="23" fill="#111520" stroke="rgba(100,140,255,0.25)" strokeWidth="1" />
              <circle cx="520" cy="200" r="30" fill="#0d1020" stroke="rgba(100,140,255,0.15)" strokeWidth="1" />
              <circle cx="520" cy="200" r="23" fill="#111520" stroke="rgba(100,140,255,0.25)" strokeWidth="1" />

              {/* Wheel glows */}
              <ellipse cx="180" cy="220" rx="35" ry="6" fill="rgba(0,113,227,0.2)" filter="url(#softglow)" />
              <ellipse cx="520" cy="220" rx="35" ry="6" fill="rgba(0,113,227,0.2)" filter="url(#softglow)" />
            </svg>

            <div
              ref={reflectionRef}
              className="car-reflection"
              style={{ transform: 'translateX(0px) scale(1) scaleX(-1)', opacity: 0.7 }}
            />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <div className="scroll-line" />
          SCROLL
        </div>
      </section>
    </>
  )
}