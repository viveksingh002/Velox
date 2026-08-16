"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API = "http://localhost:5000/api";
const TABS = ["All", "Ongoing", "Completed", "Cancelled"];

interface Booking {
  _id: string;
  pickup: string;
  drop: string;
  vehicle: string;
  price: number;
  status: string;
  driverName: string;
  paymentStatus: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending:     { label: "Finding Driver",  bg: "#fefce8", color: "#92400e" },
    accepted:    { label: "Driver Accepted", bg: "#eff6ff", color: "#1d4ed8" },
    arrived:     { label: "Driver Arrived",  bg: "#fef3c7", color: "#92400e" },
    in_progress: { label: "Ongoing",         bg: "#f0fdf4", color: "#15803d" },
    completed:   { label: "Completed",       bg: "#f0fdf4", color: "#15803d" },
    cancelled:   { label: "Cancelled",       bg: "#fef2f2", color: "#dc2626" },
  };
  const s = map[status] || { label: status, bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

const VEHICLE_ICONS: Record<string, JSX.Element> = {
  bike: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M9 6l1.5 5.5L5.5 17"/><path d="M9 6h6"/><path d="M15 6l3 4.5"/></svg>,
  auto: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17h1m16 0h1M4 9l2-5h12l2 5"/><rect x="2" y="9" width="20" height="8" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  car:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
};

function BookingCard({ booking }: { booking: Booking }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const dateStr = new Date(booking.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  });

  const isOngoing = ["pending", "accepted", "arrived", "in_progress"].includes(booking.status);

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 12 }}>
      {isOngoing && (
        <div style={{ height: 3, background: "linear-gradient(90deg,#22c55e,#16a34a)", animation: "shimmer 2s infinite" }} />
      )}
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", flexShrink: 0 }}>
              {VEHICLE_ICONS[booking.vehicle] || VEHICLE_ICONS.car}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4, textTransform: "capitalize" }}>{booking.vehicle} Ride</p>
              <p style={{ fontSize: 12, color: "#9ca3af" }}>{dateStr}</p>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 6 }}>₹{booking.price}</p>
            <StatusBadge status={booking.status} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3, flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#111827" }} />
            <div style={{ width: 1.5, height: 20, background: "#e5e7eb" }} />
            <div style={{ width: 7, height: 7, borderRadius: 2, background: "#ef4444" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12.5, color: "#374151", fontWeight: 500, marginBottom: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{booking.pickup}</p>
            <p style={{ fontSize: 12.5, color: "#374151", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{booking.drop}</p>
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 20px 18px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: `₹${booking.price}`,                                      icon: "💰" },
                { label: booking.paymentStatus === "online" ? "Online" : "Cash",   icon: "💳" },
                booking.driverName ? { label: booking.driverName, icon: "🧑‍✈️" } : null,
              ].filter(Boolean).map((chip: any) => (
                <span key={chip.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }}>
                  {chip.icon} {chip.label}
                </span>
              ))}
            </div>
            {isOngoing && (
              <button onClick={() => router.push(`/ride/${booking._id}`)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#111827", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Track Ride
              </button>
            )}
            {(booking.status === "completed" || booking.status === "cancelled") && (
              <button onClick={() => router.push(`/?pickup=${encodeURIComponent(booking.pickup)}&drop=${encodeURIComponent(booking.drop)}`)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Rebook →
              </button>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "60px 32px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>
        {tab === "Ongoing" ? "🚗" : tab === "Completed" ? "✅" : tab === "Cancelled" ? "❌" : "📋"}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 8 }}>No {tab === "All" ? "" : tab.toLowerCase()} bookings</h3>
      <p style={{ fontSize: 14, color: "#9ca3af" }}>Your {tab === "All" ? "" : tab.toLowerCase()} rides will appear here.</p>
    </div>
  );
}

function SummaryStrip({ bookings }: { bookings: Booking[] }) {
  const completed  = bookings.filter((b) => b.status === "completed");
  const totalSpent = completed.reduce((s, b) => s + (b.price || 0), 0);
  const ongoing    = bookings.filter((b) => ["pending", "accepted", "arrived", "in_progress"].includes(b.status));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
      {[
        { label: "Total Rides", value: bookings.length.toString() },
        { label: "Total Spent", value: `₹${totalSpent}`           },
        { label: "Ongoing",     value: ongoing.length.toString()   },
      ].map((s) => (
        <div key={s.label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 18px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function MyBookingsPage() {
  const router      = useRouter();
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [search,    setSearch]    = useState("");

  const fetchBookings = async (email: string) => {
    try {
      const res  = await fetch(`${API}/booking/customer-email/${encodeURIComponent(email)}`);
      if (!res.ok) {
        setLoadError(`Server responded ${res.status}. Check the backend route /api/booking/customer-email/:email exists.`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
        setLoadError("");
      } else {
        setLoadError(data.error || "Could not load bookings.");
      }
    } catch {
      setLoadError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) { setLoading(false); return; }

      fetchBookings(email);
      interval = setInterval(() => fetchBookings(email), 8000);
    };

    init();
    return () => { if (interval) clearInterval(interval); };
  }, []);

  const filtered = bookings.filter((b) => {
    const matchTab =
      activeTab === "All" ||
      (activeTab === "Ongoing"   && ["pending", "accepted", "arrived", "in_progress"].includes(b.status)) ||
      (activeTab === "Completed" && b.status === "completed") ||
      (activeTab === "Cancelled" && b.status === "cancelled");
    const matchSearch = !search ||
      b.pickup.toLowerCase().includes(search.toLowerCase()) ||
      b.drop.toLowerCase().includes(search.toLowerCase()) ||
      b._id.slice(-6).toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: 32, height: 32, border: "2px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter,sans-serif" }}>
      <div style={{ background: "#111827", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>My Bookings</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 48px" }}>
        {loadError && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, fontSize: 12.5, color: "#b91c1c", fontWeight: 600 }}>
            ⚠️ {loadError}
          </div>
        )}

        {bookings.length > 0 && <SummaryStrip bookings={bookings} />}

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f3f4f6", marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search by location or ride ID..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: "#111827", fontFamily: "Inter,sans-serif" }} />
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "7px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: activeTab === tab ? "#111827" : "#f3f4f6", color: activeTab === tab ? "#fff" : "#6b7280", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0
          ? <EmptyState tab={activeTab} />
          : filtered.mapp((b) => <BookingCard key={b._id} booking={b} />)
        }
      </div>
    </div>
  );
}