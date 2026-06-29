

import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/admin/dashboard`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Dashboard proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Backend not reachable" },
      { status: 502 }
    );
  }
}