// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, newPassword } = await req.json();
    const res = await fetch(`${DJANGO_API}/auth/reset-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, new_password: newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail ?? "Reset failed" },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "Password reset successfully" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}