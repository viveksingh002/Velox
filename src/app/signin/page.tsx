'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SigninPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setMessage(error.message); setLoading(false) }
  }

  const handleSubmit = async () => {
      if (isSignup && !name.trim()) return setMessage('Please enter your full name.')
    if (!email || !password) return setMessage('Please enter your email and password.')
    if (password.length < 6) return setMessage('Password must be at least 6 characters.')
    setLoading(true); setMessage(''); setIsSuccess(false)

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name } 
      },
      })
      if (error) setMessage(error.message)
      else { setIsSuccess(true); setMessage('Check your email for a confirmation link.') }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message === 'Invalid login credentials' ? 'Invalid email or password.' : error.message)
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .sp-page {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          background: #0b0b14;
        }

        .sp-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,113,227,0.18), transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(80,50,220,0.1), transparent 55%),
            radial-gradient(ellipse 30% 30% at 20% 60%, rgba(0,160,255,0.07), transparent 50%);
        }

        .sp-dots {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 30px 30px;
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent);
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent);
        }

        .sp-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(13,13,26,0.97);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          padding: 2.6rem 2.6rem 2.2rem;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 32px 80px rgba(0,0,0,0.7),
            0 0 60px rgba(0,113,227,0.07);
          animation: cardIn 0.45s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }

        .sp-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          font-size: 13px;
        }
        .sp-close:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }

        .sp-top {
          text-align: center;
          margin-bottom: 1.8rem;
        }

        .sp-logo {
          font-size: 22px;
          font-weight: 300;
          font-style: italic;
          letter-spacing: -0.5px;
          background: linear-gradient(120deg, #fff 30%, #5ac8fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
          margin-bottom: 0.35rem;
          text-decoration: none;
        }

        .sp-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          font-weight: 400;
        }

        .sp-google {
          width: 100%;
          padding: 13px 20px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 980px;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.85);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          font-family: inherit;
          margin-bottom: 1.3rem;
        }
        .sp-google:hover:not(:disabled) {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }
        .sp-google:disabled { opacity: 0.5; cursor: not-allowed; }

        .sp-divider {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.3rem;
        }
        .sp-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .sp-divider-text { font-size: 11px; color: rgba(255,255,255,0.2); font-weight: 600; letter-spacing: 1.5px; }

        .sp-input-wrap {
          position: relative;
          margin-bottom: 0.75rem;
        }
        .sp-input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .sp-input {
          width: 100%;
          padding: 13px 18px 13px 44px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 980px;
          font-size: 14px;
          color: #fff;
          background: rgba(255,255,255,0.05);
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
          -webkit-text-fill-color: #fff;
        }
        .sp-input::placeholder { color: rgba(255,255,255,0.22); }
        .sp-input:focus {
          border-color: rgba(0,113,227,0.55);
          background: rgba(0,113,227,0.05);
          box-shadow: 0 0 0 3px rgba(0,113,227,0.1);
        }
        .sp-input:focus ~ .sp-input-icon,
        .sp-input-wrap:focus-within .sp-input-icon {
          color: rgba(0,113,227,0.7);
        }

        .sp-message {
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 12px;
          margin-bottom: 0.85rem;
          text-align: center;
          line-height: 1.5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .sp-message.error {
          color: #fca5a5;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
        }
        .sp-message.success {
          color: #5ac8fa;
          background: rgba(0,113,227,0.08);
          border: 1px solid rgba(0,113,227,0.18);
        }

        .sp-submit {
          width: 100%;
          padding: 14px;
          border-radius: 980px;
          background: linear-gradient(135deg, #0071e3, #0055b3);
          border: none;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 20px rgba(0,113,227,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: all 0.25s;
          margin-bottom: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.2px;
        }
        .sp-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,113,227,0.55), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .sp-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .sp-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .sp-toggle {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
        }
        .sp-toggle button {
          background: none;
          border: none;
          color: #5ac8fa;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          font-family: inherit;
          padding: 0;
          transition: color 0.2s;
        }
        .sp-toggle button:hover { color: #7dd5fc; }

        .sp-terms {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.15);
          margin-top: 1.4rem;
          line-height: 1.6;
        }
        .sp-terms a {
          color: rgba(255,255,255,0.28);
          text-decoration: underline;
          cursor: pointer;
          transition: color 0.2s;
        }
        .sp-terms a:hover { color: rgba(255,255,255,0.5); }

        @media (max-width: 480px) {
          .sp-card { padding: 2rem 1.5rem 1.8rem; border-radius: 20px; }
        }
      `}</style>

      <div className="sp-page">
        <div className="sp-bg" />
        <div className="sp-dots" />

        <div className="sp-card">

          {/* Close → home */}
          <Link href="/" className="sp-close" aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </Link>

          {/* Logo */}
          <div className="sp-top">
            <Link href="/" className="sp-logo">Vëlox</Link>
            <p className="sp-tagline">
              {isSignup ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          {/* Google */}
          <button className="sp-google" onClick={handleGoogle} disabled={loading}>
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="sp-divider">
            <div className="sp-divider-line" />
            <span className="sp-divider-text">OR</span>
            <div className="sp-divider-line" />
          </div>

{/* Name — only on signup */}
{isSignup && (
  <div className="sp-input-wrap">
    <span className="sp-input-icon">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </span>
    <input
      className="sp-input"
      type="text"
      placeholder="Full name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      disabled={loading}
      autoComplete="name"
    />
  </div>
)}

          {/* Email input with icon */}
          <div className="sp-input-wrap">
            <span className="sp-input-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
            </span>
            <input
              className="sp-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password input with icon */}
          <div className="sp-input-wrap">
            <span className="sp-input-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              className="sp-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Error / Success */}
          {message && (
            <div className={`sp-message ${isSuccess ? 'success' : 'error'}`}>
              {isSuccess
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              }
              {message}
            </div>
          )}

          {/* Submit */}
          <button className="sp-submit" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><div className="sp-spinner" /> Authenticating...</>
              : isSignup ? 'Create account' : 'Sign in'}
          </button>

          {/* Toggle */}
          <div className="sp-toggle">
            {isSignup ? 'Already have an account? ' : 'No account? '}
            <button onClick={() => { setIsSignup(!isSignup); setMessage(''); setIsSuccess(false);setName('') }}>
              {isSignup ? 'Sign in' : 'Create one →'}
            </button>
          </div>

          {/* Terms — only on signup */}
          {isSignup && (
            <p className="sp-terms">
              By creating an account, you agree to our{' '}
              <a>Terms of Service</a> and <a>Privacy Policy</a>.
            </p>
          )}

        </div>
      </div>
    </>
  )
}