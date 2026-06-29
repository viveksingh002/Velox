"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type VehicleType = "bike" | "auto" | "car" | "loading" | "truck" | "";

interface Step1Data {
  vehicleType: VehicleType;
  vehicleNumber: string;
  vehicleModel: string;
}

const VEHICLE_TYPES = [
  {
    id: "bike", label: "Bike", sub: "2 wheeler",
    icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-1"/><path d="M15 6l3 4.5"/><path d="M9 6l1.5 5.5L5.5 17"/><path d="M9 6h6"/><path d="M12 11.5L18.5 17"/></svg>),
  },
  {
    id: "auto", label: "Auto", sub: "3 wheeler ride",
    icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17h1m16 0h1M4 9l2-5h12l2 5"/><rect x="2" y="9" width="20" height="8" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 9v8"/></svg>),
  },
  {
    id: "car", label: "Car", sub: "4 wheeler ride",
    icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>),
  },
  {
    id: "loading", label: "Loading", sub: "Small goods",
    icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="14" height="10" rx="1"/><path d="M16 10h4l2 3v4h-6V10z"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7V4h8v3"/></svg>),
  },
  {
    id: "truck", label: "Truck", sub: "Heavy transport",
    icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>),
  },
];

function Stepper({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 24 }}>
      <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>Step {step} of 3</p>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ width: s === step ? 24 : 8, height: 4, borderRadius: 99, background: s <= step ? "#2563eb" : "#e5e7eb", transition: "all 0.3s" }} />
        ))}
      </div>
    </div>
  );
}

export default function VehiclePage() {
  const router = useRouter();
  const [data, setData] = useState<Step1Data>({ vehicleType: "", vehicleNumber: "", vehicleModel: "" });

  // Load saved data if coming back
  useEffect(() => {
    const saved = localStorage.getItem("onboard_vehicle");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const valid = data.vehicleType && data.vehicleNumber.trim() && data.vehicleModel.trim();

  const handleNext = () => {
    localStorage.setItem("onboard_vehicle", JSON.stringify(data));
    router.push("/partner/onboard/documents");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 24, boxShadow: "0 4px 40px rgba(0,0,0,0.10)", overflow: "hidden" }}>
        <div style={{ position: "relative", padding: "28px 32px 32px" }}>

          {/* Back */}
          <button onClick={() => router.push("/partner/onboard")} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: 28, left: 28 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>

          <Stepper step={1} />

          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 4 }}>Vehicle Details</h2>
          <p style={{ fontSize: 13.5, color: "#9ca3af", textAlign: "center", marginBottom: 28 }}>Add your vehicle information</p>

          {/* Vehicle type grid */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Vehicle type</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
            {VEHICLE_TYPES.map((v) => {
              const active = data.vehicleType === v.id;
              return (
                <button key={v.id} onClick={() => setData({ ...data, vehicleType: v.id as VehicleType })}
                  style={{ padding: "14px 8px", borderRadius: 14, cursor: "pointer", textAlign: "center", border: active ? "2px solid #2563eb" : "1.5px solid #e5e7eb", background: active ? "#eff6ff" : "#fff", transition: "all 0.18s" }}>
                  <div style={{ display: "flex", justifyContent: "center", color: active ? "#2563eb" : "#6b7280", background: active ? "#dbeafe" : "#f3f4f6", width: 48, height: 48, borderRadius: "50%", margin: "0 auto 8px", alignItems: "center" }}>
                    {v.icon}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: active ? "#2563eb" : "#111827", marginBottom: 2 }}>{v.label}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>{v.sub}</p>
                </button>
              );
            })}
          </div>

          {/* Vehicle number */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Vehicle number</p>
            <input placeholder="MH12AB1234" value={data.vehicleNumber}
              onChange={(e) => setData({ ...data, vehicleNumber: e.target.value.toUpperCase() })}
              style={{ width: "100%", padding: "12px 0", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "Inter,sans-serif" }} />
          </div>

          {/* Vehicle model */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Vehicle model / capacity</p>
            <input placeholder="Tata Ace / 1.5 Ton" value={data.vehicleModel}
              onChange={(e) => setData({ ...data, vehicleModel: e.target.value })}
              style={{ width: "100%", padding: "12px 0", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "Inter,sans-serif" }} />
          </div>

          <button onClick={handleNext} disabled={!valid}
            style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: valid ? "pointer" : "not-allowed", background: valid ? "#111827" : "#d1d5db", color: "#fff", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}