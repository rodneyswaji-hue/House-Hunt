// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const djangoRes = await fetch(`${DJANGO_API}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await djangoRes.json();
    if (!djangoRes.ok) {
      return NextResponse.json(
        { error: data.detail ?? data.phone?.[0] ?? "Registration failed" },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "Account created" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}