"use client";

import { useState } from "react";

const footerLinks = {
  FLEET: ["Bikes", "Cars", "SUVs", "Vans", "Trucks"],
  COMPANY: ["About", "Careers", "Blog", "Contact"],
  SUPPORT: ["Help centre", "Track ride", "Manage booking", "Refund policy"],
};

const socials = [
  {
    label: "Instagram",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];



export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <>
      <style>{`
        .f-root {
          background: #020204;
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }

        /* Top glow */
        .f-root::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,113,227,0.6), rgba(90,200,250,0.4), transparent);
        }
        .f-root::after {
          content: '';
          position: absolute;
          top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 400px; height: 120px;
          background: radial-gradient(ellipse, rgba(0,113,227,0.12), transparent 70%);
          pointer-events: none;
        }

        .f-wrap { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }

        /* ── NEWSLETTER BAND ── */
        .f-newsletter {
          padding: 3rem 2.5rem 0;
          margin-bottom: 0;
        }
        .f-nl-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          padding: 2rem 2.5rem;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        .f-nl-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 100% at 0% 50%, rgba(0,113,227,0.08), transparent);
          pointer-events: none;
        }
        .f-nl-text h3 {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .f-nl-text p {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
        }
        .f-nl-form {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .f-nl-input {
          padding: 10px 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 980px;
          font-size: 13px;
          color: #fff;
          outline: none;
          font-family: inherit;
          width: 220px;
          transition: border-color 0.2s, background 0.2s;
        }
        .f-nl-input::placeholder { color: rgba(255,255,255,0.25); }
        .f-nl-input:focus {
          border-color: rgba(0,113,227,0.5);
          background: rgba(0,113,227,0.06);
        }
        .f-nl-btn {
          padding: 10px 22px;
          background: #0071e3;
          border: none;
          border-radius: 980px;
          font-size: 13px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.25s;
          white-space: nowrap;
          box-shadow: 0 0 20px rgba(0,113,227,0.35);
        }
        .f-nl-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 35px rgba(0,113,227,0.55);
        }
        .f-nl-success {
          font-size: 13px;
          color: #5ac8fa;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .f-nl-success::before {
          content: '✓';
          display: inline-flex;
          width: 20px; height: 20px;
          background: rgba(90,200,250,0.15);
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }



        /* ── MAIN FOOTER BODY ── */
        .f-body {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr 1fr;
          gap: 3rem;
          padding: 3rem 2.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        /* Brand col */
        .f-logo {
          font-size: 28px;
          font-weight: 300;
          font-style: italic;
          background: linear-gradient(135deg, #ffffff, #5ac8fa, #0071e3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
          display: inline-block;
          margin-bottom: 0.75rem;
        }
        .f-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.28);
          line-height: 1.75;
          max-width: 230px;
          margin-bottom: 1.5rem;
        }

        /* Socials */
        .f-socials { display: flex; gap: 8px; margin-bottom: 1.75rem; }
        .f-social {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: all 0.2s;
        }
        .f-social:hover {
          border-color: rgba(0,113,227,0.5);
          background: rgba(0,113,227,0.1);
          color: #5ac8fa;
          transform: translateY(-2px);
        }

        /* India badge */
        .f-india {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        .f-india-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #0071e3;
          box-shadow: 0 0 8px rgba(0,113,227,0.7);
          animation: fpulse 2.5s infinite;
        }
        @keyframes fpulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.65); }
        }

        /* Link columns */
        .f-col-title {
          font-size: 9px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 2.5px;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
        }
        .f-link {
          display: flex;
          align-items: center;
          gap: 0;
          font-size: 13px;
          color: rgba(255,255,255,0.38);
          margin-bottom: 0.65rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          width: fit-content;
          position: relative;
        }
        .f-link::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0;
          width: 0; height: 1px;
          background: #0071e3;
          transition: width 0.25s;
        }
        .f-link:hover { color: rgba(255,255,255,0.8); }
        .f-link:hover::after { width: 100%; }

        /* ── BOTTOM BAR ── */
        .f-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2.5rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .f-copy {
          font-size: 11px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.2px;
        }
        .f-legal { display: flex; gap: 1.5rem; align-items: center; }
        .f-legal a {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.15s;
        }
        .f-legal a:hover { color: rgba(255,255,255,0.5); }
        .f-legal-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .f-body { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .f-brand-col { grid-column: 1 / -1; }
          .f-nl-inner { flex-direction: column; align-items: flex-start; }
          .f-nl-form { width: 100%; }
          .f-nl-input { flex: 1; }
        }
        @media (max-width: 600px) {
          .f-newsletter { padding: 2rem 1.25rem 0; }

          .f-body { grid-template-columns: 1fr; padding: 2rem 1.25rem; }
          .f-bottom { padding: 1.25rem; flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <footer className="f-root">

        {/* Newsletter band */}
        <div className="f-newsletter">
          <div className="f-wrap">
            <div className="f-nl-inner">
              <div className="f-nl-text">
                <h3>Stay in the fast lane.</h3>
                <p>New vehicles, city launches & exclusive offers — straight to your inbox.</p>
              </div>
              {subscribed ? (
                <div className="f-nl-success">You&apos;re in! We&apos;ll keep you posted.</div>
              ) : (
                <div className="f-nl-form">
                  <input
                    className="f-nl-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  />
                  <button className="f-nl-btn" onClick={handleSubscribe}>
                    Subscribe
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Main body */}
        <div className="f-wrap">
          <div className="f-body">
            {/* Brand col */}
            <div className="f-brand-col">
              <div className="f-logo">Vëlox</div>
              <p className="f-tagline">
                Every vehicle. Every journey.<br />
                One seamless platform built for India.
              </p>
              <div className="f-socials">
                {socials.map((s) => (
                  <button key={s.label} className="f-social" aria-label={s.label}>
                    {s.icon}
                  </button>
                ))}
              </div>
              <div className="f-india">
                <div className="f-india-dot" />
                Now live across India
              </div>
            </div>

            {/* Link cols */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <div className="f-col-title">{title}</div>
                {links.map((link) => (
                  <a key={link} className="f-link" href="#">
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="f-wrap">
          <div className="f-bottom">
            <div className="f-copy">© 2026 Vëlox Technologies Pvt. Ltd. All rights reserved.</div>
            <div className="f-legal">
              <a href="#">Privacy</a>
              <div className="f-legal-dot" />
              <a href="#">Terms</a>
              <div className="f-legal-dot" />
              <a href="#">Legal</a>
            </div>
          </div>
        </div>

      </footer>
    </>
  );
}