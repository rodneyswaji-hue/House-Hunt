// app/api/tenants/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DJANGO = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

export async function GET() {
  const token = (await cookies()).get("tenant_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const res = await fetch(`${DJANGO}/tenants/me/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("tenant_token", "", { maxAge: 0, path: "/" });
  return response;
}