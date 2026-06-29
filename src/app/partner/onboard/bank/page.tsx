"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Step3Data {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  mobile: string;
  upi: string;
}

const FIELDS = [
  { key: "accountName"   as const, label: "Account holder name",  placeholder: "As per bank records",      maxLength: 60 },
  { key: "accountNumber" as const, label: "Bank account number",   placeholder: "Enter account number",     maxLength: 18 },
  { key: "ifsc"          as const, label: "IFSC code",             placeholder: "HDFC0001234",              maxLength: 11 },
  { key: "mobile"        as const, label: "Mobile number",         placeholder: "10 digit mobile number",   maxLength: 10 },
  { key: "upi"           as const, label: "UPI ID (optional)",     placeholder: "name@upi",                 maxLength: 50 },
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

function ErrorBanner({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{msg}</p>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}

function Success({ name }: { name: string }) {
  const router = useRouter();
  const [count, setCount] = useState(3);

  // countdown
  useState(() => {
    const t = setInterval(() => setCount((c) => c - 1), 1000);
    setTimeout(() => { clearInterval(t); router.push("/partner/dashboard"); }, 3000);
  });

  return (
    <div style={{ padding: "48px 32px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Application Submitted!</h2>
      <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>
        Your partner application has been submitted.<br />Admin will review within 24–48 hours.
      </p>
      <p style={{ fontSize: 13, color: "#9ca3af" }}>
        Redirecting in <span style={{ fontWeight: 700, color: "#2563eb" }}>{Math.max(count, 0)}</span>…
      </p>
    </div>
  );
}

export default function BankPage() {
  const router = useRouter();
  const [data, setData] = useState<Step3Data>({ accountName: "", accountNumber: "", ifsc: "", mobile: "", upi: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const valid = data.accountName.trim() && data.accountNumber.trim() && data.ifsc.trim() && data.mobile.length === 10;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Read vehicle & documents from localStorage
      const vehicle  = JSON.parse(localStorage.getItem("onboard_vehicle")   || "{}");
      const docs     = JSON.parse(localStorage.getItem("onboard_documents") || "{}");

      const res = await fetch("http://localhost:5000/api/vendor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:  data.accountName,
          email: `${data.mobile}@velox.partner`,
          phone: data.mobile,
          vehicle: {
            type:   vehicle.vehicleType  || "",
            model:  vehicle.vehicleModel || "",
            number: vehicle.vehicleNumber || "",
          },
          documents: {
            aadhaarUrl: docs.aadhaar || "",
            licenseUrl: docs.license || "",
            rcUrl:      docs.rc      || "",
          },
          bank: {
            accountHolderName: data.accountName,
            accountNumber:     data.accountNumber,
            ifsc:              data.ifsc,
            upi:               data.upi,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Store name for dashboard
        localStorage.setItem("velox_vendor_name",  data.accountName);
        localStorage.setItem("velox_vendor_email", `${data.mobile}@velox.partner`);
        // Clear temp keys
        localStorage.removeItem("onboard_vehicle");
        localStorage.removeItem("onboard_documents");
        setSubmitted(true);
      } else {
        setError(json.message || "Something went wrong.");
      }
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 24, boxShadow: "0 4px 40px rgba(0,0,0,0.10)", overflow: "hidden" }}>
        <Success name={data.accountName} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 24, boxShadow: "0 4px 40px rgba(0,0,0,0.10)", overflow: "hidden" }}>
        <div style={{ position: "relative", padding: "28px 32px 32px" }}>

          {/* Back */}
          <button onClick={() => router.push("/partner/onboard/documents")} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: 28, left: 28 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>

          <Stepper step={3} />

          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 4 }}>Bank & Payout Setup</h2>
          <p style={{ fontSize: 13.5, color: "#9ca3af", textAlign: "center", marginBottom: 28 }}>Used for vendor payouts</p>

          {error && <ErrorBanner msg={error} onClose={() => setError("")} />}

          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
            {FIELDS.map((f) => {
              const focused = focusedField === f.key;
              return (
                <div key={f.key}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>{f.label}</p>
                  <input
                    placeholder={f.placeholder}
                    value={data[f.key]}
                    maxLength={f.maxLength}
                    onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                    onFocus={() => setFocusedField(f.key)}
                    onBlur={() => setFocusedField(null)}
                    style={{ width: "100%", padding: "10px 0", border: "none", borderBottom: `1.5px solid ${focused ? "#2563eb" : "#e5e7eb"}`, outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "Inter,sans-serif", transition: "border-color 0.2s" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Payout info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 24, padding: "12px 14px", background: "#eff6ff", borderRadius: 10, border: "1px solid #dbeafe" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <p style={{ fontSize: 12, color: "#1d4ed8" }}>Payouts are processed every Monday. Bank details are encrypted and secure.</p>
          </div>

          <button onClick={handleSubmit} disabled={!valid || submitting}
            style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: valid && !submitting ? "pointer" : "not-allowed", background: valid && !submitting ? "#111827" : "#d1d5db", color: "#fff", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {submitting ? "Submitting…" : "Submit Application"}
            {!submitting && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}