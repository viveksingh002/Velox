"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page just kicks off the onboarding flow → /partner/onboard/vehicle
export default function OnboardIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/partner/onboard/vehicle");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: 32, height: 32, border: "2px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}