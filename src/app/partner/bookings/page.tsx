"use client";

import { useState, useEffect } from "react";
import PartnerNav from "../components/PartnerNav";

const API = "https://velox-d49r.onrender.com/api";
const FILTER_TABS = ["All", "Completed", "Cancelled"];

function SummaryStrip({ bookings }: { bookings: any[] }) {
  const completed = bookings.filter((b) => b.status === "completed");
  const totalEarnings = completed.reduce((acc, b) => acc + (Number(b.price) || 0), 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
      {[
        { label: "Total Rides",  value: bookings.length.toString() },
        { label: "Total Earned", value: `₹${totalEarnings}`        },
        { label: "Completed",    value: completed.length.toString() },
      ].map((s) => (
        <div key={s.label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 18px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";
  const hasPrice = (isCompleted || isCancelled) && booking.price;

  const customerName = booking.customerName || "Customer";
  const initials     = customerName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const shortId      = booking._id?.slice(-6).toUpperCase() || "——";
  const dateStr      = booking.createdAt
    ? new Date(booking.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "—";

  const statusColor = isCompleted ? { bg: "#f0fdf4", color: "#15803d", label: "Completed" }
    : isCancelled   ? { bg: "#fef2f2", color: "#dc2626", label: "Cancelled"  }
    :                 { bg: "#fefce8", color: "#92400e", label: booking.status };

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 10 }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: isCompleted ? "linear-gradient(135deg,#111827,#374151)" : "#f3f4f6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: isCompleted ? "#fff" : "#9ca3af", fontSize: 13, fontWeight: 700 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{customerName}</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: hasPrice ? "#111827" : "#9ca3af" }}>
              {hasPrice ? `₹${booking.price}` : "—"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>#{shortId} · {dateStr}</p>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: statusColor.bg, color: statusColor.color }}>
              {statusColor.label}
            </span>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ padding: "0 20px 18px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <div style={{ width: 1.5, height: 28, background: "#e5e7eb" }} />
                <div style={{ width: 8, height: 8, borderRadius: 2, background: "#ef4444" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>{booking.pickup || "—"}</p>
                <p style={{ fontSize: 12, color: "#6b7280" }}>{booking.drop || "—"}</p>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {[
                booking.vehicle    && { label: booking.vehicle },
                booking.driverName && { label: `Driver: ${booking.driverName}` },
                isCompleted && booking.price && { label: `₹${booking.price} earned` },
                isCancelled && booking.price && { label: `₹${booking.price} (cancelled)` },
              ].filter(Boolean).map((chip: any) => (
                <span key={chip.label} style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }}>{chip.label}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "56px 32px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 8 }}>No {filter.toLowerCase()} rides</h3>
      <p style={{ fontSize: 14, color: "#9ca3af" }}>Your {filter.toLowerCase()} rides will appear here.</p>
    </div>
  );
}

export default function BookingsPage() {
  const [name,      setName]     = useState("Vendor");
  const [activeTab, setActiveTab] = useState("All");
  const [search,    setSearch]   = useState("");
  const [bookings,  setBookings] = useState<any[]>([]);
  const [loading,   setLoading]  = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("velox_vendor_name");
    if (saved) setName(saved);
    fetchBookings();
  }, []);

const fetchBookings = async () => {
  try {
    const driverName = localStorage.getItem("velox_vendor_name") || "Driver";
    const res  = await fetch(`${API}/booking?driverName=${encodeURIComponent(driverName)}`);
    const data = await res.json();
    const done = (Array.isArray(data) ? data : []).filter((b: any) =>
      b.status === "completed" || b.status === "cancelled"
    );
    done.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setBookings(done);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const filtered = bookings.filter((b) => {
    const matchTab    = activeTab === "All" || b.status === activeTab.toLowerCase();
    const custName    = (b.customerName || "Customer").toLowerCase();
    const shortId     = (b._id || "").slice(-6).toLowerCase();
    const matchSearch = !search || custName.includes(search.toLowerCase()) || shortId.includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter,sans-serif" }}>
      <PartnerNav name={name} active="My Bookings" />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ marginBottom: 24, marginTop: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>My Bookings</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Your complete ride history</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ width: 32, height: 32, border: "2px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            <SummaryStrip bookings={bookings} />
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f3f4f6" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input placeholder="Search by name or ride ID…" value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: "#111827", fontFamily: "Inter,sans-serif" }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {FILTER_TABS.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "7px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: activeTab === tab ? "#111827" : "#f3f4f6", color: activeTab === tab ? "#fff" : "#6b7280", transition: "all 0.2s" }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0
              ? <EmptyState filter={activeTab} />
              : filtered.map((b) => <BookingCard key={b._id} booking={b} />)
            }
          </>
        )}
      </div>
    </div>
  );
}