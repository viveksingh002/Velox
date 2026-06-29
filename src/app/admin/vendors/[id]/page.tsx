"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, XCircle, Car, FileText, Landmark, ShieldCheck, Loader2 } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminVendorReviewPage() {
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
      const res = await axios.get(`/api/admin/vendors/${id}`);
      setData(res.data.vendor);
      setLoading(false);
    }
    load();
  }, [id]);

  const approveVendor = async () => {
    setActionLoading(true);
    await axios.post(`/api/admin/vendors/${id}/approve`);
    router.push("/admin/dashboard");
  };

  const rejectVendor = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    await axios.post(`/api/admin/vendors/${id}/reject`, { reason: rejectReason });
    router.push("/admin/dashboard");
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#08080d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading vendor review...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .avd-root {
          min-height: 100vh;
          background: #08080d;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #fff;
        }

        .avd-header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(8,8,13,0.92);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          padding: 0 2.5rem; height: 64px;
          display: flex; align-items: center; gap: 16px;
        }
        .avd-back {
          width: 38px; height: 38px; border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.6);
          transition: all 0.2s; flex-shrink: 0;
        }
        .avd-back:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .avd-header-info { flex: 1; }
        .avd-header-name { font-size: 16px; font-weight: 600; color: #fff; }
        .avd-header-email { font-size: 12px; color: rgba(255,255,255,0.35); }

        .avd-main {
          max-width: 1200px; margin: 0 auto;
          padding: 3rem 2.5rem;
          display: grid; grid-template-columns: 1fr 380px; gap: 2rem;
        }

        .avd-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 1.8rem 2rem;
          margin-bottom: 1rem; transition: all 0.3s;
        }
        .avd-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(0,113,227,0.15);
        }
        .avd-card-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7);
          margin-bottom: 1.4rem;
          padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .avd-card-title svg { color: #0071e3; }

        .avd-info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 14px;
        }
        .avd-info-row:last-child { border-bottom: none; }
        .avd-info-label { color: rgba(255,255,255,0.35); font-weight: 400; }
        .avd-info-value { color: rgba(255,255,255,0.85); font-weight: 600; }

        /* Docs */
        .avd-docs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .avd-doc-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; overflow: hidden;
        }
        .avd-doc-label {
          padding: 8px 12px;
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          color: rgba(255,255,255,0.35); text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .avd-doc-preview {
          height: 140px; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.15);
        }
        .avd-doc-preview img { width: 100%; height: 100%; object-fit: cover; }
        .avd-doc-link {
          display: block; text-align: center; padding: 8px;
          font-size: 11px; font-weight: 600; color: #5ac8fa;
          text-decoration: none; border-top: 1px solid rgba(255,255,255,0.06);
          transition: background 0.15s;
        }
        .avd-doc-link:hover { background: rgba(0,113,227,0.08); }

        /* Decision card */
        .avd-decision {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 1.8rem 2rem;
          margin-bottom: 1rem;
        }
        .avd-decision-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7);
          margin-bottom: 0.6rem;
        }
        .avd-decision-title svg { color: #0071e3; }
        .avd-decision-sub { font-size: 13px; color: rgba(255,255,255,0.25); margin-bottom: 1.5rem; }

        .avd-approve-btn {
          width: 100%; padding: 13px;
          border-radius: 14px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #0071e3, #0055b3);
          color: #fff; font-size: 14px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 20px rgba(0,113,227,0.35);
          transition: all 0.25s; margin-bottom: 10px;
        }
        .avd-approve-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,113,227,0.5); }

        .avd-reject-btn {
          width: 100%; padding: 13px;
          border-radius: 14px; cursor: pointer;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 600;
          font-family: 'Inter', sans-serif; transition: all 0.25s;
        }
        .avd-reject-btn:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.25); color: #fca5a5;
        }

        /* Status badge */
        .avd-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 980px;
          font-size: 12px; font-weight: 600;
        }

        /* Modal */
        .avd-modal-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center; padding: 1.5rem;
        }
        .avd-modal {
          width: 100%; max-width: 380px;
          background: rgba(14,14,26,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 22px; padding: 2rem;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7);
        }
        .avd-modal h3 { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .avd-modal p { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 1.5rem; }
        .avd-modal textarea {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #fff; font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none; resize: none; min-height: 90px;
          transition: border-color 0.2s; margin-bottom: 1.2rem;
        }
        .avd-modal textarea:focus { border-color: rgba(0,113,227,0.5); }
        .avd-modal textarea::placeholder { color: rgba(255,255,255,0.2); }
        .avd-modal-btns { display: flex; gap: 10px; }
        .avd-modal-cancel {
          flex: 1; padding: 12px; border-radius: 12px; cursor: pointer;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .avd-modal-cancel:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .avd-modal-confirm {
          flex: 1; padding: 12px; border-radius: 12px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #0071e3, #0055b3);
          color: #fff; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(0,113,227,0.35); transition: all 0.2s;
        }
        .avd-modal-confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(0,113,227,0.5); }
        .avd-modal-confirm.danger { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 4px 16px rgba(220,38,38,0.35); }

        @media (max-width: 900px) {
          .avd-main { grid-template-columns: 1fr; }
          .avd-docs-grid { grid-template-columns: 1fr 1fr; }
          .avd-header { padding: 0 1.25rem; }
          .avd-main { padding: 2rem 1.25rem; }
        }
      `}</style>

      <div className="avd-root">
        {/* Header */}
        <header className="avd-header">
          <button className="avd-back" onClick={() => router.back()}>
            <ArrowLeft size={16} />
          </button>
          <div className="avd-header-info">
            <div className="avd-header-name">{data.name}</div>
            <div className="avd-header-email">{data.email}</div>
          </div>
          <StatusBadge status={data.vendorStatus} />
        </header>

        {/* Main */}
        <main className="avd-main">
          {/* Left */}
          <div>
            <motion.div className="avd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="avd-card-title"><Car size={16} /> Vehicle Details</div>
              <InfoRow label="Vehicle Type" value={data.vehicle?.type} />
              <InfoRow label="Registration Number" value={data.vehicle?.number} />
              <InfoRow label="Model" value={data.vehicle?.model} />
            </motion.div>

            <motion.div className="avd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="avd-card-title"><FileText size={16} /> Documents</div>
              <div className="avd-docs-grid">
                <DocCard label="Aadhaar" url={data.documents?.aadhaarUrl} />
                <DocCard label="License" url={data.documents?.licenseUrl} />
                <DocCard label="RC" url={data.documents?.rcUrl} />
              </div>
            </motion.div>
          </div>

          {/* Right */}
          <div>
            <motion.div className="avd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="avd-card-title"><Landmark size={16} /> Bank Details</div>
              <InfoRow label="Account Holder" value={data.bank?.accountHolderName} />
              <InfoRow label="IFSC Code" value={data.bank?.ifsc} />
              <InfoRow label="UPI ID" value={data.bank?.upi || '—'} />
            </motion.div>

            {data.vendorStatus === 'pending' && (
              <motion.div className="avd-decision" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="avd-decision-title"><ShieldCheck size={16} /> Admin Decision</div>
                <div className="avd-decision-sub">Verify all documents before approving.</div>
                <button className="avd-approve-btn" onClick={() => setShowApprove(true)}>Approve Vendor</button>
                <button className="avd-reject-btn" onClick={() => setShowReject(true)}>Reject Vendor</button>
              </motion.div>
            )}
          </div>
        </main>

        {/* Approve Modal */}
        <AnimatePresence>
          {showApprove && (
            <motion.div className="avd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="avd-modal" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
                <h3>Approve Vendor?</h3>
                <p>Confirm all information and documents have been verified.</p>
                <div className="avd-modal-btns">
                  <button className="avd-modal-cancel" onClick={() => setShowApprove(false)}>Cancel</button>
                  <button className="avd-modal-confirm" onClick={approveVendor} disabled={actionLoading}>
                    {actionLoading && <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
                    Yes, Approve
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reject Modal */}
        <AnimatePresence>
          {showReject && (
            <motion.div className="avd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="avd-modal" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
                <h3>Reject Vendor</h3>
                <p>Please provide a reason for rejection.</p>
                <textarea placeholder="Enter rejection reason (required)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                <div className="avd-modal-btns">
                  <button className="avd-modal-cancel" onClick={() => setShowReject(false)}>Cancel</button>
                  <button className="avd-modal-confirm danger" onClick={rejectVendor} disabled={actionLoading || !rejectReason.trim()}>
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

function InfoRow({ label, value }: any) {
  return (
    <div className="avd-info-row">
      <span className="avd-info-label">{label}</span>
      <span className="avd-info-value">{value || '—'}</span>
    </div>
  );
}

function DocCard({ label, url }: any) {
  const isImage = url?.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPdf = url?.endsWith('.pdf');
  return (
    <div className="avd-doc-card">
      <div className="avd-doc-label">{label}</div>
      <div className="avd-doc-preview">
        {!url && <FileText size={28} />}
        {isImage && <img src={url} alt={label} />}
        {isPdf && <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} />}
      </div>
      {url && <a href={url} target="_blank" className="avd-doc-link">Open document →</a>}
    </div>
  );
}

function StatusBadge({ status }: any) {
  if (status === 'approved') return <span className="avd-badge" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}><CheckCircle size={13} /> Approved</span>;
  if (status === 'rejected') return <span className="avd-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}><XCircle size={13} /> Rejected</span>;
  return <span className="avd-badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}><Clock size={13} /> Pending</span>;
}