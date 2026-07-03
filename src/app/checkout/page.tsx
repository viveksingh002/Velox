'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VehicleIcon({ type }: { type: string }) {
  if (type === 'bike') return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <circle cx="11" cy="34" r="7" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="37" cy="34" r="7" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M11 34 L20 20 L28 20 L37 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20 L24 14 L30 14 L32 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20 L28 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
  if (type === 'car') return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="26" width="40" height="10" rx="3" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M10 26 L15 16 L33 16 L38 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="13" cy="36" r="4.5" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="35" cy="36" r="4.5" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  )
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <rect x="3" y="24" width="42" height="12" rx="3" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M8 24 L11 13 L37 13 L40 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="36" r="5" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="36" cy="36" r="5" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  )
}

const TIMEOUT_SECONDS = 120
const API = "http://localhost:5000/api"

export default function CheckoutPage() {
  const params  = useSearchParams()
  const router  = useRouter()

  const pickup      = decodeURIComponent(params.get('pickup')      || '')
  const drop        = decodeURIComponent(params.get('drop')        || '')
  const vehicle     = params.get('vehicle')     || 'bike'
  const vehicleName = params.get('vehicleName') || 'Vehicle'
  const fare        = params.get('fare')        || '0'
  const rating      = params.get('rating')      || '4.5'

  // Stages: idle → loading → finding → accepted → payment → cancelled
  const [stage,       setStage]       = useState<'idle'|'loading'|'finding'|'accepted'|'payment'|'cancelled'>('idle')
  const [countdown,   setCountdown]   = useState(TIMEOUT_SECONDS)
  const [bookingId,   setBookingId]   = useState('')
  const [driverName,  setDriverName]  = useState('Driver')
  const [payMethod,   setPayMethod]   = useState<'cash'|'online'|''>('')

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Countdown timer when finding driver
  useEffect(() => {
    if (stage !== 'finding') return
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          stopPolling()
          setStage('cancelled')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [stage])

  // Poll booking status every 3s
  const startPolling = (id: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API}/booking/${id}/status`)
        const data = await res.json()
        if (data.success && data.status === 'accepted') {
          stopPolling()
          setDriverName(data.driverName || 'Driver')
          setStage('accepted')
          // After 2s show payment screen
          setTimeout(() => setStage('payment'), 2000)
        }
      } catch {}
    }, 3000)
  }

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  useEffect(() => () => stopPolling(), [])

  // Request ride
  const handleRequest = async () => {
    setStage('loading')
    try {
      const res  = await fetch(`${API}/booking`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pickup, drop, vehicle, price: Number(fare) }),
      })
      const data = await res.json()
      if (data.success) {
        setBookingId(data.data._id)
        setStage('finding')
        startPolling(data.data._id)
      } else {
        alert('Booking failed. Try again.')
        setStage('idle')
      }
    } catch {
      alert('Server se connect nahi ho pa raha!')
      setStage('idle')
    }
  }

  const handlePayment = () => {
    if (!payMethod) return
    // Navigate to tracking page
    router.push(`/ride/${bookingId}?driverName=${encodeURIComponent(driverName)}&pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}&fare=${fare}&vehicle=${vehicle}&payMethod=${payMethod}`)
  }

  const mins = Math.floor(countdown / 60)
  const secs = String(countdown % 60).padStart(2, '0')

  // ── CANCELLED ──────────────────────────────────────────────────────────────
  if (stage === 'cancelled') return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .co-screen{min-height:100svh;background:#f4f4f6;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center}
        .co-icon{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;animation:pop 0.4s cubic-bezier(0.34,1.56,0.64,1)}
        @keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
        .co-title{font-size:24px;font-weight:800;color:#111;letter-spacing:-0.5px;margin-bottom:.5rem}
        .co-sub{font-size:14px;color:#888;line-height:1.6;margin-bottom:2rem;max-width:280px}
        .co-btn-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
        .co-btn{padding:14px 32px;border-radius:14px;border:none;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
        .co-btn-dark{background:#111;color:#fff}.co-btn-dark:hover{background:#000;transform:translateY(-1px)}
        .co-btn-light{background:#fff;color:#111;border:1.5px solid #e8e8e8}.co-btn-light:hover{background:#f5f5f5}
      `}</style>
      <div className="co-screen">
        <div className="co-icon" style={{ background:'#fee2e2' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </div>
        <div className="co-title">Ride Cancelled</div>
        <p className="co-sub">{countdown === 0 ? 'No driver responded in time. Please try again.' : 'Your ride request has been cancelled.'}</p>
        <div className="co-btn-row">
          <button className="co-btn co-btn-dark" onClick={() => { setStage('idle'); setCountdown(TIMEOUT_SECONDS) }}>Try Again</button>
          <button className="co-btn co-btn-light" onClick={() => router.push('/')}>Go Home</button>
        </div>
      </div>
    </>
  )

  // ── FINDING DRIVER ─────────────────────────────────────────────────────────
  if (stage === 'finding') return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .co-screen{min-height:100svh;background:#f4f4f6;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center}
        .co-spin-ring{width:72px;height:72px;border-radius:50%;border:3px solid #e5e7eb;border-top-color:#111;animation:spin .9s linear infinite;margin:0 auto 1.5rem}
        @keyframes spin{to{transform:rotate(360deg)}}
        .co-conf-title{font-size:26px;font-weight:800;color:#111;letter-spacing:-.8px;margin-bottom:.4rem}
        .co-conf-sub{font-size:14px;color:#888;margin-bottom:2rem;line-height:1.5}
        .co-conf-timer{display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;border:1.5px solid #e8e8e8;border-radius:14px;padding:14px 24px;margin-bottom:1.5rem;font-size:15px;font-weight:600;color:#111}
        .co-timer-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;animation:pulse 1s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .co-conf-details{width:100%;max-width:420px;background:#fff;border:1.5px solid #ebebeb;border-radius:16px;overflow:hidden;margin-bottom:1.5rem}
        .co-conf-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #f5f5f5;font-size:13px}
        .co-conf-row:last-child{border-bottom:none}
        .co-conf-row span:first-child{color:#aaa;font-weight:500}
        .co-conf-row span:last-child{color:#111;font-weight:600;max-width:220px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .co-cancel-btn{width:100%;max-width:420px;padding:15px;background:#fff;color:#111;border:1.5px solid #e8e8e8;border-radius:14px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}
      `}</style>
      <div className="co-screen">
        <div className="co-spin-ring" />
        <div className="co-conf-title">Finding Your Driver</div>
        <p className="co-conf-sub">Waiting for driver to accept...</p>
        <div className="co-conf-timer">
          <div className="co-timer-dot" />
          Driver responding in {mins}:{secs}
        </div>
        <div className="co-conf-details">
          {[['Vehicle', vehicleName], ['Pickup', pickup], ['Drop', drop], ['Est. Fare', `₹${fare}`]].map(([l, v]) => (
            <div className="co-conf-row" key={l}><span>{l}</span><span>{v}</span></div>
          ))}
        </div>
        <button className="co-cancel-btn" onClick={() => { stopPolling(); setStage('cancelled') }}>
          ✕ Cancel Request
        </button>
      </div>
    </>
  )

  // ── DRIVER ACCEPTED ────────────────────────────────────────────────────────
  if (stage === 'accepted') return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .co-screen{min-height:100svh;background:#f4f4f6;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center}
        .co-acc-icon{width:72px;height:72px;border-radius:50%;background:#111;display:flex;align-items:center;justify-content:center;color:#fff;margin:0 auto 1.5rem;animation:pop .5s cubic-bezier(0.34,1.56,0.64,1)}
        @keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
        .co-conf-title{font-size:26px;font-weight:800;color:#111;letter-spacing:-.8px;margin-bottom:.4rem}
        .co-conf-sub{font-size:14px;color:#888;margin-bottom:1rem;line-height:1.5}
        .co-progress{width:200px;height:3px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin:0 auto}
        .co-progress-bar{height:100%;background:#111;border-radius:99px;animation:fill 2s linear forwards}
        @keyframes fill{from{width:0}to{width:100%}}
      `}</style>
      <div className="co-screen">
        <div className="co-acc-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <div className="co-conf-title">Driver Accepted!</div>
        <p className="co-conf-sub">{driverName} is on the way.<br/>Preparing payment options...</p>
        <div className="co-progress"><div className="co-progress-bar" /></div>
      </div>
    </>
  )

  // ── PAYMENT SELECTION ──────────────────────────────────────────────────────
  if (stage === 'payment') return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .co-page{min-height:100svh;background:#f4f4f6;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;padding:0 1rem 4rem}
        .co-topbar{width:100%;max-width:760px;padding:1.25rem 0 1rem;display:flex;align-items:center;gap:12px}
        .co-grid{width:100%;max-width:760px;display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .co-card{background:#fff;border:1.5px solid #ebebeb;border-radius:20px;padding:1.5rem}
        .co-card-label{font-size:10px;font-weight:800;letter-spacing:1.5px;color:#aaa;margin-bottom:.6rem}
        .co-veh-badge{width:48px;height:48px;border-radius:14px;background:#111;display:flex;align-items:center;justify-content:center;color:#fff}
        .co-route-row{display:flex;align-items:flex-start;gap:10px;padding:5px 0}
        .co-route-dot-fill{width:8px;height:8px;border-radius:50%;background:#111;flex-shrink:0;margin-top:4px}
        .co-route-dot-empty{width:8px;height:8px;border-radius:50%;border:2px solid #111;flex-shrink:0;margin-top:4px}
        .co-route-connector{width:1px;height:14px;background:#ddd;margin-left:3px;margin-bottom:2px}
        .co-route-label{font-size:9px;color:#bbb;letter-spacing:1px;font-weight:700}
        .co-route-text{font-size:13px;color:#111;font-weight:500;line-height:1.3}
        .co-fare-row{padding-top:1rem;border-top:1px solid #f0f0f0}
        .co-fare-amt{font-size:36px;font-weight:800;color:#111;letter-spacing:-1.5px}
        .co-pay-option{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:14px;border:1.5px solid #e8e8e8;cursor:pointer;margin-bottom:10px;transition:all .2s;background:#fff}
        .co-pay-option.selected{border-color:#111;background:#111;color:#fff}
        .co-pay-icon{width:36px;height:36px;border-radius:10px;background:#f4f4f4;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .co-pay-option.selected .co-pay-icon{background:rgba(255,255,255,.15)}
        .co-pay-name{font-size:14px;font-weight:700}
        .co-pay-sub{font-size:12px;color:#888;margin-top:2px}
        .co-pay-option.selected .co-pay-sub{color:rgba(255,255,255,.7)}
        .co-pay-check{margin-left:auto;width:20px;height:20px;border-radius:50%;border:2px solid #e8e8e8;display:flex;align-items:center;justify-content:center}
        .co-pay-option.selected .co-pay-check{border-color:#fff;background:#fff}
        .co-proceed-btn{width:100%;padding:16px;background:#111;color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px}
        .co-proceed-btn:disabled{opacity:.4;cursor:not-allowed}
        .co-proceed-btn:not(:disabled):hover{background:#000;transform:translateY(-1px)}
        .co-secure{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;color:#bbb;margin-top:8px}
        @media(max-width:600px){.co-grid{grid-template-columns:1fr}}
      `}</style>
      <div className="co-page">
        <div className="co-topbar">
          <div style={{ fontSize:11,color:'#aaa',letterSpacing:1,fontWeight:700 }}>BOOKING</div>
          <div style={{ fontSize:22,fontWeight:800,color:'#111',letterSpacing:-.8 }}>Checkout</div>
        </div>
        <div className="co-grid">
          {/* Left — ride summary */}
          <div className="co-card">
            <div className="co-card-label">SELECTED VEHICLE</div>
            <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1.25rem' }}>
              <div style={{ fontSize:28,fontWeight:800,color:'#111',letterSpacing:-1 }}>{vehicleName.split(' ')[0]}</div>
              <div className="co-veh-badge"><VehicleIcon type={vehicle} /></div>
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <div className="co-route-row">
                <div className="co-route-dot-fill" />
                <div><div className="co-route-label">PICKUP</div><div className="co-route-text">{pickup}</div></div>
              </div>
              <div className="co-route-connector" />
              <div className="co-route-row">
                <div className="co-route-dot-empty" />
                <div><div className="co-route-label">DROP</div><div className="co-route-text">{drop}</div></div>
              </div>
            </div>
            <div className="co-fare-row">
              <div style={{ fontSize:11,color:'#aaa',fontWeight:500 }}>TOTAL FARE</div>
              <div className="co-fare-amt">₹{fare}</div>
              <div style={{ fontSize:11,color:'#bbb',marginTop:3 }}>Includes base + distance charges</div>
            </div>
          </div>

          {/* Right — payment */}
          <div className="co-card">
            <div className="co-card-label">ALMOST THERE</div>
            <div style={{ fontSize:22,fontWeight:800,color:'#111',letterSpacing:-.5,marginBottom:'1.25rem' }}>Select Payment</div>

            {[
              { id:'cash',   name:'Cash',           sub:'Pay driver after ride',      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg> },
              { id:'online', name:'Online Payment',  sub:'UPI · Card · Netbanking',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg> },
            ].map(opt => (
              <div key={opt.id} className={`co-pay-option${payMethod===opt.id?' selected':''}`} onClick={() => setPayMethod(opt.id as 'cash'|'online')}>
                <div className="co-pay-icon">{opt.icon}</div>
                <div>
                  <div className="co-pay-name">{opt.name}</div>
                  <div className="co-pay-sub">{opt.sub}</div>
                </div>
                <div className="co-pay-check">
                  {payMethod===opt.id && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
              </div>
            ))}

            <button className="co-proceed-btn" disabled={!payMethod} onClick={handlePayment}>
              {payMethod ? 'Proceed to Payment →' : 'Select a Method'}
            </button>
            <div className="co-secure">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Secure & verified booking
            </div>
          </div>
        </div>
      </div>
    </>
  )

  // ── CHECKOUT (default) ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .co-page{min-height:100svh;background:#f4f4f6;font-family:'Inter',-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;padding:0 1rem 4rem}
        .co-topbar{width:100%;max-width:760px;padding:1.25rem 0 1rem;display:flex;align-items:center;gap:12px}
        .co-back{width:36px;height:36px;border-radius:50%;background:#fff;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#111;text-decoration:none;transition:all .2s;flex-shrink:0}
        .co-back:hover{background:#f0f0f0}
        .co-grid{width:100%;max-width:760px;display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .co-card{background:#fff;border:1.5px solid #ebebeb;border-radius:20px;padding:1.5rem}
        .co-card-label{font-size:10px;font-weight:800;letter-spacing:1.5px;color:#aaa;margin-bottom:.6rem}
        .co-veh-badge{width:48px;height:48px;border-radius:14px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#333}
        .co-route{margin-bottom:1rem}
        .co-route-row{display:flex;align-items:flex-start;gap:10px;padding:5px 0}
        .co-route-dot-fill{width:8px;height:8px;border-radius:50%;background:#111;flex-shrink:0;margin-top:4px}
        .co-route-dot-empty{width:8px;height:8px;border-radius:50%;border:2px solid #111;flex-shrink:0;margin-top:4px}
        .co-route-connector{width:1px;height:14px;background:#ddd;margin-left:3px;margin-bottom:2px}
        .co-route-label{font-size:9px;color:#bbb;letter-spacing:1px;font-weight:700}
        .co-route-text{font-size:13px;color:#111;font-weight:500;line-height:1.3}
        .co-fare-row{padding-top:1rem;border-top:1px solid #f0f0f0}
        .co-fare-label{font-size:11px;color:#aaa;font-weight:500}
        .co-fare-amt{font-size:36px;font-weight:800;color:#111;letter-spacing:-1.5px}
        .co-fare-note{font-size:11px;color:#bbb;margin-top:3px}
        .co-confirm-label{font-size:10px;color:#aaa;letter-spacing:1.5px;font-weight:700;margin-bottom:.75rem}
        .co-confirm-title{font-size:22px;font-weight:800;color:#111;letter-spacing:-.5px;margin-bottom:1.25rem}
        .co-features{display:flex;flex-direction:column;gap:10px;margin-bottom:1.5rem}
        .co-feature{display:flex;align-items:center;gap:10px;font-size:13px;color:#555;font-weight:500}
        .co-feature-icon{width:32px;height:32px;border-radius:10px;background:#f4f4f4;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#555}
        .co-req-btn{width:100%;padding:16px;background:#111;color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:8px}
        .co-req-btn:hover:not(:disabled){background:#000;transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,.2)}
        .co-req-btn:disabled{opacity:.6;cursor:not-allowed}
        .co-secure{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;color:#bbb;margin-top:8px}
        .co-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:600px){.co-grid{grid-template-columns:1fr}}
      `}</style>

      <div className="co-page">
        <div className="co-topbar">
          <Link href="/search" className="co-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <div>
            <div style={{ fontSize:11,color:'#aaa',letterSpacing:1,fontWeight:700 }}>BOOKING</div>
            <div style={{ fontSize:24,fontWeight:800,color:'#111',letterSpacing:-.8 }}>Checkout</div>
            <div style={{ fontSize:13,color:'#aaa',marginTop:1 }}>Review your ride and confirm</div>
          </div>
        </div>

        <div className="co-grid">
          <div className="co-card">
            <div className="co-card-label">SELECTED VEHICLE</div>
            <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1.25rem' }}>
              <div style={{ fontSize:28,fontWeight:800,color:'#111',letterSpacing:-1 }}>{vehicleName.split(' ')[0]}</div>
              <div className="co-veh-badge"><VehicleIcon type={vehicle} /></div>
            </div>
            <div className="co-route">
              <div className="co-route-row">
                <div className="co-route-dot-fill" />
                <div><div className="co-route-label">PICKUP</div><div className="co-route-text">{pickup}</div></div>
              </div>
              <div className="co-route-connector" />
              <div className="co-route-row">
                <div className="co-route-dot-empty" />
                <div><div className="co-route-label">DROP</div><div className="co-route-text">{drop}</div></div>
              </div>
            </div>
            <div className="co-fare-row">
              <div className="co-fare-label">TOTAL FARE</div>
              <div className="co-fare-amt">₹{fare}</div>
              <div className="co-fare-note">Includes base + distance charges</div>
            </div>
          </div>

          <div className="co-card">
            <div className="co-confirm-label">READY TO GO?</div>
            <div className="co-confirm-title">Confirm Your Ride</div>
            <div className="co-features">
              {[
                { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>, text:'Driver responds within 2 minutes' },
                { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>, text:'Verified & insured drivers only' },
                { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>, text:'Pay only after driver accepts' },
              ].map((f,i) => (
                <div className="co-feature" key={i}>
                  <div className="co-feature-icon">{f.icon}</div>{f.text}
                </div>
              ))}
            </div>
            <button className="co-req-btn" onClick={handleRequest} disabled={stage==='loading'}>
              {stage==='loading' ? <><div className="co-spinner"/> Requesting...</> : <>Request Ride →</>}
            </button>
            <div className="co-secure">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Secure & verified booking
            </div>
          </div>
        </div>
      </div>
    </>
  )
}