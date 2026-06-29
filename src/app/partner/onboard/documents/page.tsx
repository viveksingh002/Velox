"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface DocFile { name: string; file: File | null; }
interface Step2Data { aadhaar: DocFile; license: DocFile; rc: DocFile; }

const DOCS = [
  { key: "aadhaar" as const, label: "Aadhaar / ID Proof",  sub: "Government issued ID",      accept: "image/*,.pdf" },
  { key: "license" as const, label: "Driving License",     sub: "Valid driving license",      accept: "image/*,.pdf" },
  { key: "rc"      as const, label: "Vehicle RC",          sub: "Registration Certificate",   accept: "image/*,.pdf" },
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

export default function DocumentsPage() {
  const router = useRouter();
  const [data, setData] = useState<Step2Data>({
    aadhaar: { name: "", file: null },
    license: { name: "", file: null },
    rc:      { name: "", file: null },
  });
  const [uploading, setUploading] = useState(false);

  const refs = {
    aadhaar: useRef<HTMLInputElement>(null),
    license: useRef<HTMLInputElement>(null),
    rc:      useRef<HTMLInputElement>(null),
  };

  const allSelected = DOCS.every((d) => data[d.key].file);

  const handleFile = (key: keyof Step2Data, file: File) => {
    setData((prev) => ({ ...prev, [key]: { name: file.name, file } }));
  };

  const handleContinue = async () => {
    setUploading(true);
    // Save doc names to localStorage (actual upload happens on final submit)
    localStorage.setItem("onboard_documents", JSON.stringify({
      aadhaar: data.aadhaar.name,
      license: data.license.name,
      rc:      data.rc.name,
    }));
    await new Promise((r) => setTimeout(r, 700));
    setUploading(false);
    router.push("/partner/onboard/bank");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 24, boxShadow: "0 4px 40px rgba(0,0,0,0.10)", overflow: "hidden" }}>
        <div style={{ position: "relative", padding: "28px 32px 32px" }}>

          {/* Back */}
          <button onClick={() => router.push("/partner/onboard/vehicle")} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: 28, left: 28 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>

          <Stepper step={2} />

          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 4 }}>Upload Documents</h2>
          <p style={{ fontSize: 13.5, color: "#9ca3af", textAlign: "center", marginBottom: 28 }}>Required for verification</p>

          {/* Doc upload cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {DOCS.map((doc) => {
              const selected = !!data[doc.key].file;
              return (
                <div key={doc.key}>
                  <input
                    ref={refs[doc.key]}
                    type="file"
                    accept={doc.accept}
                    style={{ display: "none" }}
                    onChange={(e) => e.target.files?.[0] && handleFile(doc.key, e.target.files[0])}
                  />
                  <button
                    onClick={() => refs[doc.key].current?.click()}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 14, border: selected ? "1.5px solid #22c55e" : "1.5px solid #e5e7eb", background: selected ? "#f0fdf4" : "#fff", cursor: "pointer", transition: "all 0.18s" }}>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{doc.label}</p>
                      <p style={{ fontSize: 12, color: selected ? "#16a34a" : "#9ca3af" }}>{selected ? data[doc.key].name : doc.sub}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {selected && <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>✓ Added</span>}
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: selected ? "#16a34a" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {selected
                          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        }
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            {DOCS.map((d) => (
              <div key={d.key} style={{ flex: 1, height: 3, borderRadius: 99, background: data[d.key].file ? "#16a34a" : "#e5e7eb", transition: "background 0.3s" }} />
            ))}
          </div>

          {/* Security note */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "10px 14px", background: "#f9fafb", borderRadius: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <p style={{ fontSize: 12, color: "#6b7280" }}>Documents are securely stored and manually verified by our team.</p>
          </div>

          <button onClick={handleContinue} disabled={!allSelected || uploading}
            style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: allSelected && !uploading ? "pointer" : "not-allowed", background: allSelected && !uploading ? "#111827" : "#d1d5db", color: "#fff", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {uploading ? "Saving…" : "Continue"}
            {!uploading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}