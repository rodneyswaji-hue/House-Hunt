// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${DJANGO_API}/auth/verify-otp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data.detail ?? data.non_field_errors?.[0] ?? "Invalid OTP";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
    return NextResponse.json({ message: "OTP verified" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}