"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Stepper config ───────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Vehicle" },
  { id: 2, label: "Documents" },
  { id: 3, label: "Bank" },
  { id: 4, label: "Review" },
  { id: 5, label: "Video KYC", locked: true },
  { id: 6, label: "Pricing", locked: true },
  { id: 7, label: "Final Review", locked: true },
  { id: 8, label: "Live", locked: true },
];

// Lock icon
function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

// Check icon
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}

// ─── Onboarding Stepper ───────────────────────────────────────────────────────
function OnboardingStepper({ currentStep }: { currentStep: number }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
      padding: "28px 32px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", overflowX: "auto", gap: 0, paddingBottom: 4 }}>
        {STEPS.map((step, i) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const locked = step.locked && step.id > currentStep;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {/* Node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 64 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: done ? "#111827" : active ? "#fff" : "#f3f4f6",
                  border: active ? "2px solid #111827" : done ? "none" : "1.5px solid #d1d5db",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: done ? "#fff" : active ? "#111827" : "#9ca3af",
                  fontSize: 14, fontWeight: 700,
                  transition: "all 0.2s",
                }}>
                  {done ? <CheckIcon /> : locked ? <LockIcon /> : step.id}
                </div>
                <span style={{
                  fontSize: 11.5, fontWeight: active || done ? 600 : 400,
                  color: done ? "#111827" : active ? "#111827" : "#9ca3af",
                  whiteSpace: "nowrap",
                }}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div style={{
                  height: 2, width: 40, marginBottom: 20, flexShrink: 0,
                  background: done ? "#111827" : "#e5e7eb",
                  transition: "background 0.3s",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Status banner ────────────────────────────────────────────────────────────
function StatusBanner() {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
      padding: "20px 24px", marginBottom: 20,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: "#111827",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Documents Under Review</p>
        <p style={{ fontSize: 13, color: "#6b7280" }}>Admin is verifying your documents.</p>
      </div>
    </div>
  );
}

// ─── Earnings dashboard ───────────────────────────────────────────────────────
function EarningsDashboard() {
  const stats = [
    { icon: "⭐", label: "BEST DAY", value: "₹0", sub: "—" },
    { icon: "📊", label: "DAILY AVG", value: "₹0", sub: "per day" },
    { icon: "🚀", label: "TODAY", value: "—", sub: "—" },
  ];

  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
      padding: "24px 28px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>
            Partner Dashboard
          </p>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Daily Earnings</h3>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Last 7 days performance</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>
            Weekly Total
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>₹0</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 2 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>0% vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "#f9fafb", borderRadius: 12, padding: "16px",
            border: "1px solid #f3f4f6",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 13 }}>{s.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase" }}>
                {s.label}
              </span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 2 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Empty chart area */}
      <div style={{
        height: 120, borderRadius: 12, background: "#f9fafb",
        border: "1px dashed #e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, color: "#d1d5db", fontWeight: 500 }}>No earnings data yet</p>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16 }}>
        {[{ color: "#2563eb", label: "Today" }, { color: "#93c5fd", label: "Best day" }].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function PartnerNav() {
  return (
    <div style={{
      background: "#111827", padding: "0 32px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 60, marginBottom: 32,
    }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontStyle: "italic" }}>
        Vëlox
      </span>
      <div style={{ display: "flex", gap: 32 }}>
        {["Active Ride", "Pending Requests", "My Bookings"].map((l) => (
          <a key={l} href="#" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontWeight: 500 }}>
            {l}
          </a>
        ))}
      </div>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "linear-gradient(135deg,#2563eb,#60a5fa)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 13, fontWeight: 700,
      }}>
        TV
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function PartnerDashboard() {
  const currentStep = 4; // Review step (after Vehicle, Documents, Bank done)

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter, sans-serif" }}>
      <PartnerNav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Vendor Onboarding</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Complete all steps to activate your account</p>
        </div>

        <OnboardingStepper currentStep={currentStep} />
        <StatusBanner />
        <EarningsDashboard />
      </div>
    </div>
  );
}