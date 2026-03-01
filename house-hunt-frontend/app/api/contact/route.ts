// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";

const DJANGO = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${DJANGO}/feedback/contact/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}