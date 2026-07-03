'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

const API = 'http://localhost:5000/api'

// Fixed reference points — simulation only, backend has no lat/lng yet
const PICKUP_COORD: [number, number] = [28.6139, 77.2090]
const DROP_COORD:   [number, number] = [28.6300, 77.2200]
const START_COORD:  [number, number] = [28.6050, 77.2000]
const SIM_STEPS = 40
const TICK_MS   = 1500

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// ── Status Badge (same pattern as partner page) ─────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    on_the_way: { label: 'Driver on the way', bg: '#fefce8', color: '#854d0e', dot: '#eab308' },
    in_progress:{ label: 'Ride in progress',  bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
    completed:  { label: 'Completed',         bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
  }
  const s = map[status] || map.on_the_way
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  )
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

  const mapRef      = useRef<HTMLDivElement>(null)
  const mapObj       = useRef<any>(null)
  const driverMarker  = useRef<any>(null)
  const stepRef         = useRef(0)
  const legRef           = useRef<'to_pickup' | 'to_drop'>('to_pickup')

  const [mapReady, setMapReady] = useState(false)
  const [status,   setStatus]   = useState<'on_the_way' | 'in_progress' | 'completed'>('on_the_way')
  const [eta,      setEta]      = useState(12)
  const [elapsed,  setElapsed]  = useState(0)
  const [liveDriverName, setLiveDriverName] = useState(driverName)
  const [otp] = useState(() => String(Math.floor(1000 + Math.random() * 9000)))

  // ── Timer (same pattern as partner page) ───────────────────────────────
  useEffect(() => {
    if (status === 'completed') return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [status])
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const secs = (elapsed % 60).toString().padStart(2, '0')

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
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null }
    }
  }, [])

  const initMap = () => {
    if (!mapRef.current || mapObj.current) return
    const L = (window as any).L

    const map = L.map(mapRef.current, { zoomControl: false, dragging: true, scrollWheelZoom: false }).setView(START_COORD, 14)
    mapObj.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map)

    const pickupIcon = L.divIcon({
      html: `<div style="background:#111827;color:#fff;padding:4px 9px;border-radius:7px;font-size:10px;font-weight:700;letter-spacing:.3px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3)">PICKUP</div>`,
      className: '', iconAnchor: [26, 9],
    })
    const dropIcon = L.divIcon({
      html: `<div style="background:#fff;color:#111827;padding:4px 9px;border-radius:7px;font-size:10px;font-weight:700;letter-spacing:.3px;white-space:nowrap;border:1.5px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,.15)">DROP</div>`,
      className: '', iconAnchor: [18, 9],
    })
    const driverIcon = L.divIcon({
      html: `<div style="width:30px;height:30px;background:#111827;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.35);border:2px solid #fff">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-3l3.15 4.63L18 14"/><path d="M5.5 17.5 9 10l1.5-2h5"/></svg>
      </div>`,
      className: '', iconAnchor: [15, 15],
    })

    L.marker(PICKUP_COORD, { icon: pickupIcon }).addTo(map)
    L.marker(DROP_COORD,   { icon: dropIcon   }).addTo(map)
    driverMarker.current = L.marker(START_COORD, { icon: driverIcon, zIndexOffset: 1000 }).addTo(map)

    L.polyline([START_COORD, PICKUP_COORD, DROP_COORD], {
      color: '#111827', weight: 3, dashArray: '6 6', opacity: 0.4,
    }).addTo(map)

    map.fitBounds([START_COORD, PICKUP_COORD, DROP_COORD], { padding: [40, 40] })
    setMapReady(true)
  }

  // ── Simulate driver movement ───────────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return
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
          setEta(9)
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
    const t = setInterval(() => setEta(p => (p <= 1 ? 0 : p - 1)), 60000)
    return () => clearInterval(t)
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

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 48px' }}>

        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Your Ride</h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Live trip tracking</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>

          {/* header */}
          <div style={{ background: '#111827', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 4 }}>Booking ID</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{bookingId ? `RYD-${bookingId.slice(-6).toUpperCase()}` : 'RYD-------'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Timer</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#22c55e', fontVariantNumeric: 'tabular-nums' }}>{mins}:{secs}</p>
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>

            {/* Live map */}
            <div style={{ width: '100%', height: 220, borderRadius: 16, border: '1px solid #e5e7eb', marginBottom: 20, overflow: 'hidden' }}>
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Route */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', boxShadow: '0 0 0 2px #22c55e' }} />
                  <div style={{ width: 2, height: 36, background: '#e5e7eb' }} />
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#ef4444' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: 18 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 3 }}>Pickup</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{pickup}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 3 }}>Drop</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{drop}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Vehicle', value: vehicle.charAt(0).toUpperCase() + vehicle.slice(1) },
                { label: 'ETA',     value: status === 'completed' ? 'Arrived' : `${eta} min` },
                { label: 'Fare',    value: `₹${fare}` },
              ].map(s => (
                <div key={s.label} style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 14px', border: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 5 }}>{s.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Driver info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f9fafb', borderRadius: 14, border: '1px solid #f3f4f6', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a5b4fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  {liveDriverName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{liveDriverName}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>⭐ 4.9 · {payMethod}</p>
                </div>
              </div>
              <a href="tel:+911234567890" style={{ width: 38, height: 38, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>
            </div>

            {/* OTP — customer shows this to driver to start trip */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#eff6ff', borderRadius: 12, marginBottom: 20, border: '1px solid #dbeafe' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>
                  {status === 'on_the_way' ? 'Share this OTP with driver' : 'Trip OTP'}
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#1d4ed8', letterSpacing: 6 }}>{otp}</p>
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            {/* Action buttons */}
            {status === 'completed' ? (
              <div style={{ textAlign: 'center', padding: '13px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>✓ Ride Completed! Redirecting...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button style={{ padding: '13px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Share Trip
                </button>
                <button style={{ padding: '13px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  SOS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}