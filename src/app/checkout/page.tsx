'use client'

import { useState, useEffect } from 'react'
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

export default function CheckoutPage() {
  const params = useSearchParams()
  const router = useRouter()

  const [loading,   setLoading]   = useState(false)
  const [requested, setRequested] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [countdown, setCountdown] = useState(TIMEOUT_SECONDS)

  const pickup      = decodeURIComponent(params.get('pickup')      || '')
  const drop        = decodeURIComponent(params.get('drop')        || '')
  const vehicle     = params.get('vehicle')     || 'bike'
  const vehicleName = params.get('vehicleName') || 'Vehicle'
  const fare        = params.get('fare')        || '0'
  const rating      = params.get('rating')      || '4.5'

  // Countdown starts after ride is requested; auto-cancel when it hits 0
  useEffect(() => {
    if (!requested || cancelled) return
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setCancelled(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [requested, cancelled])

  const handleRequest = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    setRequested(true)
  }

  // Cancelled screen (manual or timeout)
  if (cancelled) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .co-screen {
            min-height: 100svh; background: #f4f4f6;
            font-family: 'Inter', sans-serif;
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; padding: 2rem; text-align: center;
          }
          .co-icon {
            width: 72px; height: 72px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.5rem;
            animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
          }
          @keyframes pop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
          .co-title { font-size: 24px; font-weight: 800; color: #111; letter-spacing: -0.5px; margin-bottom: 0.5rem; }
          .co-sub { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 2rem; max-width: 280px; }
          .co-btn-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
          .co-btn { padding: 14px 32px; border-radius: 14px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
          .co-btn-dark { background: #111; color: #fff; }
          .co-btn-dark:hover { background: #000; transform: translateY(-1px); }
          .co-btn-light { background: #fff; color: #111; border: 1.5px solid #e8e8e8; }
          .co-btn-light:hover { background: #f5f5f5; }
        `}</style>
        <div className="co-screen">
          <div className="co-icon" style={{ background: '#fee2e2' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </div>
          <div className="co-title">Ride Cancelled</div>
          <p className="co-sub">
            {countdown === 0
              ? 'No driver responded in time. Please try again.'
              : 'Your ride request has been cancelled.'}
          </p>
          <div className="co-btn-row">
            <button className="co-btn co-btn-dark" onClick={() => router.back()}>Try Again</button>
            <button className="co-btn co-btn-light" onClick={() => router.push('/')}>Go Home</button>
          </div>
        </div>
      </>
    )
  }

  // Waiting for driver — same design as screenshot 1
  if (requested) {
    const mins = Math.floor(countdown / 60)
    const secs = String(countdown % 60).padStart(2, '0')

    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .co-screen {
            min-height: 100svh; background: #f4f4f6;
            font-family: 'Inter', sans-serif;
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; padding: 2rem; text-align: center;
          }
          .co-conf-icon {
            width: 72px; height: 72px; border-radius: 50%;
            background: #111; display: flex; align-items: center; justify-content: center;
            color: #fff; margin: 0 auto 1.5rem;
            animation: confPop 0.5s cubic-bezier(0.34,1.56,0.64,1);
          }
          @keyframes confPop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
          .co-conf-title { font-size: 26px; font-weight: 800; color: #111; letter-spacing: -0.8px; margin-bottom: 0.4rem; }
          .co-conf-sub { font-size: 14px; color: #888; text-align: center; margin-bottom: 2rem; line-height: 1.5; }
          .co-conf-timer {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            background: #fff; border: 1.5px solid #e8e8e8;
            border-radius: 14px; padding: 14px 24px; margin-bottom: 1.5rem;
            font-size: 15px; font-weight: 600; color: #111;
          }
          .co-conf-timer-dot {
            width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
            animation: timerPulse 1s infinite;
          }
          @keyframes timerPulse { 0%,100%{opacity:1}50%{opacity:0.3} }
          .co-conf-details {
            width: 100%; max-width: 420px;
            background: #fff; border: 1.5px solid #ebebeb; border-radius: 16px;
            overflow: hidden; margin-bottom: 1.5rem;
          }
          .co-conf-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 16px; border-bottom: 1px solid #f5f5f5; font-size: 13px;
          }
          .co-conf-row:last-child { border-bottom: none; }
          .co-conf-row span:first-child { color: #aaa; font-weight: 500; }
          .co-conf-row span:last-child { color: #111; font-weight: 600; max-width: 220px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .co-home-btn {
            width: 100%; max-width: 420px; padding: 15px;
            background: #111; color: #fff; border: none; border-radius: 14px;
            font-size: 15px; font-weight: 600; cursor: pointer;
            font-family: inherit; transition: all 0.2s;
          }
          .co-home-btn:hover { background: #000; transform: translateY(-1px); }
        `}</style>
        <div className="co-screen">
          <div className="co-conf-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div className="co-conf-title">Ride Requested!</div>
          <p className="co-conf-sub">Driver is reviewing your request.<br/>You'll get a confirmation shortly.</p>
          <div className="co-conf-timer">
            <div className="co-conf-timer-dot" />
            Driver responding in {mins}:{secs}
          </div>
          <div className="co-conf-details">
            {[
              ['Vehicle',   vehicleName],
              ['Pickup',    pickup],
              ['Drop',      drop],
              ['Est. Fare', `₹${fare}`],
              ['Rating',    `★ ${rating}`],
            ].map(([l, v]) => (
              <div className="co-conf-row" key={l}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>
          <button className="co-home-btn" onClick={() => router.push('/')}>← Back to Home</button>
        </div>
      </>
    )
  }

  // Checkout / confirm screen
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .co-page {
          min-height: 100svh; background: #f4f4f6;
          font-family: 'Inter', -apple-system, sans-serif;
          display: flex; flex-direction: column; align-items: center;
          padding: 0 1rem 4rem;
        }
        .co-topbar { width: 100%; max-width: 760px; padding: 1.25rem 0 1rem; display: flex; align-items: center; gap: 12px; }
        .co-back {
          width: 36px; height: 36px; border-radius: 50%;
          background: #fff; border: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #111; text-decoration: none; transition: all 0.2s; flex-shrink: 0;
        }
        .co-back:hover { background: #f0f0f0; }
        .co-topbar-label { font-size: 11px; color: #aaa; letter-spacing: 1px; font-weight: 700; }
        .co-topbar-title { font-size: 24px; font-weight: 800; color: #111; letter-spacing: -0.8px; }
        .co-grid { width: 100%; max-width: 760px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .co-card { background: #fff; border: 1.5px solid #ebebeb; border-radius: 20px; padding: 1.5rem; }
        .co-card-label { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #aaa; margin-bottom: 0.6rem; }
        .co-veh-badge { width: 48px; height: 48px; border-radius: 14px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #333; }
        .co-route { margin-bottom: 1rem; }
        .co-route-row { display: flex; align-items: flex-start; gap: 10px; padding: 5px 0; }
        .co-route-dot-fill { width: 8px; height: 8px; border-radius: 50%; background: #111; flex-shrink: 0; margin-top: 4px; }
        .co-route-dot-empty { width: 8px; height: 8px; border-radius: 50%; border: 2px solid #111; flex-shrink: 0; margin-top: 4px; }
        .co-route-connector { width: 1px; height: 14px; background: #ddd; margin-left: 3px; margin-bottom: 2px; }
        .co-route-label { font-size: 9px; color: #bbb; letter-spacing: 1px; font-weight: 700; }
        .co-route-text { font-size: 13px; color: #111; font-weight: 500; line-height: 1.3; }
        .co-fare-row { padding-top: 1rem; border-top: 1px solid #f0f0f0; }
        .co-fare-label { font-size: 11px; color: #aaa; font-weight: 500; }
        .co-fare-amt { font-size: 36px; font-weight: 800; color: #111; letter-spacing: -1.5px; }
        .co-fare-note { font-size: 11px; color: #bbb; margin-top: 3px; }
        .co-confirm-label { font-size: 10px; color: #aaa; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 0.75rem; }
        .co-confirm-title { font-size: 22px; font-weight: 800; color: #111; letter-spacing: -0.5px; margin-bottom: 1.25rem; }
        .co-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem; }
        .co-feature { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #555; font-weight: 500; }
        .co-feature-icon { width: 32px; height: 32px; border-radius: 10px; background: #f4f4f4; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #555; }
        .co-req-btn {
          width: 100%; padding: 16px; background: #111; color: #fff; border: none; border-radius: 14px;
          font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.25s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .co-req-btn:hover:not(:disabled) { background: #000; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .co-req-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .co-secure { display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 11px; color: #bbb; margin-top: 8px; }
        .co-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) { .co-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="co-page">
        <div className="co-topbar">
          <Link href="/search" className="co-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <div className="co-topbar-label">BOOKING</div>
            <div className="co-topbar-title">Checkout</div>
            <div style={{ fontSize: 13, color: '#aaa', marginTop: 1 }}>Review your ride and confirm</div>
          </div>
        </div>

        <div className="co-grid">
          <div className="co-card">
            <div className="co-card-label">SELECTED VEHICLE</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: -1 }}>{vehicleName.split(' ')[0]}</div>
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
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>, text: 'Driver responds within 2 minutes' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>, text: 'Verified & insured drivers only' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>, text: 'Pay only after driver accepts' },
              ].map((f, i) => (
                <div className="co-feature" key={i}>
                  <div className="co-feature-icon">{f.icon}</div>{f.text}
                </div>
              ))}
            </div>
            <button className="co-req-btn" onClick={handleRequest} disabled={loading}>
              {loading ? <><div className="co-spinner"/> Requesting...</> : <>Request Ride →</>}
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