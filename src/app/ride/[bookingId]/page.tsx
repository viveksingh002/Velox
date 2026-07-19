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
  const [status,    setStatus]    = useState<'on_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'>('on_way')
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
      if (s === 'cancelled')   setStatus('cancelled')
      if (typeof data.otp === 'string' && data.otp.length > 0) setOtp(data.otp)
    } catch {}
  }, [bookingId])

  useEffect(() => {
    pollStatus()
    const id = setInterval(pollStatus, 5000)
    return () => clearInterval(id)
  }, [pollStatus])

  useEffect(() => {
    if (status === 'completed' || status === 'cancelled') return
    if (mapInstance.current) return
    const link  = document.createElement('link')
    link.rel    = 'stylesheet'
    link.href   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script  = document.createElement('script')
    script.src    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initMap()
    document.head.appendChild(script)
  }, [status])

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
    cancelled:   { label: 'Ride Cancelled',     dot: '#ef4444' },
  }
  const sc = statusConfig[status]

  const rebookUrl = `/?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}`

  // Cancelled: full replacement screen, no map, no driver info
  if (status === 'cancelled') {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; }
          *::-webkit-scrollbar { display: none; }
          * { scrollbar-width: none; -ms-overflow-style: none; }
          @keyframes popIn { from { transform: scale(0.92) translateY(14px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
          @keyframes ringPulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 18px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
          @keyframes glow { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
          @keyframes floatBlob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-16px) scale(1.06); } }
          .rebook-btn { transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .rebook-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(0,0,0,0.28); }
          .rebook-btn:active { transform: translateY(0); }
          .ghost-btn { transition: background 0.18s ease, border-color 0.18s ease; }
          .ghost-btn:hover { background: #f9fafb; border-color: #d1d5db; }
        `}</style>
        <div style={{ minHeight: '100svh', width: '100vw', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', padding: 20, overflow: 'hidden' }}>

          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.16) 0%, transparent 70%)', filter: 'blur(10px)', animation: 'floatBlob 9s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.10) 0%, transparent 70%)', filter: 'blur(10px)', animation: 'floatBlob 11s ease-in-out infinite reverse' }} />

          <div style={{ width: '100%', maxWidth: 412, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative', zIndex: 1 }}>

            <div style={{ padding: '44px 34px 30px', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)' }} />
              <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(145deg, rgba(239,68,68,0.18), rgba(239,68,68,0.05))', border: '1.5px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', animation: 'ringPulse 2.2s infinite' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: 99, padding: '5px 14px', fontSize: 10.5, fontWeight: 800, color: '#f87171', letterSpacing: 1.5, marginBottom: 16 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', display: 'inline-block', animation: 'glow 1.6s infinite' }} />
                RIDE CANCELLED
              </div>
              <h2 style={{ fontSize: 23, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: -0.5 }}>This ride didn't work out</h2>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, maxWidth: 300, margin: '0 auto', fontWeight: 400 }}>
                Your partner had to cancel this trip. No charges were made — grab another ride whenever you're ready.
              </p>
            </div>

            <div style={{ padding: '0 26px 30px' }}>
              <div style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '18px 20px', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff', display: 'block', flexShrink: 0, boxShadow: '0 0 8px rgba(255,255,255,0.5)' }} />
                    <span style={{ width: 1.5, height: 30, background: 'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(239,68,68,0.5))', display: 'block', margin: '4px 0' }} />
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: '#ef4444', display: 'block', flexShrink: 0, boxShadow: '0 0 8px rgba(239,68,68,0.5)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 3 }}>PICKUP</div>
                      <div style={{ fontSize: 13.5, color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>{pickup}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 3 }}>DROP</div>
                      <div style={{ fontSize: 13.5, color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>{drop}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <button
                  className="rebook-btn"
                  onClick={() => router.push(rebookUrl)}
                  style={{ width: '100%', padding: 16, borderRadius: 15, border: 'none', background: 'linear-gradient(135deg, #fff, #f0f0f0)', color: '#0a0a0a', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 10px 24px rgba(0,0,0,0.3)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Request Same Ride Again
                </button>
                <button
                  className="ghost-btn"
                  onClick={() => router.push('/')}
                  style={{ width: '100%', padding: 16, borderRadius: 15, border: '1.5px solid rgba(255,255,255,0.14)', background: 'transparent', color: 'rgba(255,255,255,0.75)', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}
                >
                  Book a New Ride
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

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

          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>LIVE TRACKING</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f3f4f6', borderRadius: 99, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, display: 'inline-block', animation: 'blink 1.5s infinite' }} />
              {sc.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>Your Ride</div>
          </div>

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

          {status === 'in_progress' && (
            <div style={{ margin: '12px 24px 0', borderRadius: 12, background: '#eff6ff', border: '1.5px solid #bfdbfe', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, display: 'inline-block', animation: 'blink 1.5s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>Ride in progress — enjoy your trip! 🚀</span>
            </div>
          )}

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