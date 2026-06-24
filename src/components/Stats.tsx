'use client'
 
import { useEffect, useRef, useState } from 'react'
 
const stats = [
  { id: 's1', target: 50, suffix: '+', label: 'VEHICLE TYPES', icon: '🚗' },
  { id: 's2', target: 6, suffix: 'k+', label: 'HAPPY RIDERS', icon: '😊' },
  { id: 's3', target: 24, suffix: '/7', label: 'AVAILABILITY', icon: '🕐' },
  { id: 's4', target: 4.9, suffix: '★', label: 'AVG RATING', icon: '⭐', decimal: true },
]
 
function useCountUp(target: number, duration: number, start: boolean, decimal = false) {
  const [value, setValue] = useState(0)
 
  useEffect(() => {
    if (!start) return
    let current = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setValue(decimal ? Math.round(current * 10) / 10 : Math.round(current))
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [start, target, duration, decimal])
 
  return value
}
 
function StatItem({
  target,
  suffix,
  label,
  duration,
  started,
  decimal,
  index,
}: {
  target: number
  suffix: string
  label: string
  duration: number
  started: boolean
  decimal?: boolean
  index: number
}) {
  const value = useCountUp(target, duration, started, decimal)
 
  return (
    <div
      className="stat-item"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="stat-num">
        {decimal ? value.toFixed(1) : value}
        <span>{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
 
      <style>{`
        .stat-item {
          padding: 2.2rem 2rem;
          text-align: center;
          border-right: 1px solid rgba(0, 0, 0, 0.05);
          transition: background 0.25s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .stat-item:last-child {
          border-right: none;
        }
        .stat-item:hover {
          background: rgba(0, 113, 227, 0.04);
        }
        .stat-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 40px;
          height: 2px;
          background: #0071e3;
          border-radius: 2px;
          transition: transform 0.3s ease;
        }
        .stat-item:hover::after {
          transform: translateX(-50%) scaleX(1);
        }
        .stat-num {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -2px;
          color: #111;
          line-height: 1;
          margin-bottom: 0.2rem;
        }
        .stat-num span {
          color: #0071e3;
        }
        .stat-label {
          font-size: 11px;
          color: rgba(0, 0, 0, 0.4);
          letter-spacing: 2px;
          font-weight: 700;
        }
      `}</style>
    </div>
  )
}
 
export default function StatsBar() {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
 
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
 
  return (
    <>
      <style>{`
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 20;
        }
 
        @media (max-width: 640px) {
          .stats-bar {
            grid-template-columns: repeat(2, 1fr);
          }
          .stat-item:nth-child(2) {
            border-right: none;
          }
          .stat-item:nth-child(1),
          .stat-item:nth-child(2) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          }
          .stat-num {
            font-size: 32px !important;
          }
        }
      `}</style>
 
      <div className="stats-bar" ref={ref}>
        {stats.map((stat, i) => (
          <StatItem
            key={stat.id}
            target={stat.target}
            suffix={stat.suffix}
            label={stat.label}
            duration={i === 1 ? 1000 : 1200}
            started={started}
            decimal={stat.decimal}
            index={i}
          />
        ))}
      </div>
    </>
  )
}