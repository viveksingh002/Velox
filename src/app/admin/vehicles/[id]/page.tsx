"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, IndianRupee, CheckCircle, XCircle, Truck, Image as ImageIcon, ShieldCheck, Loader2, Clock } from "lucide-react";

export default function AdminVehicleReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/api/admin/vehicles/${id}`);
        setData(res.data.vehicle);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  const approve = async () => {
    try { setActionLoading(true); await axios.post(`/api/admin/vehicles/${id}/approve`); router.push("/admin/dashboard"); }
    catch (err) { console.error(err); }
    finally { setActionLoading(false); setShowApprove(false); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) return;
    try { setActionLoading(true); await axios.post(`/api/admin/vehicles/${id}/reject`, { reason: rejectReason }); router.push("/admin/dashboard"); }
    catch (err) { console.error(err); }
    finally { setActionLoading(false); setShowReject(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#08080d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading vehicle review...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .aveh-root {
          min-height: 100vh;
          background: #08080d;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #fff;
        }

        .aveh-header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(8,8,13,0.92);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          padding: 0 2.5rem; height: 64px;
          display: flex; align-items: center; gap: 16px;
        }
        .aveh-back {
          width: 38px; height: 38px; border-radius: 12px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.6); transition: all 0.2s; flex-shrink: 0;
        }
        .aveh-back:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .aveh-header-name { font-size: 16px; font-weight: 600; color: #fff; }
        .aveh-header-email { font-size: 12px; color: rgba(255,255,255,0.35); }
        .aveh-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 980px;
          font-size: 12px; font-weight: 600;
        }

        .aveh-main {
          max-width: 1200px; margin: 0 auto;
          padding: 3rem 2.5rem;
          display: grid; grid-template-columns: 1fr 400px; gap: 2rem; align-items: start;
        }

        /* Vehicle image */
        .aveh-img-wrap {
          border-radius: 24px; overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          aspect-ratio: 16/10;
          display: flex; align-items: center; justify-content: center;
        }
        .aveh-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .aveh-img-placeholder { color: rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .aveh-img-placeholder p { font-size: 13px; color: rgba(255,255,255,0.2); }

        /* Cards */
        .aveh-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 1.8rem 2rem;
          margin-bottom: 1rem; transition: all 0.3s;
        }
        .aveh-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(0,113,227,0.15); }
        .aveh-card-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7);
          margin-bottom: 1.4rem; padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .aveh-card-title svg { color: #0071e3; }

        .aveh-info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 14px;
        }
        .aveh-info-row:last-child { border-bottom: none; }
        .aveh-info-label { color: rgba(255,255,255,0.35); }
        .aveh-info-value { color: rgba(255,255,255,0.85); font-weight: 600; }

        /* Decision */
        .aveh-decision {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 1.8rem 2rem; margin-bottom: 1rem;
        }
        .aveh-decision-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7);
          margin-bottom: 0.5rem;
        }
        .aveh-decision-title svg { color: #0071e3; }
        .aveh-decision-sub { font-size: 13px; color: rgba(255,255,255,0.25); margin-bottom: 1.5rem; }
        .aveh-btn-row { display: flex; gap: 10px; }
        .aveh-approve-btn {
          flex: 1; padding: 13px; border-radius: 14px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #0071e3, #0055b3);
          color: #fff; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 20px rgba(0,113,227,0.35); transition: all 0.25s;
        }
        .aveh-approve-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,113,227,0.5); }
        .aveh-reject-btn {
          flex: 1; padding: 13px; border-radius: 14px; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
          transition: all 0.25s;
        }
        .aveh-reject-btn:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25); color: #fca5a5; }

        /* Modal */
        .aveh-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center; padding: 1.5rem;
        }
        .aveh-modal {
          width: 100%; max-width: 380px;
          background: rgba(14,14,26,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 22px; padding: 2rem;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7);
        }
        .aveh-modal h3 { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .aveh-modal p { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 1.5rem; }
        .aveh-modal textarea {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #fff; font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none; resize: none; min-height: 90px; margin-bottom: 1.2rem;
          transition: border-color 0.2s;
        }
        .aveh-modal textarea:focus { border-color: rgba(0,113,227,0.5); }
        .aveh-modal textarea::placeholder { color: rgba(255,255,255,0.2); }
        .aveh-modal-btns { display: flex; gap: 10px; }
        .aveh-modal-cancel {
          flex: 1; padding: 12px; border-radius: 12px; cursor: pointer;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .aveh-modal-cancel:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .aveh-modal-confirm {
          flex: 1; padding: 12px; border-radius: 12px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #0071e3, #0055b3);
          color: #fff; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(0,113,227,0.35); transition: all 0.2s;
        }
        .aveh-modal-confirm:hover { transform: translateY(-1px); }
        .aveh-modal-confirm.danger { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 4px 16px rgba(220,38,38,0.35); }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .aveh-main { grid-template-columns: 1fr; }
          .aveh-header { padding: 0 1.25rem; }
          .aveh-main { padding: 2rem 1.25rem; }
        }
      `}</style>

      <div className="aveh-root">
        {/* Header */}
        <header className="aveh-header">
          <button className="aveh-back" onClick={() => router.back()}><ArrowLeft size={16} /></button>
          <div style={{ flex: 1 }}>
            <div className="aveh-header-name">{data.owner?.name}</div>
            <div className="aveh-header-email">{data.owner?.email}</div>
          </div>
          <VehicleStatusBadge status={data.status} />
        </header>

        {/* Main */}
        <main className="aveh-main">
          {/* Left — Image */}
          <motion.div className="aveh-img-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} alt="Vehicle" />
              : <div className="aveh-img-placeholder"><ImageIcon size={48} /><p>No image uploaded</p></div>
            }
          </motion.div>

          {/* Right — Details */}
          <div>
            <motion.div className="aveh-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="aveh-card-title"><Truck size={16} /> Vehicle Details</div>
              <div className="aveh-info-row"><span className="aveh-info-label">Vehicle Type</span><span className="aveh-info-value">{data.type}</span></div>
              <div className="aveh-info-row"><span className="aveh-info-label">Registration Number</span><span className="aveh-info-value">{data.number}</span></div>
              <div className="aveh-info-row"><span className="aveh-info-label">Model</span><span className="aveh-info-value">{data.model}</span></div>
            </motion.div>

            <motion.div className="aveh-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="aveh-card-title"><IndianRupee size={16} /> Pricing Configuration</div>
              <div className="aveh-info-row"><span className="aveh-info-label">Base Fare</span><span className="aveh-info-value">₹{data.baseFare}</span></div>
              <div className="aveh-info-row"><span className="aveh-info-label">Price per KM</span><span className="aveh-info-value">₹{data.pricePerKm}</span></div>
              <div className="aveh-info-row"><span className="aveh-info-label">Waiting Charge</span><span className="aveh-info-value">₹{data.waitingCharge}</span></div>
            </motion.div>

            {data.status === 'pending' && (
              <motion.div className="aveh-decision" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="aveh-decision-title"><ShieldCheck size={16} /> Admin Decision</div>
                <div className="aveh-decision-sub">Review pricing and vehicle details before deciding.</div>
                <div className="aveh-btn-row">
                  <button className="aveh-approve-btn" onClick={() => setShowApprove(true)}>Approve</button>
                  <button className="aveh-reject-btn" onClick={() => setShowReject(true)}>Reject</button>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* Approve Modal */}
        <AnimatePresence>
          {showApprove && (
            <motion.div className="aveh-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="aveh-modal" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
                <h3>Approve this vehicle?</h3>
                <p>This will make the vehicle available for booking on the platform.</p>
                <div className="aveh-modal-btns">
                  <button className="aveh-modal-cancel" onClick={() => setShowApprove(false)}>Cancel</button>
                  <button className="aveh-modal-confirm" onClick={approve} disabled={actionLoading}>
                    {actionLoading && <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reject Modal */}
        <AnimatePresence>
          {showReject && (
            <motion.div className="aveh-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="aveh-modal" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
                <h3>Reject Vehicle</h3>
                <p>Please provide a reason for rejection.</p>
                <textarea placeholder="Enter rejection reason (required)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                <div className="aveh-modal-btns">
                  <button className="aveh-modal-cancel" onClick={() => setShowReject(false)}>Cancel</button>
                  <button className="aveh-modal-confirm danger" onClick={reject} disabled={actionLoading || !rejectReason.trim()}>
                    {actionLoading && <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
                    Reject
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function VehicleStatusBadge({ status }: any) {
  if (status === 'approved') return <span className="aveh-badge" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}><CheckCircle size={13} /> Approved</span>;
  if (status === 'rejected') return <span className="aveh-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}><XCircle size={13} /> Rejected</span>;
  return <span className="aveh-badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}><Clock size={13} /> Pending</span>;
}