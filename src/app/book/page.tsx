'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const vehicleTypes = [
  {
    id: 'bike', label: 'Bike', sub: 'Quick & affordable',
    icon: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <circle cx="11" cy="34" r="7" stroke="currentColor" strokeWidth="2"/>
        <circle cx="37" cy="34" r="7" stroke="currentColor" strokeWidth="2"/>
        <circle cx="11" cy="34" r="2.5" fill="currentColor" opacity="0.4"/>
        <circle cx="37" cy="34" r="2.5" fill="currentColor" opacity="0.4"/>
        <path d="M11 34 L20 20 L28 20 L37 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 20 L24 14 L30 14 L32 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30 14 L34 12 M30 14 L30 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M20 20 L28 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'auto', label: 'Auto', sub: 'Everyday rides',
    icon: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <path d="M8 28 L12 16 L36 16 L40 28 L40 36 L8 36 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 28 L16 20 L32 20 L34 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <circle cx="14" cy="36" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="34" cy="36" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="14" cy="36" r="2" fill="currentColor" opacity="0.35"/>
        <circle cx="34" cy="36" r="2" fill="currentColor" opacity="0.35"/>
        <rect x="8" y="30" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 'car', label: 'Car', sub: 'Comfort rides',
    icon: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="26" width="40" height="10" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 26 L15 16 L33 16 L38 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 26 L19 18 L29 18 L32 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <line x1="24" y1="18" x2="24" y2="26" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
        <circle cx="13" cy="36" r="4.5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="35" cy="36" r="4.5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="13" cy="36" r="1.8" fill="currentColor" opacity="0.35"/>
        <circle cx="35" cy="36" r="1.8" fill="currentColor" opacity="0.35"/>
      </svg>
    ),
  },
  {
    id: 'loading', label: 'Loading', sub: 'Load cargo',
    icon: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect x="2" y="20" width="30" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M32 26 L32 36 L46 36 L46 30 L42 22 L32 22 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="10" cy="36" r="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="24" cy="36" r="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="40" cy="36" r="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="10" cy="36" r="1.5" fill="currentColor" opacity="0.35"/>
        <circle cx="24" cy="36" r="1.5" fill="currentColor" opacity="0.35"/>
        <circle cx="40" cy="36" r="1.5" fill="currentColor" opacity="0.35"/>
      </svg>
    ),
  },
  {
    id: 'truck', label: 'Truck', sub: 'Heavy transport',
    icon: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect x="2" y="16" width="28" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M30 24 L30 34 L46 34 L46 28 L42 20 L30 20 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="10" cy="34" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="22" cy="34" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="39" cy="34" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="10" cy="34" r="2" fill="currentColor" opacity="0.35"/>
        <circle cx="22" cy="34" r="2" fill="currentColor" opacity="0.35"/>
        <circle cx="39" cy="34" r="2" fill="currentColor" opacity="0.35"/>
      </svg>
    ),
  },
]

export default function BookPage() {
  const router = useRouter()
  const [vehicle, setVehicle] = useState('bike')
  const [mobile, setMobile] = useState('')
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!mobile || mobile.length < 10) e.mobile = 'Enter a valid 10-digit number'
    if (!pickup || pickup.length < 3) e.pickup = 'Enter pickup location'
    if (!drop || drop.length < 3) e.drop = 'Enter drop location'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const params = new URLSearchParams({
      pickup: encodeURIComponent(pickup),
      drop: encodeURIComponent(drop),
      vehicle,
      mobile,
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .book-page {
          min-height: 100vh;
          background: #f4f4f6;
          font-family: 'Inter', -apple-system, sans-serif;
          display: flex; flex-direction: column; align-items: center;
          padding: 0 1rem 4rem;
        }

        /* Top bar */
        .book-topbar {
          width: 100%; max-width: 560px;
          display: flex; align-items: center; gap: 1rem;
          padding: 1.25rem 0 0;
          margin-bottom: 1.5rem;
        }
        .book-back {
          width: 36px; height: 36px; border-radius: 50%;
          background: #fff; border: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #111; transition: all 0.2s;
          text-decoration: none; flex-shrink: 0;
        }
        .book-back:hover { background: #f0f0f0; }
        .book-topbar-title { font-size: 20px; font-weight: 700; color: #111; letter-spacing: -0.5px; }
        .book-topbar-sub { font-size: 13px; color: #888; margin-top: 1px; }

        /* Step dots */
        .book-dots {
          display: flex; gap: 5px; margin-left: auto;
        }
        .book-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #e0e0e0;
        }
        .book-dot--active { background: #111; }

        /* Card */
        .book-card {
          width: 100%; max-width: 560px;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #ebebeb;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        /* Section */
        .book-section {
          padding: 1.5rem 1.5rem 0;
        }
        .book-section:last-of-type { padding-bottom: 1.5rem; }
        .book-section-divider {
          height: 1px; background: #f0f0f0; margin: 1.25rem 0 0;
        }

        /* Step number */
        .book-step-num {
          width: 24px; height: 24px; border-radius: 50%;
          background: #111; color: #fff;
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem; flex-shrink: 0;
        }
        .book-step-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;
        }
        .book-step-label {
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #888;
        }

        /* Vehicle grid */
        .book-vehicle-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .book-vehicle-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid #e8e8e8;
          background: #fafafa;
          cursor: pointer; transition: all 0.18s;
          text-align: left;
        }
        .book-vehicle-btn:hover { border-color: #ccc; background: #f5f5f5; }
        .book-vehicle-btn--active {
          border-color: #111 !important;
          background: #f8f8f8 !important;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .book-vehicle-icon { color: #333; flex-shrink: 0; transition: color 0.18s; }
        .book-vehicle-btn--active .book-vehicle-icon { color: #111; }
        .book-vehicle-name { font-size: 14px; font-weight: 600; color: #111; line-height: 1.2; }
        .book-vehicle-sub { font-size: 11px; color: #999; margin-top: 1px; }

        /* Mobile input */
        .book-mobile-wrap {
          display: flex; align-items: center; gap: 0;
          border: 1.5px solid #e8e8e8; border-radius: 12px;
          overflow: hidden; background: #fafafa;
          transition: border-color 0.2s;
        }
        .book-mobile-wrap:focus-within { border-color: #111; background: #fff; }
        .book-mobile-prefix {
          padding: 13px 12px; font-size: 14px; color: #555;
          border-right: 1px solid #e8e8e8; background: #f4f4f4;
          font-weight: 500; white-space: nowrap;
        }
        .book-mobile-input {
          flex: 1; padding: 13px 14px; border: none; outline: none;
          font-size: 14px; color: #111; background: transparent;
          font-family: inherit; letter-spacing: 0.5px;
        }
        .book-mobile-input::placeholder { color: #bbb; letter-spacing: 0; }

        /* Route inputs */
        .book-route-wrap { position: relative; }
        .book-route-input-wrap {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 14px;
          border: 1.5px solid #e8e8e8; border-radius: 12px;
          background: #fafafa; margin-bottom: 8px;
          transition: border-color 0.2s, background 0.2s;
        }
        .book-route-input-wrap:focus-within { border-color: #111; background: #fff; }
        .book-route-dot {
          width: 9px; height: 9px; border-radius: 50%;
          flex-shrink: 0;
        }
        .book-route-dot--pickup { background: #111; }
        .book-route-dot--drop { border: 2px solid #111; background: transparent; }
        .book-route-input {
          flex: 1; border: none; outline: none;
          font-size: 14px; color: #111; background: transparent;
          font-family: inherit;
        }
        .book-route-input::placeholder { color: #bbb; }
        .book-route-icon {
          color: #bbb; cursor: pointer; transition: color 0.2s; flex-shrink: 0;
        }
        .book-route-icon:hover { color: #555; }
        .book-route-connector {
          width: 1px; height: 12px; background: #ddd;
          margin: 0 0 8px 18px;
        }

        /* Error */
        .book-error {
          font-size: 11px; color: #e53e3e; margin-top: 5px;
          display: flex; align-items: center; gap: 4px;
        }

        /* Continue button */
        .book-continue {
          width: 100%; max-width: 560px;
          margin-top: 1.25rem;
          padding: 15px;
          background: #111; color: #fff;
          border: none; border-radius: 14px;
          font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .book-continue:hover:not(:disabled) { background: #000; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .book-continue:disabled { opacity: 0.5; cursor: not-allowed; }
        .book-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .book-vehicle-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .book-vehicle-btn { padding: 10px 10px; }
          .book-vehicle-name { font-size: 13px; }
        }
      `}</style>

      <div className="book-page">
        {/* Topbar */}
        <div className="book-topbar">
          <Link href="/" className="book-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <div className="book-topbar-title">Book a Ride</div>
            <div className="book-topbar-sub">Fill in the details below</div>
          </div>
          <div className="book-dots">
            <div className="book-dot book-dot--active" />
            <div className="book-dot" />
            <div className="book-dot" />
            <div className="book-dot" />
          </div>
        </div>

        {/* Main card */}
        <div className="book-card">

          {/* Step 1 — Vehicle */}
          <div className="book-section">
            <div className="book-step-header">
              <div className="book-step-num">1</div>
              <div className="book-step-label">CHOOSE VEHICLE</div>
            </div>
            <div className="book-vehicle-grid">
              {vehicleTypes.map(v => (
                <button
                  key={v.id}
                  className={`book-vehicle-btn ${vehicle === v.id ? 'book-vehicle-btn--active' : ''}`}
                  onClick={() => setVehicle(v.id)}
                >
                  <span className="book-vehicle-icon">{v.icon}</span>
                  <span>
                    <div className="book-vehicle-name">{v.label}</div>
                    <div className="book-vehicle-sub">{v.sub}</div>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="book-section-divider" />

          {/* Step 2 — Mobile */}
          <div className="book-section">
            <div className="book-step-header">
              <div className="book-step-num">2</div>
              <div className="book-step-label">MOBILE NUMBER</div>
            </div>
            <div className="book-mobile-wrap" style={{ borderColor: errors.mobile ? '#e53e3e' : '' }}>
              <div className="book-mobile-prefix">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.77a16 16 0 006.29 6.29l1.3-1.3a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                +91
              </div>
              <input
                className="book-mobile-input"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                maxLength={10}
                onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, mobile: '' })) }}
              />
            </div>
            {errors.mobile && <div className="book-error">⚠ {errors.mobile}</div>}
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>Ride updates will be sent to this number</div>
          </div>

          <div className="book-section-divider" />

          {/* Step 3 — Route */}
          <div className="book-section" style={{ paddingBottom: '1.5rem' }}>
            <div className="book-step-header">
              <div className="book-step-num">3</div>
              <div className="book-step-label">ROUTE</div>
            </div>
            <div className="book-route-wrap">
              <div className="book-route-input-wrap" style={{ borderColor: errors.pickup ? '#e53e3e' : '' }}>
                <div className="book-route-dot book-route-dot--pickup" />
                <input
                  className="book-route-input"
                  placeholder="Pickup location"
                  value={pickup}
                  onChange={e => { setPickup(e.target.value); setErrors(p => ({ ...p, pickup: '' })) }}
                />
                <span className="book-route-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
                  </svg>
                </span>
              </div>
              {errors.pickup && <div className="book-error">⚠ {errors.pickup}</div>}

              <div className="book-route-connector" />

              <div className="book-route-input-wrap" style={{ borderColor: errors.drop ? '#e53e3e' : '' }}>
                <div className="book-route-dot book-route-dot--drop" />
                <input
                  className="book-route-input"
                  placeholder={pickup ? 'Select drop location' : 'Select pickup first'}
                  value={drop}
                  disabled={!pickup}
                  onChange={e => { setDrop(e.target.value); setErrors(p => ({ ...p, drop: '' })) }}
                />
                <span className="book-route-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
              </div>
              {errors.drop && <div className="book-error">⚠ {errors.drop}</div>}
            </div>
          </div>

        </div>

        {/* Continue button */}
        <button
          className="book-continue"
          onClick={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <><div className="book-spinner" /> Finding vehicles...</>
          ) : (
            <>Continue →</>
          )}
        </button>
      </div>
    </>
  )
}