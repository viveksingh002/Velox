"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Works for both "vendor" (partner) and "customer" — pass userType as a prop
// or read it from wherever you store the logged-in user's role.
type UserType = "vendor" | "customer";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  avatar: string;       // data URL or hosted URL
  joined: string;        // e.g. "Jan 2025"
  // vendor-only
  vehicleModel?: string;
  registrationNumber?: string;
  rating?: number;
  totalRides?: number;
  // customer-only
  totalBookings?: number;
}

const API = "https://velox-d49r.onrender.com/api";

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ flex: 1, background: "#f9fafb", borderRadius: 14, padding: "14px 12px", border: "1px solid #f3f4f6", textAlign: "center" }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#111827" }}>{value}</div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: "#9ca3af", marginTop: 2, letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
}

function SettingsRow({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 4px", background: "none", border: "none", borderBottom: "1px solid #f3f4f6", cursor: "pointer", textAlign: "left" }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 10, background: danger ? "#fef2f2" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: danger ? "#dc2626" : "#374151", flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: danger ? "#dc2626" : "#111827" }}>{label}</span>
      {!danger && <ChevronRight />}
    </button>
  );
}

export default function ProfilePage({ userType = "vendor" as UserType }: { userType?: UserType }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "", email: "", phone: "", avatar: "", joined: "",
  });
  const [draft, setDraft] = useState<ProfileData>(profile);

  const storageKey = "velox_vendor_email"; // only used for vendor flow

  const fetchProfile = async () => {
    if (userType === "customer") {
      // Customer identity comes from Supabase auth, not localStorage
      const { data } = await supabase.auth.getUser();
      const su = data.user;
      if (!su?.email) { setLoading(false); return; }

      const supaName = su.user_metadata?.full_name || su.email.split("@")[0];
      const joined = su.created_at
        ? new Date(su.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "";

      // Start with what Supabase already knows, then layer in
      // extra fields (phone, avatar, totalBookings) from the backend if present.
      let merged: ProfileData = {
        name: supaName,
        email: su.email,
        phone: su.user_metadata?.phone || "",
        avatar: su.user_metadata?.avatar_url || "",
        joined,
      };

      try {
        const res = await fetch(`${API}/customer/profile/${encodeURIComponent(su.email)}`);
        const json = await res.json();
        if (json.success && json.data) {
          merged = { ...merged, ...json.data };
        }
      } catch {}

      setProfile(merged);
      setDraft(merged);
      setLoading(false);
      return;
    }

    // Vendor identity — kept on localStorage per the existing partner flow
    const email = localStorage.getItem(storageKey);
    if (!email) {
      setLoadError("No vendor email found in localStorage (velox_vendor_email). Make sure /profile sets this before loading the vendor profile.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/vendor/profile/${encodeURIComponent(email)}`);
      if (!res.ok) {
        setLoadError(`Server responded ${res.status} for /api/vendor/profile/${email}. Check the backend route exists and was restarted.`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setDraft(data.data);
      } else {
        setLoadError(data.message || "Could not load vendor profile.");
      }
    } catch {
      setLoadError("Could not reach the server. Is the backend running on port 5000?");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const initials = (profile.name || "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setDraft((d) => ({ ...d, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    let email: string | null = null;
    if (userType === "customer") {
      const { data } = await supabase.auth.getUser();
      email = data.user?.email ?? null;
    } else {
      email = localStorage.getItem(storageKey);
    }
    if (!email) return;

    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${API}/${userType}/profile/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        setSaveError(`Server error (${res.status}). Profile endpoint may not exist on the backend yet.`);
        setSaving(false);
        return;
      }
      const data = await res.json();
      if (data.success) { setProfile(draft); setEditing(false); }
      else { setSaveError(data.message || "Failed to save changes."); }
    } catch {
      setSaveError("Could not reach the server. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (userType === "customer") {
      await supabase.auth.signOut();
      router.push("/");
      return;
    }
    localStorage.removeItem(storageKey);
    router.push("/partner/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const p = editing ? draft : profile;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Inter,sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#111827", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Profile
        </button>
        {!editing ? (
          <button onClick={() => { setDraft(profile); setEditing(true); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <EditIcon /> Edit
          </button>
        ) : (
          <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
        )}
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 48px" }}>
        {loadError && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, fontSize: 12.5, color: "#b91c1c", fontWeight: 600 }}>
            ⚠️ {loadError}
          </div>
        )}
        {/* Avatar + name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 28, marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 92, height: 92, borderRadius: "50%", background: p.avatar ? `url(${p.avatar}) center/cover` : "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 30, fontWeight: 800, border: "4px solid #fff", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
              {!p.avatar && initials}
            </div>
            {editing && (
              <>
                <button onClick={() => fileInputRef.current?.click()} style={{ position: "absolute", right: -2, bottom: -2, width: 30, height: 30, borderRadius: "50%", background: "#111827", border: "3px solid #f3f4f6", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarPick} style={{ display: "none" }} />
              </>
            )}
          </div>

          {!editing ? (
            <>
              <h1 style={{ marginTop: 14, fontSize: 19, fontWeight: 800, color: "#111827" }}>{profile.name || "Your Name"}</h1>
              <p style={{ fontSize: 12.5, color: "#9ca3af", marginTop: 2 }}>
                {userType === "vendor" ? "Partner" : "Customer"} · Joined {profile.joined || "—"}
              </p>
            </>
          ) : (
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Full name"
              style={{ marginTop: 14, fontSize: 18, fontWeight: 800, color: "#111827", textAlign: "center", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", background: "transparent", padding: "4px 0", width: 220 }}
            />
          )}
        </div>

        {/* Stats */}
        {!editing && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {userType === "vendor" ? (
              <>
                <StatCard icon="⭐" label="RATING" value={profile.rating ? profile.rating.toFixed(1) : "—"} />
                <StatCard icon="🚗" label="TOTAL RIDES" value={String(profile.totalRides ?? 0)} />
                <StatCard icon="🚙" label="VEHICLE" value={profile.vehicleModel || "—"} />
              </>
            ) : (
              <>
                <StatCard icon="📦" label="BOOKINGS" value={String(profile.totalBookings ?? 0)} />
                <StatCard icon="⭐" label="MEMBER" value={profile.joined || "—"} />
              </>
            )}
          </div>
        )}

        {/* Contact info */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "18px 20px", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Contact Info</p>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: "#9ca3af", marginBottom: 4 }}>Email</p>
            {editing && userType === "vendor" ? (
              <input
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                style={{ width: "100%", fontSize: 14, fontWeight: 600, color: "#111827", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", background: "transparent", padding: "4px 0" }}
              />
            ) : (
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{profile.email || "—"}</p>
            )}
          </div>

          <div>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: "#9ca3af", marginBottom: 4 }}>Phone</p>
            {editing ? (
              <input
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                style={{ width: "100%", fontSize: 14, fontWeight: 600, color: "#111827", border: "none", borderBottom: "1.5px solid #e5e7eb", outline: "none", background: "transparent", padding: "4px 0" }}
              />
            ) : (
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{profile.phone || "—"}</p>
            )}
          </div>
        </div>

        {/* Vehicle info (vendor only) */}
        {userType === "vendor" && !editing && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "18px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Vehicle</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>{profile.vehicleModel || "—"}</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Registered vehicle</p>
              </div>
              <span style={{ background: "#111827", color: "#fff", fontSize: 12, fontWeight: 800, padding: "6px 12px", borderRadius: 8, letterSpacing: 0.5 }}>
                {profile.registrationNumber || "—"}
              </span>
            </div>
          </div>
        )}

        {editing ? (
          <>
            {saveError && (
              <p style={{ fontSize: 12.5, color: "#dc2626", textAlign: "center", marginBottom: 12, fontWeight: 600 }}>{saveError}</p>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: saving ? "#d1d5db" : "#111827", color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "4px 16px" }}>
            <SettingsRow
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              label="Change Password"
              onClick={() => router.push(userType === "vendor" ? "/partner/settings/password" : "/settings/password")}
            />
            <SettingsRow
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>}
              label="Notifications"
              onClick={() => router.push(userType === "vendor" ? "/partner/settings/notifications" : "/settings/notifications")}
            />
            <SettingsRow
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>}
              label="Help & Support"
              onClick={() => window.location.href = "mailto:support@velox.in"}
            />
            <SettingsRow
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>}
              label="Log Out"
              danger
              onClick={handleLogout}
            />
          </div>
        )}
      </div>
    </div>
  );
}