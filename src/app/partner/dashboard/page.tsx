"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type VendorStatus = "pending" | "approved" | "rejected";
type VideoKycStatus = "pending" | "in_progress" | "completed";
type VideoKycResult = "approved" | "rejected" | null;
type PricingStatus = "pending" | "submitted" | "approved" | "rejected" | null;

const STEPS = [
  { id: 1, label: "Vehicle" },
  { id: 2, label: "Documents" },
  { id: 3, label: "Bank" },
  { id: 4, label: "Review" },
  { id: 5, label: "Video KYC", locked: true },
  { id: 6, label: "Pricing",   locked: true },
  { id: 7, label: "Final Review", locked: true },
  { id: 8, label: "Live",      locked: true },
];

const EARNINGS_DATA = [
  { day: "Mon", amount: 0 },
  { day: "Tue", amount: 0 },
  { day: "Wed", amount: 0 },
  { day: "Thu", amount: 0 },
  { day: "Fri", amount: 0 },
  { day: "Sat", amount: 0 },
  { day: "Sun", amount: 0 },
];

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Active Ride",      href: "/partner/active-ride" },
  { label: "Pending Requests", href: "/partner/pending-requests" },
  { label: "My Bookings",      href: "/partner/bookings" },
];

function PartnerNav({ name }: { name: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "V";

  return (
    <>
      <div style={{ background: "#111827", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontStyle: "italic" }}>Vëlox</span>
        <div className="nav-links" style={{ display: "flex", gap: 28 }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}>
              {l.label}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "none", flexDirection: "column", gap: 4 }}>
            {[0,1,2].map((i) => <div key={i} style={{ width: 20, height: 2, background: "#fff", borderRadius: 99 }} />)}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div style={{ background: "#1f2937", padding: "8px 0", borderBottom: "1px solid #374151" }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: "block", padding: "12px 24px", fontSize: 14, color: "rgba(255,255,255,0.8)", textDecoration: "none", fontWeight: 500 }}>
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

function OnboardingStepper({ currentStep }: { currentStep: number }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "24px 20px", marginBottom: 20, overflowX: "auto" }}>
      <div className="stepper-mobile" style={{ display: "none", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Step {currentStep} of {STEPS.length}</p>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{STEPS.find((s) => s.id === currentStep)?.label}</span>
        </div>
        <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(currentStep / STEPS.length) * 100}%`, background: "#111827", borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STEPS.map((step) => {
            const done   = step.id < currentStep;
            const active = step.id === currentStep;
            return (
              <span key={step.id} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: done ? "#111827" : active ? "#eff6ff" : "#f3f4f6", color: done ? "#fff" : active ? "#2563eb" : "#9ca3af", border: active ? "1px solid #2563eb" : "1px solid transparent" }}>
                {done ? "✓" : step.locked && !active ? "🔒" : ""} {step.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="stepper-desktop" style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "max-content" }}>
        {STEPS.map((step, i) => {
          const done   = step.id < currentStep;
          const active = step.id === currentStep;
          const locked = !!step.locked && step.id > currentStep;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 64 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: done ? "#111827" : active ? "#fff" : "#f3f4f6", border: active ? "2px solid #111827" : done ? "none" : "1.5px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", color: done ? "#fff" : active ? "#111827" : "#9ca3af", fontSize: 14, fontWeight: 700, transition: "all 0.2s" }}>
                  {done ? <CheckIcon /> : locked ? <LockIcon /> : step.id}
                </div>
                <span style={{ fontSize: 11, fontWeight: active || done ? 600 : 400, color: done ? "#111827" : active ? "#111827" : "#9ca3af", whiteSpace: "nowrap" }}>
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div style={{ height: 2, width: 36, marginBottom: 20, flexShrink: 0, background: done ? "#111827" : "#e5e7eb", transition: "background 0.3s" }} />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .stepper-desktop { display: none !important; }
          .stepper-mobile  { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Pricing Modal (inline, no redirect) ── */
function PricingModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const [baseFare, setBaseFare] = useState("");
  const [pricePerKm, setPricePerKm] = useState("");
  const [waitingCharge, setWaitingCharge] = useState("0");
  const [vehicleImage, setVehicleImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const valid = baseFare.trim() && pricePerKm.trim() && vehicleImage;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => setVehicleImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!valid) return;
    setError("");
    setSubmitting(true);
    try {
      const email = localStorage.getItem("velox_vendor_email");
      const res = await fetch(`http://localhost:5000/api/vendor/pricing/${encodeURIComponent(email!)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseFare: Number(baseFare),
          pricePerKm: Number(pricePerKm),
          waitingCharge: Number(waitingCharge) || 0,
          vehicleImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSubmitted();
        onClose();
      } else {
        setError(data.message || "Failed to submit pricing");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit pricing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 24, boxShadow: "0 4px 40px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "28px 28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Pricing & Vehicle Image</h2>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Upload vehicle photo and set fares</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Image upload */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Vehicle photo</p>
          <label
            htmlFor="vehicleImageInput"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8,
              width: "100%", height: 160, borderRadius: 16, cursor: "pointer", marginBottom: 20,
              border: vehicleImage ? "1.5px solid #e5e7eb" : "2px dashed #d1d5db",
              background: vehicleImage ? "transparent" : "#fafafa",
              overflow: "hidden",
            }}
          >
            {vehicleImage ? (
              <img src={vehicleImage} alt="Vehicle" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <p style={{ fontSize: 12.5, color: "#9ca3af" }}>Tap to upload vehicle photo</p>
              </>
            )}
          </label>
          <input id="vehicleImageInput" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Base fare (₹)</p>
            <input type="number" placeholder="40" value={baseFare} onChange={(e) => setBaseFare(e.target.value)}
              style={{ width: "100%", padding: "12px 0", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "Inter,sans-serif" }} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Price per KM (₹)</p>
            <input type="number" placeholder="10" value={pricePerKm} onChange={(e) => setPricePerKm(e.target.value)}
              style={{ width: "100%", padding: "12px 0", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "Inter,sans-serif" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Waiting charge / min (₹)</p>
            <input type="number" placeholder="0" value={waitingCharge} onChange={(e) => setWaitingCharge(e.target.value)}
              style={{ width: "100%", padding: "12px 0", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "Inter,sans-serif" }} />
          </div>

          {error && <p style={{ fontSize: 12.5, color: "#dc2626", marginBottom: 16, textAlign: "center" }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSubmit} disabled={!valid || submitting}
              style={{ flex: 1.5, padding: "13px", borderRadius: 14, border: "none", cursor: valid && !submitting ? "pointer" : "not-allowed", background: valid && !submitting ? "#111827" : "#d1d5db", color: "#fff", fontSize: 14, fontWeight: 600 }}>
              {submitting ? "Submitting..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBanner({
  status,
  videoKycStatus,
  videoKycResult,
  pricingStatus,
  pricingRejectReason,
  videoKycRoomId,
  onRetry,
  onSetPricing,
}: {
  status: VendorStatus;
  videoKycStatus: VideoKycStatus;
  videoKycResult: VideoKycResult;
  pricingStatus: PricingStatus;
  pricingRejectReason: string;
  videoKycRoomId: string | null;
  onRetry: () => void;
  onSetPricing: () => void;
}) {
  const handleJoinCall = () => {
    if (!videoKycRoomId) return;
    window.location.href = `/video-kyc/${videoKycRoomId}?role=vendor`;
  };

  if (status === "rejected") {
    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>❌</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Application Rejected</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Your application was rejected. You can re-apply or contact support.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={onRetry} style={{ padding: "10px 18px", background: "#111827", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Re-apply →</button>
            <a href="mailto:support@velox.in" style={{ padding: "10px 18px", background: "#fff", color: "#374151", borderRadius: 10, fontWeight: 600, fontSize: 13, border: "1.5px solid #e5e7eb", textDecoration: "none", whiteSpace: "nowrap" }}>Contact Support</a>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>⏳</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Documents Under Review</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Admin is verifying your documents. This usually takes 24–48 hours.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>Checking…</span>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  if (videoKycStatus !== "completed") {
    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>✅</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Application Approved!</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              {videoKycStatus === "in_progress" ? "Admin has started your Video KYC call. Join now." : "Your documents are verified. Wait for admin to start your Video KYC."}
            </p>
          </div>
          {videoKycStatus === "in_progress" ? (
            <button onClick={handleJoinCall} style={{ padding: "10px 20px", background: "#16a34a", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Join Call →</button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 12, color: "#6b7280" }}>Waiting for admin to start KYC…</span>
            </div>
          )}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  if (videoKycResult === "rejected") {
    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>❌</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Video KYC Rejected</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Your identity verification was not approved. Please contact support.</p>
          </div>
          <a href="mailto:support@velox.in" style={{ padding: "10px 18px", background: "#fff", color: "#374151", borderRadius: 10, fontWeight: 600, fontSize: 13, border: "1.5px solid #e5e7eb", textDecoration: "none", whiteSpace: "nowrap" }}>Contact Support</a>
        </div>
      </div>
    );
  }

  if (!pricingStatus || pricingStatus === "pending") {
    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>💰</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Video KYC Approved!</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Now set your fare pricing and upload a vehicle photo to continue.</p>
          </div>
          <button onClick={onSetPricing} style={{ padding: "10px 20px", background: "#2563eb", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Set Pricing →</button>
        </div>
      </div>
    );
  }

  if (pricingStatus === "submitted") {
    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>⏳</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Pricing Under Review</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Admin is reviewing your pricing and vehicle image.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>Checking…</span>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  if (pricingStatus === "rejected") {
    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>❌</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Pricing Rejected</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>{pricingRejectReason || "Please review and resubmit your pricing details."}</p>
          </div>
          <button onClick={onSetPricing} style={{ padding: "10px 20px", background: "#111827", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Resubmit Pricing →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>✅</div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Pricing Approved!</p>
          <p style={{ fontSize: 13, color: "#6b7280" }}>Final review is Completed. You'll go live shortly.</p>
        </div>
      </div>
    </div>
  );
}

function EarningsChart({ data }: { data: typeof EARNINGS_DATA }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  const total = data.reduce((s, d) => s + d.amount, 0);
  const best  = Math.max(...data.map((d) => d.amount));
  const avg   = total > 0 ? Math.round(total / data.filter((d) => d.amount > 0).length) : 0;

  const stats = [
    { icon: "⭐", label: "BEST DAY",  value: best  > 0 ? `₹${best}`  : "₹0", sub: best  > 0 ? data.find((d) => d.amount === best)?.day ?? "—" : "—" },
    { icon: "📊", label: "DAILY AVG", value: avg   > 0 ? `₹${avg}`   : "₹0", sub: "per day" },
    { icon: "🚀", label: "TODAY",     value: data[data.length - 1].amount > 0 ? `₹${data[data.length - 1].amount}` : "—", sub: "—" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>Partner Dashboard</p>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Daily Earnings</h3>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Last 7 days performance</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Weekly Total</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>₹{total}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 13 }}>{s.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 2 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#f9fafb", borderRadius: 14, padding: "20px 16px 12px", border: "1px solid #f3f4f6" }}>
        {total === 0 ? (
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, marginBottom: 8 }}>
              {data.map((d, i) => (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", height: [40,55,35,70,50,80,45][i], borderRadius: "6px 6px 0 0", background: "#e5e7eb" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {data.map((d) => (
                <p key={d.day} style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#d1d5db", fontWeight: 500 }}>{d.day}</p>
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: 13, color: "#d1d5db", fontWeight: 500, marginTop: 12 }}>No earnings yet — start accepting rides!</p>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, marginBottom: 8 }}>
              {data.map((d) => {
                const h = Math.max((d.amount / max) * 88, d.amount > 0 ? 6 : 0);
                const isToday = d === data[data.length - 1];
                return (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 4, height: "100%" }}>
                    {d.amount > 0 && <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 600 }}>₹{d.amount}</span>}
                    <div style={{ width: "100%", height: h, borderRadius: "6px 6px 0 0", background: isToday ? "#111827" : "#d1d5db", transition: "height 0.5s ease" }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {data.map((d) => (
                <p key={d.day} style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{d.day}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStep(status: VendorStatus, videoKycStatus: VideoKycStatus, videoKycResult: VideoKycResult, pricingStatus: PricingStatus) {
  if (status !== "approved") return 4;
  if (videoKycStatus !== "completed") return 5;
  if (videoKycResult === "rejected") return 5;
  if (!pricingStatus || pricingStatus === "pending") return 6;   
  if (pricingStatus === "rejected") return 6;                     
  if (pricingStatus === "submitted") return 7;                    
  return 8;                                                       
}

export default function PartnerDashboard() {
  const router = useRouter();
  const [status,               setStatus]               = useState<VendorStatus>("pending");
  const [videoKycStatus,        setVideoKycStatus]        = useState<VideoKycStatus>("pending");
  const [videoKycResult,        setVideoKycResult]        = useState<VideoKycResult>(null);
  const [videoKycRoomId,        setVideoKycRoomId]        = useState<string | null>(null);
  const [pricingStatus,         setPricingStatus]         = useState<PricingStatus>(null);
  const [pricingRejectReason,   setPricingRejectReason]   = useState("");
  const [name,                  setName]                  = useState("Vendor");
  const [vendorId,              setVendorId]              = useState("");
  const [loading,               setLoading]               = useState(true);
  const [apiDown,               setApiDown]               = useState(false);
  const [showPricingModal,      setShowPricingModal]      = useState(false);

  const fetchStatus = async () => {
    const email = localStorage.getItem("velox_vendor_email");
    if (!email) { setLoading(false); return; }
    try {
      const res  = await fetch(`http://localhost:5000/api/vendor/status/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setStatus(data.status as VendorStatus);
        setVideoKycStatus((data.videoKycStatus as VideoKycStatus) || "pending");
        setVideoKycResult((data.videoKycResult as VideoKycResult) ?? null);
        setVideoKycRoomId(data.videoKycRoomId || null);
        setPricingStatus((data.pricingStatus as PricingStatus) ?? null);
        setPricingRejectReason(data.pricingRejectReason || "");
        if (data.vendorId || data._id || data.id) {
          setVendorId(data.vendorId || data._id || data.id);
        }
        setApiDown(false);
      }
    } catch {
      setApiDown(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem("velox_vendor_name");
    if (savedName) setName(savedName);

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    localStorage.removeItem("velox_vendor_email");
    localStorage.removeItem("velox_vendor_name");
    router.push("/partner/onboard");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: 32, height: 32, border: "2px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter,sans-serif" }}>
      <PartnerNav name={name} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 48px" }}>
        {apiDown && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#fef3c7", borderRadius: 10, border: "1px solid #fcd34d", marginTop: 16 }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <p style={{ fontSize: 13, color: "#92400e", fontWeight: 500 }}>Unable to reach server. Status may be outdated.</p>
          </div>
        )}

        <div style={{ marginBottom: 24, marginTop: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Vendor Onboarding</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Complete all steps to activate your account</p>
        </div>

        <OnboardingStepper currentStep={getStep(status, videoKycStatus, videoKycResult, pricingStatus)} />

        <StatusBanner
          status={status}
          videoKycStatus={videoKycStatus}
          videoKycResult={videoKycResult}
          pricingStatus={pricingStatus}
          pricingRejectReason={pricingRejectReason}
          videoKycRoomId={videoKycRoomId}
          onRetry={handleRetry}
          onSetPricing={() => setShowPricingModal(true)}
        />

        <EarningsChart data={EARNINGS_DATA} />
      </div>

      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          onSubmitted={fetchStatus}
        />
      )}
    </div>
  );
}