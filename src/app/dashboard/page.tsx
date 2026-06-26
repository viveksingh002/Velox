'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/signin'
      } else {
        setUser(data.user)
        setLoading(false)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || ''
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    }
    return name[0]?.toUpperCase() || 'U'
  }

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .db-root {
          min-height: 100vh;
          background: #08080d;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #fff;
        }

        /* Navbar */
        .db-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2.5rem;
          background: rgba(8,8,13,0.9);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
        }
        .db-nav-logo {
          font-size: 20px;
          font-weight: 300;
          font-style: italic;
          background: linear-gradient(120deg, #fff 30%, #5ac8fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
        }
        .db-nav-right { display: flex; align-items: center; gap: 1rem; }
        .db-nav-name { font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 500; }
        .db-nav-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0071e3, #5ac8fa);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
          border: 2px solid rgba(0,113,227,0.4);
        }
        .db-logout-btn {
          padding: 7px 16px;
          border-radius: 980px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex; align-items: center; gap: 6px;
        }
        .db-logout-btn:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.2);
          color: #fca5a5;
        }

        /* Main */
        .db-main { max-width: 1100px; margin: 0 auto; padding: 3rem 2.5rem; }

        /* Welcome */
        .db-welcome {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .db-welcome-label {
          font-size: 11px;
          color: #0071e3;
          letter-spacing: 2.5px;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .db-welcome-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 700;
          letter-spacing: -1.5px;
          color: #fff;
          margin-bottom: 0.4rem;
        }
        .db-welcome-title span {
          background: linear-gradient(135deg, #5ac8fa, #0071e3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .db-welcome-sub { font-size: 14px; color: rgba(255,255,255,0.35); }

        /* Stats */
        .db-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 2.5rem;
        }
        .db-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 1.6rem 1.8rem;
          transition: all 0.25s;
        }
        .db-stat:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(0,113,227,0.2);
        }
        .db-stat-icon {
          font-size: 22px;
          margin-bottom: 1rem;
          display: block;
        }
        .db-stat-num {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -1px;
          color: #fff;
          margin-bottom: 0.2rem;
        }
        .db-stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
        }

        /* Quick actions */
        .db-section-title {
          font-size: 16px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          letter-spacing: -0.3px;
          margin-bottom: 1rem;
        }
        .db-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 2.5rem;
        }
        .db-action-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 1.8rem 2rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }
        .db-action-card:hover {
          background: rgba(0,113,227,0.07);
          border-color: rgba(0,113,227,0.25);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .db-action-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: rgba(0,113,227,0.1);
          border: 1px solid rgba(0,113,227,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .db-action-card:hover .db-action-icon {
          background: rgba(0,113,227,0.2);
          box-shadow: 0 0 20px rgba(0,113,227,0.3);
        }
        .db-action-title {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.2rem;
        }
        .db-action-desc { font-size: 12px; color: rgba(255,255,255,0.35); }
        .db-action-arrow {
          margin-left: auto;
          color: rgba(255,255,255,0.2);
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .db-action-card:hover .db-action-arrow {
          color: #0071e3;
          transform: translateX(4px);
        }

        /* Recent bookings empty */
        .db-empty {
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 3rem;
          text-align: center;
        }
        .db-empty-icon { font-size: 36px; margin-bottom: 1rem; opacity: 0.4; }
        .db-empty-title { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.4); margin-bottom: 0.4rem; }
        .db-empty-sub { font-size: 13px; color: rgba(255,255,255,0.2); margin-bottom: 1.5rem; }
        .db-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #0071e3;
          color: #fff;
          border: none;
          border-radius: 980px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          font-family: inherit;
          box-shadow: 0 4px 16px rgba(0,113,227,0.35);
        }
        .db-empty-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,113,227,0.5); }

        @media (max-width: 640px) {
          .db-main { padding: 2rem 1.25rem; }
          .db-stats { grid-template-columns: 1fr 1fr; }
          .db-actions { grid-template-columns: 1fr; }
          .db-nav { padding: 1rem 1.25rem; }
        }
      `}</style>

      <div className="db-root">

        {/* Navbar */}
        <nav className="db-nav">
          <Link href="/" className="db-nav-logo">Vëlox</Link>
          <div className="db-nav-right">
            <span className="db-nav-name">{getDisplayName()}</span>
            <div className="db-nav-avatar">{getInitials()}</div>
            <button className="db-logout-btn" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </nav>

        <main className="db-main">

          {/* Welcome */}
          <div className="db-welcome">
            <div className="db-welcome-label">DASHBOARD</div>
            <h1 className="db-welcome-title">
              Welcome back, <span>{getDisplayName().split(' ')[0]}</span> 👋
            </h1>
            <p className="db-welcome-sub">Here's what's happening with your account today.</p>
          </div>

          {/* Stats */}
          <div className="db-stats">
            <div className="db-stat">
              <span className="db-stat-icon">🚗</span>
              <div className="db-stat-num">0</div>
              <div className="db-stat-label">Total Bookings</div>
            </div>
            <div className="db-stat">
              <span className="db-stat-icon">⏳</span>
              <div className="db-stat-num">0</div>
              <div className="db-stat-label">Active Rides</div>
            </div>
            <div className="db-stat">
              <span className="db-stat-icon">⭐</span>
              <div className="db-stat-num">—</div>
              <div className="db-stat-label">Avg Rating</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="db-section-title">Quick Actions</div>
          <div className="db-actions">
            <Link href="/#fleet" className="db-action-card">
              <div className="db-action-icon">🚀</div>
              <div>
                <div className="db-action-title">Book a Vehicle</div>
                <div className="db-action-desc">Browse fleet and book instantly</div>
              </div>
              <svg className="db-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/bookings" className="db-action-card">
              <div className="db-action-icon">📋</div>
              <div>
                <div className="db-action-title">My Bookings</div>
                <div className="db-action-desc">View and manage your rides</div>
              </div>
              <svg className="db-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/profile" className="db-action-card">
              <div className="db-action-icon">👤</div>
              <div>
                <div className="db-action-title">Edit Profile</div>
                <div className="db-action-desc">Update your personal info</div>
              </div>
              <svg className="db-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/#support" className="db-action-card">
              <div className="db-action-icon">🛟</div>
              <div>
                <div className="db-action-title">Support</div>
                <div className="db-action-desc">Get help with your bookings</div>
              </div>
              <svg className="db-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Recent Bookings */}
          <div className="db-section-title">Recent Bookings</div>
          <div className="db-empty">
            <div className="db-empty-icon">🚗</div>
            <div className="db-empty-title">No bookings yet</div>
            <div className="db-empty-sub">Your ride history will appear here once you book a vehicle.</div>
            <Link href="/#fleet" className="db-empty-btn">
              Book your first ride
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

        </main>
      </div>
    </>
  )
}