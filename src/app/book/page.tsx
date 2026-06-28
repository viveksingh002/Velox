'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LocationInput from '@/components/LocationInput'

const vehicleTypes = [
  {
    id: 'bike', label: 'Bike', sub: 'Quick & affordable',
    icon: (
      <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
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
      <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
        <path d="M8 28 L12 16 L36 16 L40 28 L40 36 L8 36 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 28 L16 20 L32 20 L34 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <circle cx="14" cy="36" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="34" cy="36" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="14" cy="36" r="2" fill="currentColor" opacity="0.35"/>
        <circle cx="34" cy="36" r="2" fill="currentColor" opacity="0.35"/>
      </svg>
    ),
  },
  {
    id: 'car', label: 'Car', sub: 'Comfort rides',
    icon: (
      <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="26" width="40" height="10" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 26 L15 16 L33 16 L38 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 26 L19 18 L29 18 L32 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
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
      <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
        <rect x="2" y="20" width="30" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M32 26 L32 36 L46 36 L46 30 L42 22 L32 22 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="10" cy="36" r="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="24" cy="36" r="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="40" cy="36" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 'truck', label: 'Truck', sub: 'Heavy transport',
    icon: (
      <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
        <rect x="2" y="16" width="28" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M30 24 L30 34 L46 34 L46 28 L42 20 L30 20 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="10" cy="34" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="22" cy="34" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="39" cy="34" r="5" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
]

export default function BookPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [vehicle, setVehicle] = useState(searchParams.get('vehicle') || 'bike')
  const [mobile,  setMobile]  = useState('')

  // Pickup state
  const [pickupText, setPickupText] = useState('')
  const [pickupLat,  setPickupLat]  = useState(0)
  const [pickupLng,  setPickupLng]  = useState(0)

  // Drop state
  const [dropText, setDropText] = useState('')
  const [dropLat,  setDropLat]  = useState(0)
  const [dropLng,  setDropLng]  = useState(0)

  const [loading, setLoading]   = useState(false)
  const [errors,  setErrors]    = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!mobile || mobile.length < 10)  e.mobile  = 'Enter a valid 10-digit number'
    if (!pickupText || !pickupLat)       e.pickup  = 'Select a pickup location from suggestions'
    if (!dropText   || !dropLat)         e.drop    = 'Select a drop location from suggestions'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const params = new URLSearchParams({
      pickup:       pickupText,
      drop:         dropText,
      vehicle,
      mobileNumber: mobile,
      pickupLat:    String(pickupLat),
      pickupLng:    String(pickupLng),
      dropLat:      String(dropLat),
      dropLng:      String(dropLng),
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .book-page {
          min-height: 100svh;
          background: #f4f4f6;
          font-family: 'Inter', -apple-system, sans-serif;
          display: flex; flex-direction: column; align-items: center;
          padding: 0 1rem 5rem;
        }

        /* Topbar */
        .book-topbar {
          width: 100%; max-width: 560px;
          display: flex; align-items: center; gap: 12px;
          padding: 1.25rem 0 0; margin-bottom: 1.5rem;
        }
        .book-back {
          width: 38px; height: 38px; border-radius: 50%;
          background: #fff; border: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #111; text-decoration: none;
          transition: all 0.2s; flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .book-back:hover { background: #f0f0f0; }
        .book-topbar-title { font-size: 20px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
        .book-topbar-sub   { font-size: 13px; color: #aaa; margin-top: 1px; }
        .book-dots { display: flex; gap: 5px; margin-left: auto; }
        .book-dot  { width: 8px; height: 8px; border-radius: 50%; background: #e0e0e0; }
        .book-dot--active { background: #111; }

        /* Card */
        .book-card {
          width: 100%; max-width: 560px;
          background: #fff; border-radius: 22px;
          border: 1.5px solid #ebebeb;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          overflow: visible;
        }

        /* Section */
        .book-section { padding: 1.5rem 1.5rem 0; }
        .book-section:last-of-type { padding-bottom: 1.5rem; }
        .book-divider { height: 1px; background: #f0f0f0; margin: 1.25rem 0 0; }

        /* Step header */
        .book-step-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
        .book-step-num {
          width: 24px; height: 24px; border-radius: 50%;
          background: #111; color: #fff;
          font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .book-step-label { font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #aaa; }

        /* Vehicle grid */
        .book-vehicle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .book-vehicle-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 12px; border-radius: 12px;
          border: 1.5px solid #e8e8e8; background: #fafafa;
          cursor: pointer; transition: all 0.18s; text-align: left;
        }
        .book-vehicle-btn:hover { border-color: #ccc; background: #f5f5f5; }
        .book-vehicle-btn--active {
          border-color: #111 !important; background: #f8f8f8 !important;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .book-vehicle-icon { color: #333; flex-shrink: 0; transition: color 0.18s; }
        .book-vehicle-btn--active .book-vehicle-icon { color: #111; }
        .book-vehicle-name { font-size: 13px; font-weight: 700; color: #111; line-height: 1.2; }
        .book-vehicle-sub  { font-size: 11px; color: #aaa; margin-top: 1px; }

        /* Mobile input */
        .book-mobile-wrap {
          display: flex; align-items: center;
          border: 1.5px solid #e8e8e8; border-radius: 14px;
          overflow: hidden; background: #fafafa; transition: all 0.2s;
        }
        .book-mobile-wrap:focus-within {
          border-color: #111; background: #fff;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .book-mobile-prefix {
          padding: 13px 12px; font-size: 14px; color: #555;
          border-right: 1px solid #e8e8e8; background: #f4f4f4;
          font-weight: 600; white-space: nowrap; display: flex; align-items: center; gap: 5px;
        }
        .book-mobile-input {
          flex: 1; padding: 13px 14px; border: none; outline: none;
          font-size: 15px; color: #111; background: transparent;
          font-family: inherit; letter-spacing: 0.5px;
        }
        .book-mobile-input::placeholder { color: #ccc; letter-spacing: 0; font-size: 14px; }

        /* Route connector */
        .book-route-connector { width: 1px; height: 12px; background: #ddd; margin: 0 0 0 18px; }

        /* Error */
        .book-error { font-size: 11px; color: #e53e3e; margin-top: 6px; display: flex; align-items: center; gap: 4px; }

        /* Continue */
        .book-continue {
          width: 100%; max-width: 560px; margin-top: 14px;
          padding: 15px; background: #111; color: #fff;
          border: none; border-radius: 16px; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }
        .book-continue:hover:not(:disabled) { background: #000; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .book-continue:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }
        .book-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Hint */
        .book-hint { font-size: 11px; color: #bbb; margin-top: 8px; text-align: center; }
      `}</style>

      <div className="book-page">

        {/* Topbar */}
        <div className="book-topbar">
          <Link href="/" className="book-back">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <div className="book-topbar-title">Book a Ride</div>
            <div className="book-topbar-sub">Fill in the details below</div>
          </div>
          <div className="book-dots">
            {[0,1,2,3].map(i => (
              <div key={i} className={`book-dot ${i === 0 ? 'book-dot--active' : ''}`} />
            ))}
          </div>
        </div>

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

          <div className="book-divider" />

          {/* Step 2 — Mobile */}
          <div className="book-section">
            <div className="book-step-header">
              <div className="book-step-num">2</div>
              <div className="book-step-label">MOBILE NUMBER</div>
            </div>
            <div className="book-mobile-wrap" style={{ borderColor: errors.mobile ? '#e53e3e' : '' }}>
              <div className="book-mobile-prefix">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.77a16 16 0 006.29 6.29l1.3-1.3a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                +91
              </div>
              <input
                className="book-mobile-input"
                type="tel"
                placeholder="Enter mobile number"
                value={mobile}
                maxLength={10}
                onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setErrors(p => ({...p, mobile: ''})) }}
              />
            </div>
            {errors.mobile && <div className="book-error">⚠ {errors.mobile}</div>}
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>Ride updates will be sent to this number</div>
          </div>

          <div className="book-divider" />

          {/* Step 3 — Route with Photon autocomplete */}
          <div className="book-section" style={{ paddingBottom: '1.5rem' }}>
            <div className="book-step-header">
              <div className="book-step-num">3</div>
              <div className="book-step-label">ROUTE</div>
            </div>

            {/* Pickup */}
            <LocationInput
              placeholder="Pickup location"
              value={pickupText}
              dotColor="fill"
              autoFocus={false}
              onChange={(text, lat, lon) => {
                setPickupText(text)
                setPickupLat(lat)
                setPickupLng(lon)
                setErrors(p => ({...p, pickup: ''}))
              }}
            />
            {errors.pickup && <div className="book-error">⚠ {errors.pickup}</div>}

            <div className="book-route-connector" />

            {/* Drop */}
            <LocationInput
              placeholder={pickupText ? 'Drop location' : 'Select pickup first'}
              value={dropText}
              dotColor="empty"
              disabled={!pickupText}
              onChange={(text, lat, lon) => {
                setDropText(text)
                setDropLat(lat)
                setDropLng(lon)
                setErrors(p => ({...p, drop: ''}))
              }}
            />
            {errors.drop && <div className="book-error">⚠ {errors.drop}</div>}
          </div>

        </div>

        {/* Continue button */}
        <button
          className="book-continue"
          onClick={handleContinue}
          disabled={loading}
        >
          {loading
            ? <><div className="book-spinner" /> Finding vehicles...</>
            : <>Continue →</>
          }
        </button>

        <div className="book-hint">Type at least 3 characters to search locations</div>

      </div>
    </>
  )
}