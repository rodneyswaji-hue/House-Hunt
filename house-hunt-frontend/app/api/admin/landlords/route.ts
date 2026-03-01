// app/api/admin/landlords/route.ts — list all landlords (admin only)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DJANGO = process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

async function getAdminToken() {
  return (await cookies()).get("landlord_token")?.value;
}

export async function GET() {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${DJANGO}/auth/landlords/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}