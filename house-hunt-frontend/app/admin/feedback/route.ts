// app/api/admin/feedback/route.ts — pending reviews list
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DJANGO = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function GET() {
  const token = (await cookies()).get("landlord_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${DJANGO}/feedback/reviews/pending/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}