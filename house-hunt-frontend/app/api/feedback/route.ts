// app/api/feedback/route.ts — submit review (POST) + get approved reviews (GET)
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const DJANGO = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function GET(req: NextRequest) {
  const landlordId = new URL(req.url).searchParams.get("landlordId");
  if (!landlordId) return NextResponse.json({ error: "landlordId required" }, { status: 400 });

  try {
    const res = await fetch(`${DJANGO}/feedback/reviews/landlord/${landlordId}/`, { cache: "no-store" });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = (await cookies()).get("tenant_token")?.value;
  if (!token) return NextResponse.json({ error: "Login required to leave a review" }, { status: 401 });

  try {
    const body = await req.json();
    const res = await fetch(`${DJANGO}/feedback/reviews/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

