// app/api/upload/route.ts
// Forwards presigned URL request to Django.
// AWS credentials live in Django only — not needed here anymore.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  // Must be a logged-in landlord
  const token = (await cookies()).get("landlord_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const djangoRes = await fetch(`${DJANGO_API}/houses/upload-url/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await djangoRes.json();

    if (!djangoRes.ok) {
      return NextResponse.json(
        { error: data.error ?? "Failed to generate upload URL" },
        { status: djangoRes.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}