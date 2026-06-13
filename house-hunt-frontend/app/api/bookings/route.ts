// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { houseId, phone } = body as { houseId: string; phone: string };

    if (!houseId || !phone) {
      return NextResponse.json({ error: "houseId and phone are required" }, { status: 400 });
    }

    if (!/^07\d{8}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Kenyan phone number" }, { status: 400 });
    }

    const djangoRes = await fetch(`${DJANGO_API}/bookings/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ houseId, phone }),
    });

    const data = await djangoRes.json();

    if (!djangoRes.ok) {
      return NextResponse.json(
        { error: data.detail ?? data.error ?? "Booking failed" },
        { status: djangoRes.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
