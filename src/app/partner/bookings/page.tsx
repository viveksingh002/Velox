"use client";

import { useState, useEffect } from "react";

// ── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_BOOKINGS = [
  { id: "RYD-2047", customer: "Priya Sharma",   pickup: "MG Road, Bengaluru",        drop: "Indiranagar 100ft Road",    fare: "₹142", distance: "4.2 km", date: "Today, 1:10 PM",       status: "completed",  paymentMode: "Cash",    rating: 5 },
  { id: "RYD-2046", customer: "Rahul Gupta",    pickup: "Koramangala 5th Block",      drop: "Electronic City Phase 1",   fare: "₹298", distance: "9.7 km", date: "Today, 10:44 AM",      status: "completed",  paymentMode: "UPI",     rating: 4 },
  { id: "RYD-2045", customer: "Sneha Patel",    pickup: "Whitefield, ITPL Gate",      drop: "Marathahalli Bridge",       fare: "₹88",  distance: "2.9 km", date: "Yesterday, 7:22 PM",   status: "cancelled",  paymentMode: "UPI",     rating: null },
  { id: "RYD-2044", customer: "Dev Kumar",      pickup: "Hebbal Flyover",             drop: "Yelahanka New Town",        fare: "₹214", distance: "7.1 km", date: "Yesterday, 3:05 PM",   status: "completed",  paymentMode: "Cash",    rating: 5 },
  { id: "RYD-2043", customer: "Aisha Khan",     pickup: "JP Nagar 7th Phase",         drop: "Bannerghatta Road",         fare: "₹76",  distance: "2.3 km", date: "25 Jun, 9:15 AM",      status: "completed",  paymentMode: "Card",    rating: 4 },
  { id: "RYD-2042", customer: "Vivek Nair",     pickup: "HSR Layout Sector 4",        drop: "BTM Layout 2nd Stage",      fare: "₹54",  distance: "1.8 km", date: "24 Jun, 6:30 PM",      status: "cancelled",  paymentMode: "UPI",     rating: null },
  { id: "RYD-2041", customer: "Meera Iyer",     pickup: "Sarjapur Road, Wipro Gate",  drop: "Bellandur Lake Road",       fare: "₹167", distance: "5.5 km", date: "23 Jun, 11:00 AM",     status: "completed",  paymentMode: "Cash",    rating: 5 },
];

const FILTER_TABS = ["All", "Completed", "Cancelled"];

// ── Shared Nav ──────────────────────────────────────────────────────────────
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
          <a key={l.label} href={l.href} style={{ fontSize: 13.5, color: l.label === "My Bookings" ? "#fff" : "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: l.label === "My Bookings" ? 700 : 500 }}>{l.label}</a>
        ))}
      </div>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{initials}</div>
    </div>
  );
}

// ── Summary Strip ───────────────────────────────────────────────────────────
function SummaryStrip({ bookings }: { bookings: typeof MOCK_BOOKINGS }) {
  const completed = bookings.filter((b) => b.status === "completed");
  const totalEarnings = completed.reduce((acc, b) => acc + parseInt(b.fare.replace("₹", "")), 0);
  const avgRating = completed.filter((b) => b.rating).reduce((acc, b, _, arr) => acc + (b.rating! / arr.length), 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
      {[
        { label: "Total Rides", value: bookings.length.toString(), icon: "🚗" },
        { label: "Total Earned", value: `₹${totalEarnings}`, icon: "💰" },
        { label: "Avg Rating", value: avgRating.toFixed(1) + " ⭐", icon: "⭐" },
      ].map((s) => (
        <div key={s.label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 18px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Booking Card ────────────────────────────────────────────────────────────
function BookingCard({ booking }: { booking: typeof MOCK_BOOKINGS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = booking.status === "completed";

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 10 }}>
      {/* Main row */}
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14 }}>
        {/* Avatar */}
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: isCompleted ? "linear-gradient(135deg,#111827,#374151)" : "#f3f4f6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: isCompleted ? "#fff" : "#9ca3af", fontSize: 13, fontWeight: 700 }}>
          {booking.customer.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{booking.customer}</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: isCompleted ? "#111827" : "#9ca3af" }}>{isCompleted ? booking.fare : "—"}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{booking.id} · {booking.date}</p>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: isCompleted ? "#f0fdf4" : "#fef2f2", color: isCompleted ? "#15803d" : "#dc2626" }}>
              {isCompleted ? "Completed" : "Cancelled"}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div style={{ padding: "0 20px 18px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Route */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4, gap: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <div style={{ width: 1.5, height: 28, background: "#e5e7eb" }} />
                <div style={{ width: 8, height: 8, borderRadius: 2, background: "#ef4444" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>{booking.pickup}</p>
                <p style={{ fontSize: 12, color: "#6b7280" }}>{booking.drop}</p>
              </div>
            </div>

            {/* Meta chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {[
                { label: booking.distance },
                { label: booking.paymentMode },
                ...(booking.rating ? [{ label: `${booking.rating} ★ rating` }] : []),
              ].map((chip) => (
                <span key={chip.label} style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }}>{chip.label}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "56px 32px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 8 }}>No {filter.toLowerCase()} rides</h3>
      <p style={{ fontSize: 14, color: "#9ca3af" }}>Your {filter.toLowerCase()} rides will appear here.</p>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [name, setName] = useState("Vendor");
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("velox_vendor_name");
    if (saved) setName(saved);
  }, []);

  const filtered = MOCK_BOOKINGS.filter((b) => {
    const matchTab = activeTab === "All" || b.status === activeTab.toLowerCase();
    const matchSearch = !search || b.customer.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter,sans-serif" }}>
      <PartnerNav name={name} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 48px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>My Bookings</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Your complete ride history</p>
        </div>

        <SummaryStrip bookings={MOCK_BOOKINGS} />

        {/* Search + Filter */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: 16 }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f3f4f6" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder="Search by name or ride ID…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: "#111827", fontFamily: "Inter,sans-serif" }} />
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {FILTER_TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "7px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: activeTab === tab ? "#111827" : "#f3f4f6", color: activeTab === tab ? "#fff" : "#6b7280", transition: "all 0.2s" }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0
          ? <EmptyState filter={activeTab} />
          : filtered.map((b) => <BookingCard key={b.id} booking={b} />)
        }
      </div>
    </div>
  );
}