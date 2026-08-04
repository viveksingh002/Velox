"use client";

import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  { label: "Active Ride",      href: "/partner/active-ride" },
  { label: "Pending Requests", href: "/partner/pending-requests" },
  { label: "My Bookings",      href: "/partner/bookings" },
];

export default function PartnerNav({ name, active }: { name: string; active?: string }) {
  const initials    = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "V";
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef   = useRef<HTMLDivElement>(null);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("velox_vendor_name");
    localStorage.removeItem("velox_vendor_email");
    window.location.href = "/partner/onboard";
  };

  return (
    <>
      <div style={{ background: "#111827", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontStyle: "italic" }}>Vëlox</span>

        {/* Desktop nav links */}
        <div className="nav-links" style={{ display: "flex", gap: 32 }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} style={{ fontSize: 13.5, color: l.label === active ? "#fff" : "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: l.label === active ? 700 : 500 }}>
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar with dropdown */}
          <div ref={avatarRef} style={{ position: "relative" }}>
            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
              {initials}
            </button>

            {/* Dropdown */}
            {avatarOpen && (
              <div style={{ position: "absolute", right: 0, top: 46, background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", border: "1px solid #e5e7eb", minWidth: 200, overflow: "hidden", zIndex: 200 }}>
                {/* User info */}
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{name}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af" }}>Partner Account</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard link */}
                <a
                  href="/partner/dashboard"
                  onClick={() => setAvatarOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", textDecoration: "none", color: "#374151", fontSize: 13, fontWeight: 500, transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Dashboard
                </a>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "none", border: "none", color: "#dc2626", fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left", borderTop: "1px solid #f3f4f6", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "none", flexDirection: "column", gap: 4 }}>
            {[0,1,2].map((i) => <div key={i} style={{ width: 20, height: 2, background: "#fff", borderRadius: 99 }} />)}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ background: "#1f2937", padding: "8px 0", borderBottom: "1px solid #374151" }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 24px", fontSize: 14, color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
          <a href="/partner/dashboard" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 24px", fontSize: 14, color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
            Dashboard
          </a>
          <button onClick={handleLogout} style={{ width: "100%", padding: "12px 24px", background: "none", border: "none", color: "#f87171", fontSize: 14, textAlign: "left", cursor: "pointer" }}>
            Log Out
          </button>
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