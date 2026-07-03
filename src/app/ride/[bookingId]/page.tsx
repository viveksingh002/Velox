'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

const API = 'http://localhost:5000/api'

// Fixed reference points — simulation only, backend has no lat/lng yet
const PICKUP_COORD: [number, number] = [28.6139, 77.2090]
const DROP_COORD:   [number, number] = [28.6300, 77.2200]
const START_COORD:  [number, number] = [28.6050, 77.2000]
const SIM_STEPS = 40          // how many ticks driver takes to reach pickup, then drop
const TICK_MS   = 1500

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function RidePage() {
  const params  = useParams()
  const search  = useSearchParams()
  const router  = useRouter()

  const bookingId  = (params.bookingId as string) || ''
  const driverName = search.get('driverName') || 'Driver'
  const pickup     = search.get('pickup')     || ''
  const drop       = search.get('drop')       || ''
  const fare       = search.get('fare')       || '0'
  const vehicle    = search.get('vehicle')    || 'bike'
  const payMethod  = search.get('payMethod')  || 'cash'

  const mapRef       = useRef<HTMLDivElement>(null)
  const mapObj        = useRef<any>(null)
  const driverMarker  = useRef<any>(null)
  const stepRef        = useRef(0)
  const legRef          = useRef<'to_pickup' | 'to_drop'>('to_pickup')

  const [mapReady, setMapReady] = useState(false)
  const [status,   setStatus]   = useState<'on_the_way' | 'arrived' | 'in_progress' | 'completed'>('on_the_way')
  const [eta,      setEta]      = useState(5)
  const [liveDriverName, setLiveDriverName] = useState(driverName)

  // ── Load Leaflet + init map ────────────────────────────────────────────
  useEffect(() => {
    if (mapObj.current) return

    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initMap()
    document.head.appendChild(script)

    return () => {
      if (mapObj.current) {
        mapObj.current.remove()
        mapObj.current = null
      }
    }
  }, [])

  const initMap = () => {
    if (!mapRef.current || mapObj.current) return
    const L = (window as any).L

    const map = L.map(mapRef.current, { zoomControl: false }).setView(START_COORD, 14)
    mapObj.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const pickupIcon = L.divIcon({
      html: `<div style="background:#111;color:#fff;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:.3px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3)">PICKUP</div>`,
      className: '', iconAnchor: [30, 10],
    })
    const dropIcon = L.divIcon({
      html: `<div style="background:#fff;color:#111;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:.3px;white-space:nowrap;border:1.5px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,.15)">DROP</div>`,
      className: '', iconAnchor: [20, 10],
    })
    const driverIcon = L.divIcon({
      html: `<div style="width:34px;height:34px;background:#111;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,.35);border:2px solid #fff">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-3l3.15 4.63L18 14"/><path d="M5.5 17.5 9 10l1.5-2h5"/></svg>
      </div>`,
      className: '', iconAnchor: [17, 17],
    })

    L.marker(PICKUP_COORD, { icon: pickupIcon }).addTo(map)
    L.marker(DROP_COORD,   { icon: dropIcon   }).addTo(map)

    driverMarker.current = L.marker(START_COORD, { icon: driverIcon, zIndexOffset: 1000 }).addTo(map)

    L.polyline([START_COORD, PICKUP_COORD, DROP_COORD], {
      color: '#111', weight: 3, dashArray: '6 6', opacity: 0.45,
    }).addTo(map)

    map.fitBounds([START_COORD, PICKUP_COORD, DROP_COORD], { padding: [50, 50] })
    setMapReady(true)
  }

  // ── Simulate driver movement ───────────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return
    const L = (window as any).L

    const timer = setInterval(() => {
      const from = legRef.current === 'to_pickup' ? START_COORD  : PICKUP_COORD
      const to   = legRef.current === 'to_pickup' ? PICKUP_COORD : DROP_COORD

      stepRef.current += 1
      const t = Math.min(stepRef.current / SIM_STEPS, 1)
      const next: [number, number] = [lerp(from[0], to[0], t), lerp(from[1], to[1], t)]

      if (driverMarker.current) driverMarker.current.setLatLng(next)

      if (t >= 1) {
        stepRef.current = 0
        if (legRef.current === 'to_pickup') {
          legRef.current = 'to_drop'
          setStatus('in_progress')
        } else {
          clearInterval(timer)
          setStatus('completed')
        }
      }
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [mapReady])

  // ── ETA countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'completed') return
    const t = setInterval(() => {
      setEta(prev => (prev <= 1 ? 0 : prev - 1))
    }, 60000)
    return () => clearInterval(t)
  }, [status])

  useEffect(() => {
    if (status === 'in_progress' && eta === 0) setEta(8)
  }, [status])

  // ── Poll real booking status from backend ──────────────────────────────
  useEffect(() => {
    if (!bookingId) return
    const poll = setInterval(async () => {
      try {
        const res  = await fetch(`${API}/booking/${bookingId}/status`)
        const data = await res.json()
        if (data.success && data.driverName) setLiveDriverName(data.driverName)
      } catch {}
    }, 5000)
    return () => clearInterval(poll)
  }, [bookingId])

  // ── Redirect home after completion ─────────────────────────────────────
  useEffect(() => {
    if (status !== 'completed') return
    const t = setTimeout(() => router.push('/'), 2500)
    return () => clearTimeout(t)
  }, [status, router])

  const statusConfig = {
    on_the_way: { label: 'Driver on the Way',  color: '#22c55e', dot: true  },
    arrived:    { label: 'Driver Arrived',      color: '#f59e0b', dot: false },
    in_progress:{ label: 'Ride in Progress',    color: '#2563eb', dot: true  },
    completed:  { label: 'Ride Completed',      color: '#6b7280', dot: false },
  }
  const sc = statusConfig[status]

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        .rd-page{height:100svh;display:flex;flex-direction:column;font-family:'Inter',-apple-system,sans-serif;background:#f4f4f6;overflow:hidden}
        .rd-map-wrap{flex:1;position:relative;background:#e8e8ea}
        .rd-map{width:100%;height:100%}
        .rd-status-pill{position:absolute;top:16px;left:50%;transform:translateX(-50%);background:#fff;border-radius:99px;padding:8px 18px;display:flex;align-items:center;gap:8px;box-shadow:0 2px 16px rgba(0,0,0,.12);z-index:500;white-space:nowrap}
        .rd-dot{width:8px;height:8px;border-radius:50%;animation:rd-pulse 1.4s infinite}
        @keyframes rd-pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .rd-panel{background:#fff;border-radius:20px 20px 0 0;padding:20px 20px 28px;box-shadow:0 -4px 24px rgba(0,0,0,.08);z-index:100}
        .rd-stats{display:flex;gap:10px;margin-bottom:16px}
        .rd-stat{flex:1;border-radius:14px;padding:12px 16px}
        .rd-stat-eta{background:#f9fafb;border:1px solid #f3f4f6}
        .rd-stat-fare{background:#111}
        .rd-stat-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
        .rd-stat-val{font-size:22px;font-weight:800}
        .rd-driver-card{display:flex;align-items:center;justify-content:space-between;background:#111;border-radius:16px;padding:14px 18px;margin-bottom:14px}
        .rd-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a5b4fc);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;flex-shrink:0}
        .rd-call-btn{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0}
        .rd-route{background:#f9fafb;border-radius:14px;padding:12px 16px;margin-bottom:14px;border:1px solid #f3f4f6}
        .rd-pay-badge{font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;color:#fff;text-transform:capitalize}
        .rd-complete-btn{width:100%;padding:15px;background:#111;color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
        .rd-done-banner{text-align:center;padding:12px;background:#f0fdf4;border-radius:14px;border:1px solid #bbf7d0}
      `}</style>

      <div className="rd-page">
        <div className="rd-map-wrap">
          <div ref={mapRef} className="rd-map" />
          <div className="rd-status-pill">
            {sc.dot && <div className="rd-dot" style={{ background: sc.color }} />}
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{sc.label}</span>
          </div>
        </div>

        <div className="rd-panel">
          <div className="rd-stats">
            <div className="rd-stat rd-stat-eta">
              <p className="rd-stat-label" style={{ color: '#9ca3af' }}>ETA</p>
              <p className="rd-stat-val" style={{ color: '#111' }}>{status === 'completed' ? '0' : eta} min</p>
            </div>
            <div className="rd-stat rd-stat-fare">
              <p className="rd-stat-label" style={{ color: 'rgba(255,255,255,.5)' }}>Fare</p>
              <p className="rd-stat-val" style={{ color: '#fff' }}>₹{fare}</p>
            </div>
          </div>

          <div className="rd-driver-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="rd-avatar">{liveDriverName.charAt(0).toUpperCase()}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{liveDriverName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>⭐ 4.9</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>·</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', textTransform: 'capitalize' }}>{vehicle}</span>
                  <span className="rd-pay-badge" style={{ background: payMethod === 'cash' ? '#16a34a' : '#2563eb' }}>{payMethod}</span>
                </div>
              </div>
            </div>
            <a href="tel:+911234567890" className="rd-call-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>
          </div>

          <div className="rd-route">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111' }} />
                <div style={{ width: 1.5, height: 24, background: '#e5e7eb' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #111', background: '#fff' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>Pickup</p>
                <p style={{ fontSize: 13, color: '#111', fontWeight: 500, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pickup}</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>Drop</p>
                <p style={{ fontSize: 13, color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drop}</p>
              </div>
            </div>
          </div>

          {status === 'completed' ? (
            <div className="rd-done-banner">
              <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>✓ Ride Completed! Redirecting...</p>
            </div>
          ) : (
            <button className="rd-complete-btn" disabled style={{ opacity: 0.5, cursor: 'default' }}>
              {status === 'in_progress' ? 'Ride in Progress…' : 'Waiting for Driver…'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}