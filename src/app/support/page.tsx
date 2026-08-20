"use client";

import { useState } from "react";

const API = "https://velox-d49r.onrender.com/api";

export default function SupportPage() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const valid = validEmail && message.trim().length > 0;

  const handleSubmit = async () => {
    if (!valid) return;
    setSending(true);
    setError("");
    try {
      const res  = await fetch(`${API}/support/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 16px 48px", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 24, boxShadow: "0 4px 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{ padding: "36px 36px 40px" }}>

          {sent ? (
            <div style={{ textAlign: "center", padding: "32px 8px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Message sent!</h2>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>
                Thanks for reaching out. Our team will get back to you shortly.
              </p>
              <button onClick={() => setSent(false)}
                style={{ padding: "11px 22px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Contact Support</h2>
              <p style={{ fontSize: 13.5, color: "#9ca3af", marginBottom: 28 }}>
                Have a question or an issue? Send us a message and we&apos;ll reply to your email.
              </p>

              {error && (
                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{error}</p>
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Your name (optional)</p>
                <input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "12px 0", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "Inter,sans-serif" }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Your email</p>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "12px 0", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "Inter,sans-serif" }}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Message</p>
                <textarea
                  placeholder="Tell us what's going on..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, outline: "none", fontSize: 14, color: "#111827", background: "#fafafa", fontFamily: "Inter,sans-serif", resize: "vertical" }}
                />
              </div>

              <button onClick={handleSubmit} disabled={!valid || sending}
                style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: valid && !sending ? "pointer" : "not-allowed", background: valid && !sending ? "#111827" : "#d1d5db", color: "#fff", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {sending ? "Sending…" : "Send message"}
                {!sending && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}