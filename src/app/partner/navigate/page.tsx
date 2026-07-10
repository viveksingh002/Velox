"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type Status = "accepted" | "arrived" | "in_progress";

interface Booking {
  _id: string;
  pickup: string;
  drop: string;
  vehicle: string;
  model: string;
  registrationNumber: string;
  price: number;
  status: Status;
  customerName: string;
  customerPhone: string;
  paymentStatus: "paid" | "cash";
  otp: string;
}

const MOCK: Booking = {
  _id: "bkg_1",
  pickup: "Sipari Bazar, Jhansi, Uttar Pradesh, India",
  drop: "BKD, Jhansi, Uttar Pradesh, India",
  vehicle: "Motorcycle",
  model: "Hunter 350",
  registrationNumber: "UP61AS1234",
  price: 63,
  status: "accepted",
  customerName: "ANKUSH SAHU",
  customerPhone: "+91 90000 00000",
  paymentStatus: "paid",
  otp: "1234",
};

function ClientOnly({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}

function RideMap({ pickup, drop, status }: { pickup: string; drop: string; status: Status }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInst = useRef<any>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    let cancelled = false;

    const init = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        if (cancelled || !mapRef.current) return;

        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
          zoomSnap: 0.5,
          zoomDelta: 0.5,
        });
        mapInst.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          className: "rydex-tiles",
        }).addTo(map);

        const geocode = async (place: string) => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          if (!data.length) throw new Error("Not found");
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        };

        const getCurrentPos = (): Promise<{ lat: number; lng: number }> =>
          new Promise((res, rej) => {
            if (!navigator.geolocation) return rej();
            navigator.geolocation.getCurrentPosition(
              (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
              () => rej(),
              { timeout: 4000 },
            );
          });

        // Pehle pickup/drop geocode karo, phir GPS fallback pickup ke paas rakho
        const pickupC = await geocode(pickup).catch(() => ({ lat: 25.4484, lng: 78.5685 }));
        const dropC = await geocode(drop).catch(() => ({ lat: 25.46, lng: 78.58 }));
        const current = await getCurrentPos().catch(() => ({
          lat: pickupC.lat - 0.025,
          lng: pickupC.lng - 0.025,
        }));

        const carIcon = L.divIcon({
          html: `<div style="width:56px;height:56px;border-radius:50%;background:#0a0a0a;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 28px rgba(0,0,0,0.35);border:3px solid #fff;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>
          </div>`,
          className: "", iconSize: [56, 56], iconAnchor: [28, 28],
        });

        const pillIcon = (label: string) => L.divIcon({
          html: `<div style="background:#0a0a0a;color:#fff;font-size:11px;font-weight:800;letter-spacing:0.5px;padding:6px 12px;border-radius:999px;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,0.28);border:2px solid #fff;">${label}</div>`,
          className: "", iconAnchor: [30, 14],
        });

        L.marker([current.lat, current.lng], { icon: carIcon }).addTo(map);
        L.marker([pickupC.lat, pickupC.lng], { icon: pillIcon("PICKUP") }).addTo(map);
        L.marker([dropC.lat, dropC.lng], { icon: pillIcon("DROP") }).addTo(map);

        const drawRoute = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
          try {
            const res = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`,
            );
            const data = await res.json();
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]);
            L.polyline(coords, { color: "#0a0a0a", weight: 4, opacity: 0.9 }).addTo(map);
          } catch {
            L.polyline([[from.lat, from.lng], [to.lat, to.lng]], { color: "#0a0a0a", weight: 3, dashArray: "8 6" }).addTo(map);
          }
        };

        await drawRoute(current, pickupC);
        await drawRoute(pickupC, dropC);

        const bounds = L.latLngBounds([
          [current.lat, current.lng],
          [pickupC.lat, pickupC.lng],
          [dropC.lat, dropC.lng],
        ]);

        map.fitBounds(bounds, {
          paddingTopLeft: [60, 100],
          paddingBottomRight: [60, 320],
          maxZoom: 13,
          animate: true,
        });

        setTimeout(() => {
          map.invalidateSize();
        }, 500);

        setMapStatus("ready");
      } catch {
        setMapStatus("error");
      }
    };

    init();
    return () => {
      cancelled = true;
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
    };
  }, [pickup, drop]);

  const label = status === "in_progress" ? "En Route to Drop" : status === "arrived" ? "Arrived at Pickup" : "Heading to Pickup";

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <style>{`.rydex-tiles{filter:grayscale(1) contrast(0.95) brightness(1.05)}.leaflet-container{background:#f5f4f0;font-family:inherit}`}</style>
      <div ref={mapRef} style={{ position: "absolute", inset: 0 }} />
      {mapStatus === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f4f0", zIndex: 5 }}>
          <div style={{ width: 34, height: 34, border: "3px solid #e6e6e3", borderTopColor: "#0a0a0a", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
      )}
      <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10, background: "#fff", padding: "8px 16px", borderRadius: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#0a0a0a", whiteSpace: "nowrap" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#eab308" }} />
        {label}
      </div>
    </div>
  );
}

function OtpSection({ expectedOtp, onVerified }: { expectedOtp: string; onVerified: () => void }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const onChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits]; next[i] = val; setDigits(next); setError("");
    if (val && i < 3) refs[i + 1].current?.focus();
  };
  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };
  const verify = async () => {
    const otp = digits.join("");
    if (otp.length !== 4) { setError("Enter 4-digit OTP"); return; }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 600));
    if (otp === expectedOtp) onVerified();
    else setError("Incorrect OTP");
    setVerifying(false);
  };
  const filled = digits.join("").length === 4;

  return (
    <div style={{ marginTop: 16, borderRadius: 18, overflow: "hidden", border: "1px solid #eeece7" }}>
      <div style={{ background: "#0a0a0a", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 12.5, letterSpacing: 0.6 }}>ENTER CUSTOMER OTP</span>
      </div>
      <div style={{ padding: 18, background: "#fff" }}>
        <p style={{ fontSize: 13, color: "#6b6b66", margin: "0 0 14px" }}>Ask the customer for their 4-digit OTP to start the ride.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {digits.map((d, i) => (
            <input key={i} ref={refs[i]} value={d} inputMode="numeric" maxLength={1}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              style={{ width: 56, height: 60, textAlign: "center", fontSize: 22, fontWeight: 800, borderRadius: 12, border: `1.5px solid ${error ? "#e11d3c" : "#e6e6e3"}`, background: "#f6f5f1", color: "#0a0a0a", outline: "none" }}
            />
          ))}
        </div>
        {error && <p style={{ marginTop: 10, color: "#e11d3c", fontSize: 12.5, textAlign: "center", fontWeight: 600 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={() => { setDigits(["", "", "", ""]); setError(""); }}
            style={{ flex: 1, height: 48, borderRadius: 12, border: "1.5px solid #e6e6e3", background: "#fff", color: "#0a0a0a", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button disabled={!filled || verifying} onClick={verify}
            style={{ flex: 1.4, height: 48, borderRadius: 12, border: "none", background: filled && !verifying ? "#0a0a0a" : "#c7c7c2", color: "#fff", fontSize: 14, fontWeight: 800, cursor: filled && !verifying ? "pointer" : "not-allowed" }}>
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RatingPopup({ onSubmit }: { onSubmit: (rating: number) => void }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "2rem", width: "100%", maxWidth: 360, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", animation: "rpPop 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <style>{`@keyframes rpPop{from{transform:scale(0.88);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0a0a0a", marginBottom: 4 }}>Rate this ride</div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: "1.5rem" }}>How was your experience with the customer?</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} onClick={() => setRating(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
              style={{ fontSize: 36, cursor: "pointer", transition: "transform 0.15s", transform: i <= (hovered || rating) ? "scale(1.2)" : "scale(1)", userSelect: "none" }}>
              {i <= (hovered || rating) ? "⭐" : "☆"}
            </span>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: "#6b7280", height: 20, marginBottom: "1.25rem" }}>{labels[hovered || rating]}</div>
        <button disabled={rating === 0} onClick={() => onSubmit(rating)}
          style={{ width: "100%", padding: "14px", background: rating > 0 ? "#0a0a0a" : "#c7c7c2", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: rating > 0 ? "pointer" : "not-allowed", marginBottom: 8 }}>
          Submit Rating
        </button>
        <button onClick={() => onSubmit(0)}
          style={{ width: "100%", padding: 10, background: "none", border: "none", color: "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Skip
        </button>
      </div>
    </div>
  );
}

function ThankYouScreen({ booking, rating, onBack }: { booking: Booking; rating: number; onBack: () => void }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(135deg,#0a0a0a,#1f2937)", padding: "2.5rem 2rem", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", animation: "tyPop 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <style>{`@keyframes tyPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Ride Completed! 🎉</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Great job! Your earnings have been recorded.</div>
      </div>
      <div style={{ padding: "1.75rem" }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#16a34a", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Message to Customer</div>
          <div style={{ fontSize: 14, color: "#15803d", lineHeight: 1.6, fontWeight: 500 }}>
            Thank you for riding with Vëlox! 🙏<br />
            It was a pleasure serving you. We hope to see you again soon!
          </div>
        </div>
        {rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fefce8", border: "1px solid #fef08a", borderRadius: 12, padding: "10px 14px", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: 18 }}>{"⭐".repeat(rating)}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#854d0e" }}>You rated this ride {rating}/5</span>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.25rem" }}>
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", border: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 5 }}>Fare Earned</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0a0a0a" }}>₹{booking.price}</div>
          </div>
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", border: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 5 }}>Vehicle</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0a0a0a" }}>{booking.model}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <a href="/partner/bookings" style={{ padding: "13px", background: "#f3f4f6", color: "#374151", borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>View Bookings</a>
          <button onClick={onBack} style={{ padding: "13px", background: "#0a0a0a", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default function ActiveRidePage() {
  const [booking, setBooking] = useState<Booking>(MOCK);
  const [expanded, setExpanded] = useState(false);
  const [arriving, setArriving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [finalRating, setFinalRating] = useState(0);

  const handleArrive = async () => {
    setArriving(true);
    await new Promise((r) => setTimeout(r, 500));
    setBooking((b) => ({ ...b, status: "arrived" }));
    setExpanded(true);
    setArriving(false);
  };

  const handleComplete = async () => {
    setCompleting(true);
    await new Promise((r) => setTimeout(r, 600));
    setCompleting(false);
    setShowRating(true);
  };

  const handleRatingSubmit = (rating: number) => {
    setFinalRating(rating);
    setShowRating(false);
    setShowThankYou(true);
  };

  const onOtpVerified = () => setBooking((b) => ({ ...b, status: "in_progress" }));

  const isPaid = booking.paymentStatus === "paid";
  const statusTitle = booking.status === "accepted" ? "Heading to Pickup" : booking.status === "arrived" ? "Arrived at Pickup" : "Ride in Progress";
  const statusSub = booking.status === "accepted" ? "Drive to the pickup location" : booking.status === "arrived" ? "Ask customer for OTP to start ride" : "Drive to the drop location";
  const showArriveCta = booking.status === "accepted";

  if (showThankYou) {
    return (
      <div style={{ minHeight: "100svh", background: "#f3f4f6", fontFamily: "'Inter',system-ui,sans-serif", padding: "2rem 1rem" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <ThankYouScreen booking={booking} rating={finalRating} onBack={() => window.location.href = "/partner/dashboard"} />
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#f5f4f0", fontFamily: "'Inter',system-ui,sans-serif", overflow: "hidden" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {showRating && <RatingPopup onSubmit={handleRatingSubmit} />}

      <ClientOnly fallback={<div style={{ position: "absolute", inset: 0, background: "#f5f4f0" }} />}>
        <RideMap pickup={booking.pickup} drop={booking.drop} status={booking.status} />
      </ClientOnly>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 20, background: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: "0 -20px 60px rgba(0,0,0,0.18)", maxHeight: expanded ? "82vh" : "22vh", display: "flex", flexDirection: "column", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        <div onClick={() => setExpanded((e) => !e)} style={{ padding: "10px 0 6px", display: "flex", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <div style={{ width: 44, height: 5, borderRadius: 999, background: "#d9d7d1" }} />
        </div>

        <div style={{ padding: "6px 20px 100px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0a0a0a", letterSpacing: -0.2 }}>{statusTitle}</h1>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#8a8a83" }}>{statusSub}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: "#0a0a0a" }}>9</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: "#8a8a83", letterSpacing: 0.5, marginTop: 2 }}>MIN</div>
              </div>
              <button onClick={() => setExpanded((e) => !e)} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f2f2f0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 10, marginTop: 16 }}>
            <div style={{ background: "#f6f5f1", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#8a8a83", letterSpacing: 0.5 }}>ETA</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800, color: "#0a0a0a" }}>9 <span style={{ fontSize: 12, color: "#8a8a83", fontWeight: 600 }}>min</span></div>
            </div>
            <div style={{ background: "#0a0a0a", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#eab308", fontWeight: 900, fontSize: 12 }}>₹</div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#8a8a83", letterSpacing: 0.5 }}>FARE</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800, color: "#fff" }}>₹{booking.price}</div>
            </div>
          </div>

          <div style={{ marginTop: 12, background: "#0a0a0a", borderRadius: 16, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "#1e1e1c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></svg>
              </div>
              <span style={{ position: "absolute", right: -2, bottom: -2, width: 12, height: 12, borderRadius: "50%", background: "#22c55e", border: "2px solid #0a0a0a" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: 0.3 }}>{booking.customerName}</div>
              <span style={{ display: "inline-block", marginTop: 4, padding: "2px 10px", borderRadius: 999, background: isPaid ? "#193d2b" : "#3d2f19", color: isPaid ? "#22c55e" : "#eab308", fontSize: 10.5, fontWeight: 800 }}>{isPaid ? "Paid" : "Cash"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#1a1a1a", padding: "6px 10px", borderRadius: 10, color: "#eab308", fontWeight: 800, fontSize: 12 }}>₹ {booking.price}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 10, marginTop: 10 }}>
            <button style={{ height: 44, borderRadius: 12, border: "none", background: "#f2f2f0", color: "#0a0a0a", fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call
            </button>
            <button style={{ height: 44, borderRadius: 12, border: "none", background: "#0a0a0a", color: "#fff", fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message
            </button>
          </div>

          <div style={{ marginTop: 12, background: "#f6f5f1", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2v-3.15a1 1 0 0 0-.84-.99L16 12l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 13.42V17h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8a8a83", letterSpacing: 0.5 }}>YOUR VEHICLE</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0a0a0a", marginTop: 2 }}>{booking.model || booking.vehicle}</div>
            </div>
            <div style={{ background: "#0a0a0a", color: "#fff", fontSize: 11.5, fontWeight: 800, padding: "6px 10px", borderRadius: 8, letterSpacing: 0.6 }}>{booking.registrationNumber || "—"}</div>
          </div>

          <div style={{ marginTop: 12, background: "#fff", border: "1px solid #eeece7", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0a0a0a" }} />
                <span style={{ width: 2, flex: 1, background: "#e6e6e3", margin: "4px 0" }} />
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#0a0a0a" }} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8a8a83", letterSpacing: 0.5 }}>PICKUP</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a0a", marginTop: 2 }}>{booking.pickup}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8a8a83", letterSpacing: 0.5 }}>DROP</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a0a", marginTop: 2 }}>{booking.drop}</div>
                </div>
              </div>
            </div>
          </div>

          {booking.status === "arrived" && <OtpSection expectedOtp={booking.otp} onVerified={onOtpVerified} />}

          {booking.status === "in_progress" && (
            <button onClick={handleComplete} disabled={completing}
              style={{ width: "100%", marginTop: 16, height: 54, borderRadius: 14, border: "none", background: "#0a0a0a", color: "#fff", fontSize: 15, fontWeight: 800, cursor: completing ? "wait" : "pointer" }}>
              {completing ? "Completing..." : "✓ Complete Ride"}
            </button>
          )}
        </div>

        {showArriveCta && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 14, background: "linear-gradient(to top, #fff 70%, rgba(255,255,255,0))", display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={handleArrive} disabled={arriving}
              style={{ flex: 1, height: 52, borderRadius: 999, border: "none", background: "#0a0a0a", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: arriving ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 12px 28px rgba(0,0,0,0.25)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {arriving ? "Updating..." : "I've Arrived at Pickup →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}