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
      // Django validation errors can be nested under phone field
      const errorMsg = data.detail ?? data.phone?.[0] ?? data.non_field_errors?.[0] ?? "Phone number not found";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
    return NextResponse.json({ message: "OTP sent" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}