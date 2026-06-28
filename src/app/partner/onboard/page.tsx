"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type VehicleType = "bike" | "auto" | "car" | "loading" | "truck" | "";

interface Step1Data {
  vehicleType: VehicleType;
  vehicleNumber: string;
  vehicleModel: string;
}
interface DocFile { name: string; file: File | null }
interface Step2Data {
  aadhaar: DocFile;
  license: DocFile;
  rc: DocFile;
}
interface Step3Data {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  mobile: string;
  upi: string;
}

// ─── Vehicle options ──────────────────────────────────────────────────────────
const VEHICLE_TYPES = [
  {
    id: "bike", label: "Bike", sub: "2 wheeler",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
        <path d="M15 6a1 1 0 0 0-1-1h-1"/><path d="M15 6l3 4.5"/>
        <path d="M9 6l1.5 5.5L5.5 17"/><path d="M9 6h6"/><path d="M12 11.5L18.5 17"/>
      </svg>
    ),
  },
  {
    id: "auto", label: "Auto", sub: "3 wheeler ride",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h1m16 0h1M4 9l2-5h12l2 5"/><rect x="2" y="9" width="20" height="8" rx="2"/>
        <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
        <path d="M12 9v8"/>
      </svg>
    ),
  },
  {
    id: "car", label: "Car", sub: "4 wheeler ride",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
        <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
      </svg>
    ),
  },
  {
    id: "loading", label: "Loading", sub: "Small goods",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="14" height="10" rx="1"/>
        <path d="M16 10h4l2 3v4h-6V10z"/>
        <circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>
        <path d="M6 7V4h8v3"/>
      </svg>
    ),
  },
  {
    id: "truck", label: "Truck", sub: "Heavy transport",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
];

// ─── Shared stepper ───────────────────────────────────────────────────────────
function Stepper({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 24 }}>
      <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, letterSpacing: "0.5px" }}>
        Step {step} of 3
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{
            width: s === step ? 24 : 8, height: 4, borderRadius: 99,
            background: s <= step ? "#2563eb" : "#e5e7eb",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Back button ──────────────────────────────────────────────────────────────
function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #e5e7eb",
      background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      position: "absolute", top: 28, left: 28, transition: "all 0.2s",
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
    </button>
  );
}

// ─── Step 1: Vehicle Details ──────────────────────────────────────────────────
function Step1({ data, onChange, onNext, onBack }: {
  data: Step1Data;
  onChange: (d: Step1Data) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const valid = data.vehicleType && data.vehicleNumber.trim() && data.vehicleModel.trim();

  return (
    <div style={{ position: "relative", padding: "28px 32px 32px" }}>
      <BackBtn onClick={onBack} />
      <Stepper step={1} />

      <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 4 }}>
        Vehicle Details
      </h2>
      <p style={{ fontSize: 13.5, color: "#9ca3af", textAlign: "center", marginBottom: 28 }}>
        Add your vehicle information
      </p>

      {/* Vehicle type */}
      <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Vehicle type</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {VEHICLE_TYPES.map((v) => {
          const active = data.vehicleType === v.id;
          return (
            <button key={v.id} onClick={() => onChange({ ...data, vehicleType: v.id as VehicleType })}
              style={{
                padding: "14px 8px", borderRadius: 14, cursor: "pointer", textAlign: "center",
                border: active ? "2px solid #2563eb" : "1.5px solid #e5e7eb",
                background: active ? "#eff6ff" : "#fff",
                transition: "all 0.18s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6,
                color: active ? "#2563eb" : "#6b7280",
                background: active ? "#dbeafe" : "#f3f4f6",
                width: 48, height: 48, borderRadius: "50%", margin: "0 auto 8px",
                alignItems: "center",
              }}>
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
        <input
          placeholder="MH12AB1234"
          value={data.vehicleNumber}
          onChange={(e) => onChange({ ...data, vehicleNumber: e.target.value.toUpperCase() })}
          style={{
            width: "100%", padding: "12px 0", borderBottom: "1.5px solid #e5e7eb", border: "none",
            borderBottom: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, color: "#111827",
            background: "transparent", fontFamily: "Inter, sans-serif",
          }}
        />
      </div>

      {/* Vehicle model */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Vehicle model / capacity</p>
        <input
          placeholder="Tata Ace / 1.5 Ton"
          value={data.vehicleModel}
          onChange={(e) => onChange({ ...data, vehicleModel: e.target.value })}
          style={{
            width: "100%", padding: "12px 0", border: "none",
            borderBottom: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, color: "#111827",
            background: "transparent", fontFamily: "Inter, sans-serif",
          }}
        />
      </div>

      <button onClick={onNext} disabled={!valid} style={{
        width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: valid ? "pointer" : "not-allowed",
        background: valid ? "#111827" : "#d1d5db", color: "#fff", fontSize: 15, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
      }}>
        Continue
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Step 2: Upload Documents ─────────────────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }: {
  data: Step2Data;
  onChange: (d: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const refs = { aadhaar: useRef<HTMLInputElement>(null), license: useRef<HTMLInputElement>(null), rc: useRef<HTMLInputElement>(null) };

  const docs = [
    { key: "aadhaar" as const, label: "Aadhaar / ID Proof", sub: "Government issued ID" },
    { key: "license" as const, label: "Driving License", sub: "Valid driving license" },
    { key: "rc" as const, label: "Vehicle RC", sub: "Registration Certificate" },
  ];

  const allSelected = docs.every((d) => data[d.key].file);

  const handleFile = (key: keyof Step2Data, file: File) => {
    onChange({ ...data, [key]: { name: file.name, file } });
  };

  const handleContinue = async () => {
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setUploading(false);
    onNext();
  };

  return (
    <div style={{ position: "relative", padding: "28px 32px 32px" }}>
      <BackBtn onClick={onBack} />
      <Stepper step={2} />

      <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 4 }}>
        Upload Documents
      </h2>
      <p style={{ fontSize: 13.5, color: "#9ca3af", textAlign: "center", marginBottom: 28 }}>
        Required for verification
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {docs.map((doc) => {
          const selected = !!data[doc.key].file;
          return (
            <div key={doc.key}>
              <input ref={refs[doc.key]} type="file" accept="image/*,.pdf" style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFile(doc.key, e.target.files[0])} />
              <button onClick={() => refs[doc.key].current?.click()} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 18px", borderRadius: 14, border: "1.5px solid #e5e7eb",
                background: "#fff", cursor: "pointer", transition: "all 0.18s",
              }}>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{doc.label}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>{selected ? data[doc.key].name : doc.sub}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {selected && <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>Selected</span>}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: selected ? "#111827" : "#f3f4f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {selected ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust note */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "10px 14px", background: "#f9fafb", borderRadius: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p style={{ fontSize: 12, color: "#6b7280" }}>Documents are securely stored and manually verified by our team.</p>
      </div>

      <button onClick={handleContinue} disabled={!allSelected || uploading} style={{
        width: "100%", padding: "15px", borderRadius: 14, border: "none",
        cursor: allSelected && !uploading ? "pointer" : "not-allowed",
        background: allSelected && !uploading ? "#111827" : "#d1d5db",
        color: "#fff", fontSize: 15, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
      }}>
        {uploading ? "Uploading..." : "Continue"}
        {!uploading && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── Step 3: Bank & Payout Setup ─────────────────────────────────────────────
function Step3({ data, onChange, onNext, onBack }: {
  data: Step3Data;
  onChange: (d: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const valid = data.accountName && data.accountNumber && data.ifsc && data.mobile.length === 10;

  const fields = [
    { key: "accountName" as const, label: "Account holder name", placeholder: "As per bank records",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
    { key: "accountNumber" as const, label: "Bank account number", placeholder: "Enter account number",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg> },
    { key: "ifsc" as const, label: "IFSC code", placeholder: "HDFC0001234",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg> },
    { key: "mobile" as const, label: "Mobile number", placeholder: "10 digit mobile number", maxLength: 10,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg> },
    { key: "upi" as const, label: <span>UPI ID <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 11 }}>(optional)</span></span>, placeholder: "name@upi",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
  ];

  return (
    <div style={{ position: "relative", padding: "28px 32px 32px" }}>
      <BackBtn onClick={onBack} />
      <Stepper step={3} />

      <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 4 }}>
        Bank & Payout Setup
      </h2>
      <p style={{ fontSize: 13.5, color: "#9ca3af", textAlign: "center", marginBottom: 28 }}>
        Used for vendor payouts
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
        {fields.map((f) => (
          <div key={f.key}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>{f.label}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1.5px solid #e5e7eb", paddingBottom: 10 }}>
              {f.icon}
              <input
                placeholder={f.placeholder}
                value={data[f.key]}
                maxLength={(f as any).maxLength}
                onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
                style={{
                  flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827",
                  background: "transparent", fontFamily: "Inter, sans-serif",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Trust note */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 24 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <p style={{ fontSize: 12, color: "#6b7280" }}>Bank details are verified before first payout. This usually takes 24–48 hours.</p>
      </div>

      <button onClick={onNext} disabled={!valid} style={{
        width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: valid ? "pointer" : "not-allowed",
        background: valid ? "#111827" : "#d1d5db", color: "#fff", fontSize: 15, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
      }}>
        Save & Continue
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function Success() {
  const router = useRouter();
  const [count, setCount] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.push("/partner/dashboard");
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div style={{ padding: "48px 32px", textAlign: "center" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
        style={{ width: 72, height: 72, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </motion.div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>You're all set!</h2>
      <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>
        Your partner application has been submitted.<br />We'll review and get back within 24–48 hours.
      </p>
      <p style={{ fontSize: 13, color: "#9ca3af" }}>
        Redirecting to dashboard in <span style={{ fontWeight: 700, color: "#2563eb" }}>{count}</span>...
      </p>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function PartnerOnboard() {
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<Step1Data>({ vehicleType: "", vehicleNumber: "", vehicleModel: "" });
  const [step2, setStep2] = useState<Step2Data>({
    aadhaar: { name: "", file: null },
    license: { name: "", file: null },
    rc: { name: "", file: null },
  });
  const [step3, setStep3] = useState<Step3Data>({ accountName: "", accountNumber: "", ifsc: "", mobile: "", upi: "" });

  const router = typeof window !== "undefined" ? { back: () => window.history.back() } : { back: () => {} };

  return (
    <div style={{
      minHeight: "100vh", background: "#f3f4f6",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "Inter, sans-serif",
    }}>
      <motion.div
        style={{
          width: "100%", maxWidth: 480, background: "#fff",
          borderRadius: 24, boxShadow: "0 4px 40px rgba(0,0,0,0.10)",
          overflow: "hidden",
        }}
        layout
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
              <Step1 data={step1} onChange={setStep1} onNext={() => setStep(2)} onBack={() => router.back()} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
              <Step2 data={step2} onChange={setStep2} onNext={() => setStep(3)} onBack={() => setStep(1)} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
              <Step3 data={step3} onChange={setStep3} onNext={() => setStep(4)} onBack={() => setStep(2)} />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <Success />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}