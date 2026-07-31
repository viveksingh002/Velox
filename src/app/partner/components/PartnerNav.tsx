"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "Active Ride",      href: "/partner/active-ride" },
  { label: "Pending Requests", href: "/partner/pending-requests" },
  { label: "My Bookings",      href: "/partner/bookings" },
];

export default function PartnerNav({ name, active }: { name: string; active?: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "V";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div style={{ background: "#111827", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontStyle: "italic" }}>Vëlox</span>
        <div className="nav-links" style={{ display: "flex", gap: 32 }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} style={{ fontSize: 13.5, color: l.label === active ? "#fff" : "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: l.label === active ? 700 : 500 }}>
              {l.label}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
            {initials}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "none", flexDirection: "column", gap: 4 }}>
            {[0,1,2].map((i) => <div key={i} style={{ width: 20, height: 2, background: "#fff", borderRadius: 99 }} />)}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: "#1f2937", padding: "8px 0", borderBottom: "1px solid #374151" }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 24px", fontSize: 14, color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}