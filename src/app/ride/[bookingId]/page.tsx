'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function RideTrackingPage() {
  const search  = useSearchParams()
  const router  = useRouter()
  const mapRef  = useRef<HTMLDivElement>(null)
  const mapInst = useRef<any>(null)

  const driverName   = search.get('driverName')   || 'Driver'
  const vehicleModel = search.get('vehicleModel') || 'Vehicle'
  const plateNumber  = search.get('plateNumber')  || '—'
  const pickup       = search.get('pickup')        || ''
  const drop         = search.get('drop')          || ''
  const fare         = search.get('fare')          || '0'
  const vehicle      = search.get('vehicle')       || 'bike'
  const payMethod    = search.get('payMethod')     || 'cash'
  const pickupLat    = Number(search.get('pickupLat'))  || 25.4484
  const pickupLng    = Number(search.get('pickupLng'))  || 78.5691
  const dropLat      = Number(search.get('dropLat'))    || 25.4600
  const dropLng      = Number(search.get('dropLng'))    || 78.5800

  const [status, setStatus] = useState<'on_the_way' | 'arrived' | 'completed'>('on_the_way')
  const [eta,    setEta]    = useState(5)

  useEffect(() => {
    if (mapInst.current || !mapRef.current) return

    const link = document.createElement('link')
    link.rel   = 'stylesheet'
    link.href  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script    = document.createElement('script')
    script.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload   = () => initMap()
    document.head.appendChild(script)

    return () => {
      mapInst.current?.remove()
      mapInst.current = null
    }
  }, [])

  const initMap = () => {
    if (!mapRef.current || mapInst.current) return
    const L = (window as any).L

    const map = L.map(mapRef.current, { zoomControl: false })
      .setView([pickupLat, pickupLng], 14)
    mapInst.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const mkIcon = (html: string) => L.divIcon({ html, className: '', iconAnchor: [0, 0] })

    const pickupIcon = mkIcon(`<div style="background:#111;color:#fff;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:.5px;box-shadow:0 2px 8px rgba(0,0,0,.3);white-space:nowrap;border:2px solid #fff">PICKUP</div>`)
    const dropIcon   = mkIcon(`<div style="background:#fff;color:#111;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:.5px;box-shadow:0 2px 8px rgba(0,0,0,.15);white-space:nowrap;border:1.5px solid #e5e7eb">DROP</div>`)

    // Driver slightly offset from pickup
    const driverLat = pickupLat - 0.012
    const driverLng = pickupLng - 0.010
    const driverIcon = mkIcon(`<div style="width:38px;height:38px;background:#111;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,.35);border:2.5px solid #fff;font-size:18px">🏍️</div>`)

    L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(map)
    L.marker([dropLat,   dropLng],   { icon: dropIcon   }).addTo(map)
    L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(map)

    L.polyline([[driverLat, driverLng], [pickupLat, pickupLng], [dropLat, dropLng]], {
      color: '#111', weight: 3, dashArray: '6 8', opacity: 0.55,
    }).addTo(map)

    map.fitBounds([[driverLat, driverLng], [pickupLat, pickupLng], [dropLat, dropLng]], { padding: [48, 48] })
  }

  useEffect(() => {
    const t = setInterval(() => {
      setEta(p => {
        if (p <= 1) { clearInterval(t); setStatus('arrived'); return 0 }
        return p - 1
      })
    }, 60000)
    return () => clearInterval(t)
  }, [])

  const isCompleted = status === 'completed'

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .rt-root{height:100svh;display:flex;flex-direction:column;font-family:'Inter',-apple-system,sans-serif;overflow:hidden;background:#f4f4f6}

        /* Map */
        .rt-map{flex:1;position:relative;min-height:0}
        .rt-map-el{width:100%;height:100%}

        /* Status pill */
        .rt-status-pill{position:absolute;top:16px;left:50%;transform:translateX(-50%);background:#fff;border-radius:980px;padding:8px 20px;display:flex;align-items:center;gap:8px;box-shadow:0 2px 16px rgba(0,0,0,.12);z-index:1000;white-space:nowrap;font-size:13px;font-weight:700;color:#111}
        .rt-status-dot{width:8px;height:8px;border-radius:50%;animation:rtPulse 1.5s infinite}
        @keyframes rtPulse{0%,100%{opacity:1}50%{opacity:.3}}

        /* Bottom panel */
        .rt-panel{background:#fff;border-radius:20px 20px 0 0;box-shadow:0 -4px 24px rgba(0,0,0,.08);flex-shrink:0;overflow:hidden}
        .rt-panel-scroll{padding:16px 16px 32px;overflow-y:auto;max-height:55vh}

        /* ETA + Fare */
        .rt-top-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
        .rt-card-light{background:#f9fafb;border-radius:14px;padding:12px 16px;border:1px solid #f3f4f6}
        .rt-card-dark{background:#111;border-radius:14px;padding:12px 16px}
        .rt-card-label{font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px}
        .rt-card-val{font-size:22px;font-weight:800;line-height:1}

        /* Driver card */
        .rt-driver{background:#111;border-radius:16px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .rt-driver-left{display:flex;align-items:center;gap:12px}
        .rt-avatar{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a5b4fc);display:flex;align-items:center;justify-content:center;color:#fff;font-size:17px;font-weight:800;flex-shrink:0}
        .rt-driver-name{font-size:15px;font-weight:700;color:#fff;margin-bottom:4px}
        .rt-driver-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .rt-driver-meta span{font-size:12px;color:rgba(255,255,255,.55)}
        .rt-pay-badge{font-size:10px;font-weight:700;padding:2px 9px;border-radius:980px;text-transform:capitalize}

        /* Action buttons */
        .rt-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
        .rt-action-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:14px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;border:none;font-family:inherit}
        .rt-call-btn{background:#f9fafb;color:#111;border:1.5px solid #e5e7eb}
        .rt-call-btn:hover{background:#f3f4f6}
        .rt-msg-btn{background:#111;color:#fff}
        .rt-msg-btn:hover{background:#000}

        /* Route card */
        .rt-route{background:#f9fafb;border-radius:14px;padding:14px 16px;border:1px solid #f3f4f6;margin-bottom:12px}
        .rt-route-row{display:flex;align-items:flex-start;gap:12px}
        .rt-route-dots{display:flex;flex-direction:column;align-items:center;padding-top:3px;flex-shrink:0}
        .rt-dot-fill{width:8px;height:8px;border-radius:50%;background:#111}
        .rt-dot-empty{width:8px;height:8px;border-radius:50%;border:2px solid #111;background:#fff}
        .rt-dot-line{width:1.5px;height:28px;background:#e5e7eb;margin:2px 0}
        .rt-route-label{font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}
        .rt-route-text{font-size:13px;font-weight:500;color:#111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:260px}

        /* Vehicle card */
        .rt-vehicle{background:#f9fafb;border-radius:14px;padding:12px 16px;border:1px solid #f3f4f6;display:flex;align-items:center;gap:12px;margin-bottom:12px}
        .rt-vehicle-icon{width:42px;height:42px;border-radius:12px;background:#111;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .rt-vehicle-model{font-size:14px;font-weight:700;color:#111}
        .rt-vehicle-plate{font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:.5px;margin-top:2px}
        .rt-plate-badge{background:#111;color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:8px;letter-spacing:1px;margin-left:auto}

        /* Complete / Done */
        .rt-complete-btn{width:100%;padding:15px;background:#111;color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
        .rt-complete-btn:hover{background:#000;transform:translateY(-1px)}
        .rt-done-banner{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:14px;text-align:center;font-size:14px;font-weight:700;color:#16a34a}

        @media(min-width:768px){
          .rt-root{flex-direction:row}
          .rt-map{flex:1}
          .rt-panel{width:360px;border-radius:0;border-left:1px solid #f3f4f6;box-shadow:-4px 0 24px rgba(0,0,0,.06)}
          .rt-panel-scroll{max-height:100vh;padding:24px}
          .rt-top-label{font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px}
        }
      `}</style>

      <div className="rt-root">

        {/* Map */}
        <div className="rt-map">
          <div ref={mapRef} className="rt-map-el" />
          <div className="rt-status-pill">
            {status === 'on_the_way' && <div className="rt-status-dot" style={{ background: '#22c55e' }} />}
            {status === 'on_the_way' && 'Driver on the Way'}
            {status === 'arrived'    && '🟡 Driver Arrived!'}
            {status === 'completed'  && '✓ Ride Completed'}
          </div>
        </div>

        {/* Panel */}
        <div className="rt-panel">
          <div className="rt-panel-scroll">

            {/* Desktop label */}
            <div className="rt-top-label" style={{ display: 'none' }}>LIVE TRACKING — YOUR RIDE</div>

            {/* ETA + Fare */}
            <div className="rt-top-row">
              <div className="rt-card-light">
                <div className="rt-card-label" style={{ color: '#9ca3af' }}>ETA</div>
                <div className="rt-card-val" style={{ color: '#111' }}>{eta} <span style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>min</span></div>
              </div>
              <div className="rt-card-dark">
                <div className="rt-card-label" style={{ color: 'rgba(255,255,255,.45)' }}>FARE</div>
                <div className="rt-card-val" style={{ color: '#fff' }}>₹{fare}</div>
              </div>
            </div>

            {/* Driver */}
            <div className="rt-driver">
              <div className="rt-driver-left">
                <div className="rt-avatar">{driverName.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="rt-driver-name">{driverName}</div>
                  <div className="rt-driver-meta">
                    <span>⭐ 4.9</span>
                    <span>·</span>
                    <span style={{ textTransform: 'capitalize' }}>{vehicle}</span>
                    <span
                      className="rt-pay-badge"
                      style={{
                        background: payMethod === 'cash' ? '#16a34a' : '#2563eb',
                        color: '#fff',
                      }}
                    >
                      {payMethod === 'cash' ? 'Cash' : 'Paid'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call + Message */}
            <div className="rt-actions">
              <a href="tel:+911234567890" style={{ textDecoration: 'none' }}>
                <button className="rt-action-btn rt-call-btn" style={{ width: '100%' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Call
                </button>
              </a>
              <button className="rt-action-btn rt-msg-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Message
              </button>
            </div>

            {/* Route */}
            <div className="rt-route">
              <div className="rt-route-row">
                <div className="rt-route-dots">
                  <div className="rt-dot-fill" />
                  <div className="rt-dot-line" />
                  <div className="rt-dot-empty" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: 14 }}>
                    <div className="rt-route-label">PICKUP</div>
                    <div className="rt-route-text">{pickup}</div>
                  </div>
                  <div>
                    <div className="rt-route-label">DROP</div>
                    <div className="rt-route-text">{drop}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div className="rt-vehicle">
              <div className="rt-vehicle-icon">🏍️</div>
              <div>
                <div className="rt-vehicle-model">{vehicleModel}</div>
                <div className="rt-vehicle-plate">{plateNumber}</div>
              </div>
              <div className="rt-plate-badge">{plateNumber}</div>
            </div>

            {/* Arrived */}
            {status === 'arrived' && (
              <button
                className="rt-complete-btn"
                onClick={() => { setStatus('completed'); setTimeout(() => router.push('/'), 2500) }}
              >
                Complete Ride ✓
              </button>
            )}

            {/* Completed */}
            {status === 'completed' && (
              <div className="rt-done-banner">✓ Ride Completed! Redirecting...</div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}