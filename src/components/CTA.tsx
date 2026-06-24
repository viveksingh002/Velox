"use client";

import { useEffect, useRef } from "react";

interface CTAProps {
  onSendPrompt?: (text: string) => void;
  onOpenModal?: () => void;
}

export default function CTA({ onSendPrompt, onOpenModal }: CTAProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("cta-visible");
        });
      },
      { threshold: 0.15 }
    );
    const els = sectionRef.current?.querySelectorAll(".cta-reveal");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .cta-section {
          padding: 8rem 2.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,113,227,0.25), transparent), #08080d;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }

        /* Ambient orbs */
        .cta-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
        }
        .cta-orb1 {
          width: 500px; height: 500px;
          background: rgba(0,113,227,0.12);
          top: -150px; left: 50%;
          transform: translateX(-50%);
          animation: ctaOrbPulse 7s ease-in-out infinite;
        }
        .cta-orb2 {
          width: 300px; height: 300px;
          background: rgba(90,200,250,0.07);
          bottom: -80px; right: 10%;
          animation: ctaOrbDrift 9s ease-in-out infinite alternate;
        }
        @keyframes ctaOrbPulse {
          0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }
        @keyframes ctaOrbDrift {
          0% { transform: translateY(0); }
          100% { transform: translateY(-30px); }
        }

        /* Floating particles */
        .cta-particle {
          position: absolute;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #0071e3;
          opacity: 0;
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0% { opacity: 0; transform: translateY(0) scale(0); }
          20% { opacity: 0.6; transform: translateY(-20px) scale(1); }
          80% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-120px) scale(0.5); }
        }

        /* Content */
        .cta-inner {
          position: relative;
          z-index: 10;
          max-width: 700px;
          margin: 0 auto;
        }
        .cta-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: rgba(0,150,255,0.8);
          letter-spacing: 3px;
          font-weight: 800;
          margin-bottom: 1.5rem;
        }
        .cta-label::before,
        .cta-label::after {
          content: '';
          width: 24px; height: 1px;
          background: rgba(0,150,255,0.5);
        }
        .cta-heading {
          font-size: clamp(42px, 6.5vw, 82px);
          font-weight: 900;
          letter-spacing: -4px;
          line-height: 0.93;
          color: #fff;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .cta-heading span {
          display: block;
          font-weight: 200;
          font-style: italic;
          text-transform: none;
          letter-spacing: -2.5px;
          font-size: 0.72em;
          background: linear-gradient(135deg, #5ac8fa, #0071e3, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cta-sub {
          font-size: 17px;
          color: rgba(255,255,255,0.45);
          margin-bottom: 3rem;
          font-weight: 400;
          line-height: 1.6;
        }
        .cta-sub b {
          color: rgba(255,255,255,0.7);
          font-weight: 600;
        }

        /* Buttons */
        .cta-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-cta-glow {
          padding: 16px 40px;
          background: #0071e3;
          color: #fff;
          border: none;
          border-radius: 980px;
          font-size: 15px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 0 30px rgba(0,113,227,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }
        .btn-cta-glow::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 980px;
        }
        .btn-cta-glow:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 0 60px rgba(0,113,227,0.65), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .btn-cta-glow:hover::after { opacity: 1; }

        .btn-cta-ghost {
          padding: 16px 36px;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 980px;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
          font-weight: 500;
          font-family: inherit;
        }
        .btn-cta-ghost:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(0,113,227,0.4);
          transform: translateY(-2px);
        }

        /* Trust badges */
        .cta-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-top: 3rem;
          flex-wrap: wrap;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        .trust-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #0071e3;
          opacity: 0.7;
        }

        /* Reveal animation */
        .cta-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .cta-reveal.cta-visible {
          opacity: 1;
          transform: none;
        }
        .cta-reveal-delay-1 { transition-delay: 0.1s; }
        .cta-reveal-delay-2 { transition-delay: 0.22s; }
        .cta-reveal-delay-3 { transition-delay: 0.34s; }
        .cta-reveal-delay-4 { transition-delay: 0.46s; }

        @media (max-width: 600px) {
          .cta-section { padding: 5rem 1.5rem; }
          .cta-actions { flex-direction: column; align-items: center; }
          .btn-cta-glow, .btn-cta-ghost { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="cta-section" ref={sectionRef}>
        {/* Ambient orbs */}
        <div className="cta-orb cta-orb1" />
        <div className="cta-orb cta-orb2" />

        {/* Floating particles */}
        {[
          { left: "20%", animationDelay: "0s", animationDuration: "4s", bottom: "20%" },
          { left: "35%", animationDelay: "1.2s", animationDuration: "5s", bottom: "30%" },
          { left: "55%", animationDelay: "0.6s", animationDuration: "3.8s", bottom: "15%" },
          { left: "70%", animationDelay: "2s", animationDuration: "4.5s", bottom: "25%" },
          { left: "80%", animationDelay: "0.3s", animationDuration: "6s", bottom: "35%" },
        ].map((p, i) => (
          <div
            key={i}
            className="cta-particle"
            style={{
              left: p.left,
              bottom: p.bottom,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}

        <div className="cta-inner">
          <div className="cta-label cta-reveal">GET STARTED</div>

          <h2 className="cta-heading cta-reveal cta-reveal-delay-1">
            Ready to
            <span>move differently?</span>
          </h2>

          <p className="cta-sub cta-reveal cta-reveal-delay-2">
            Join <b>6,000+ riders</b> across India who chose Vëlox for their
            daily commute. First ride, zero hassle.
          </p>

          <div className="cta-actions cta-reveal cta-reveal-delay-3">
            <button
              className="btn-cta-glow"
              onClick={() =>
                onSendPrompt?.("I want to sign up for Velox and book my first vehicle")
              }
            >
              Get started — it&apos;s free
            </button>
            <button className="btn-cta-ghost" onClick={onOpenModal}>
              Sign in{" "}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="cta-trust cta-reveal cta-reveal-delay-4">
            {[
              "No credit card required",
              "Cancel anytime",
              "Insured & verified",
              "24/7 support",
            ].map((item, i) => (
              <div className="trust-item" key={i}>
                <div className="trust-dot" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}