"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── Mock Data (replace with API later) ─────────────────────────────────────
const MOCK_RIDE = {
  id: "RYD-2048",
  status: "in_progress", // "waiting" | "in_progress" | "completed" | null
  customer: { name: "Aarav Mehta", phone: "+91 98765 43210", rating: 4.7 },
  pickup: "Sector 14 Market, Gurugram",
  drop: "Cyber Hub, DLF Phase 2",
  distance: "6.4 km",
  eta: "12 min",
  fare: "₹186",
  paymentMode: "UPI",
  startedAt: "2:34 PM",
  otp: "7821",
};

// ── Shared Nav (same as dashboard) ─────────────────────────────────────────
function PartnerNav({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "V";
  return (
    <div style={{ background: "#111827", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, marginBottom: 32 }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontStyle: "italic" }}>Vëlox</span>
      <div style={{ display: "flex", gap: 32 }}>
        {[
          { label: "Active Ride", href: "/partner/active-ride" },
          { label: "Pending Requests", href: "/partner/pending-requests" },
          { label: "My Bookings", href: "/partner/bookings" },
        ].map((l) => (
          <a key={l.label} href={l.href} style={{ fontSize: 13.5, color: l.label === "Active Ride" ? "#fff" : "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: l.label === "Active Ride" ? 700 : 500 }}>{l.label}</a>
        ))}
      </div>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{initials}</div>
    </div>
  );
}

// ── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    waiting:     { label: "Waiting for customer", bg: "#fefce8", color: "#854d0e", dot: "#eab308" },
    in_progress: { label: "Ride in progress",     bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
    completed:   { label: "Completed",            bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
  };
  const s = map[status] || map.waiting;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

// ── Map Placeholder ─────────────────────────────────────────────────────────
function MapPlaceholder() {
  return (
    <div style={{ width: "100%", height: 220, borderRadius: 16, background: "linear-gradient(145deg,#e0e7ef,#f1f5f9)", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, overflow: "hidden", position: "relative" }}>
      {/* fake road lines */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.18 }}>
        <div style={{ position: "absolute", top: "45%", left: 0, right: 0, height: 18, background: "#94a3b8", borderRadius: 4 }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "52%", width: 18, background: "#94a3b8", borderRadius: 4 }} />
      </div>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
      <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Live map will appear here</p>
      <p style={{ fontSize: 11, color: "#94a3b8" }}>Integrate Google Maps / Mapbox</p>
    </div>
  );
}

// ── Ride Card ───────────────────────────────────────────────────────────────
function ActiveRideCard({ ride }: { ride: typeof MOCK_RIDE }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 20 }}>
      {/* header */}
      <div style={{ background: "#111827", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 4 }}>Ride ID</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{ride.id}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Timer</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", fontVariantNumeric: "tabular-nums" }}>{mins}:{secs}</p>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <MapPlaceholder />

        {/* Route */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff", boxShadow: "0 0 0 2px #22c55e" }} />
              <div style={{ width: 2, height: 36, background: "#e5e7eb" }} />
              <div style={{ width: 10, height: 10, borderRadius: 3, background: "#ef4444" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 3 }}>Pickup</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{ride.pickup}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 3 }}>Drop</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{ride.drop}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Distance", value: ride.distance },
            { label: "ETA", value: ride.eta },
            { label: "Fare", value: ride.fare },
          ].map((s) => (
            <div key={s.label} style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", border: "1px solid #f3f4f6" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>{s.label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Customer info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#f9fafb", borderRadius: 14, border: "1px solid #f3f4f6", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#a5b4fc)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>
              {ride.customer.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{ride.customer.name}</p>
              <p style={{ fontSize: 12, color: "#9ca3af" }}>⭐ {ride.customer.rating} · {ride.paymentMode}</p>
            </div>
          </div>
          <a href={`tel:${ride.customer.phone}`} style={{ width: 38, height: 38, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </a>
        </div>

        {/* OTP */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "#eff6ff", borderRadius: 12, marginBottom: 20, border: "1px solid #dbeafe" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 2 }}>Trip OTP</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8", letterSpacing: 6 }}>{ride.otp}</p>
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button style={{ padding: "13px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Navigate
          </button>
          <button style={{ padding: "13px", borderRadius: 12, border: "none", background: "#111827", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            End Ride
          </button>
        </div>
      </div>
    </div>
  );
}

// ── No Ride State ───────────────────────────────────────────────────────────
function NoRide() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "64px 32px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>No active ride</h3>
      <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6 }}>You don't have an ongoing ride right now.<br />New requests will appear in Pending Requests.</p>
      <a href="/partner/pending-requests" style={{ display: "inline-block", marginTop: 24, padding: "11px 24px", background: "#111827", color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
        View Pending Requests →
      </a>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function ActiveRidePage() {
  const [name, setName] = useState("Vendor");
  const [hasRide] = useState(true); // TODO: replace with API fetch

  useEffect(() => {
    const saved = localStorage.getItem("velox_vendor_name");
    if (saved) setName(saved);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter,sans-serif" }}>
      <PartnerNav name={name} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Active Ride</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>Your current trip details</p>
          </div>
          {hasRide && <StatusBadge status={MOCK_RIDE.status} />}
        </div>
        {hasRide ? <ActiveRideCard ride={MOCK_RIDE} /> : <NoRide />}
      </div>
    </div>
  );
}