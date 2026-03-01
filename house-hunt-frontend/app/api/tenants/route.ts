// app/api/tenants/route.ts
import { NextRequest, NextResponse } from "next/server";

const DJANGO = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "register";
  const endpoint = action === "login" ? "tenants/login/" : "tenants/register/";

  try {
    const body = await req.json();
    const res = await fetch(`${DJANGO}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) return NextResponse.json(data, { status: res.status });

    // For login, set httpOnly cookie
    if (action === "login" && data.token) {
      const response = NextResponse.json(data);
      response.cookies.set("tenant_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}