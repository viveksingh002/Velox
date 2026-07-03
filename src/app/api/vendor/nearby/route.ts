import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "";
    const res  = await fetch(
      `${BACKEND}/api/vendor/nearby?type=${type}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { success: false, vendors: [], message: "Backend not reachable" },
      { status: 502 }
    );
  }
}