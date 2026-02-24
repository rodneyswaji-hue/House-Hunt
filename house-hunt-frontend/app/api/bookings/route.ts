// app/api/bookings/route.ts
// POST /api/bookings — save a notification request for a house
// 🔌 DJANGO: When backend is ready, this forwards to POST /api/bookings/ on Django
// For now it returns a success stub so the client still works.

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

    // ─── Django integration point ────────────────────────────────────────
    // Uncomment when Django bookings endpoint is ready:
    //
    // const djangoRes = await fetch(`${DJANGO_API}/bookings/`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ house_id: houseId, phone }),
    // });
    // const data = await djangoRes.json();
    // if (!djangoRes.ok) {
    //   return NextResponse.json({ error: data.detail ?? "Booking failed" }, { status: 400 });
    // }
    // return NextResponse.json(data, { status: 201 });
    // ─────────────────────────────────────────────────────────────────────

    // Temporary stub response
    console.log(`[STUB] Booking: house=${houseId} phone=${phone}`);
    return NextResponse.json({ message: "Notification registered", houseId, phone }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Suppress unused variable warning until Django is wired
void DJANGO_API;