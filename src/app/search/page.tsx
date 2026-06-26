'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Fake nearby vehicles data
const fakeVehicles = {
  bike: [
    { id: 1, name: 'Hunter 350', plate: 'UP81A51234', rating: 4.8, perKm: 10, waiting: 2, fare: 63, tag: 'BEST PICK', image: null },
    { id: 2, name: 'Splendor+', plate: 'UP81B98765', rating: 4.5, perKm: 8, waiting: 5, fare: 52, tag: null, image: null },
  ],
  auto: [
    { id: 3, name: 'Bajaj RE', plate: 'UP81C11223', rating: 4.7, perKm: 12, waiting: 3, fare: 75, tag: 'BEST PICK', image: null },
  ],
  car: [
    { id: 4, name: 'Swift Dzire', plate: 'UP81D44556', rating: 4.9, perKm: 18, waiting: 4, fare: 149, tag: 'BEST PICK', image: null },
    { id: 5, name: 'Honda City', plate: 'UP81E77889', rating: 4.6, perKm: 20, waiting: 7, fare: 189, tag: null, image: null },
  ],
  loading: [
    { id: 6, name: 'Tata Ace', plate: 'UP81F22334', rating: 4.4, perKm: 25, waiting: 8, fare: 220, tag: 'BEST PICK', image: null },
  ],
  truck: [
    { id: 7, name: 'Ashok Leyland', plate: 'UP81G55667', rating: 4.3, perKm: 40, waiting: 12, fare: 450, tag: 'BEST PICK', image: null },
  ],
}

// Vehicle SVG icons
function VehicleIcon({ type, size = 20 }: { type: string; size?: number }) {
  const s = size
  if (type === 'bike') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="11" cy="34" r="7" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="37" cy="34" r="7" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M11 34 L20 20 L28 20 L37 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20 L24 14 L30 14 L32 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20 L28 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
  if (type === 'car') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="26" width="40" height="10" rx="3" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M10 26 L15 16 L33 16 L38 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="13" cy="36" r="4.5" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="35" cy="36" r="4.5" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  )
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="22" width="40" height="14" rx="3" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="13" cy="36" r="4.5" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="35" cy="36" r="4.5" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  )
}

export default function SearchPage() {
  const params = useSearchParams()
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isLive, setIsLive] = useState(false)

  const pickup = decodeURIComponent(params.get('pickup') || '')
  const drop = decodeURIComponent(params.get('drop') || '')
  const vehicle = params.get('vehicle') || 'bike'
  const mobile = params.get('mobile') || ''

  const vehicles = fakeVehicles[vehicle as keyof typeof fakeVehicles] || fakeVehicles.bike

  // Load Mapbox
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    if (!MAPBOX_TOKEN) {
      setMapLoaded(true)
      return
    }

    // Load mapbox-gl dynamically
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js'
    script.onload = () => {
      const mapboxgl = (window as any).mapboxgl
      mapboxgl.accessToken = MAPBOX_TOKEN

      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [78.5691, 25.4484], // Jhansi, UP (default)
        zoom: 13,
      })

      map.on('load', () => {
        setMapLoaded(true)
        setIsLive(true)

        // Geocode pickup → place marker
        geocodeAndMark(mapboxgl, map, pickup, MAPBOX_TOKEN, 'pickup', '#111')
        geocodeAndMark(mapboxgl, map, drop, MAPBOX_TOKEN, 'drop', '#0071e3')

        // Draw route between them
        drawRoute(map, pickup, drop, MAPBOX_TOKEN)
      })

      mapInstance.current = map
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  const geocodeAndMark = async (mapboxgl: any, map: any, place: string, token: string, label: string, color: string) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json?access_token=${token}&country=IN&limit=1`
      )
      const data = await res.json()
      if (!data.features?.length) return
      const [lng, lat] = data.features[0].center

      // Custom marker element
      const el = document.createElement('div')
      el.style.cssText = `
        background: ${color}; color: white; padding: 5px 12px;
        border-radius: 20px; font-size: 11px; font-weight: 700;
        letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        border: 2px solid white; white-space: nowrap;
        font-family: Inter, sans-serif;
      `
      el.innerText = label.toUpperCase()

      new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map)

      map.flyTo({ center: [lng, lat], zoom: 13 })
    } catch {}
  }

  const drawRoute = async (map: any, from: string, to: string, token: string) => {
    try {
      // Geocode both
      const [pickupRes, dropRes] = await Promise.all([
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(from)}.json?access_token=${token}&country=IN&limit=1`).then(r => r.json()),
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(to)}.json?access_token=${token}&country=IN&limit=1`).then(r => r.json()),
      ])
      if (!pickupRes.features?.length || !dropRes.features?.length) return
      const pCoord = pickupRes.features[0].center
      const dCoord = dropRes.features[0].center

      // Get directions
      const dirRes = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pCoord[0]},${pCoord[1]};${dCoord[0]},${dCoord[1]}?geometries=geojson&access_token=${token}`
      ).then(r => r.json())

      if (!dirRes.routes?.length) return
      const route = dirRes.routes[0].geometry

      // Add route layer
      if (map.getSource('route')) {
        map.getSource('route').setData(route)
      } else {
        map.addSource('route', { type: 'geojson', data: route })
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#111', 'line-width': 4 },
        })
      }

      // Fit bounds
      const bounds = new (window as any).mapboxgl.LngLatBounds(pCoord, pCoord)
      bounds.extend(dCoord)
      map.fitBounds(bounds, { padding: 60 })
    } catch {}
  }

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
        .search-map {
          flex: 1; position: relative; min-height: 0;
        }
        .search-map-el { width: 100%; height: 100%; }
        .search-map-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #e8edf2, #d4dce6);
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 8px; color: #888; font-size: 14px;
        }
        .search-map-placeholder svg { opacity: 0.3; }

        /* Live badge */
        .search-live {
          position: absolute; top: 12px; right: 12px;
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

        /* Distance badge */
        .search-distance {
          position: absolute; top: 12px; left: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .search-dist-badge {
          background: #fff; border: 1px solid #e0e0e0;
          border-radius: 980px; padding: 5px 12px;
          font-size: 11px; font-weight: 600; color: #555;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex; align-items: center; gap: 5px;
        }

        /* Bottom panel */
        .search-panel {
          background: #fff;
          border-top-left-radius: 20px; border-top-right-radius: 20px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
          overflow: hidden;
          max-height: 55vh;
          display: flex; flex-direction: column;
        }
        .search-panel-handle {
          width: 36px; height: 4px; border-radius: 2px;
          background: #e0e0e0; margin: 10px auto 0;
        }

        /* Route summary */
        .search-route {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .search-route-row {
          display: flex; align-items: flex-start; gap: 10px; padding: 4px 0;
        }
        .search-route-dot-wrap {
          display: flex; flex-direction: column; align-items: center; padding-top: 4px;
        }
        .search-route-dot-fill { width: 8px; height: 8px; border-radius: 50%; background: #111; flex-shrink: 0; }
        .search-route-dot-empty { width: 8px; height: 8px; border-radius: 50%; border: 2px solid #111; flex-shrink: 0; }
        .search-route-line-sm { width: 1px; height: 12px; background: #ddd; margin: 2px 0; }
        .search-route-label { font-size: 9px; color: #aaa; letter-spacing: 1px; font-weight: 700; }
        .search-route-text { font-size: 13px; color: #111; font-weight: 500; line-height: 1.3; }
        .search-route-action { margin-left: auto; color: #bbb; cursor: pointer; }
        .search-route-action:hover { color: #555; }

        /* Vehicle list */
        .search-list { overflow-y: auto; flex: 1; padding: 12px 16px 16px; }
        .search-list-header {
          font-size: 16px; font-weight: 700; color: #111;
          letter-spacing: -0.3px; margin-bottom: 2px;
        }
        .search-list-sub { font-size: 12px; color: #aaa; margin-bottom: 12px; }

        /* Vehicle card */
        .search-vcard {
          border: 1.5px solid #ebebeb; border-radius: 16px;
          padding: 14px; margin-bottom: 10px;
          cursor: pointer; transition: all 0.2s; position: relative;
          overflow: hidden; background: #fff;
        }
        .search-vcard:hover { border-color: #111; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .search-vcard-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
        .search-vcard-img {
          width: 80px; height: 60px; border-radius: 10px;
          background: linear-gradient(135deg, #f0f2f5, #e8eaf0);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #555;
        }
        .search-vcard-info { flex: 1; }
        .search-vcard-name { font-size: 16px; font-weight: 700; color: #111; letter-spacing: -0.3px; }
        .search-vcard-plate { font-size: 11px; color: #999; font-weight: 500; margin-top: 2px; letter-spacing: 0.5px; }
        .search-vcard-badges { display: flex; gap: 6px; margin-top: 6px; }
        .search-vcard-badge {
          font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 980px;
          display: flex; align-items: center; gap: 3px;
        }
        .search-vcard-badge--rating { background: #f5f5f5; color: #555; }
        .search-vcard-badge--type { background: #111; color: #fff; }
        .search-vcard-badge--best { background: #111; color: #fff; }

        .search-vcard-stats {
          display: flex; gap: 16px; padding: 10px 0;
          border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;
          margin-bottom: 10px;
        }
        .search-vcard-stat { display: flex; align-items: center; gap: 5px; }
        .search-vcard-stat-label { font-size: 10px; color: #aaa; font-weight: 600; }
        .search-vcard-stat-val { font-size: 13px; font-weight: 700; color: #111; }

        .search-vcard-footer { display: flex; align-items: center; justify-content: space-between; }
        .search-vcard-fare { display: flex; align-items: baseline; gap: 4px; }
        .search-vcard-fare-label { font-size: 11px; color: #aaa; font-weight: 500; }
        .search-vcard-fare-amt { font-size: 28px; font-weight: 800; color: #111; letter-spacing: -1px; }
        .search-vcard-fare-sym { font-size: 18px; font-weight: 600; color: #111; }

        .search-book-btn {
          padding: 10px 22px; background: #111; color: #fff;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
          display: flex; align-items: center; gap: 6px;
        }
        .search-book-btn:hover { background: #000; transform: scale(1.02); }

        /* No mapbox fallback */
        .no-token-banner {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: rgba(0,0,0,0.75); color: #fff;
          font-size: 12px; text-align: center; padding: 8px;
          backdrop-filter: blur(4px);
        }
      `}</style>

      <div className="search-root">

        {/* Map area */}
        <div className="search-map">
          <div className="search-map-el" ref={mapRef}>
            {!mapLoaded && (
              <div className="search-map-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Loading map...
              </div>
            )}
          </div>

          {/* Distance badges */}
          <div className="search-distance">
            <div className="search-dist-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              2.33 km
            </div>
            <div className="search-dist-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              6 min
            </div>
          </div>

          {/* Live badge */}
          {isLive && (
            <div className="search-live">
              <div className="search-live-dot" />
              Live
            </div>
          )}

          {/* No token notice */}
          {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && mapLoaded && (
            <div className="no-token-banner">
              Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local to enable live map
            </div>
          )}
        </div>

        {/* Bottom panel */}
        <div className="search-panel">
          <div className="search-panel-handle" />

          {/* Route summary */}
          <div className="search-route">
            <div className="search-route-row">
              <div className="search-route-dot-wrap">
                <div className="search-route-dot-fill" />
                <div className="search-route-line-sm" />
                <div className="search-route-dot-empty" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  <div className="search-route-label">PICKUP</div>
                  <div className="search-route-text">{pickup || 'Pickup location'}</div>
                </div>
                <div>
                  <div className="search-route-label">DROP</div>
                  <div className="search-route-text">{drop || 'Drop location'}</div>
                </div>
              </div>
              <div className="search-route-action">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Vehicle list */}
          <div className="search-list">
            <div className="search-list-header">{vehicles.length} Available</div>
            <div className="search-list-sub">{vehicle.charAt(0).toUpperCase() + vehicle.slice(1)} rides near your pickup</div>

            {vehicles.map(v => (
              <div key={v.id} className="search-vcard">
                {v.tag && (
                  <div style={{ marginBottom: 8 }}>
                    <span className="search-vcard-badge search-vcard-badge--best">★ {v.tag}</span>
                  </div>
                )}
                <div className="search-vcard-top">
                  <div className="search-vcard-img">
                    <VehicleIcon type={vehicle} size={40} />
                  </div>
                  <div className="search-vcard-info">
                    <div className="search-vcard-name">{v.name}</div>
                    <div className="search-vcard-plate">{v.plate}</div>
                    <div className="search-vcard-badges">
                      <span className="search-vcard-badge search-vcard-badge--rating">★ {v.rating}</span>
                      <span className="search-vcard-badge search-vcard-badge--type">⬡ {vehicle.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="search-vcard-stats">
                  <div className="search-vcard-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    <div>
                      <div className="search-vcard-stat-label">PER KM</div>
                      <div className="search-vcard-stat-val">₹{v.perKm}</div>
                    </div>
                  </div>
                  <div className="search-vcard-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    <div>
                      <div className="search-vcard-stat-label">WAITING</div>
                      <div className="search-vcard-stat-val">₹{v.waiting} <span style={{fontSize:10,color:'#aaa',fontWeight:400}}>min</span></div>
                    </div>
                  </div>
                </div>

                <div className="search-vcard-footer">
                  <div className="search-vcard-fare">
                    <div className="search-vcard-fare-label">EST. FARE</div>
                    <div>
                      <span className="search-vcard-fare-sym">₹ </span>
                      <span className="search-vcard-fare-amt">{v.fare}</span>
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