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
    <div style={{ background:"#111827",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60,marginBottom:32 }}>
      <span style={{ fontSize:18,fontWeight:800,color:"#fff",letterSpacing:"-0.5px",fontStyle:"italic" }}>Vëlox</span>
      <div style={{ display:"flex",gap:32 }}>
        {[{ label:"Active Ride",href:"/partner/active-ride" },{ label:"Pending Requests",href:"/partner/pending-requests" },{ label:"My Bookings",href:"/partner/bookings" }].map((l) => (
          <a key={l.label} href={l.href} style={{ fontSize:13.5,color:l.label==="Pending Requests"?"#fff":"rgba(255,255,255,0.55)",textDecoration:"none",fontWeight:l.label==="Pending Requests"?700:500 }}>{l.label}</a>
        ))}
      </div>
      <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#60a5fa)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700 }}>{initials}</div>
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
  bike: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M9 6l1.5 5.5L5.5 17"/><path d="M9 6h6"/><path d="M15 6l3 4.5"/><path d="M12 11.5L18.5 17"/></svg>,
  auto: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17h1m16 0h1M4 9l2-5h12l2 5"/><rect x="2" y="9" width="20" height="8" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  car:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
};

function RequestCard({ req, onAccept, onDecline }: { req: Request; onAccept: (id: string) => void; onDecline: (id: string) => void }) {
  const secs = useCountdown(req.expiresIn);
  const expired = secs <= 0;
  const urgentColor = secs <= 10 ? "#ef4444" : secs <= 20 ? "#f59e0b" : "#22c55e";
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
    <div style={{ background:"#fff",borderRadius:16,border:`1.5px solid ${expired?"#f3f4f6":"#e5e7eb"}`,overflow:"hidden",marginBottom:12,opacity:expired?0.5:1,transition:"opacity 0.3s" }}>
      <div style={{ height:4,background:"#f3f4f6" }}>
        <div style={{ height:"100%",width:`${pct}%`,background:urgentColor,transition:"width 1s linear, background 0.3s" }} />
      </div>
      <div style={{ padding:"18px 20px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14 }}>
          <div style={{ display:"flex",gap:12,alignItems:"center" }}>
            <div style={{ width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#a5b4fc)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:700,flexShrink:0 }}>
              {req.customer.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p style={{ fontSize:15,fontWeight:700,color:"#111827",marginBottom:3 }}>{req.customer}</p>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <span style={{ fontSize:12,color:"#6b7280" }}>⭐ {req.rating}</span>
                <span style={{ fontSize:12,color:"#d1d5db" }}>·</span>
                <span style={{ fontSize:12,color:"#6b7280" }}>{req.trips} trips</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:22,fontWeight:800,color:"#111827",marginBottom:2 }}>{req.fare}</p>
            <div style={{ display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={urgentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span style={{ fontSize:12,fontWeight:700,color:urgentColor }}>{expired?"Expired":`${secs}s left`}</span>
            </div>
          </div>
        </div>

        <div style={{ display:"flex",gap:12,alignItems:"flex-start",marginBottom:14 }}>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",paddingTop:3 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:"#22c55e" }} />
            <div style={{ width:1.5,height:26,background:"#e5e7eb" }} />
            <div style={{ width:8,height:8,borderRadius:2,background:"#ef4444" }} />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13,color:"#374151",fontWeight:500,marginBottom:14 }}>{req.pickup}</p>
            <p style={{ fontSize:13,color:"#374151",fontWeight:500 }}>{req.drop}</p>
          </div>
        </div>

        <div style={{ display:"flex",gap:8,marginBottom:16 }}>
          {[
            { label:req.distance, icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg> },
            { label:req.eta+" away", icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/></svg> },
            { label:req.vehicleNeeded, icon:vehicleIcons[req.vehicleNeeded]||null },
          ].map((chip) => (
            <span key={chip.label} style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:500,padding:"4px 11px",borderRadius:99,background:"#f3f4f6",color:"#374151" }}>
              {chip.icon}{chip.label}
            </span>
          ))}
        </div>

        {!expired && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 2fr",gap:10 }}>
            <button onClick={() => onDecline(req.id)} style={{ padding:"12px",borderRadius:12,border:"1.5px solid #e5e7eb",background:"#fff",color:"#6b7280",fontSize:14,fontWeight:600,cursor:"pointer" }}>Decline</button>
            <button onClick={handleAccept} disabled={accepting} style={{ padding:"12px",borderRadius:12,border:"none",background:accepting?"#6b7280":"#111827",color:"#fff",fontSize:14,fontWeight:600,cursor:accepting?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              {accepting ? "Accepting..." : <>Accept Ride <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
            </button>
          </div>
        )}
        {expired && (
          <div style={{ padding:"10px",background:"#f9fafb",borderRadius:12,textAlign:"center" }}>
            <p style={{ fontSize:13,color:"#9ca3af",fontWeight:500 }}>Request expired</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: "accept" | "decline" }) {
  return (
    <div style={{ position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",borderRadius:12,background:type==="accept"?"#111827":"#dc2626",color:"#fff",fontSize:14,fontWeight:600,zIndex:1000,boxShadow:"0 8px 32px rgba(0,0,0,0.25)",whiteSpace:"nowrap" }}>
      {msg}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"64px 32px",textAlign:"center" }}>
      <div style={{ width:72,height:72,borderRadius:"50%",background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
      </div>
      <h3 style={{ fontSize:18,fontWeight:700,color:"#111827",marginBottom:8 }}>All caught up!</h3>
      <p style={{ fontSize:14,color:"#9ca3af",lineHeight:1.6 }}>No pending ride requests right now.<br/>New requests will show up here automatically.</p>
    </div>
  );
}

export default function PendingRequestsPage() {
  const [name, setName]     = useState("Vendor");
  const [requests, setRequests] = useState<Request[]>([]);
  const [toast, setToast]   = useState<{ msg: string; type: "accept" | "decline" } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("velox_vendor_name");
    if (saved) setName(saved);
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/booking`);
      const data = await res.json();
      const fresh = (Array.isArray(data) ? data : []).filter((b: any) => {
        const age = (Date.now() - new Date(b.createdAt).getTime()) / 1000;
        return age < 60 && (!b.status || b.status === "pending");
      });
      setRequests(fresh.map((b: any) => ({
        id:            b._id,
        customer:      "Customer",
        rating:        4.5,
        trips:         0,
        pickup:        b.pickup,
        drop:          b.drop,
        distance:      "—",
        fare:          `₹${b.price}`,
        eta:           "—",
        vehicleNeeded: b.vehicle,
        expiresIn:     Math.max(60 - Math.floor((Date.now() - new Date(b.createdAt).getTime()) / 1000), 0),
      })));
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
    showToast("✓ Ride accepted! Check Active Ride.", "accept");
  };

  const handleDecline = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showToast("Ride declined.", "decline");
  };


  return (
    <div style={{ minHeight:"100vh",background:"#f3f4f6",fontFamily:"Inter,sans-serif" }}>
      <PartnerNav name={name} />
      <div style={{ maxWidth:680,margin:"0 auto",padding:"0 24px 48px" }}>
        <div style={{ marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:28,fontWeight:800,color:"#111827",marginBottom:4 }}>Pending Requests</h1>
            <p style={{ fontSize:14,color:"#6b7280" }}>Accept or decline incoming ride requests</p>
          </div>
          {requests.length > 0 && (
            <div style={{ width:32,height:32,borderRadius:"50%",background:"#111827",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:800 }}>{requests.length}</div>
          )}
        </div>
        {requests.length > 0 && (
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#eff6ff",borderRadius:12,marginBottom:20,border:"1px solid #dbeafe" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <p style={{ fontSize:13,color:"#1d4ed8",fontWeight:500 }}>Each request expires automatically. Accept quickly!</p>
          </div>
        )}
        {requests.length === 0 ? <EmptyState /> : requests.map((r) => (
          <RequestCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline} />
        ))}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}