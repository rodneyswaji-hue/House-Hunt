import { NextRequest, NextResponse } from "next/server";

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const res = await fetch(`${DJANGO_API}/contact/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Failed to send message");

    return NextResponse.json({ message: "Message sent successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
