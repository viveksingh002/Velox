import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "https://velox-d49r.onrender.com";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const res  = await fetch(`${BACKEND}/api/admin/vendors/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, message: "Backend not reachable" }, { status: 502 });
  }
}