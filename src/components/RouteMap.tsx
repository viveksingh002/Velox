'use client'

import { useEffect, useRef, useState } from 'react'

interface RouteMapProps {
  pickup: string
  drop: string
  onDistance?: (km: number) => void
  onChange?: (pickup: string, drop: string) => void
}

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

async function getRoute(from: [number, number], to: [number, number]) {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    )
    const data = await res.json()
    if (!data.routes?.length) return null
    return {
      coords: data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]) as [number, number][],
      distanceKm: parseFloat((data.routes[0].distance / 1000).toFixed(1)),
    }
  } catch { return null }
}

export default function RouteMap({ pickup, drop, onDistance, onChange }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = async () => {
      const L = (window as any).L

      // Fix marker icon in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Create map
      const map = L.map(mapRef.current!, {
        zoomControl: false,
        scrollWheelZoom: true,
      })

      // Add zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map)

      // OpenStreetMap tiles — free, no key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Default center: India
      map.setView([22.9734, 78.6569], 5)

      mapInstance.current = map
      setReady(true)

      // Geocode + draw route
      if (pickup && drop) {
        await drawRoute(L, map, pickup, drop, onDistance)
      } else if (pickup) {
        const coord = await geocode(pickup)
        if (coord) {
          placeMarker(L, map, coord, 'PICKUP', '#111')
          map.setView(coord, 13)
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

  // Re-draw when pickup/drop change after map is ready
  useEffect(() => {
    if (!ready || !mapInstance.current) return
    const L = (window as any).L
    if (!L) return
    if (pickup && drop) {
      // Clear existing layers except tile layer
      mapInstance.current.eachLayer((layer: any) => {
        if (!layer._url) mapInstance.current.removeLayer(layer)
      })
      drawRoute(L, mapInstance.current, pickup, drop, onDistance)
    }
  }, [pickup, drop, ready])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', background: '#e8edf2' }}
    />
  )
}

function placeMarker(L: any, map: any, coord: [number, number], label: string, bg: string) {
  const el = document.createElement('div')
  el.style.cssText = `
    background: ${bg};
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    border: 2px solid white;
    white-space: nowrap;
    font-family: Inter, -apple-system, sans-serif;
  `
  el.innerText = label

  const icon = L.divIcon({
    className: '',
    html: el.outerHTML,
    iconAnchor: [label === 'PICKUP' ? 32 : 24, 28],
  })

  L.marker(coord, { icon }).addTo(map)
}

async function drawRoute(
  L: any,
  map: any,
  pickup: string,
  drop: string,
  onDistance?: (km: number) => void
) {
  const [pickupCoord, dropCoord] = await Promise.all([
    geocode(pickup),
    geocode(drop),
  ])

  if (pickupCoord) placeMarker(L, map, pickupCoord, 'PICKUP', '#111111')
  if (dropCoord)   placeMarker(L, map, dropCoord,   'DROP',   '#0071e3')

  if (pickupCoord && dropCoord) {
    const route = await getRoute(pickupCoord, dropCoord)
    if (route) {
      // Draw route polyline
      L.polyline(route.coords, {
        color:   '#111',
        weight:  4,
        opacity: 0.85,
      }).addTo(map)

      // Fit both markers
      map.fitBounds([pickupCoord, dropCoord], { padding: [60, 60] })

      // Report distance to parent
      if (onDistance) onDistance(route.distanceKm)
    } else {
      // Fallback: just fit both points
      map.fitBounds([pickupCoord, dropCoord], { padding: [60, 60] })
    }
  } else if (pickupCoord) {
    map.setView(pickupCoord, 14)
  } else if (dropCoord) {
    map.setView(dropCoord, 14)
  }
}