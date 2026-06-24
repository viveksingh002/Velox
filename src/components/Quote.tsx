'use client'

import { useEffect, useRef, useState } from 'react'

const quotes = [
  {
    text: "Booked a car in 30 seconds. Picked it up in 5 minutes. This is what every rental experience should feel like.",
    author: "Rahul M.",
    city: "Delhi",
    since: "2025",
    rating: 5,
  },
  {
    text: "The bike was at my doorstep before I even put my shoes on. Velox has completely changed how I commute.",
    author: "Priya S.",
    city: "Mumbai",
    since: "2025",
    rating: 5,
  },
  {
    text: "Used the SUV for a family trip to Agra. Zero paperwork, pristine condition. Never going back to traditional rentals.",
    author: "Arjun K.",
    city: "Bangalore",
    since: "2024",
    rating: 5,
  },
]

export default function Quote() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Auto-rotate
  useEffect(() => {
    intervalRef.current = setInterval(() => switchTo((active + 1) % quotes.length), 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [active])

  const switchTo = (idx: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => { setActive(idx); setAnimating(false) }, 350)
  }

  const q = quotes[active]

  return (
    <>
      <style>{`
        .quote-section {
          padding: 7rem 2.5rem;
          background: #050508;
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          position: relative;
          overflow: hidden;
        }

        /* Background glow */
        .quote-bg-glow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,113,227,0.08), transparent 70%),
            linear-gradient(135deg, rgba(0,50,120,0.15), rgba(80,20,180,0.08));
          pointer-events: none;
        }

        /* Giant decorative quote mark */
        .quote-deco {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 280px;
          font-family: Georgia, serif;
          color: rgba(0,113,227,0.05);
          line-height: 1;
          pointer-events: none;
          user-select: none;
          letter-spacing: -10px;
        }

        /* Reveal */
        .quote-inner {
          max-width: 820px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 2;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .quote-inner--visible { opacity: 1; transform: none; }

        /* Stars */
        .quote-stars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-bottom: 2rem;
        }
        .quote-star {
          width: 16px; height: 16px;
        }

        /* Text */
        .quote-text-wrap {
          position: relative;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2.5rem;
        }
        .quote-text {
          font-size: clamp(20px, 3vw, 32px);
          font-weight: 300;
          color: rgba(255,255,255,0.88);
          letter-spacing: -0.8px;
          line-height: 1.5;
          font-style: italic;
          position: absolute;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .quote-text--visible { opacity: 1; transform: none; }
        .quote-text--hidden  { opacity: 0; transform: translateY(12px); }

        /* Highlight word */
        .quote-highlight {
          background: linear-gradient(135deg, #5ac8fa, #0071e3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: normal;
          font-weight: 500;
        }

        /* Author */
        .quote-author-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          transition: opacity 0.35s ease;
        }
        .quote-author-wrap--hidden { opacity: 0; }

        .quote-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0,113,227,0.3), rgba(90,200,250,0.2));
          border: 1px solid rgba(0,113,227,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #5ac8fa;
          letter-spacing: -0.5px;
          flex-shrink: 0;
        }

        .quote-meta { text-align: left; }
        .quote-name {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          letter-spacing: -0.3px;
        }
        .quote-detail {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1.5px;
          font-weight: 700;
          margin-top: 2px;
        }

        /* Divider */
        .quote-author-line {
          width: 1px; height: 28px;
          background: rgba(255,255,255,0.1);
        }
        .quote-badge {
          font-size: 10px;
          color: rgba(90,200,250,0.6);
          letter-spacing: 1px;
          font-weight: 700;
          padding: 4px 10px;
          border: 1px solid rgba(90,200,250,0.2);
          border-radius: 980px;
          background: rgba(90,200,250,0.06);
        }

        /* Dots */
        .quote-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 2.5rem;
        }
        .quote-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }
        .quote-dot--active {
          background: #0071e3;
          border-color: #0071e3;
          box-shadow: 0 0 10px rgba(0,113,227,0.6);
          width: 20px;
          border-radius: 3px;
        }

        /* Progress bar */
        .quote-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 1px;
          background: linear-gradient(90deg, #0071e3, #5ac8fa);
          animation: quoteProgress 5s linear infinite;
        }
        @keyframes quoteProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        @media (max-width: 600px) {
          .quote-section { padding: 5rem 1.5rem; }
          .quote-deco { font-size: 160px; }
        }
      `}</style>

      <div className="quote-section" ref={sectionRef}>
        <div className="quote-bg-glow" />
        <div className="quote-deco">"</div>

        {/* Progress bar */}
        <div
          className="quote-progress"
          key={active}
        />

        <div className={`quote-inner ${visible ? 'quote-inner--visible' : ''}`}>

          {/* Stars */}
          <div className="quote-stars">
            {Array.from({ length: q.rating }).map((_, i) => (
              <svg key={i} className="quote-star" viewBox="0 0 24 24" fill="#0071e3">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>

          {/* Quote text */}
          <div className="quote-text-wrap">
            <p className={`quote-text ${animating ? 'quote-text--hidden' : 'quote-text--visible'}`}>
              &ldquo;{q.text}&rdquo;
            </p>
          </div>

          {/* Author */}
          <div className={`quote-author-wrap ${animating ? 'quote-author-wrap--hidden' : ''}`}>
            <div className="quote-avatar">
              {q.author.split(' ').map(w => w[0]).join('')}
            </div>
            <div className="quote-meta">
              <div className="quote-name">{q.author}</div>
              <div className="quote-detail">{q.city.toUpperCase()} · SINCE {q.since}</div>
            </div>
            <div className="quote-author-line" />
            <div className="quote-badge">VËLOX MEMBER</div>
          </div>

          {/* Dot nav */}
          <div className="quote-dots">
            {quotes.map((_, i) => (
              <button
                key={i}
                className={`quote-dot ${i === active ? 'quote-dot--active' : ''}`}
                onClick={() => switchTo(i)}
                aria-label={`Quote ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  )
}