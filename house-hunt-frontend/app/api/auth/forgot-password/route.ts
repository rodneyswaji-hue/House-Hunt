// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const res = await fetch(`${DJANGO_API}/auth/forgot-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail ?? "Phone number not found" },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "OTP sent" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}