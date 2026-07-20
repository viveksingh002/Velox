"use client";
import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api";

type Request = {
  id: string;
  customer: string;
  rating: number;
  trips: number;
  pickup: string;
  drop: string;
  distance: string;
  fare: string;
  eta: string;
  vehicleNeeded: string;
  expiresIn: number;
};

function PartnerNav({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "V";
  return (
    <div className="sticky top-0 z-40 h-[64px] px-8 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
      <span className="text-lg font-extrabold italic tracking-tight text-white">Vëlox</span>
      <div className="flex gap-8">
        {[
          { label: "Active Ride", href: "/partner/active-ride" },
          { label: "Pending Requests", href: "/partner/pending-requests" },
          { label: "My Bookings", href: "/partner/bookings" },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            className={`text-[13.5px] transition-colors ${
              l.label === "Pending Requests"
                ? "text-amber-400 font-semibold"
                : "text-white/40 font-medium hover:text-white/70"
            }`}
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black text-[13px] font-bold">
        {initials}
      </div>
    </div>
  );
}

function useCountdown(initial: number) {
  const [secs, setSecs] = useState(initial);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  return secs;
}

const vehicleIcons: Record<string, JSX.Element> = {
  bike: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M9 6l1.5 5.5L5.5 17" /><path d="M9 6h6" /><path d="M15 6l3 4.5" /><path d="M12 11.5L18.5 17" />
    </svg>
  ),
  auto: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h1m16 0h1M4 9l2-5h12l2 5" /><rect x="2" y="9" width="20" height="8" rx="2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
    </svg>
  ),
  car: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
    </svg>
  ),
};

function RequestCard({ req, onAccept, onDecline }: { req: Request; onAccept: (id: string) => void; onDecline: (id: string) => void }) {
  const secs = useCountdown(req.expiresIn);
  const expired = secs <= 0;
  const urgent = secs <= 10;
  const warn = secs <= 20 && secs > 10;
  const urgentColor = urgent ? "#ef4444" : warn ? "#f59e0b" : "#34d399";
  const pct = (secs / req.expiresIn) * 100;
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await fetch(`${API}/booking/${req.id}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverName: "Driver" }),
      });
      onAccept(req.id);
    } catch {
      setAccepting(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden mb-4 transition-all duration-300 ${
        expired ? "opacity-40 border-white/5" : "border-white/10"
      } bg-zinc-900/60 backdrop-blur-sm ${urgent && !expired ? "shadow-[0_0_0_1px_rgba(239,68,68,0.4),0_0_24px_rgba(239,68,68,0.15)]" : ""}`}
    >
      <div className="h-[3px] bg-white/5">
        <div
          className="h-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%`, background: urgentColor }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3 items-center">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-300 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {req.customer.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-[15px] font-bold text-zinc-100 mb-0.5">{req.customer}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-500">⭐ {req.rating}</span>
                <span className="text-xs text-zinc-700">·</span>
                <span className="text-xs text-zinc-500">{req.trips} trips</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[22px] font-extrabold text-amber-400 mb-0.5">{req.fare}</p>
            <div className="flex items-center gap-1 justify-end">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={urgentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              <span className="text-xs font-bold" style={{ color: urgentColor }}>
                {expired ? "Expired" : `${secs}s left`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 items-start mb-4">
          <div className="flex flex-col items-center pt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="w-[1.5px] h-[26px] bg-white/10" />
            <div className="w-2 h-2 rounded-sm bg-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-zinc-300 font-medium mb-3.5">{req.pickup}</p>
            <p className="text-[13px] text-zinc-300 font-medium">{req.drop}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { label: req.distance, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg> },
            { label: req.eta + " away", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l3 3" /></svg> },
            { label: req.vehicleNeeded, icon: vehicleIcons[req.vehicleNeeded] || null },
          ].map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-white/5 text-zinc-300 border border-white/5"
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>

        {!expired && (
          <div className="grid grid-cols-[1fr_2fr] gap-2.5">
            <button
              onClick={() => onDecline(req.id)}
              className="py-3 rounded-xl border border-white/10 bg-transparent text-zinc-400 text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className={`py-3 rounded-xl border-none text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                accepting ? "bg-zinc-700 text-zinc-300 cursor-not-allowed" : "bg-amber-400 text-black hover:bg-amber-300 cursor-pointer"
              }`}
            >
              {accepting ? (
                "Accepting..."
              ) : (
                <>
                  Accept Ride
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
        {expired && (
          <div className="py-2.5 bg-white/5 rounded-xl text-center">
            <p className="text-[13px] text-zinc-500 font-medium">Request expired</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: "accept" | "decline" }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white text-sm font-semibold z-[1000] shadow-2xl whitespace-nowrap ${
        type === "accept" ? "bg-amber-400 text-black" : "bg-red-600"
      }`}
    >
      {msg}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-white/10 py-16 px-8 text-center">
      <div className="w-[72px] h-[72px] rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-zinc-100 mb-2">All caught up!</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">
        No pending ride requests right now.
        <br />
        New requests will show up here automatically.
      </p>
    </div>
  );
}

export default function PendingRequestsPage() {
  const [name, setName] = useState("Vendor");
  const [requests, setRequests] = useState<Request[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "accept" | "decline" } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("velox_vendor_name");
    if (saved) setName(saved);
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/booking`);
      const data = await res.json();
      const fresh = (Array.isArray(data) ? data : []).filter((b: any) => {
        const age = (Date.now() - new Date(b.createdAt).getTime()) / 1000;
        return age < 60 && (!b.status || b.status === "pending");
      });
      setRequests(
        fresh.map((b: any) => ({
          id: b._id,
          customer: "Customer",
          rating: 4.5,
          trips: 0,
          pickup: b.pickup,
          drop: b.drop,
          distance: "—",
          fare: `₹${b.price}`,
          eta: "—",
          vehicleNeeded: b.vehicle,
          expiresIn: Math.max(60 - Math.floor((Date.now() - new Date(b.createdAt).getTime()) / 1000), 0),
        }))
      );
    } catch {}
  }, []);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 8000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const showToast = (msg: string, type: "accept" | "decline") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAccept = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showToast("✓ Ride accepted!", "accept");
    setTimeout(() => {
      window.location.href = "/partner/active-ride";
    }, 1500);
  };

  const handleDecline = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showToast("Ride declined.", "decline");
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-[Inter,sans-serif]">
      <PartnerNav name={name} />
      <div className="max-w-[680px] mx-auto px-6 pb-12 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold text-zinc-100 mb-1">Pending Requests</h1>
            <p className="text-sm text-zinc-500">Accept or decline incoming ride requests</p>
          </div>
          {requests.length > 0 && (
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-black text-[13px] font-extrabold">
              {requests.length}
            </div>
          )}
        </div>

        {requests.length > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-400/10 rounded-xl mb-5 border border-amber-400/20">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            <p className="text-[13px] text-amber-400 font-medium">Each request expires automatically. Accept quickly!</p>
          </div>
        )}

        {requests.length === 0 ? (
          <EmptyState />
        ) : (
          requests.map((r) => <RequestCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline} />)
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}