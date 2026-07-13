'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

const API = "http://localhost:5000/api"

export default function RideTrackingPage() {
  const params    = useParams()
  const search    = useSearchParams()
  const router    = useRouter()
  const bookingId = params.bookingId as string

  const pickup     = decodeURIComponent(search.get('pickup')     || '')
  const drop       = decodeURIComponent(search.get('drop')       || '')
  const fare       = search.get('fare')       || '0'
  const vehicle    = search.get('vehicle')    || 'bike'
  const driverName = decodeURIComponent(search.get('driverName') || 'Driver')
  const payMethod  = search.get('payMethod')  || 'cash'

  const mapRef      = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  const [eta,       setEta]       = useState(180)
  const [status,    setStatus]    = useState<'on_way' | 'arrived' | 'in_progress' | 'completed'>('on_way')
  const [otp,       setOtp]       = useState('')
  const [otpCopied, setOtpCopied] = useState(false)

  const pollStatus = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/booking/${bookingId}/status`)
      const data = await res.json()
      if (!data.success) return
      const s = data.status
      if (s === 'arrived')     setStatus('arrived')
      if (s === 'in_progress') setStatus('in_progress')
      if (s === 'completed')   setStatus('completed')
      if (typeof data.otp === 'string' && data.otp.length > 0) setOtp(data.otp)
    } catch {}
  }, [bookingId])

  useEffect(() => {
    pollStatus()
    const id = setInterval(pollStatus, 5000)
    return () => clearInterval(id)
  }, [pollStatus])

  useEffect(() => {
    if (mapInstance.current) return
    const link  = document.createElement('link')
    link.rel    = 'stylesheet'
    link.href   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script  = document.createElement('script')
    script.src    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initMap()
    document.head.appendChild(script)
  }, [])

  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return
    const L   = (window as any).L
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([25.4484, 78.5685], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

    const driverIcon = L.divIcon({
      className: '',
      html: `<div style="width:40px;height:40px;border-radius:50%;background:#111;border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🏍</div>`,
      iconSize: [40, 40], iconAnchor: [20, 20],
    })
    const pickupIcon = L.divIcon({
      className: '',
      html: `<div style="background:#111;color:#fff;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;white-space:nowrap;">PICKUP</div>`,
      iconAnchor: [30, 12],
    })
    const dropIcon = L.divIcon({
      className: '',
      html: `<div style="background:#ef4444;color:#fff;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;white-space:nowrap;">DROP</div>`,
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
        const line = L.polyline(
          [[pickupCoord.lat, pickupCoord.lng], [dropCoord.lat, dropCoord.lng]],
          { color: '#111', weight: 3, dashArray: '8 6', opacity: 0.7 }
        ).addTo(map)
        map.fitBounds(line.getBounds(), { padding: [60, 60] })
        let step      = 0
        const steps   = 60
        const latDiff = (dropCoord.lat - pickupCoord.lat) / steps
        const lngDiff = (dropCoord.lng - pickupCoord.lng) / steps
        const marker  = L.marker([pickupCoord.lat, pickupCoord.lng], { icon: driverIcon }).addTo(map)
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

  const etaMins    = Math.ceil(eta / 60)
  const showOtp    = status === 'arrived' || status === 'in_progress'
  const displayOtp = otp.length > 0 ? otp : '8472'

  const copyOtp = () => {
    navigator.clipboard.writeText(displayOtp)
    setOtpCopied(true)
    setTimeout(() => setOtpCopied(false), 2000)
  }

  const statusConfig = {
    on_way:      { label: 'Driver On the Way',  dot: '#22c55e' },
    arrived:     { label: 'Driver Has Arrived', dot: '#f59e0b' },
    in_progress: { label: 'Ride in Progress',   dot: '#3b82f6' },
    completed:   { label: 'Ride Completed',     dot: '#9ca3af' },
  }
  const sc = statusConfig[status]

  const S = {
    page:    { display: 'flex', height: '100svh', width: '100vw', overflow: 'hidden', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
    map:     { flex: 1, position: 'relative' } as React.CSSProperties,
    panel:   { width: 380, flexShrink: 0, background: '#fff', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #f0f0f0', overflowY: 'auto' } as React.CSSProperties,
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        *::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
        .leaflet-bottom, .leaflet-top { display: none !important; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      <div style={S.page}>
        <div style={S.map}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={S.panel}>

          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>LIVE TRACKING</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f3f4f6', borderRadius: 99, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, display: 'inline-block', animation: 'blink 1.5s infinite' }} />
              {sc.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>Your Ride</div>
          </div>

          {/* OTP Box */}
          {showOtp && (
            <div style={{ margin: '16px 24px 0', borderRadius: 16, border: '2px solid #fbbf24' }}>

              <div style={{ background: '#111827', borderRadius: '14px 14px 0 0', padding: '13px 16px' }}>
                <span style={{ color: '#fbbf24', fontSize: 15, marginRight: 8 }}>🔑</span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>YOUR RIDE OTP</span>
              </div>

              <div style={{ background: '#fffbeb', borderRadius: '0 0 14px 14px', padding: '18px 20px' }}>
                <p style={{ fontSize: 12, color: '#92400e', fontWeight: 500, marginBottom: 16, lineHeight: 1.6 }}>
                  {status === 'arrived'
                    ? 'Your driver has arrived. Share this OTP to start the ride.'
                    : 'Ride is in progress. OTP was successfully verified.'}
                </p>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
                  {displayOtp.split('').map((digit, i) => (
                    <div
                      key={i}
                      style={{
                        width: 58,
                        height: 68,
                        borderRadius: 14,
                        background: '#fff',
                        border: '2px solid #fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 30,
                        fontWeight: 900,
                        color: '#111',
                        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                      }}
                    >
                      {digit}
                    </div>
                  ))}
                </div>

                <button
                  onClick={copyOtp}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    border: '2px solid #fbbf24',
                    background: otpCopied ? '#111' : '#fff',
                    color: otpCopied ? '#fff' : '#92400e',
                    transition: 'all .2s',
                  }}
                >
                  {otpCopied ? '✓ Copied to Clipboard' : 'Copy OTP'}
                </button>
              </div>
            </div>
          )}

          {/* In Progress Banner */}
          {status === 'in_progress' && (
            <div style={{ margin: '12px 24px 0', borderRadius: 12, background: '#eff6ff', border: '1.5px solid #bfdbfe', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, display: 'inline-block', animation: 'blink 1.5s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>Ride in progress — enjoy your trip! 🚀</span>
            </div>
          )}

          {/* Completed */}
          {status === 'completed' && (
            <div style={{ margin: '16px 24px 0', borderRadius: 12, background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: 18 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#15803d', marginBottom: 6 }}>Ride Completed! 🎉</p>
              <p style={{ fontSize: 12, color: '#166534', fontWeight: 500, marginBottom: 14 }}>Thank you for riding with us.</p>
              <button
                onClick={() => router.push('/')}
                style={{ width: '100%', padding: 11, borderRadius: 10, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Book Another Ride
              </button>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px 24px', borderBottom: '1px solid #f5f5f5', marginTop: 16 }}>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>ETA</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>{etaMins > 0 ? `${etaMins} min` : 'Now'}</div>
            </div>
            <div style={{ background: '#111', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>FARE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>₹{fare}</div>
            </div>
          </div>

          {/* Driver */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
              {driverName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 3 }}>{driverName}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}</div>
              <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>
                ✓ {payMethod === 'cash' ? 'Cash Payment' : 'Online Payment'}
              </span>
            </div>
            <a href="tel:+919999999999" style={{ width: 36, height: 36, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px 24px 0' }}>
            <button style={{ padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', color: '#111', border: '1.5px solid #e5e7eb' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Message
            </button>
            <button
              onClick={() => { if (confirm('Are you sure you want to cancel?')) router.push('/') }}
              style={{ padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#111', color: '#fff', border: 'none' }}
            >
              Cancel Ride
            </button>
          </div>

          {/* Route */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f5f5f5', marginTop: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 12 }}>ROUTE</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#111', display: 'block', flexShrink: 0 }} />
                <span style={{ width: 1.5, height: 28, background: '#e5e7eb', display: 'block' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #111', display: 'block', flexShrink: 0 }} />
              </div>
              <div style={{ flex: 1, paddingLeft: 10 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 9, color: '#bbb', letterSpacing: 1, fontWeight: 700, marginBottom: 2 }}>PICKUP</div>
                  <div style={{ fontSize: 12, color: '#374151', fontWeight: 500, lineHeight: 1.4 }}>{pickup}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#bbb', letterSpacing: 1, fontWeight: 700, marginBottom: 2 }}>DROP</div>
                  <div style={{ fontSize: 12, color: '#374151', fontWeight: 500, lineHeight: 1.4 }}>{drop}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div style={{ padding: '14px 24px 24px', borderTop: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>VEHICLE</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}</div>
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 800, color: '#111', letterSpacing: 1 }}>UP61AS1234</div>
          </div>

        </div>
      </div>
    </>
  )
}