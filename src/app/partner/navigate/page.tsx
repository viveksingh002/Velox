"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function NavigateMap() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [phase, setPhase] = useState<"to_pickup" | "to_drop">("to_pickup");
  const [eta, setEta] = useState<string>("--");
  const [dist, setDist] = useState<string>("--");

  const pickup = searchParams.get("pickup") || "";
  const drop   = searchParams.get("drop")   || "";
  const bookingId = searchParams.get("id")  || "";

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css" as any);

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const map = L.map(mapRef.current!, { zoomControl: false });
        mapInstance.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Geocode pickup and drop using Nominatim
        const geocode = async (place: string) => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          if (data.length === 0) throw new Error(`Could not find: ${place}`);
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name };
        };

        // Get current location
        const getCurrentPos = (): Promise<{ lat: number; lng: number }> =>
          new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(
              (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
              () => reject(new Error("Location denied"))
            )
          );

        const [current, pickupCoords, dropCoords] = await Promise.all([
          getCurrentPos().catch(() => ({ lat: 25.4484, lng: 78.5685 })), // fallback Jhansi
          geocode(pickup),
          geocode(drop),
        ]);

        // Custom icons
        const currentIcon = L.divIcon({
          html: `<div style="width:44px;height:44px;border-radius:50%;background:#111827;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M9 6l1.5 5.5L5.5 17"/><path d="M9 6h6"/><path d="M15 6l3 4.5"/><path d="M12 11.5L18.5 17"/></svg>
          </div>`,
          className: "",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const pickupIcon = L.divIcon({
          html: `<div style="background:#22c55e;color:#fff;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);">PICKUP</div>`,
          className: "",
          iconAnchor: [30, 14],
        });

        const dropIcon = L.divIcon({
          html: `<div style="background:#ef4444;color:#fff;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);">DROP</div>`,
          className: "",
          iconAnchor: [22, 14],
        });

        // Add markers
        L.marker([current.lat, current.lng], { icon: currentIcon }).addTo(map);
        L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon }).addTo(map);
        L.marker([dropCoords.lat, dropCoords.lng], { icon: dropIcon }).addTo(map);

        // Draw route using OSRM
        const drawRoute = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }, color: string) => {
          try {
            const res = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
            );
            const data = await res.json();
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]);
            const duration = data.routes[0].duration; // seconds
            const distance = data.routes[0].distance; // meters

            setEta(`${Math.ceil(duration / 60)} min`);
            setDist(`${(distance / 1000).toFixed(1)} km`);

            L.polyline(coords, { color, weight: 5, opacity: 0.85 }).addTo(map);

            const bounds = L.latLngBounds([
              [from.lat, from.lng],
              [to.lat, to.lng],
            ]);
            map.fitBounds(bounds, { padding: [60, 60] });
          } catch {
            // fallback straight line
            L.polyline([[from.lat, from.lng], [to.lat, to.lng]], { color, weight: 4, dashArray: "8 6" }).addTo(map);
          }
        };

        // Draw both routes (current→pickup dashed, pickup→drop solid)
        await drawRoute(current, pickupCoords, "#f59e0b");
        await drawRoute(pickupCoords, dropCoords, "#2563eb");

        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    initMap();
  }, [pickup, drop]);

  return (
    <div style={{ height: "100svh", display: "flex", flexDirection: "column", fontFamily: "Inter,sans-serif", background: "#f3f4f6" }}>
      {/* Header */}
      <div style={{ background: "#111827", padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Navigation</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            {phase === "to_pickup" ? "Heading to pickup" : "Heading to drop"}
          </p>
        </div>
        {status === "ready" && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 1 }}>ETA</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>{eta}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 1 }}>DIST</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{dist}</p>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: "relative" }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        {status === "loading" && (
          <div style={{ position: "absolute", inset: 0, background: "#e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, border: "3px solid rgba(0,0,0,0.1)", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <p style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Loading map...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {status === "error" && (
          <div style={{ position: "absolute", inset: 0, background: "#f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Could not load map</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Check your internet connection or location permissions.</p>
            <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "#111827", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {/* Legend */}
        {status === "ready" && (
          <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", zIndex: 999 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 20, height: 3, background: "#f59e0b", borderRadius: 99 }} />
              <p style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>To Pickup</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 3, background: "#2563eb", borderRadius: 99 }} />
              <p style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>To Drop</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "16px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e" }} />
            <div style={{ width: 1.5, height: 28, background: "#e5e7eb" }} />
            <div style={{ width: 9, height: 9, borderRadius: 2, background: "#ef4444" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: 1, marginBottom: 2 }}>PICKUP</p>
              <p style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{pickup}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: 1, marginBottom: 2 }}>DROP</p>
              <p style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{drop}</p>
            </div>
          </div>
          <button onClick={() => router.back()} style={{ padding: "10px 16px", background: "#111827", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", whiteSpace: "nowrap", alignSelf: "center" }}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NavigatePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100svh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <NavigateMap />
    </Suspense>
  );
}