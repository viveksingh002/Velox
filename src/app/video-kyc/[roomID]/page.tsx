'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Mic, MicOff, Video, VideoOff, Phone, ArrowLeft, Shield } from 'lucide-react'
import axios from 'axios'

export default function VideoKYCPage() {
  const { roomID } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const role = searchParams.get('role') || 'vendor' // 'admin' or 'vendor'
  const vendorId = searchParams.get('vendorId') || ''

  const containerRef = useRef<HTMLDivElement>(null)
  const zegoRef = useRef<any>(null)
  const hasInitialized = useRef(false)

  const [joined, setJoined] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

  const APP_ID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
  const SERVER_SECRET = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || ''

  const safeDestroyZego = async () => {
  if (!zegoRef.current) return
  const z = zegoRef.current
  zegoRef.current = null

  // Zego SDK has an internal bug — destroy() sometimes throws an
  // async "createSpan" error outside the normal call stack, which a
  // regular try/catch cannot catch. Suppress only that specific error
  // for a short window while destroy cleans up.
  const suppressZegoError = (e: ErrorEvent) => {
    if (e?.message?.includes('createSpan')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
  window.addEventListener('error', suppressZegoError)

  try {
    await Promise.resolve(z.destroy?.())
  } catch (e) {
    // ignore — handled by listener above too
  } finally {
    setTimeout(() => {
      window.removeEventListener('error', suppressZegoError)
    }, 1000)
  }
}

  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false

    const init = async () => {
      // Strict-mode double mount guard: wait for any pending destroy first
      if (hasInitialized.current) {
        await safeDestroyZego()
      }
      hasInitialized.current = true

      try {
        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt')

        if (cancelled) return

        const userID = role === 'admin' ? `admin_${Date.now()}` : `vendor_${Date.now()}`
        const userName = role === 'admin' ? 'Admin' : 'Vendor'

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          APP_ID,
          SERVER_SECRET,
          String(roomID),
          userID,
          userName
        )

        const zego = ZegoUIKitPrebuilt.create(kitToken)

        if (cancelled) {
          try { zego.destroy?.() } catch (e) {}
          return
        }

        zegoRef.current = zego

        zego.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showPreJoinView: false,
          showLeaveRoomConfirmDialog: false,
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: false,
          showMyMicrophoneToggleButton: false,
          showAudioVideoSettingsButton: false,
          showScreenSharingButton: false,
          showTextChat: false,
          showUserList: false,
          showRoomDetailsButton: false,
          showLeavingView: false,
          onJoinRoom: () => {
            if (!cancelled) {
              setJoined(true)
              setLoading(false)
            }
          },
          onLeaveRoom: () => {
            router.back()
          },
          onUserJoin: () => {},
          onUserLeave: () => {},
        })
      } catch (err) {
        console.error('Zego init error:', err)
        if (!cancelled) {
          setError('Failed to connect. Please try again.')
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      cancelled = true
      safeDestroyZego()
      hasInitialized.current = false
    }
  }, [])

  const toggleMic = () => {
    zegoRef.current?.turnMicrophoneOn?.(!micOn)
    setMicOn(p => !p)
  }

  const toggleCam = () => {
    zegoRef.current?.turnCameraOn?.(!camOn)
    setCamOn(p => !p)
  }

  // ✅ Vendor-side polling: detect when admin approves/rejects during the call
  useEffect(() => {
    if (role !== 'vendor') return
    const email = typeof window !== 'undefined' ? localStorage.getItem('velox_vendor_email') : null
    if (!email) return

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vendor/status/${encodeURIComponent(email)}`)
        const data = await res.json()
        if (data.success && data.videoKycStatus === 'completed') {
          clearInterval(poll)
          await safeDestroyZego()
          setDone(data.status === 'approved' ? 'approved' : 'rejected')
        }
      } catch {
        // ignore transient errors, keep polling
      }
    }, 3000)

    return () => clearInterval(poll)
  }, [role])

  const handleApprove = async () => {
    setActionLoading('approve')
    try {
      await axios.post(`/api/admin/vendors/${vendorId}/approve`)
      await axios.patch(`/api/admin/vendors/video-kyc/complete/${vendorId}`)
      await safeDestroyZego()
      setDone('approved')
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setActionLoading('reject')
    try {
      await axios.post(`/api/admin/vendors/${vendorId}/reject`, { reason: rejectReason })
      await axios.patch(`/api/admin/vendors/video-kyc/complete/${vendorId}`)
      await safeDestroyZego()
      setDone('rejected')
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
      setShowRejectModal(false)
    }
  }

  // Done screen
  if (done) {
    const isVendor = role === 'vendor'
    const title = done === 'approved'
      ? (isVendor ? 'Congratulations! You\'re Approved 🎉' : 'Vendor Approved!')
      : (isVendor ? 'Application Rejected' : 'Vendor Rejected')
    const sub = done === 'approved'
      ? (isVendor ? 'Your Video KYC has been approved. You can now proceed to the next step.' : 'The vendor has been approved and can now receive bookings.')
      : (isVendor ? 'Your Video KYC was not approved. Please check your dashboard for details.' : `Vendor has been rejected. Reason: ${rejectReason}`)
    const redirectPath = isVendor ? '/partner/dashboard' : '/admin/dashboard'

    return (
      <>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}.vk-done{min-height:100svh;background:#08080d;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;padding:2rem}.vk-done-card{text-align:center;max-width:360px}.vk-done-icon{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;animation:pop 0.5s cubic-bezier(0.34,1.56,0.64,1)}@keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}.vk-done-title{font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.8px;margin-bottom:0.5rem}.vk-done-sub{font-size:14px;color:rgba(255,255,255,0.4);margin-bottom:2rem;line-height:1.6}.vk-done-btn{width:100%;padding:14px;background:#0071e3;color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 0 30px rgba(0,113,227,0.35)}`}</style>
        <div className="vk-done">
          <div className="vk-done-card">
            <div className="vk-done-icon" style={{ background: done === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: done === 'approved' ? '#10b981' : '#f87171' }}>
              {done === 'approved' ? <CheckCircle size={36}/> : <XCircle size={36}/>}
            </div>
            <div className="vk-done-title">{title}</div>
            <div className="vk-done-sub">{sub}</div>
            <button className="vk-done-btn" onClick={() => router.push(redirectPath)}>
              {isVendor ? 'Go to My Dashboard' : 'Back to Dashboard'}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .vk-root{height:100svh;background:#08080d;font-family:'Inter',-apple-system,sans-serif;color:#fff;display:flex;flex-direction:column;overflow:hidden}

        /* Header */
        .vk-header{display:flex;align-items:center;gap:12px;padding:1rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;z-index:10;background:#08080d}
        .vk-back{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,0.6);transition:all 0.2s}
        .vk-back:hover{background:rgba(255,255,255,0.1);color:#fff}
        .vk-title{font-size:15px;font-weight:700}
        .vk-sub{font-size:11px;color:rgba(255,255,255,0.35);margin-top:1px}
        .vk-live-badge{margin-left:auto;display:flex;align-items:center;gap:6px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25);padding:5px 12px;border-radius:980px;font-size:11px;font-weight:700;color:#f87171}
        .vk-live-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;animation:livePulse 1.5s infinite}
        @keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.3}}

        /* Video container */
        .vk-video-wrap{flex:1;position:relative;min-height:0}
        .vk-video-wrap > div{width:100%!important;height:100%!important}

        /* Loading overlay */
        .vk-loading{position:absolute;inset:0;background:#08080d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:5}
        .vk-loading-spinner{width:40px;height:40px;border:3px solid rgba(0,113,227,0.2);border-top-color:#0071e3;border-radius:50%;animation:spin 0.8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .vk-loading-text{font-size:14px;color:rgba(255,255,255,0.4)}

        /* Error */
        .vk-error{position:absolute;inset:0;background:#08080d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:5;padding:2rem;text-align:center}
        .vk-error-text{font-size:15px;color:#f87171;font-weight:600}
        .vk-error-btn{padding:11px 24px;background:#0071e3;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}

        /* Controls */
        .vk-controls{display:flex;align-items:center;justify-content:center;gap:12px;padding:1.25rem;border-top:1px solid rgba(255,255,255,0.06);flex-shrink:0;background:#08080d}
        .vk-ctrl-btn{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid rgba(255,255,255,0.1);transition:all 0.2s;font-size:13px;font-weight:700;font-family:inherit}
        .vk-ctrl-btn--on{background:rgba(255,255,255,0.08);color:#fff}
        .vk-ctrl-btn--on:hover{background:rgba(255,255,255,0.14)}
        .vk-ctrl-btn--off{background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.3);color:#f87171}
        .vk-ctrl-btn--off:hover{background:rgba(239,68,68,0.25)}
        .vk-ctrl-btn--end{background:rgba(239,68,68,0.85);border-color:transparent;color:#fff;width:56px;height:56px}
        .vk-ctrl-btn--end:hover{background:#ef4444}

        /* Admin action buttons */
        .vk-admin-actions{display:flex;gap:10px;padding:0 1.25rem 1.25rem;flex-shrink:0}
        .vk-approve-btn{flex:1;padding:13px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 0 20px rgba(16,185,129,0.35);transition:all 0.25s}
        .vk-approve-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 35px rgba(16,185,129,0.5)}
        .vk-approve-btn:disabled{opacity:0.5;cursor:not-allowed}
        .vk-reject-btn{flex:1;padding:13px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.25s}
        .vk-reject-btn:hover:not(:disabled){background:rgba(239,68,68,0.2)}
        .vk-reject-btn:disabled{opacity:0.5;cursor:not-allowed}
        .vk-btn-spinner{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;animation:spin 0.7s linear infinite}

        /* Reject modal */
        .vk-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(12px);z-index:999;display:flex;align-items:center;justify-content:center;padding:1.5rem}
        .vk-modal{width:100%;max-width:380px;background:rgba(14,14,26,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:22px;padding:2rem;box-shadow:0 32px 80px rgba(0,0,0,0.7)}
        .vk-modal h3{font-size:18px;font-weight:700;color:#fff;margin-bottom:0.5rem}
        .vk-modal p{font-size:13px;color:rgba(255,255,255,0.35);margin-bottom:1.25rem}
        .vk-modal textarea{width:100%;padding:12px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;outline:none;resize:none;min-height:80px;margin-bottom:1rem;transition:border-color 0.2s}
        .vk-modal textarea:focus{border-color:rgba(0,113,227,0.5)}
        .vk-modal textarea::placeholder{color:rgba(255,255,255,0.2)}
        .vk-modal-btns{display:flex;gap:10px}
        .vk-modal-cancel{flex:1;padding:12px;border-radius:12px;cursor:pointer;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.55);font-size:14px;font-weight:600;font-family:inherit;transition:all 0.2s}
        .vk-modal-cancel:hover{background:rgba(255,255,255,0.09);color:#fff}
        .vk-modal-confirm{flex:1;padding:12px;border-radius:12px;border:none;cursor:pointer;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-size:14px;font-weight:600;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s}
        .vk-modal-confirm:disabled{opacity:0.5;cursor:not-allowed}

        /* Room ID badge */
        .vk-room-badge{margin-left:auto;background:rgba(0,113,227,0.08);border:1px solid rgba(0,113,227,0.2);padding:4px 12px;border-radius:980px;font-size:10px;color:rgba(90,200,250,0.7);font-weight:700;letter-spacing:0.5px}
      `}</style>

      <div className="vk-root">
        {/* Header */}
        <div className="vk-header">
          <button className="vk-back" onClick={() => router.back()}><ArrowLeft size={16}/></button>
          <div>
            <div className="vk-title">
              <Shield size={13} style={{marginRight:6,verticalAlign:'middle',color:'#0071e3'}}/>
              Video KYC
            </div>
            <div className="vk-sub">{role === 'admin' ? 'Admin — Verify vendor identity' : 'Vendor — Identity verification call'}</div>
          </div>
          {joined && (
            <div className="vk-live-badge">
              <div className="vk-live-dot"/>
              LIVE
            </div>
          )}
          {!joined && <div className="vk-room-badge">Room: {String(roomID).slice(0,8)}...</div>}
        </div>

        {/* Video area */}
        <div className="vk-video-wrap">
          {loading && (
            <div className="vk-loading">
              <div className="vk-loading-spinner"/>
              <div className="vk-loading-text">Connecting to video call...</div>
            </div>
          )}
          {error && (
            <div className="vk-error">
              <div className="vk-error-text">{error}</div>
              <button className="vk-error-btn" onClick={() => window.location.reload()}>Try Again</button>
            </div>
          )}
          <div ref={containerRef} style={{width:'100%',height:'100%'}}/>
        </div>

        {/* Controls */}
        <div className="vk-controls">
          <button className={`vk-ctrl-btn ${micOn ? 'vk-ctrl-btn--on' : 'vk-ctrl-btn--off'}`} onClick={toggleMic}>
            {micOn ? <Mic size={18}/> : <MicOff size={18}/>}
          </button>
          <button className={`vk-ctrl-btn vk-ctrl-btn--end`} onClick={() => router.back()}>
            <Phone size={20}/>
          </button>
          <button className={`vk-ctrl-btn ${camOn ? 'vk-ctrl-btn--on' : 'vk-ctrl-btn--off'}`} onClick={toggleCam}>
            {camOn ? <Video size={18}/> : <VideoOff size={18}/>}
          </button>
        </div>

        {/* Admin approve/reject buttons */}
        {role === 'admin' && joined && (
          <div className="vk-admin-actions">
            <button className="vk-approve-btn" onClick={handleApprove} disabled={!!actionLoading}>
              {actionLoading === 'approve' ? <><div className="vk-btn-spinner"/> Approving...</> : <><CheckCircle size={15}/> Approve</>}
            </button>
            <button className="vk-reject-btn" onClick={() => setShowRejectModal(true)} disabled={!!actionLoading}>
              {actionLoading === 'reject' ? <><div className="vk-btn-spinner"/> Rejecting...</> : <><XCircle size={15}/> Reject</>}
            </button>
          </div>
        )}

        {/* Reject modal */}
        {showRejectModal && (
          <div className="vk-overlay">
            <div className="vk-modal">
              <h3>Reject Vendor?</h3>
              <p>Please provide a reason for rejection. This will be shared with the vendor.</p>
              <textarea
                placeholder="e.g. Documents not clear, face not matching..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
              <div className="vk-modal-btns">
                <button className="vk-modal-cancel" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button className="vk-modal-confirm" onClick={handleReject} disabled={!rejectReason.trim() || !!actionLoading}>
                  {actionLoading === 'reject' ? <><div className="vk-btn-spinner"/> Rejecting...</> : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}