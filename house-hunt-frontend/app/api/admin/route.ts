// app/api/admin/route.ts — site stats (admin only)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DJANGO = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function GET() {
  const token = (await cookies()).get("landlord_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${DJANGO}/admin/stats/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 403) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}