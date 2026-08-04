// app/api/contact/route.ts
// Posts to the feedback app's contact endpoint (not apps.contact — that is a
// second, older ContactMessage model with no subject and no read/resolved
// status). The admin dashboard's "unread messages" counter reads the feedback
// one, so submissions must land there to be visible.
import { NextRequest, NextResponse } from "next/server";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${DJANGO_API}/feedback/contact/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    // Pass validation errors through so the form can show what went wrong
    // instead of a generic failure.
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
