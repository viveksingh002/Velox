'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

const API = "http://localhost:5000/api"

export default function RideTrackingPage() {
  const params      = useParams()
  const search      = useSearchParams()
  const router      = useRouter()
  const bookingId   = params.bookingId as string

  const pickup     = decodeURIComponent(search.get('pickup')     || '')
  const drop       = decodeURIComponent(search.get('drop')       || '')
  const fare       = search.get('fare')       || '0'
  const vehicle    = search.get('vehicle')    || 'bike'
  const driverName = decodeURIComponent(search.get('driverName') || 'Driver')
  const payMethod  = search.get('payMethod')  || 'cash'

  const mapRef       = useRef<HTMLDivElement>(null)
  const mapInstance  = useRef<any>(null)
  const driverMarker = useRef<any>(null)

  const [eta,       setEta]       = useState(0)
  const [status,    setStatus]    = useState<'on_way' | 'arrived' | 'in_progress' | 'completed'>('on_way')
  const [elapsed,   setElapsed]   = useState(0)
  const [otp,       setOtp]       = useState<string | null>(null)
  const [otpCopied, setOtpCopied] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const pollStatus = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/booking/${bookingId}/status`)
      const data = await res.json()
      if (!data.success) return
      const s = data.status
      if (s === 'arrived')     setStatus('arrived')
      if (s === 'in_progress') setStatus('in_progress')
      if (s === 'completed')   setStatus('completed')
      if ((s === 'arrived' || s === 'in_progress') && data.otp) setOtp(data.otp)
    } catch {}
  }, [bookingId])

  useEffect(() => {
    pollStatus()
    const id = setInterval(pollStatus, 5000)
    return () => clearInterval(id)
  }, [pollStatus])

  useEffect(() => {
    if (mapInstance.current) return
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initMap()
    document.head.appendChild(script)
  }, [])

  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return
    const L = (window as any).L
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([25.4484, 78.5685], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

    const driverIcon = L.divIcon({
      className: '',
      html: `<div style="width:40px;height:40px;border-radius:50%;background:#111;border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🏍</div>`,
      iconSize: [40, 40], iconAnchor: [20, 20],
    })
    const pickupIcon = L.divIcon({
      className: '',
      html: `<div style="background:#111;color:#fff;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);">PICKUP</div>`,
      iconAnchor: [30, 12],
    })
    const dropIcon = L.divIcon({
      className: '',
      html: `<div style="background:#ef4444;color:#fff;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);">DROP</div>`,
      iconAnchor: [25, 12],
    })

    const geocode = async (address: string) => {
      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
        const data = await res.json()
        if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      } catch {}
      return null
    }

    const setupMap = async () => {
      const pickupCoord = await geocode(pickup)
      const dropCoord   = await geocode(drop)
      if (pickupCoord) L.marker([pickupCoord.lat, pickupCoord.lng], { icon: pickupIcon }).addTo(map)
      if (dropCoord)   L.marker([dropCoord.lat,   dropCoord.lng],   { icon: dropIcon   }).addTo(map)

      if (pickupCoord && dropCoord) {
        const line = L.polyline([[pickupCoord.lat, pickupCoord.lng], [dropCoord.lat, dropCoord.lng]], { color: '#111', weight: 3, dashArray: '8 6', opacity: 0.7 }).addTo(map)
        map.fitBounds(line.getBounds(), { padding: [60, 60] })

        let step = 0
        const steps = 60
        const latDiff = (dropCoord.lat - pickupCoord.lat) / steps
        const lngDiff = (dropCoord.lng - pickupCoord.lng) / steps
        const marker  = L.marker([pickupCoord.lat, pickupCoord.lng], { icon: driverIcon }).addTo(map)
        driverMarker.current = marker
        setEta(steps * 3)

        const moveDriver = setInterval(() => {
          step++
          if (step >= steps) { clearInterval(moveDriver); return }
          marker.setLatLng([pickupCoord.lat + latDiff * step, pickupCoord.lng + lngDiff * step])
          setEta(prev => Math.max(prev - 3, 0))
        }, 3000)
      }
    }

    setupMap()
    mapInstance.current = map
  }

  const copyOtp = () => {
    if (!otp) return
    navigator.clipboard.writeText(otp)
    setOtpCopied(true)
    setTimeout(() => setOtpCopied(false), 2000)
  }

  const etaMins = Math.ceil(eta / 60)

  const statusConfig = {
    on_way:      { label: 'Driver on the Way',  dot: '#22c55e' },
    arrived:     { label: 'Driver Arrived!',    dot: '#f59e0b' },
    in_progress: { label: 'Ride in Progress',   dot: '#3b82f6' },
    completed:   { label: 'Ride Completed',     dot: '#9ca3af' },
  }
  const sc = statusConfig[status]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        *::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
        .leaflet-bottom, .leaflet-top { display: none !important; }
        .track-wrap { display: flex; height: 100svh; width: 100vw; overflow: hidden; }
        .track-map  { flex: 1; position: relative; }
        .track-panel { width: 380px; flex-shrink: 0; background: #fff; display: flex; flex-direction: column; border-left: 1px solid #f0f0f0; overflow-y: auto; }
        .track-panel-header { padding: 20px 24px 16px; border-bottom: 1px solid #f5f5f5; }
        .track-badge { display: inline-flex; align-items: center; gap: 6px; background: #f3f4f6; border-radius: 99px; padding: 5px 12px; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 12px; }
        .track-badge-dot { width: 8px; height: 8px; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .track-title { font-size: 22px; font-weight: 800; color: #111; letter-spacing: -.5px; }
        .track-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px 24px; border-bottom: 1px solid #f5f5f5; }
        .track-stat { background: #f9fafb; border-radius: 12px; padding: 14px; }
        .track-stat-label { font-size: 10px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px; }
        .track-stat-val { font-size: 20px; font-weight: 800; color: #111; }
        .track-driver { display: flex; align-items: center; gap: 14px; padding: 16px 24px; border-bottom: 1px solid #f5f5f5; }
        .track-driver-avatar { width: 48px; height: 48px; border-radius: 50%; background: #111; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
        .track-driver-name { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 3px; }
        .track-driver-sub  { font-size: 12px; color: #9ca3af; }
        .track-pay-badge { display: inline-flex; align-items: center; gap: 4px; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 99px; margin-top: 4px; }
        .track-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 24px; margin-top: 4px; }
        .track-btn { padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .track-btn-light { background: #fff; color: #111; border: 1.5px solid #e5e7eb; }
        .track-btn-dark  { background: #111; color: #fff; border: none; }
        .track-route { padding: 16px 24px; border-top: 1px solid #f5f5f5; }
        .track-route-row { display: flex; gap: 12px; align-items: flex-start; }
        .track-route-col { display: flex; flex-direction: column; align-items: center; }
        .track-dot-fill  { width: 8px; height: 8px; border-radius: 50%; background: #111; }
        .track-dot-empty { width: 8px; height: 8px; border-radius: 50%; border: 2px solid #111; }
        .track-route-line { width: 1.5px; height: 28px; background: #e5e7eb; }
        .track-route-label { font-size: 9px; color: #bbb; letter-spacing: 1px; font-weight: 700; margin-bottom: 2px; }
        .track-route-text  { font-size: 12px; color: #374151; font-weight: 500; line-height: 1.4; }
        .track-vehicle { padding: 14px 24px 20px; border-top: 1px solid #f5f5f5; display: flex; align-items: center; justify-content: space-between; }
        .track-vehicle-label { font-size: 10px; color: #9ca3af; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .track-vehicle-val   { font-size: 14px; font-weight: 700; color: #111; }
        .track-plate { background: #f3f4f6; border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 800; color: #111; letter-spacing: 1px; }
        @media (max-width: 700px) {
          .track-wrap { flex-direction: column; }
          .track-map  { height: 45svh; flex: none; }
          .track-panel { width: 100%; flex: 1; border-left: none; border-top: 1px solid #f0f0f0; }
        }
      `}</style>

      <div className="track-wrap">
        <div className="track-map">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div className="track-panel">
          <div className="track-panel-header">
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>LIVE TRACKING</div>
            <div className="track-badge">
              <div className="track-badge-dot" style={{ background: sc.dot }} />
              {sc.label}
            </div>
            <div className="track-title">Your Ride</div>
          </div>

          {otp && status === 'arrived' && (
            <div style={{ margin: '16px 24px 0', borderRadius: 16, overflow: 'hidden', border: '1.5px solid #fde68a', animation: 'slideIn 0.35s ease' }}>
              <div style={{ background: '#111827', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 11.5, letterSpacing: 0.8 }}>DRIVER KO YE OTP BATAO</span>
              </div>
              <div style={{ background: '#fefce8', padding: 16 }}>
                <p style={{ fontSize: 12, color: '#92400e', marginBottom: 14, fontWeight: 500 }}>Tumhara driver aa gaya hai! Ye OTP driver ko batao ride start karne ke liye.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 14 }}>
                  {otp.split('').map((d, i) => (
                    <div key={i} style={{ width: 52, height: 60, borderRadius: 12, background: '#fff', border: '1.5px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: '#111', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      {d}
                    </div>
                  ))}
                </div>
                <button onClick={copyOtp} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1.5px solid #fde68a', background: otpCopied ? '#111' : '#fff', color: otpCopied ? '#fff' : '#92400e', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {otpCopied ? '✓ Copy ho gaya!' : 'OTP Copy Karo'}
                </button>
              </div>
            </div>
          )}

          {status === 'in_progress' && (
            <div style={{ margin: '16px 24px 0', borderRadius: 12, background: '#eff6ff', border: '1.5px solid #bfdbfe', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideIn 0.3s ease' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>Ride shuru ho gayi — enjoy your trip! 🚀</span>
            </div>
          )}

          <div className="track-stats" style={{ marginTop: 16 }}>
            <div className="track-stat">
              <div className="track-stat-label">ETA</div>
              <div className="track-stat-val">{etaMins} min</div>
            </div>
            <div className="track-stat" style={{ background: '#111' }}>
              <div className="track-stat-label" style={{ color: 'rgba(255,255,255,.5)' }}>FARE</div>
              <div className="track-stat-val" style={{ color: '#fff' }}>₹{fare}</div>
            </div>
          </div>

          <div className="track-driver">
            <div className="track-driver-avatar">
              {driverName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div className="track-driver-name">{driverName}</div>
              <div className="track-driver-sub">{vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}</div>
              <div className="track-pay-badge">✓ {payMethod === 'cash' ? 'Cash' : 'Online'}</div>
            </div>
            <a href="tel:+919999999999" style={{ width: 36, height: 36, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
          </div>

          <div className="track-actions">
            <button className="track-btn track-btn-light">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message
            </button>
            <button className="track-btn track-btn-dark" onClick={() => { if (confirm('Cancel this ride?')) router.push('/') }}>
              Cancel Ride
            </button>
          </div>

          <div className="track-route">
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 12 }}>ROUTE</div>
            <div className="track-route-row">
              <div className="track-route-col">
                <div className="track-dot-fill" />
                <div className="track-route-line" />
                <div className="track-dot-empty" />
              </div>
              <div style={{ flex: 1, paddingLeft: 10 }}>
                <div style={{ marginBottom: 20 }}>
                  <div className="track-route-label">PICKUP</div>
                  <div className="track-route-text">{pickup}</div>
                </div>
                <div>
                  <div className="track-route-label">DROP</div>
                  <div className="track-route-text">{drop}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="track-vehicle">
            <div>
              <div className="track-vehicle-label">VEHICLE</div>
              <div className="track-vehicle-val">{vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}</div>
            </div>
            <div className="track-plate">UP61AS1234</div>
          </div>
        </div>
      </div>
    </>
  )
}