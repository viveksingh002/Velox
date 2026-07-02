"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft, MapPin, Navigation,
  Bike, Car, Truck, Clock, Route,
  Zap, Search, RefreshCw
} from "lucide-react";
import VehicleBookingCard from "@/components/VehicleBookingCard";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

const VEHICLE_META: Record<string, { label: string; Icon: any }> = {
  bike:    { label: "Bike",    Icon: Bike  },
  auto:    { label: "Auto",    Icon: Car   },
  car:     { label: "Car",     Icon: Car   },
  loading: { label: "Loading", Icon: Truck },
  truck:   { label: "Truck",   Icon: Truck },
};

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [pickup,   setPickup]   = useState(params.get("pickup")  || "");
  const [drop,     setDrop]     = useState(params.get("drop")    || "");
  const [km,       setKm]       = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [fetchErr, setFetchErr] = useState("");

  const vehicle      = params.get("vehicle")      || "";
  const mobileNumber = params.get("mobileNumber") || params.get("mobile") || "";
  const pickupLat    = Number(params.get("pickupLat"));
  const pickupLng    = Number(params.get("pickupLng"));
  const meta         = VEHICLE_META[vehicle];
  const eta          = km !== null ? Math.max(3, Math.round((km / 25) * 60)) : null;

  async function fetchNearbyVehicles() {
    setLoading(true);
    setFetchErr("");
    try {
      const res  = await fetch(
        `http://localhost:5000/api/vendor/nearby?type=${encodeURIComponent(vehicle)}`
      );
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to fetch");

      // Add a fake distanceToPickup / eta per vendor
      // (replace with real geo-distance once vendors store their live location)
      const enriched = data.vendors.map((v: any, i: number) => ({
        ...v,
        distanceToPickup: parseFloat((0.5 + i * 0.6).toFixed(1)),
        eta: 2 + i * 2,
        location: {
          lat: pickupLat + (Math.random() - 0.5) * 0.01,
          lng: pickupLng + (Math.random() - 0.5) * 0.01,
        },
      }));

      setVehicles(enriched);
    } catch (err: any) {
      console.error("Fetch nearby error:", err);
      setFetchErr(err.message || "Could not load vehicles");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!vehicle) return;
    fetchNearbyVehicles();
  }, [vehicle]);

  return (
    <>
      <style>{`
        .search-root {
          min-height: 100svh;
          background: #f4f4f6;
          font-family: 'Inter', -apple-system, sans-serif;
          overflow-x: hidden;
          position: relative;
        }
        .search-back {
          position: absolute;
          top: 18px; left: 18px;
          z-index: 50;
          width: 42px; height: 42px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #e4e4e7;
          box-shadow: 0 2px 10px rgba(0,0,0,0.10);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #111;
          transition: background 0.18s;
        }
        .search-back:hover { background: #f5f5f5; }
        .search-map-wrap {
          position: relative;
          width: 100%;
          height: 52vh;
          z-index: 0;
        }
        .search-map-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 80px;
          background: linear-gradient(to top, #f4f4f6, transparent);
          pointer-events: none;
          z-index: 10;
        }
        .search-metrics {
          position: absolute;
          top: 18px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 8px;
          z-index: 999;
          pointer-events: none;
        }
        .search-metric-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          padding: 6px 14px;
          border-radius: 980px;
          font-size: 12px; font-weight: 600; color: #444;
          white-space: nowrap;
        }
        .search-sheet {
          position: relative;
          z-index: 20;
          margin-top: -40px;
          background: #fff;
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          border-top: 1px solid #ebebeb;
          box-shadow: 0 -8px 40px rgba(0,0,0,0.07);
          padding: 20px 0 80px;
          min-height: 52vh;
        }
        .search-sheet-handle {
          width: 40px; height: 4px;
          border-radius: 2px;
          background: #e4e4e7;
          margin: 0 auto 20px;
        }
        .search-sheet-inner {
          padding: 0 20px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .search-route-card {
          background: #fafafa;
          border: 1.5px solid #ebebeb;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 18px;
        }
        .search-route-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .search-route-row:last-child { border-bottom: none; }
        .search-route-dots { display: flex; flex-direction: column; align-items: center; padding-top: 4px; flex-shrink: 0; }
        .search-route-dot-fill { width: 10px; height: 10px; border-radius: 50%; background: #111; }
        .search-route-dot-sq { width: 10px; height: 10px; border-radius: 2px; background: #111; }
        .search-route-text-wrap { flex: 1; min-width: 0; }
        .search-route-label { font-size: 9px; color: #bbb; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; }
        .search-route-text { font-size: 13px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .search-route-icon { color: #ccc; flex-shrink: 0; margin-top: 2px; }
        .search-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .search-section-title { font-size: 18px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
        .search-section-sub { font-size: 12px; color: #aaa; margin-top: 2px; }
        .search-badge-live {
          display: flex; align-items: center; gap: 6px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          padding: 5px 12px; border-radius: 980px;
          font-size: 11px; font-weight: 700; color: #16a34a;
        }
        .search-badge-searching {
          display: flex; align-items: center; gap: 6px;
          background: #fafafa; border: 1px solid #e4e4e7;
          padding: 5px 12px; border-radius: 980px;
          font-size: 11px; font-weight: 600; color: #888;
        }
        .search-spinner {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid #ddd; border-top-color: #555;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .search-error-banner {
          display: flex; align-items: center; gap: 8px;
          background: #fff1f2; border: 1px solid #fecdd3;
          border-radius: 10px; padding: 10px 14px;
          font-size: 12px; color: #be123c; font-weight: 600;
          margin-bottom: 14px;
        }
        .search-empty {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 48px 16px;
        }
        .search-empty-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: #f5f5f5; border: 1.5px solid #ebebeb;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; color: #bbb;
        }
        .search-empty-title { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 6px; }
        .search-empty-sub { font-size: 13px; color: #aaa; max-width: 260px; line-height: 1.6; margin-bottom: 20px; }
        .search-retry-btn {
          display: flex; align-items: center; gap: 8px;
          background: #111; color: #fff; border: none; border-radius: 12px;
          padding: 11px 24px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .search-retry-btn:hover { background: #000; transform: translateY(-1px); }
        .search-vehicle-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 640px)  { .search-vehicle-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .search-vehicle-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1280px) { .search-vehicle-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      <div className="search-root">

        <button className="search-back" onClick={() => router.back()}>
          <ArrowLeft size={17} />
        </button>

        <div className="search-map-wrap">
          <RouteMap
            pickup={pickup}
            drop={drop}
            onDistance={setKm}
            onChange={(p: string, d: string) => { setPickup(p); setDrop(d); }}
          />
          <div className="search-map-fade" />
          <motion.div
            className="search-metrics"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="search-metric-pill">
              <Route size={12} style={{ color: '#bbb' }} />
              {km ? `${km} km` : "Calculating…"}
            </div>
            <div className="search-metric-pill">
              <Clock size={12} style={{ color: '#bbb' }} />
              {eta ? `${eta} min` : "—"}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="search-sheet"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
        >
          <div className="search-sheet-handle" />

          <div className="search-sheet-inner">

            {/* Route card */}
            <motion.div className="search-route-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <div className="search-route-row">
                <div className="search-route-dots"><div className="search-route-dot-fill" /></div>
                <div className="search-route-text-wrap">
                  <div className="search-route-label">Pickup</div>
                  <div className="search-route-text">{pickup || "—"}</div>
                </div>
                <MapPin size={14} className="search-route-icon" />
              </div>
              <div className="search-route-row">
                <div className="search-route-dots"><div className="search-route-dot-sq" /></div>
                <div className="search-route-text-wrap">
                  <div className="search-route-label">Drop</div>
                  <div className="search-route-text">{drop || "—"}</div>
                </div>
                <Navigation size={14} className="search-route-icon" />
              </div>
            </motion.div>

            {/* Error banner */}
            {fetchErr && (
              <div className="search-error-banner">
                ⚠ {fetchErr}
              </div>
            )}

            {/* Section header */}
            <motion.div className="search-section-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div>
                <div className="search-section-title">
                  {loading
                    ? "Finding vehicles…"
                    : vehicles.length > 0
                      ? `${vehicles.length} Available`
                      : "No vehicles nearby"}
                </div>
                {meta && <div className="search-section-sub">{meta.label} rides near your pickup</div>}
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="searching" className="search-badge-searching" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}>
                    <div className="search-spinner" /> Searching
                  </motion.div>
                ) : vehicles.length > 0 ? (
                  <motion.div key="live" className="search-badge-live" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Zap size={11} fill="currentColor" /> Live
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>

            {/* Empty state */}
            <AnimatePresence>
              {!loading && vehicles.length === 0 && (
                <motion.div className="search-empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="search-empty-icon"><Search size={26} /></div>
                  <div className="search-empty-title">No vehicles found</div>
                  <div className="search-empty-sub">
                    No {meta?.label || "vehicle"} drivers are live near your pickup right now.
                  </div>
                  <button className="search-retry-btn" onClick={fetchNearbyVehicles}>
                    <RefreshCw size={14} /> Retry Search
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vehicle cards */}
            <div className="search-vehicle-grid">
              {vehicles.map((v, i) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <VehicleBookingCard
                    vehicle={v}
                    distanceKm={km ?? undefined}
                    isRecommended={i === 0}
                    onBook={() => {
                      const url = new URLSearchParams({
                        pickup, drop,
                        vehicle:      v.type,
                        driverId:     v.owner,
                        vehicleId:    v._id,
                        fare:         String(Math.round(v.baseFare + (km ?? 0) * v.pricePerKm)),
                        pickupLat:    String(pickupLat),
                        pickupLng:    String(pickupLng),
                        dropLat:      params.get("dropLat")  || "",
                        dropLng:      params.get("dropLng")  || "",
                        mobileNumber,
                      });
                      router.push(`/checkout?${url.toString()}`);
                    }}
                  />
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </>
  );
}