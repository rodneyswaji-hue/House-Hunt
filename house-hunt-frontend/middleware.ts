// middleware.ts  (root of project)
import { NextRequest, NextResponse } from "next/server";

const LANDLORD_AUTH_PAGES = [
  "/landlord/login",
  "/landlord/register",
  "/landlord/forgot-password",
];

const TENANT_AUTH_PAGES = ["/tenant/login", "/tenant/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const landlordToken = req.cookies.get("landlord_token")?.value;
  const tenantToken = req.cookies.get("tenant_token")?.value;

  // ── Protect /landlord/dashboard ──────────────────────────────────────
  if (pathname.startsWith("/landlord/dashboard") && !landlordToken) {
    const loginUrl = new URL("/landlord/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Protect /admin ────────────────────────────────────────────────────
  // Admin uses the landlord JWT — Django checks is_staff on the backend.
  if (pathname.startsWith("/admin") && !landlordToken) {
    const loginUrl = new URL("/landlord/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Redirect logged-in landlords away from auth pages ────────────────
  if (landlordToken && LANDLORD_AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/landlord/dashboard", req.url));
  }

  // ── Redirect logged-in tenants away from auth pages ──────────────────
  if (tenantToken && TENANT_AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/listings", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/landlord/dashboard/:path*",
    "/landlord/login",
    "/landlord/register",
    "/landlord/forgot-password",
    "/admin/:path*",
    "/tenant/login",
    "/tenant/register",
  ],
};
