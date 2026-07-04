"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000/api";

interface Booking {
  _id: string;
  pickup: string;
  drop: string;
  vehicle: string;
  price: number;
  status: string;
  createdAt: string;
}

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    accepted:    { label: "Waiting for customer", bg: "#fefce8", color: "#854d0e", dot: "#eab308" },
    in_progress: { label: "Ride in progress",     bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
    completed:   { label: "Completed",            bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
  };
  const s = map[status] || map.accepted;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function ActiveRideCard({ ride, onEndRide }: { ride: Booking; onEndRide: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [ending,  setEnding]  = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  const handleEndRide = async () => {
    if (!confirm("End this ride?")) return;
    setEnding(true);
    try {
      await fetch(`${API}/booking/${ride._id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      onEndRide();
    } catch {
      alert("Could not end ride. Try again.");
      setEnding(false);
    }
  };

  // Vehicle emoji
  const vehicleEmoji: Record<string, string> = { bike: "🏍️", car: "🚗", auto: "🛺", truck: "🚛", loading: "🚐" };

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 20 }}>
      {/* Header */}
      <div style={{ background: "#111827", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 4 }}>Ride ID</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>#{ride._id.slice(-6).toUpperCase()}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Timer</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", fontVariantNumeric: "tabular-nums" }}>{mins}:{secs}</p>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>

        {/* Vehicle badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f9fafb", borderRadius: 12, marginBottom: 20, border: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 24 }}>{vehicleEmoji[ride.vehicle] || "🚗"}</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px" }}>Vehicle</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>{ride.vehicle}</p>
          </div>
        </div>

        {/* Route */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
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

        {/* Fare */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", border: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>Fare</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>₹{ride.price}</p>
          </div>
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", border: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>Status</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>{ride.status}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ride.drop)}`}
            target="_blank"
            rel="noreferrer"
            style={{ padding: "13px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Navigate
          </a>
          <button
            onClick={handleEndRide}
            disabled={ending}
            style={{ padding: "13px", borderRadius: 12, border: "none", background: ending ? "#6b7280" : "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600, cursor: ending ? "not-allowed" : "pointer" }}>
            {ending ? "Ending..." : "End Ride"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RideCompleted({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "56px 32px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Ride Completed! 🎉</h3>
      <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, marginBottom: 24 }}>Great job! The ride has been marked as completed.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <a href="/partner/bookings" style={{ padding: "11px 24px", background: "#f3f4f6", color: "#374151", borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          View Bookings
        </a>
        <button onClick={onBack} style={{ padding: "11px 24px", background: "#111827", color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

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

export default function ActiveRidePage() {
  const router = useRouter();
  const [name,      setName]      = useState("Vendor");
  const [ride,      setRide]      = useState<Booking | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("velox_vendor_name");
    if (saved) setName(saved);
  }, []);

  const fetchActiveRide = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/booking/active`);
      const data = await res.json();
      if (data.success && data.data) {
        setRide(data.data);
      } else {
        setRide(null);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveRide();
    const interval = setInterval(fetchActiveRide, 8000);
    return () => clearInterval(interval);
  }, [fetchActiveRide]);

  const handleEndRide = () => {
    setCompleted(true);
    setRide(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: 32, height: 32, border: "2px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter,sans-serif" }}>
      <PartnerNav name={name} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Active Ride</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>Your current trip details</p>
          </div>
          {ride && <StatusBadge status={ride.status} />}
        </div>

        {completed
          ? <RideCompleted onBack={() => router.push("/partner/dashboard")} />
          : ride
            ? <ActiveRideCard ride={ride} onEndRide={handleEndRide} />
            : <NoRide />
        }
      </div>
    </div>
  );
}