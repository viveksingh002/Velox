"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000/api";

interface Booking {
  _id: string;
  pickup: string;
  drop: string;
  vehicle: string;
  price: number;
  status: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
}

function PartnerNav({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "V";
  return (
    <div style={{ background: "#111827", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, marginBottom: 32 }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontStyle: "italic" }}>Vëlox</span>
      <div style={{ display: "flex", gap: 32 }}>
        {[
          { label: "Active Ride",       href: "/partner/active-ride" },
          { label: "Pending Requests",  href: "/partner/pending-requests" },
          { label: "My Bookings",       href: "/partner/bookings" },
        ].map((l) => (
          <a key={l.label} href={l.href} style={{ fontSize: 13.5, color: l.label === "Active Ride" ? "#fff" : "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: l.label === "Active Ride" ? 700 : 500 }}>{l.label}</a>
        ))}
      </div>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{initials}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    accepted:    { label: "Waiting for customer", bg: "#fefce8", color: "#854d0e", dot: "#eab308" },
    in_progress: { label: "Ride in progress",     bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
    completed:   { label: "Completed",            bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
  };
  const s = map[status] || map.accepted;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

// ── Rating Popup ──────────────────────────────────────────────
function RatingPopup({ ride, onSubmit }: { ride: Booking; onSubmit: (rating: number, comment: string) => void }) {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"]

  return (
    <>
      <style>{`
        .rp-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);z-index:999;display:flex;align-items:center;justify-content:center;padding:1.5rem}
        .rp-card{background:#fff;border-radius:24px;padding:2rem;width:100%;max-width:380px;box-shadow:0 24px 60px rgba(0,0,0,0.2);animation:rpPop 0.35s cubic-bezier(0.34,1.56,0.64,1)}
        @keyframes rpPop{from{transform:scale(0.88);opacity:0}to{transform:scale(1);opacity:1}}
        .rp-title{font-size:20px;font-weight:800;color:#111;margin-bottom:4px;letter-spacing:-0.5px}
        .rp-sub{font-size:13px;color:#9ca3af;margin-bottom:1.5rem}
        .rp-stars{display:flex;gap:10px;justify-content:center;margin-bottom:8px}
        .rp-star{font-size:36px;cursor:pointer;transition:transform 0.15s;user-select:none;line-height:1}
        .rp-star:hover{transform:scale(1.2)}
        .rp-star-label{text-align:center;font-size:13px;font-weight:700;color:#6b7280;height:20px;margin-bottom:1.25rem}
        .rp-textarea{width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:14px;font-family:inherit;resize:none;outline:none;color:#111;margin-bottom:1rem;transition:border-color 0.2s}
        .rp-textarea:focus{border-color:#111}
        .rp-textarea::placeholder{color:#d1d5db}
        .rp-submit{width:100%;padding:14px;background:#111;color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .rp-submit:hover:not(:disabled){background:#000;transform:translateY(-1px)}
        .rp-submit:disabled{opacity:0.4;cursor:not-allowed}
        .rp-skip{width:100%;padding:10px;background:none;border:none;color:#9ca3af;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:6px}
        .rp-skip:hover{color:#6b7280}
      `}</style>
      <div className="rp-overlay">
        <div className="rp-card">
          <div className="rp-title">Rate your rider</div>
          <div className="rp-sub">How was your experience with {ride.customerName || "the customer"}?</div>

          <div className="rp-stars">
            {[1,2,3,4,5].map(i => (
              <span
                key={i}
                className="rp-star"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
              >
                {i <= (hovered || rating) ? "⭐" : "☆"}
              </span>
            ))}
          </div>
          <div className="rp-star-label">{labels[hovered || rating]}</div>

          <textarea
            className="rp-textarea"
            rows={3}
            placeholder="Leave a comment (optional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />

          <button
            className="rp-submit"
            disabled={rating === 0}
            onClick={() => onSubmit(rating, comment)}
          >
            Submit Rating
          </button>
          <button className="rp-skip" onClick={() => onSubmit(0, "")}>Skip</button>
        </div>
      </div>
    </>
  )
}

// ── Thank You Screen ──────────────────────────────────────────
function ThankYouScreen({ ride, rating, onBack }: { ride: Booking; rating: number; onBack: () => void }) {
  const vehicleEmoji: Record<string, string> = { bike: "🏍️", car: "🚗", auto: "🛺", truck: "🚛", loading: "🚐" }

  return (
    <>
      <style>{`
        .ty-card{background:#fff;border-radius:20px;border:1px solid #e5e7eb;overflow:hidden}
        .ty-top{background:linear-gradient(135deg,#111827,#1f2937);padding:2.5rem 2rem;text-align:center}
        .ty-check{width:72px;height:72px;border-radius:50%;background:rgba(34,197,94,0.15);border:2px solid rgba(34,197,94,0.4);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;animation:tyPop 0.5s cubic-bezier(0.34,1.56,0.64,1)}
        @keyframes tyPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
        .ty-title{font-size:24px;font-weight:800;color:#fff;margin-bottom:6px;letter-spacing:-0.5px}
        .ty-sub{font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6}
        .ty-body{padding:1.75rem}
        .ty-msg-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:1.25rem;margin-bottom:1.25rem}
        .ty-msg-label{font-size:10px;font-weight:800;color:#16a34a;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px}
        .ty-msg-text{font-size:14px;color:#15803d;line-height:1.6;font-weight:500}
        .ty-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1.25rem}
        .ty-stat{background:#f9fafb;border-radius:12px;padding:12px 16px;border:1px solid #f3f4f6}
        .ty-stat-label{font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:5px}
        .ty-stat-val{font-size:20px;font-weight:800;color:#111}
        .ty-route{background:#f9fafb;border:1px solid #f3f4f6;border-radius:14px;padding:14px 16px;margin-bottom:1.25rem}
        .ty-route-label{font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:3px}
        .ty-route-text{font-size:13px;font-weight:600;color:#111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ty-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .ty-btn-light{padding:13px;background:#f3f4f6;color:#374151;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;text-decoration:none;display:flex;align-items:center;justify-content:center}
        .ty-btn-light:hover{background:#e5e7eb}
        .ty-btn-dark{padding:13px;background:#111;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .ty-btn-dark:hover{background:#000;transform:translateY(-1px)}
        .ty-rating-result{display:flex;align-items:center;gap:6px;margin-bottom:1.25rem;background:#fefce8;border:1px solid #fef08a;border-radius:12px;padding:10px 14px}
        .ty-rating-label{font-size:12px;font-weight:700;color:#854d0e}
      `}</style>

      <div className="ty-card">
        <div className="ty-top">
          <div className="ty-check">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div className="ty-title">Ride Completed! 🎉</div>
          <div className="ty-sub">Great job! Your earnings have been recorded.</div>
        </div>

        <div className="ty-body">
          {/* Thank you message to customer */}
          <div className="ty-msg-box">
            <div className="ty-msg-label">Message to Customer</div>
            <div className="ty-msg-text">
              Thank you for riding with Vëlox! 🙏<br/>
              It was a pleasure serving you. We hope to see you again soon!<br/>
              — {ride.vehicle ? `Your ${ride.vehicle} driver` : "Your driver"}
            </div>
          </div>

          {/* Rating result */}
          {rating > 0 && (
            <div className="ty-rating-result">
              <span style={{ fontSize: 18 }}>{"⭐".repeat(rating)}</span>
              <span className="ty-rating-label">You rated this ride {rating}/5</span>
            </div>
          )}

          {/* Stats */}
          <div className="ty-row">
            <div className="ty-stat">
              <div className="ty-stat-label">Fare Earned</div>
              <div className="ty-stat-val">₹{ride.price}</div>
            </div>
            <div className="ty-stat">
              <div className="ty-stat-label">Vehicle</div>
              <div className="ty-stat-val" style={{ fontSize: 22 }}>
                {vehicleEmoji[ride.vehicle] || "🚗"}
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="ty-route">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#111" }} />
                <div style={{ width: 1.5, height: 26, background: "#e5e7eb" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #111", background: "#fff" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: 14 }}>
                  <div className="ty-route-label">PICKUP</div>
                  <div className="ty-route-text">{ride.pickup}</div>
                </div>
                <div>
                  <div className="ty-route-label">DROP</div>
                  <div className="ty-route-text">{ride.drop}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="ty-btns">
            <a href="/partner/bookings" className="ty-btn-light">View Bookings</a>
            <button className="ty-btn-dark" onClick={onBack}>Dashboard</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Active Ride Card ──────────────────────────────────────────
function ActiveRideCard({ ride, onEndRide }: { ride: Booking; onEndRide: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [ending,  setEnding]  = useState(false)

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0")
  const secs = (elapsed % 60).toString().padStart(2, "0")

  const vehicleEmoji: Record<string, string> = { bike: "🏍️", car: "🚗", auto: "🛺", truck: "🚛", loading: "🚐" }

  const handleEndRide = async () => {
    if (!confirm("End this ride?")) return
    setEnding(true)
    try {
      await fetch(`${API}/booking/${ride._id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })
      onEndRide()
    } catch {
      alert("Could not end ride. Try again.")
      setEnding(false)
    }
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 20 }}>
      <div style={{ background: "#111827", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 4 }}>Ride ID</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>#{ride._id.slice(-6).toUpperCase()}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Timer</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", fontVariantNumeric: "tabular-nums" }}>{mins}:{secs}</p>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f9fafb", borderRadius: 12, marginBottom: 20, border: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 24 }}>{vehicleEmoji[ride.vehicle] || "🚗"}</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px" }}>Vehicle</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>{ride.vehicle}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff", boxShadow: "0 0 0 2px #22c55e" }} />
            <div style={{ width: 2, height: 36, background: "#e5e7eb" }} />
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "#ef4444" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 3 }}>Pickup</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{ride.pickup}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 3 }}>Drop</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{ride.drop}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", border: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>Fare</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>₹{ride.price}</p>
          </div>
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", border: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>Status</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>{ride.status}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ride.drop)}`}
            target="_blank"
            rel="noreferrer"
            style={{ padding: "13px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Navigate
          </a>
          <button
            onClick={handleEndRide}
            disabled={ending}
            style={{ padding: "13px", borderRadius: 12, border: "none", background: ending ? "#6b7280" : "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600, cursor: ending ? "not-allowed" : "pointer" }}
          >
            {ending ? "Ending..." : "End Ride"}
          </button>
        </div>
      </div>
    </div>
  )
}

function NoRide() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "64px 32px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>No active ride</h3>
      <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6 }}>You don't have an ongoing ride right now.<br/>New requests will appear in Pending Requests.</p>
      <a href="/partner/pending-requests" style={{ display: "inline-block", marginTop: 24, padding: "11px 24px", background: "#111827", color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
        View Pending Requests →
      </a>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function ActiveRidePage() {
  const router = useRouter()
  const [name,         setName]         = useState("Vendor")
  const [ride,         setRide]         = useState<Booking | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [showRating,   setShowRating]   = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [finalRating,  setFinalRating]  = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("velox_vendor_name")
    if (saved) setName(saved)
  }, [])

  const fetchActiveRide = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/booking/active`)
      const data = await res.json()
      if (data.success && data.data) setRide(data.data)
      else setRide(null)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchActiveRide()
    const interval = setInterval(fetchActiveRide, 8000)
    return () => clearInterval(interval)
  }, [fetchActiveRide])

  // Step 1: End ride → show rating popup
  const handleEndRide = () => {
    setShowRating(true)
  }

  // Step 2: Rating submitted → show thank you
  const handleRatingSubmit = (rating: number, comment: string) => {
    setFinalRating(rating)
    setShowRating(false)
    setShowThankYou(true)
    setRide(null)
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: 32, height: 32, border: "2px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter,sans-serif" }}>
      <PartnerNav name={name} />

      {/* Rating Popup */}
      {showRating && ride && (
        <RatingPopup ride={ride} onSubmit={handleRatingSubmit} />
      )}

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Active Ride</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>Your current trip details</p>
          </div>
          {ride && <StatusBadge status={ride.status} />}
        </div>

        {showThankYou && ride ? (
          <ThankYouScreen
            ride={ride}
            rating={finalRating}
            onBack={() => router.push("/partner/dashboard")}
          />
        ) : ride ? (
          <ActiveRideCard ride={ride} onEndRide={handleEndRide} />
        ) : !showThankYou ? (
          <NoRide />
        ) : null}
      </div>
    </div>
  )
}