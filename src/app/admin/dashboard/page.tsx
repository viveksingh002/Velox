"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type VendorStatus = "pending" | "approved" | "rejected";
interface Vendor {
  id: string;
  name: string;
  email: string;
  status: VendorStatus;
  vehicle: { type: string; registration: string; model: string };
  bank: { accountHolder: string; ifsc: string; upi: string };
  docs: { aadhaar: string; license: string; rc: string };
  createdAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_VENDORS: Vendor[] = [
  {
    id: "69bba2e5",
    name: "Ayush Sahu",
    email: "ayushsahu27062004@gmail.com",
    status: "pending",
    vehicle: { type: "bike", registration: "UP61AS1234", model: "Hunter 350" },
    bank: { accountHolder: "Ayush Sahu", ifsc: "HDFC0023809", upi: "—" },
    docs: { aadhaar: "", license: "", rc: "" },
    createdAt: "2026-06-28",
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  x: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  shield: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  back: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  car: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  bank: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  doc: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  trend_up: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  trend_down: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  video: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  vendor_review: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
  pricing: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, trend, trendUp }: {
  icon: React.ReactNode; label: string; value: number | string;
  sub: string; trend: string; trendUp: boolean;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", padding: "24px 24px 20px", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: trendUp ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ color: trendUp ? "#16a34a" : "#dc2626" }}>{trendUp ? Icons.trend_up : Icons.trend_down}</span>
          {trend}
        </span>
      </div>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, color: "#9ca3af" }}>{sub}</p>
    </div>
  );
}

// ─── Donut chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ approved, pending, rejected, total }: { approved: number; pending: number; rejected: number; total: number }) {
  const r = 60, cx = 80, cy = 80, stroke = 14;
  const circ = 2 * Math.PI * r;
  const pctPending = total > 0 ? pending / total : 1;
  const pctApproved = total > 0 ? approved / total : 0;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {/* bg track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      {/* pending (orange) */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth={stroke}
        strokeDasharray={`${pctPending * circ} ${circ}`}
        strokeDashoffset={circ * 0.25} strokeLinecap="round" style={{ transition: "all 0.5s" }} />
      {/* approved (green) */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth={stroke}
        strokeDasharray={`${pctApproved * circ} ${circ}`}
        strokeDashoffset={circ * (0.25 + pctPending)} strokeLinecap="round" style={{ transition: "all 0.5s" }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#111827">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#9ca3af" fontWeight="600">TOTAL</text>
    </svg>
  );
}

// ─── Status Overview card ─────────────────────────────────────────────────────
function StatusOverview({ vendors }: { vendors: Vendor[] }) {
  const approved = vendors.filter(v => v.status === "approved").length;
  const pending = vendors.filter(v => v.status === "pending").length;
  const rejected = vendors.filter(v => v.status === "rejected").length;
  const total = vendors.length;

  const rows = [
    { label: "Approved", color: "#22c55e", count: approved, icon: "🟢" },
    { label: "Pending", color: "#f59e0b", count: pending, icon: "🟡" },
    { label: "Rejected", color: "#ef4444", count: rejected, icon: "🔴" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", padding: "28px 28px" }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Applications</p>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Status Overview</h3>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 28 }}>{total} total application{total !== 1 ? "s" : ""}</p>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <DonutChart approved={approved} pending={pending} rejected={rejected} total={total} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {rows.map((row) => (
            <div key={row.label}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: row.color }} />
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{row.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{row.count}</span>
              </div>
              <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: total > 0 ? `${(row.count / total) * 100}%` : "0%", background: row.color, borderRadius: 99, transition: "width 0.5s" }} />
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{total > 0 ? Math.round((row.count / total) * 100) : 0}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notification tabs ────────────────────────────────────────────────────────
function NotifTabs({ vendors, onSelect }: { vendors: Vendor[]; onSelect: (v: Vendor) => void }) {
  const [activeTab, setActiveTab] = useState<"video" | "reviews" | "pricing">("reviews");
  const pending = vendors.filter(v => v.status === "pending");

  const tabs = [
    { id: "video" as const, icon: Icons.video, label: "Video KYC", count: 0 },
    { id: "reviews" as const, icon: Icons.vendor_review, label: "Vendor Reviews", count: pending.length },
    { id: "pricing" as const, icon: Icons.pricing, label: "Pricing & Images", count: 0 },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", overflow: "hidden" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "14px 12px", border: "none", cursor: "pointer", background: "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            borderBottom: activeTab === tab.id ? "2px solid #111827" : "2px solid transparent",
            color: activeTab === tab.id ? "#111827" : "#6b7280",
            fontWeight: activeTab === tab.id ? 700 : 500, fontSize: 13,
            fontFamily: "Inter, sans-serif", transition: "all 0.18s",
          }}>
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 99, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px" }}>
        {activeTab === "reviews" && pending.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((v) => (
              <button key={v.id} onClick={() => onSelect(v)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb",
                background: "#fafafa", cursor: "pointer", fontFamily: "Inter, sans-serif",
                transition: "all 0.18s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                    {v.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{v.name}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>{v.vehicle.type} · {v.vehicle.registration}</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "#fef3c7", padding: "4px 10px", borderRadius: 99 }}>
                  Pending
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>All caught up!</p>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>No pending items right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Earnings card ────────────────────────────────────────────────────────────
function EarningsCard() {
  const legends = [
    { color: "#22c55e", label: "Today" },
    { color: "#6366f1", label: "Best day" },
    { color: "#e5e7eb", label: "Other days" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", padding: "28px 28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>Admin Dashboard</p>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Daily Earnings</h3>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Last 7 days performance</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Weekly Total</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>₹0</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 2 }}>
            <span style={{ color: "#22c55e" }}>{Icons.trend_up}</span>
            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>0% vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Stat chips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { emoji: "⭐", label: "BEST DAY", val: "₹0", sub: "—" },
          { emoji: "📊", label: "DAILY AVG", val: "₹0", sub: "per day" },
          { emoji: "🚀", label: "TODAY", val: "—", sub: "—" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 12 }}>{s.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 2 }}>{s.val}</p>
            <p style={{ fontSize: 11, color: "#9ca3af" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Empty chart */}
      <div style={{ height: 140, background: "#f9fafb", borderRadius: 12, border: "1px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "#d1d5db", fontWeight: 500 }}>No earnings data yet</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 16 }}>
          {legends.map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: 12, color: "#6b7280" }}>{l.label}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>Updated just now</span>
      </div>
    </div>
  );
}

// ─── Vendor detail view ───────────────────────────────────────────────────────
function VendorDetail({ vendor, onBack, onApprove, onReject }: {
  vendor: Vendor; onBack: () => void;
  onApprove: (id: string) => void; onReject: (id: string) => void;
}) {
  const statusColor = vendor.status === "approved" ? "#22c55e" : vendor.status === "rejected" ? "#ef4444" : "#f59e0b";
  const statusBg = vendor.status === "approved" ? "#f0fdf4" : vendor.status === "rejected" ? "#fef2f2" : "#fef3c7";
  const statusLabel = vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1);

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter, sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {Icons.back}
          </button>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{vendor.name}</p>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{vendor.email}</p>
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: statusColor, background: statusBg, padding: "6px 14px", borderRadius: 99, display: "flex", alignItems: "center", gap: 6 }}>
          {Icons.shield} {statusLabel}
        </span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Vehicle Details */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ color: "#6b7280" }}>{Icons.car}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Vehicle Details</h3>
            </div>
            {[
              { label: "Vehicle Type", value: vendor.vehicle.type },
              { label: "Registration Number", value: vendor.vehicle.registration },
              { label: "Model", value: vendor.vehicle.model },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f9fafb" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Documents */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ color: "#6b7280" }}>{Icons.doc}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Documents</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {["Aadhaar", "License", "RC"].map((doc) => (
                <div key={doc} style={{ borderRadius: 12, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
                  <div style={{ background: "#f9fafb", height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div style={{ padding: "10px 12px", borderTop: "1px solid #f3f4f6" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{doc}</p>
                    <button style={{ fontSize: 11, color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                      Open full document
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Bank Details */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", padding: "24px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ color: "#6b7280" }}>{Icons.bank}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Bank Details</h3>
            </div>
            {[
              { label: "Account Holder", value: vendor.bank.accountHolder },
              { label: "IFSC Code", value: vendor.bank.ifsc },
              { label: "UPI ID", value: vendor.bank.upi },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Admin Decision */}
          {vendor.status === "pending" && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", padding: "24px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Admin Decision</h3>
              </div>
              <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>Verify documents carefully before approving.</p>
              <button onClick={() => onApprove(vendor.id)} style={{
                width: "100%", padding: "13px", borderRadius: 12, border: "none", cursor: "pointer",
                background: "#111827", color: "#fff", fontSize: 14, fontWeight: 700,
                fontFamily: "Inter, sans-serif", marginBottom: 10, transition: "all 0.18s",
              }}>
                Approve Vendor
              </button>
              <button onClick={() => onReject(vendor.id)} style={{
                width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid #e5e7eb", cursor: "pointer",
                background: "#fff", color: "#374151", fontSize: 14, fontWeight: 700,
                fontFamily: "Inter, sans-serif", transition: "all 0.18s",
              }}>
                Reject Vendor
              </button>
            </div>
          )}

          {vendor.status !== "pending" && (
            <div style={{ background: vendor.status === "approved" ? "#f0fdf4" : "#fef2f2", borderRadius: 16, border: `1.5px solid ${vendor.status === "approved" ? "#bbf7d0" : "#fecaca"}`, padding: "20px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: vendor.status === "approved" ? "#15803d" : "#dc2626" }}>
                {vendor.status === "approved" ? "✅ Vendor Approved" : "❌ Vendor Rejected"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main admin dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const handleApprove = (id: string) => {
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "approved" } : v));
    setSelectedVendor(null);
  };
  const handleReject = (id: string) => {
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "rejected" } : v));
    setSelectedVendor(null);
  };

  // Show vendor detail view
  if (selectedVendor) {
    const live = vendors.find(v => v.id === selectedVendor.id) || selectedVendor;
    return <VendorDetail vendor={live} onBack={() => setSelectedVendor(null)} onApprove={handleApprove} onReject={handleReject} />;
  }

  const approved = vendors.filter(v => v.status === "approved").length;
  const pending = vendors.filter(v => v.status === "pending").length;
  const rejected = vendors.filter(v => v.status === "rejected").length;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter, sans-serif" }}>
      {/* Navbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>R</div>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>VËLOX ADMIN</span>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#374151", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 99, padding: "6px 14px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
          {Icons.shield} Secure Mode
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stat row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <StatCard icon={Icons.users} label="Total Vendors" value={vendors.length} sub="vs last month" trend="+12%" trendUp={true} />
          <StatCard icon={<span style={{ color: "#22c55e" }}>{Icons.check}</span>} label="Approved" value={approved} sub="verified vendors" trend="+8%" trendUp={true} />
          <StatCard icon={Icons.clock} label="Pending" value={pending} sub="awaiting review" trend="0%" trendUp={true} />
          <StatCard icon={Icons.x} label="Rejected" value={rejected} sub="declined" trend="-3%" trendUp={false} />
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <StatusOverview vendors={vendors} />
          <NotifTabs vendors={vendors} onSelect={setSelectedVendor} />
        </div>

        <EarningsCard />
      </div>
    </div>
  );
}