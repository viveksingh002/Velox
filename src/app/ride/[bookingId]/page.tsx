'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

const API = "http://localhost:5000/api"

export default function RideTrackingPage() {
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()

  const bookingId = params.bookingId as string

  const pickup = decodeURIComponent(search.get('pickup') || '')
  const drop = decodeURIComponent(search.get('drop') || '')
  const fare = search.get('fare') || '0'
  const vehicle = search.get('vehicle') || 'bike'
  const driverName = decodeURIComponent(search.get('driverName') || 'Driver')
  const payMethod = search.get('payMethod') || 'cash'

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const driverMarker = useRef<any>(null)

  const intervalRef = useRef<any>(null)

  const [eta, setEta] = useState(0)
  const [status, setStatus] = useState<'on_way' | 'arrived' | 'completed'>('on_way')
  const [elapsed, setElapsed] = useState(0)

  // timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // cleanup movement interval (IMPORTANT FIX)
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // load leaflet once
  useEffect(() => {
    if (mapInstance.current) return

    const loadLeaflet = () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.head.appendChild(script)
    }

    loadLeaflet()
  }, [])

  const geocode = async (address: string) => {
    if (!address) return null

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await res.json()
      if (data?.[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        }
      }
    } catch (err) {
      console.log("Geocode error:", err)
    }
    return null
  }

  const initMap = async () => {
    if (!mapRef.current || mapInstance.current) return

    const L = (window as any).L

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([25.4484, 78.5685], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    mapInstance.current = map

    const driverIcon = L.divIcon({
      className: '',
      html: `<div style="width:40px;height:40px;border-radius:50%;background:#111;border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;">🏍</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })

    const pickupIcon = L.divIcon({
      className: '',
      html: `<div style="background:#111;color:#fff;padding:4px 10px;border-radius:99px;font-size:11px;">PICKUP</div>`,
    })

    const dropIcon = L.divIcon({
      className: '',
      html: `<div style="background:#ef4444;color:#fff;padding:4px 10px;border-radius:99px;font-size:11px;">DROP</div>`,
    })

    const pickupCoord = await geocode(pickup)
    const dropCoord = await geocode(drop)

    if (!pickupCoord || !dropCoord) return

    L.marker([pickupCoord.lat, pickupCoord.lng], { icon: pickupIcon }).addTo(map)
    L.marker([dropCoord.lat, dropCoord.lng], { icon: dropIcon }).addTo(map)

    const line = L.polyline(
      [[pickupCoord.lat, pickupCoord.lng], [dropCoord.lat, dropCoord.lng]],
      { color: '#111', weight: 3, dashArray: '8 6' }
    ).addTo(map)

    map.fitBounds(line.getBounds(), { padding: [60, 60] })

    // driver simulation
    const steps = 60
    let step = 0

    const latDiff = (dropCoord.lat - pickupCoord.lat) / steps
    const lngDiff = (dropCoord.lng - pickupCoord.lng) / steps

    const marker = L.marker([pickupCoord.lat, pickupCoord.lng], {
      icon: driverIcon,
    }).addTo(map)

    driverMarker.current = marker
    setEta(steps * 3)

    intervalRef.current = setInterval(() => {
      step++

      if (step >= steps) {
        clearInterval(intervalRef.current)
        setStatus('arrived')
        return
      }

      const lat = pickupCoord.lat + latDiff * step
      const lng = pickupCoord.lng + lngDiff * step

      marker.setLatLng([lat, lng])

      setEta(e => Math.max(e - 3, 0))
    }, 3000)
  }

  const etaMins = Math.ceil(eta / 60)

  const statusConfig = {
    on_way: { label: 'Driver on the Way', dot: '#22c55e' },
    arrived: { label: 'Driver Arrived!', dot: '#f59e0b' },
    completed: { label: 'Ride Completed', dot: '#9ca3af' },
  }

  const sc = statusConfig[status]

  return (
    <div>
    </div>
  )
}