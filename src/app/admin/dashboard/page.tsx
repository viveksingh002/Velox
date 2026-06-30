"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, AreaChart, Area,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, CheckCircle2, XCircle, Clock, ShieldCheck,
  ArrowRight, Truck, Video, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stats = {
  totalVendors: number;
  approved: number;
  pending: number;
  rejected: number;
};
type TabType = "kyc" | "vendor" | "vehicle";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [vendorReviews, setVendorReviews] = useState<any[]>([]);
  const [vehicleReviews, setVehicleReviews] = useState<any[]>([]);
  const [videoKycReviews, setVideoKycReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("kyc");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [dashboardRes, kycRes] = await Promise.all([
        axios.get("/api/admin/dashboard"),
        axios.get("/api/admin/vendors/video-kyc/pending"),
      ]);
      setStats(dashboardRes.data.stats);
      setVendorReviews(dashboardRes.data.pendingVendors);
      setVehicleReviews(dashboardRes.data.pendingVehicles);
      setVideoKycReviews(kycRes.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .ad-root {
          min-height: 100vh;
          background: #08080d;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #fff;
        }

        /* Header */
        .ad-header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(8,8,13,0.92);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          padding: 0 2.5rem;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ad-header-left { display: flex; align-items: center; gap: 12px; }
        .ad-logo-icon {
          width: 38px; height: 38px; border-radius: 12px;
          background: linear-gradient(135deg, #0071e3, #5ac8fa);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 15px; color: #fff;
        }
        .ad-logo-text {
          font-size: 16px; font-weight: 700; letter-spacing: 1px;
          background: linear-gradient(120deg, #fff 30%, #5ac8fa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ad-secure-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 980px;
          background: rgba(0,113,227,0.08); border: 1px solid rgba(0,113,227,0.2);
          font-size: 12px; font-weight: 600; color: rgba(90,200,250,0.8);
        }

        /* Main */
        .ad-main { max-width: 1200px; margin: 0 auto; padding: 3rem 2.5rem; }

        /* KPI Grid */
        .ad-kpi-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
          margin-bottom: 2.5rem;
        }
        .ad-kpi {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 1.6rem 1.8rem;
          cursor: default; position: relative; overflow: hidden;
          transition: all 0.3s;
        }
        .ad-kpi:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(0,113,227,0.2);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
        .ad-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.2rem; }
        .ad-kpi-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .ad-kpi-trend {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 700;
          padding: 4px 8px; border-radius: 980px;
        }
        .ad-kpi-label {
          font-size: 10px; font-weight: 700; letter-spacing: 2px;
          color: rgba(255,255,255,0.3); text-transform: uppercase; margin-bottom: 6px;
        }
        .ad-kpi-value {
          font-size: 32px; font-weight: 800; letter-spacing: -1.5px;
          color: #fff; line-height: 1;
        }
        .ad-kpi-sub {
          font-size: 11px; color: rgba(255,255,255,0.2);
          margin-top: 10px; padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* Section title */
        .ad-section-title {
          font-size: 11px; font-weight: 700; letter-spacing: 2.5px;
          color: #0071e3; text-transform: uppercase;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 10px;
        }
        .ad-section-title::before { content: ''; width: 24px; height: 1px; background: #0071e3; }

        /* Charts row */
        .ad-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 2.5rem; }
        .ad-chart-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 1.8rem;
        }
        .ad-chart-title { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 1.5rem; }

        /* Tabs */
        .ad-tabs {
          display: flex; gap: 8px; margin-bottom: 1.25rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 6px;
        }
        .ad-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          border: none; transition: all 0.2s; font-family: 'Inter', sans-serif;
          position: relative;
        }
        .ad-tab.active {
          background: #0071e3; color: #fff;
          box-shadow: 0 4px 20px rgba(0,113,227,0.4);
        }
        .ad-tab.inactive { background: none; color: rgba(255,255,255,0.4); }
        .ad-tab.inactive:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }
        .ad-tab-count {
          min-width: 20px; height: 18px; padding: 0 5px;
          border-radius: 980px; font-size: 10px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .ad-tab.active .ad-tab-count { background: rgba(255,255,255,0.2); color: #fff; }
        .ad-tab.inactive .ad-tab-count { background: rgba(255,0,0,0.7); color: #fff; }
        .ad-tab.inactive .ad-tab-count.zero { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); }

        /* Empty state */
        .ad-empty {
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 20px; padding: 3rem; text-align: center;
        }
        .ad-empty-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(0,113,227,0.1); border: 1px solid rgba(0,113,227,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
        }
        .ad-empty-title { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        .ad-empty-sub { font-size: 13px; color: rgba(255,255,255,0.2); }

        /* List item */
        .ad-list-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.2rem 1.4rem;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          transition: all 0.2s; margin-bottom: 10px; cursor: pointer;
        }
        .ad-list-item:hover {
          background: rgba(0,113,227,0.06);
          border-color: rgba(0,113,227,0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .ad-avatar {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; flex-shrink: 0;
        }
        .ad-item-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .ad-item-email { font-size: 12px; color: rgba(255,255,255,0.35); }
        .ad-review-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 10px;
          background: #0071e3; color: #fff;
          font-size: 12px; font-weight: 600; border: none; cursor: pointer;
          transition: all 0.2s; font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 14px rgba(0,113,227,0.35);
          flex-shrink: 0;
        }
        .ad-review-btn:hover {
          background: #0058c4;
          box-shadow: 0 6px 20px rgba(0,113,227,0.5);
          transform: translateY(-1px);
        }
        .ad-kyc-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 10px;
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; font-family: 'Inter', sans-serif;
          flex-shrink: 0;
        }
        .ad-kyc-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .ad-kyc-btn.active { background: rgba(0,113,227,0.15); border-color: rgba(0,113,227,0.35); color: #5ac8fa; }

        .ad-kyc-status {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
          padding: 3px 10px; border-radius: 980px; margin-top: 5px;
        }
        .ad-kyc-dot { width: 5px; height: 5px; border-radius: 50%; }

        /* Stat bar */
        .ad-stat-bar { margin-bottom: 2.5rem; }
        .ad-stat-bar-inner {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 1.8rem 2rem;
        }
        .ad-stat-bar-title { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 1.5rem; }
        .ad-progress-row { display: flex; flex-direction: column; gap: 14px; }
        .ad-progress-item { display: flex; flex-direction: column; gap: 6px; }
        .ad-progress-label-row { display: flex; justify-content: space-between; }
        .ad-progress-label { font-size: 12px; color: rgba(255,255,255,0.45); font-weight: 500; }
        .ad-progress-val { font-size: 12px; color: rgba(255,255,255,0.6); font-weight: 600; }
        .ad-progress-track {
          height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;
        }
        .ad-progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }

        @media (max-width: 900px) {
          .ad-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .ad-charts-row { grid-template-columns: 1fr; }
          .ad-main { padding: 2rem 1.25rem; }
          .ad-header { padding: 0 1.25rem; }
        }
        @media (max-width: 540px) {
          .ad-kpi-grid { grid-template-columns: 1fr 1fr; }
          .ad-tab span.label { display: none; }
        }
      `}</style>

      <div className="ad-root">
        {/* Header */}
        <header className="ad-header">
          <div className="ad-header-left">
            <div className="ad-logo-icon">V</div>
            <span className="ad-logo-text">VËLOX ADMIN</span>
          </div>
          <div className="ad-secure-badge">
            <ShieldCheck size={13} />
            Secure Mode
          </div>
        </header>

        <main className="ad-main">

          {/* KPI Cards */}
          <div className="ad-section-title">Overview</div>
          <div className="ad-kpi-grid">
            <KpiCard label="Total Vendors" value={stats.totalVendors} trend="+12%" trendDir="up" sub="vs last month" color="#a78bfa" icon={<Users size={17} />} />
            <KpiCard label="Approved" value={stats.approved} trend="+8%" trendDir="up" sub="verified vendors" color="#0071e3" icon={<CheckCircle2 size={17} />} />
            <KpiCard label="Pending" value={stats.pending} trend="0%" trendDir="flat" sub="awaiting review" color="#f59e0b" icon={<Clock size={17} />} />
            <KpiCard label="Rejected" value={stats.rejected} trend="-3%" trendDir="down" sub="declined" color="#ef4444" icon={<XCircle size={17} />} />
          </div>

          {/* Status Overview */}
          <div className="ad-section-title">Status Overview</div>
          <div className="ad-stat-bar" >
            <div className="ad-stat-bar-inner">
              <div className="ad-stat-bar-title">Vendor Distribution</div>
              <div className="ad-progress-row">
                <ProgressBar label="Approved" value={stats.approved} total={stats.totalVendors} color="#0071e3" />
                <ProgressBar label="Pending" value={stats.pending} total={stats.totalVendors} color="#f59e0b" />
                <ProgressBar label="Rejected" value={stats.rejected} total={stats.totalVendors} color="#ef4444" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="ad-section-title">Review Queue</div>
          <div className="ad-tabs">
            <TabBtn active={activeTab === "kyc"} count={videoKycReviews.length} onClick={() => setActiveTab("kyc")} icon={<Video size={14} />}>Video KYC</TabBtn>
            <TabBtn active={activeTab === "vendor"} count={vendorReviews.length} onClick={() => setActiveTab("vendor")} icon={<Users size={14} />}>Vendor Reviews</TabBtn>
            <TabBtn active={activeTab === "vehicle"} count={vehicleReviews.length} onClick={() => setActiveTab("vehicle")} icon={<Truck size={14} />}>Pricing & Images</TabBtn>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "kyc" && <ReviewList data={videoKycReviews} type="kyc" router={router} />}
              {activeTab === "vendor" && <ReviewList data={vendorReviews} type="vendor" router={router} />}
              {activeTab === "vehicle" && <ReviewList data={vehicleReviews} type="vehicle" router={router} />}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>
    </>
  );
}

/* ── KPI Card ── */
function KpiCard({ label, value, trend, trendDir, sub, color, icon }: any) {
  const trendColor = trendDir === "up" ? "rgba(0,200,100,0.15)" : trendDir === "down" ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)";
  const trendText = trendDir === "up" ? "#4ade80" : trendDir === "down" ? "#f87171" : "rgba(255,255,255,0.4)";
  const TrendIcon = trendDir === "up" ? TrendingUp : trendDir === "down" ? TrendingDown : Minus;

  return (
    <div className="ad-kpi">
      <div className="ad-kpi-top">
        <div className="ad-kpi-icon" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        <span className="ad-kpi-trend" style={{ background: trendColor, color: trendText }}>
          <TrendIcon size={10} /> {trend}
        </span>
      </div>
      <div className="ad-kpi-label">{label}</div>
      <div className="ad-kpi-value">{value}</div>
      {sub && <div className="ad-kpi-sub">{sub}</div>}
    </div>
  );
}

/* ── Progress Bar ── */
function ProgressBar({ label, value, total, color }: any) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="ad-progress-item">
      <div className="ad-progress-label-row">
        <span className="ad-progress-label">{label}</span>
        <span className="ad-progress-val">{value} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div className="ad-progress-track">
        <div className="ad-progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Tab Button ── */
function TabBtn({ active, count, onClick, icon, children }: any) {
  return (
    <button className={`ad-tab ${active ? 'active' : 'inactive'}`} onClick={onClick}>
      {icon}
      <span className="label">{children}</span>
      <span className={`ad-tab-count ${!active && count === 0 ? 'zero' : ''}`}>{count}</span>
    </button>
  );
}

/* ── Review List ── */
const AVATAR_COLORS = [
  { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  { bg: 'rgba(0,113,227,0.15)', color: '#5ac8fa' },
  { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
];

const KYC_STATUS: any = {
  pending:     { label: 'Pending',     bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', dot: '#f59e0b' },
  in_progress: { label: 'In Progress', bg: 'rgba(0,113,227,0.12)',  color: '#5ac8fa', dot: '#0071e3' },
  completed:   { label: 'Completed',   bg: 'rgba(52,211,153,0.12)', color: '#34d399', dot: '#10b981' },
};

function ReviewList({ data, type, router }: any) {
  const startKyc = async (vendorId: string, existingRoomId?: string) => {
    // Agar room already bana hua hai (in_progress), seedha usi room mein jao
    if (existingRoomId) {
      router.push(`/video-kyc/${existingRoomId}?role=admin&vendorId=${vendorId}`);
      return;
    }
    try {
      const res = await axios.patch(`/api/admin/vendors/video-kyc/start/${vendorId}`);
      if (res.data.roomId) {
        router.push(`/video-kyc/${res.data.roomId}?role=admin&vendorId=${vendorId}`);
      }
    } catch (err) { console.error(err); }
  };

  if (data.length === 0) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon"><CheckCircle2 size={20} color="#0071e3" /></div>
        <div className="ad-empty-title">All caught up!</div>
        <div className="ad-empty-sub">No pending items right now.</div>
      </div>
    );
  }

  return (
    <div>
      {data.map((item: any, i: number) => {
        const name = item.name || item.ownerName || '—';
        const email = item.email || item.ownerEmail || '—';
        const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
        const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const kycs = KYC_STATUS[item.videoKycStatus] ?? KYC_STATUS.pending;

        return (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="ad-list-item"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div className="ad-avatar" style={{ background: av.bg, color: av.color }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div className="ad-item-name">{name}</div>
                <div className="ad-item-email">{email}</div>
                {type === 'kyc' && (
                  <span className="ad-kyc-status" style={{ background: kycs.bg, color: kycs.color }}>
                    <span className="ad-kyc-dot" style={{ background: kycs.dot }} />
                    {kycs.label}
                  </span>
                )}
              </div>
            </div>

            {type === 'kyc' ? (
              <button className="ad-kyc-btn" onClick={() => startKyc(item._id, item.videoKycStatus === 'in_progress' ? item.videoKycRoomId : undefined)}>
                <Video size={13} /> {item.videoKycStatus === 'in_progress' ? 'Resume KYC' : 'Start KYC'}
              </button>
            ) : (
              <button className="ad-review-btn" onClick={() => router.push(type === 'vendor' ? `/admin/vendors/${item._id}` : `/admin/vehicles/${item._id}`)}>
                Review <ArrowRight size={13} />
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}