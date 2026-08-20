import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "https://velox-d49r.onrender.com";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND}/api/admin/vendors/video-kyc/complete/${id}`, {
      method: "PATCH",
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 502 });
  }
}