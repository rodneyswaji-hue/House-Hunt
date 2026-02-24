// app/api/houses/route.ts
// GET: public listing with server-side filtering forwarded to Django
// POST: protected, landlord only
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

// Public — no auth needed for browsing
// Forwards query params (?location=&bedrooms=&max_price=&available=) to Django
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.toString();
    const res = await fetch(
      `${DJANGO_API}/houses/${query ? `?${query}` : ""}`,
      { next: { revalidate: 30 } } // ISR: 30s keeps listings fresh + SEO happy
    );
    if (!res.ok) throw new Error(`Django ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

// Protected — landlord must be logged in to add a house
export async function POST(req: NextRequest) {
  const token = (await cookies()).get("landlord_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${DJANGO_API}/houses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create house" }, { status: 500 });
  }
}