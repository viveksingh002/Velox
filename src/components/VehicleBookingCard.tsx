'use client'

interface Vehicle {
  _id: string
  type: string
  name?: string
  model?: string
  plateNumber?: string
  baseFare?: number
  pricePerKm?: number
  rating?: number
  totalRides?: number
  images?: string[]
}

interface VehicleBookingCardProps {
  vehicle: Vehicle
  distanceKm?: number
  isRecommended?: boolean
  onBook: () => void
}

function VehicleIcon({ type }: { type: string }) {
  if (type === 'bike') return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
      <circle cx="11" cy="34" r="7" stroke="#333" strokeWidth="2.5"/>
      <circle cx="37" cy="34" r="7" stroke="#333" strokeWidth="2.5"/>
      <circle cx="11" cy="34" r="2.5" fill="#333" opacity="0.4"/>
      <circle cx="37" cy="34" r="2.5" fill="#333" opacity="0.4"/>
      <path d="M11 34 L20 20 L28 20 L37 27" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20 L24 14 L30 14 L32 20" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20 L28 20" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
  if (type === 'auto') return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
      <path d="M8 28 L12 16 L36 16 L40 28 L40 36 L8 36 Z" stroke="#333" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M14 28 L16 20 L32 20 L34 28" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      <circle cx="14" cy="36" r="5" stroke="#333" strokeWidth="2.5"/>
      <circle cx="34" cy="36" r="5" stroke="#333" strokeWidth="2.5"/>
      <circle cx="14" cy="36" r="2" fill="#333" opacity="0.35"/>
      <circle cx="34" cy="36" r="2" fill="#333" opacity="0.35"/>
    </svg>
  )
  if (type === 'car') return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="26" width="40" height="10" rx="3" stroke="#333" strokeWidth="2.5"/>
      <path d="M10 26 L15 16 L33 16 L38 26" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 26 L19 18 L29 18 L32 26" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      <line x1="24" y1="18" x2="24" y2="26" stroke="#333" strokeWidth="1.2" opacity="0.4"/>
      <circle cx="13" cy="36" r="4.5" stroke="#333" strokeWidth="2.5"/>
      <circle cx="35" cy="36" r="4.5" stroke="#333" strokeWidth="2.5"/>
      <circle cx="13" cy="36" r="1.8" fill="#333" opacity="0.35"/>
      <circle cx="35" cy="36" r="1.8" fill="#333" opacity="0.35"/>
    </svg>
  )
  if (type === 'truck') return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
      <rect x="2" y="16" width="28" height="18" rx="2" stroke="#333" strokeWidth="2.5"/>
      <path d="M30 24 L30 34 L46 34 L46 28 L42 20 L30 20 Z" stroke="#333" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="10" cy="34" r="5" stroke="#333" strokeWidth="2.5"/>
      <circle cx="22" cy="34" r="5" stroke="#333" strokeWidth="2.5"/>
      <circle cx="39" cy="34" r="5" stroke="#333" strokeWidth="2.5"/>
      <circle cx="10" cy="34" r="2" fill="#333" opacity="0.3"/>
      <circle cx="22" cy="34" r="2" fill="#333" opacity="0.3"/>
      <circle cx="39" cy="34" r="2" fill="#333" opacity="0.3"/>
    </svg>
  )
  // loading / default
  return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
      <rect x="2" y="20" width="30" height="16" rx="2" stroke="#333" strokeWidth="2.5"/>
      <path d="M32 26 L32 36 L46 36 L46 30 L42 22 L32 22 Z" stroke="#333" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="10" cy="36" r="4" stroke="#333" strokeWidth="2.5"/>
      <circle cx="24" cy="36" r="4" stroke="#333" strokeWidth="2.5"/>
      <circle cx="40" cy="36" r="4" stroke="#333" strokeWidth="2.5"/>
    </svg>
  )
}

export default function VehicleBookingCard({
  vehicle,
  distanceKm,
  isRecommended = false,
  onBook,
}: VehicleBookingCardProps) {
  const baseFare    = vehicle.baseFare    ?? 30
  const pricePerKm  = vehicle.pricePerKm  ?? 10
  const rating      = vehicle.rating      ?? 4.5
  const totalRides  = vehicle.totalRides  ?? 0
  const plate       = vehicle.plateNumber ?? '—'
  const name        = vehicle.model || vehicle.name || vehicle.type?.toUpperCase() || 'Vehicle'

  const estFare = distanceKm
    ? Math.round(baseFare + distanceKm * pricePerKm)
    : baseFare

  const waitingMin = Math.max(2, Math.round(Math.random() * 6 + 2))

  return (
    <>
      <style>{`
        .vbc-card {
          background: #fff;
          border: 1.5px solid #ebebeb;
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.22s;
          position: relative;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .vbc-card:hover {
          border-color: #111;
          box-shadow: 0 6px 24px rgba(0,0,0,0.10);
          transform: translateY(-2px);
        }

        /* Recommended badge */
        .vbc-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: #111; color: #fff;
          font-size: 9px; font-weight: 800; letter-spacing: 0.5px;
          padding: 4px 10px; border-radius: 0 0 10px 0;
          position: absolute; top: 0; left: 0;
        }

        /* Image / icon area */
        .vbc-img {
          width: 100%;
          height: 100px;
          background: linear-gradient(135deg, #f4f4f6, #e8eaef);
          display: flex; align-items: center; justify-content: center;
          position: relative;
          border-bottom: 1px solid #f0f0f0;
        }
        .vbc-img img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        /* Rating pill inside image */
        .vbc-rating-pill {
          position: absolute; bottom: 8px; left: 8px;
          display: flex; align-items: center; gap: 4px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 980px;
          padding: 3px 9px;
          font-size: 11px; font-weight: 700; color: #111;
        }
        .vbc-star { color: #f59e0b; }

        /* Type pill */
        .vbc-type-pill {
          position: absolute; bottom: 8px; right: 8px;
          background: #111; color: #fff;
          font-size: 9px; font-weight: 800; letter-spacing: 1px;
          padding: 3px 9px; border-radius: 980px;
          text-transform: uppercase;
        }

        /* Body */
        .vbc-body { padding: 12px 14px; }

        .vbc-name {
          font-size: 15px; font-weight: 700; color: #111;
          letter-spacing: -0.3px; margin-bottom: 2px;
        }
        .vbc-plate {
          font-size: 10px; color: #bbb; font-weight: 600;
          letter-spacing: 0.8px; margin-bottom: 10px;
        }

        /* Stats row */
        .vbc-stats {
          display: flex; gap: 14px;
          padding: 8px 0;
          border-top: 1px solid #f5f5f5;
          border-bottom: 1px solid #f5f5f5;
          margin-bottom: 10px;
        }
        .vbc-stat { display: flex; flex-direction: column; gap: 1px; }
        .vbc-stat-lbl { font-size: 9px; color: #bbb; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; }
        .vbc-stat-val { font-size: 13px; font-weight: 700; color: #111; }
        .vbc-stat-val span { font-size: 10px; color: #aaa; font-weight: 400; }

        /* Footer */
        .vbc-footer {
          display: flex; align-items: center; justify-content: space-between;
        }
        .vbc-fare { }
        .vbc-fare-lbl { font-size: 9px; color: #bbb; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 1px; }
        .vbc-fare-amt { font-size: 26px; font-weight: 800; color: #111; letter-spacing: -1px; line-height: 1; }
        .vbc-fare-sym { font-size: 16px; font-weight: 600; }
        .vbc-fare-note { font-size: 10px; color: #bbb; margin-top: 2px; }

        .vbc-book-btn {
          padding: 10px 20px;
          background: #111; color: #fff;
          border: none; border-radius: 10px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: all 0.18s;
          display: flex; align-items: center; gap: 5px;
          white-space: nowrap;
        }
        .vbc-book-btn:hover { background: #000; transform: scale(1.03); }
      `}</style>

      <div className="vbc-card" onClick={onBook}>

        {/* Recommended badge */}
        {isRecommended && (
          <div className="vbc-badge">
            ★ BEST PICK
          </div>
        )}

        {/* Image / icon */}
        <div className="vbc-img">
          {vehicle.images?.[0] ? (
            <img src={vehicle.images[0]} alt={name} />
          ) : (
            <VehicleIcon type={vehicle.type} />
          )}

          {/* Rating */}
          <div className="vbc-rating-pill">
            <span className="vbc-star">★</span>
            {rating.toFixed(1)}
          </div>

          {/* Type */}
          <div className="vbc-type-pill">{vehicle.type}</div>
        </div>

        {/* Body */}
        <div className="vbc-body">
          <div className="vbc-name">{name}</div>
          <div className="vbc-plate">{plate}</div>

          {/* Stats */}
          <div className="vbc-stats">
            <div className="vbc-stat">
              <div className="vbc-stat-lbl">PER KM</div>
              <div className="vbc-stat-val">₹{pricePerKm}</div>
            </div>
            <div className="vbc-stat">
              <div className="vbc-stat-lbl">WAITING</div>
              <div className="vbc-stat-val">{waitingMin} <span>min</span></div>
            </div>
            {totalRides > 0 && (
              <div className="vbc-stat">
                <div className="vbc-stat-lbl">TRIPS</div>
                <div className="vbc-stat-val">{totalRides.toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="vbc-footer">
            <div className="vbc-fare">
              <div className="vbc-fare-lbl">EST. FARE</div>
              <div className="vbc-fare-amt">
                <span className="vbc-fare-sym">₹</span>{estFare}
              </div>
              {distanceKm && (
                <div className="vbc-fare-note">for {distanceKm} km</div>
              )}
            </div>
            <button
              className="vbc-book-btn"
              onClick={e => { e.stopPropagation(); onBook() }}
            >
              Book →
            </button>
          </div>
        </div>

      </div>
    </>
  )
}