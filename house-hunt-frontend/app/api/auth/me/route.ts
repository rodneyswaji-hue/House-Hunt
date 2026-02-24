// app/api/auth/me/route.ts
// Returns the currently logged-in landlord's info by validating the JWT with Django

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function GET(_req: NextRequest) {
  const token = (await cookies()).get("landlord_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch(`${DJANGO_API}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}