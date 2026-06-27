'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const fakeVehicles = {
  bike: [
    { id: 1, name: 'Hunter 350', plate: 'UP81A51234', rating: 4.8, perKm: 10, waiting: 2, fare: 63, tag: 'BEST PICK' },
    { id: 2, name: 'Splendor+', plate: 'UP81B98765', rating: 4.5, perKm: 8, waiting: 5, fare: 52, tag: null },
  ],
  auto: [
    { id: 3, name: 'Bajaj RE', plate: 'UP81C11223', rating: 4.7, perKm: 12, waiting: 3, fare: 75, tag: 'BEST PICK' },
  ],
  car: [
    { id: 4, name: 'Swift Dzire', plate: 'UP81D44556', rating: 4.9, perKm: 18, waiting: 4, fare: 149, tag: 'BEST PICK' },
    { id: 5, name: 'Honda City', plate: 'UP81E77889', rating: 4.6, perKm: 20, waiting: 7, fare: 189, tag: null },
  ],
  loading: [
    { id: 6, name: 'Tata Ace', plate: 'UP81F22334', rating: 4.4, perKm: 25, waiting: 8, fare: 220, tag: 'BEST PICK' },
  ],
  truck: [
    { id: 7, name: 'Ashok Leyland', plate: 'UP81G55667', rating: 4.3, perKm: 40, waiting: 12, fare: 450, tag: 'BEST PICK' },
  ],
}

function VehicleIcon({ type, size = 20 }: { type: string; size?: number }) {
  if (type === 'bike') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="11" cy="34" r="7" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="37" cy="34" r="7" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M11 34 L20 20 L28 20 L37 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20 L24 14 L30 14 L32 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20 L28 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
  if (type === 'car') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="26" width="40" height="10" rx="3" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M10 26 L15 16 L33 16 L38 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="13" cy="36" r="4.5" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="35" cy="36" r="4.5" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="3" y="24" width="42" height="12" rx="3" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M8 24 L11 13 L37 13 L40 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="36" r="5" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="36" cy="36" r="5" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  )
}

// Geocode using OpenStreetMap Nominatim (free, no key needed)
async function geocode(place: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1&countrycodes=in`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (!data.length) return null
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch { return null }
}

// Get route using OSRM (free, no key needed)
async function getRoute(from: [number, number], to: [number, number]) {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    )
    const data = await res.json()
    if (!data.routes?.length) return null
    return {
      coords: data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]) as [number, number][],
      distance: (data.routes[0].distance / 1000).toFixed(1),
      duration: Math.round(data.routes[0].duration / 60),
    }
  } catch { return null }
}

export default function SearchPage() {
  const params = useSearchParams()
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: number } | null>(null)

  const pickup = decodeURIComponent(params.get('pickup') || '')
  const drop = decodeURIComponent(params.get('drop') || '')
  const vehicle = params.get('vehicle') || 'bike'
  const mobile = params.get('mobile') || ''
  const vehicles = fakeVehicles[vehicle as keyof typeof fakeVehicles] || fakeVehicles.bike

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    // Load Leaflet CSS + JS dynamically (no npm install needed)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = async () => {
      const L = (window as any).L

      // Fix default marker icon path issue in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Init map — default center India
      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: true })

      // OpenStreetMap tiles — completely free
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      map.setView([25.4484, 78.5691], 13) // Default: Jhansi, UP
      mapInstance.current = map
      setMapReady(true)

      // Geocode both locations
      const [pickupCoord, dropCoord] = await Promise.all([
        geocode(pickup),
        geocode(drop),
      ])

      if (pickupCoord) {
        // Custom pickup marker (black pill)
        const pickupIcon = L.divIcon({
          className: '',
          html: `<div style="background:#111;color:#fff;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;font-family:Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid #fff;">PICKUP</div>`,
          iconAnchor: [30, 28],
        })
        L.marker(pickupCoord, { icon: pickupIcon }).addTo(map)
        map.setView(pickupCoord, 14)
      }

      if (dropCoord) {
        // Custom drop marker (blue pill)
        const dropIcon = L.divIcon({
          className: '',
          html: `<div style="background:#0071e3;color:#fff;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;font-family:Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid #fff;">DROP</div>`,
          iconAnchor: [24, 28],
        })
        L.marker(dropCoord, { icon: dropIcon }).addTo(map)
      }

      // Draw route if both found
      if (pickupCoord && dropCoord) {
        const route = await getRoute(pickupCoord, dropCoord)
        if (route) {
          // Draw polyline
          L.polyline(route.coords, {
            color: '#111',
            weight: 4,
            opacity: 0.85,
          }).addTo(map)

          // Fit both markers in view
          map.fitBounds([pickupCoord, dropCoord], { padding: [50, 50] })
          setRouteInfo({ distance: route.distance, duration: route.duration })
        }
      }
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  const handleSelect = (v: typeof vehicles[0]) => {
    const p = new URLSearchParams({
      pickup, drop, vehicle,
      vehicleName: v.name,
      plate: v.plate,
      fare: String(v.fare),
      rating: String(v.rating),
      mobile,
    })
    router.push(`/checkout?${p.toString()}`)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .search-root {
          height: 100svh; display: flex; flex-direction: column;
          font-family: 'Inter', -apple-system, sans-serif;
          background: #f4f4f6; overflow: hidden;
        }

        /* Map */
        .search-map { flex: 1; position: relative; min-height: 0; }
        .search-map-el { width: 100%; height: 100%; }

        /* Badges over map */
        .search-overlay-tl {
          position: absolute; top: 12px; left: 12px;
          display: flex; gap: 8px; z-index: 999; pointer-events: none;
        }
        .search-dist-badge {
          background: #fff; border: 1px solid #e0e0e0;
          border-radius: 980px; padding: 5px 12px;
          font-size: 11px; font-weight: 600; color: #555;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex; align-items: center; gap: 5px;
        }
        .search-live {
          position: absolute; top: 12px; right: 12px; z-index: 999;
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid #e0e0e0;
          border-radius: 980px; padding: 5px 12px;
          font-size: 11px; font-weight: 700; color: #111;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .search-live-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
          animation: livePulse 2s infinite;
        }
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* Bottom panel */
        .search-panel {
          background: #fff;
          border-top-left-radius: 20px; border-top-right-radius: 20px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
          overflow: hidden; max-height: 56vh;
          display: flex; flex-direction: column;
        }
        .search-panel-handle {
          width: 36px; height: 4px; border-radius: 2px;
          background: #e0e0e0; margin: 10px auto 0;
        }

        /* Route summary */
        .search-route {
          padding: 12px 16px; border-bottom: 1px solid #f0f0f0;
        }
        .search-route-inner { display: flex; align-items: stretch; gap: 10px; }
        .search-route-dots { display: flex; flex-direction: column; align-items: center; padding-top: 4px; }
        .search-route-dot-fill { width: 8px; height: 8px; border-radius: 50%; background: #111; flex-shrink: 0; }
        .search-route-dot-empty { width: 8px; height: 8px; border-radius: 50%; border: 2px solid #111; flex-shrink: 0; }
        .search-route-line { flex: 1; width: 1px; background: #ddd; margin: 3px 0; }
        .search-route-texts { flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; }
        .search-route-item { display: flex; align-items: flex-start; justify-content: space-between; }
        .search-route-label { font-size: 9px; color: #bbb; letter-spacing: 1px; font-weight: 700; }
        .search-route-text { font-size: 13px; color: #111; font-weight: 500; line-height: 1.3; }
        .search-route-icon { color: #bbb; cursor: pointer; flex-shrink: 0; margin-left: 8px; }

        /* List */
        .search-list { overflow-y: auto; flex: 1; padding: 12px 16px 20px; }
        .search-list-header { font-size: 16px; font-weight: 700; color: #111; letter-spacing: -0.3px; margin-bottom: 2px; }
        .search-list-sub { font-size: 12px; color: #aaa; margin-bottom: 12px; }

        /* Vehicle card */
        .search-vcard {
          border: 1.5px solid #ebebeb; border-radius: 16px;
          padding: 14px; margin-bottom: 10px; cursor: pointer;
          transition: all 0.2s; background: #fff; position: relative;
        }
        .search-vcard:hover { border-color: #111; box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .search-vcard-best {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700; padding: 3px 10px;
          background: #111; color: #fff; border-radius: 980px; margin-bottom: 10px;
        }
        .search-vcard-top { display: flex; gap: 12px; margin-bottom: 12px; }
        .search-vcard-img {
          width: 88px; height: 64px; border-radius: 12px;
          background: linear-gradient(135deg, #f0f2f5, #e4e8ef);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #444;
        }
        .search-vcard-info { flex: 1; }
        .search-vcard-name { font-size: 17px; font-weight: 700; color: #111; letter-spacing: -0.3px; }
        .search-vcard-plate { font-size: 11px; color: #aaa; font-weight: 500; margin-top: 2px; letter-spacing: 0.5px; }
        .search-vcard-badges { display: flex; gap: 6px; margin-top: 7px; }
        .search-vcard-badge {
          font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 980px;
          display: flex; align-items: center; gap: 3px;
        }
        .badge-rating { background: #f5f5f5; color: #555; }
        .badge-type { background: #111; color: #fff; }

        .search-vcard-stats {
          display: flex; gap: 20px; padding: 10px 0;
          border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;
          margin-bottom: 10px;
        }
        .search-vcard-stat { display: flex; align-items: center; gap: 6px; }
        .search-vcard-stat-lbl { font-size: 10px; color: #aaa; font-weight: 600; }
        .search-vcard-stat-val { font-size: 13px; font-weight: 700; color: #111; }

        .search-vcard-footer { display: flex; align-items: center; justify-content: space-between; }
        .search-vcard-fare { }
        .search-vcard-fare-lbl { font-size: 10px; color: #aaa; font-weight: 600; letter-spacing: 0.5px; }
        .search-vcard-fare-amt { font-size: 30px; font-weight: 800; color: #111; letter-spacing: -1px; line-height: 1; }
        .search-vcard-fare-sym { font-size: 18px; }

        .search-book-btn {
          padding: 11px 24px; background: #111; color: #fff;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
          display: flex; align-items: center; gap: 6px;
        }
        .search-book-btn:hover { background: #000; transform: scale(1.03); }

        .search-list::-webkit-scrollbar { width: 3px; }
        .search-list::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }
      `}</style>

      <div className="search-root">

        {/* Map */}
        <div className="search-map">
          <div className="search-map-el" ref={mapRef} />

          {/* Distance / time badges */}
          {routeInfo && (
            <div className="search-overlay-tl">
              <div className="search-dist-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M12 5l7 7-7 7"/></svg>
                {routeInfo.distance} km
              </div>
              <div className="search-dist-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                {routeInfo.duration} min
              </div>
            </div>
          )}

          {/* Live badge */}
          {mapReady && (
            <div className="search-live">
              <div className="search-live-dot" />
              Live
            </div>
          )}
        </div>

        {/* Bottom panel */}
        <div className="search-panel">
          <div className="search-panel-handle" />

          {/* Route summary */}
          <div className="search-route">
            <div className="search-route-inner">
              <div className="search-route-dots">
                <div className="search-route-dot-fill" />
                <div className="search-route-line" />
                <div className="search-route-dot-empty" />
              </div>
              <div className="search-route-texts">
                <div className="search-route-item">
                  <div>
                    <div className="search-route-label">PICKUP</div>
                    <div className="search-route-text">{pickup || 'Pickup location'}</div>
                  </div>
                  <svg className="search-route-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <div className="search-route-item">
                  <div>
                    <div className="search-route-label">DROP</div>
                    <div className="search-route-text">{drop || 'Drop location'}</div>
                  </div>
                  <svg className="search-route-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle list */}
          <div className="search-list">
            <div className="search-list-header">{vehicles.length} Available</div>
            <div className="search-list-sub">{vehicle.charAt(0).toUpperCase() + vehicle.slice(1)} rides near your pickup</div>

            {vehicles.map(v => (
              <div key={v.id} className="search-vcard">
                {v.tag && <div className="search-vcard-best">★ {v.tag}</div>}
                <div className="search-vcard-top">
                  <div className="search-vcard-img">
                    <VehicleIcon type={vehicle} size={42} />
                  </div>
                  <div className="search-vcard-info">
                    <div className="search-vcard-name">{v.name}</div>
                    <div className="search-vcard-plate">{v.plate}</div>
                    <div className="search-vcard-badges">
                      <span className="search-vcard-badge badge-rating">★ {v.rating}</span>
                      <span className="search-vcard-badge badge-type">⬡ {vehicle.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="search-vcard-stats">
                  <div className="search-vcard-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    <div>
                      <div className="search-vcard-stat-lbl">PER KM</div>
                      <div className="search-vcard-stat-val">₹{v.perKm}</div>
                    </div>
                  </div>
                  <div className="search-vcard-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    <div>
                      <div className="search-vcard-stat-lbl">WAITING</div>
                      <div className="search-vcard-stat-val">₹{v.waiting} <span style={{fontSize:10,color:'#bbb',fontWeight:400}}>min</span></div>
                    </div>
                  </div>
                </div>

                <div className="search-vcard-footer">
                  <div className="search-vcard-fare">
                    <div className="search-vcard-fare-lbl">EST. FARE</div>
                    <div className="search-vcard-fare-amt">
                      <span className="search-vcard-fare-sym">₹ </span>{v.fare}
                    </div>
                  </div>
                  <button className="search-book-btn" onClick={() => handleSelect(v)}>
                    Book →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}