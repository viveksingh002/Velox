"use client";

import { useEffect, useState } from "react";
import ProfilePage from "@/components/Profile";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const [userType, setUserType] = useState<"vendor" | "customer" | null>(null);

  useEffect(() => {
    const detect = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) { setUserType("customer"); return; }

      try {
        const res = await fetch(`http://localhost:5000/api/vendor/status/${encodeURIComponent(email)}`);
        const json = await res.json();
        if (json.success) {
          // Keep localStorage in sync so Profile.tsx's vendor path can read it right away
          localStorage.setItem("velox_vendor_email", email);
          const name = data.user?.user_metadata?.full_name || email.split("@")[0];
          localStorage.setItem("velox_vendor_name", name);
          setUserType("vendor");
        } else {
          setUserType("customer");
        }
      } catch {
        setUserType("customer");
      }
    };
    detect();
  }, []);

  if (!userType) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return <ProfilePage userType={userType} />;
}