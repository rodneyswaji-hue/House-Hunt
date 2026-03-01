// middleware.ts  (root of project)
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("landlord_token")?.value;
  const { pathname } = req.nextUrl;
  const landlordToken = req.cookies.get("landlord_token")?.value;
  const tenantToken = req.cookies.get("tenant_token")?.value;

  // Protect all /landlord/dashboard routes
  if (pathname.startsWith("/landlord/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/landlord/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
        if (!landlordToken) {
      return NextResponse.redirect(new URL("/landlord/login", req.url));
    }
  }

  // Redirect already-logged-in landlords away from login/register
  if (
    token &&
    (pathname === "/landlord/login" || pathname === "/landlord/register")
  ) {
    return NextResponse.redirect(new URL("/landlord/dashboard", req.url));
  }



  // ── Protect /landlord/dashboard ──────────────────────────────────────
 

  // ── Protect /admin ────────────────────────────────────────────────────
  // Admin uses the landlord JWT — Django checks is_staff on the backend
  if (pathname.startsWith("/admin")) {
    if (!landlordToken) {
      return NextResponse.redirect(new URL("/landlord/login", req.url));
    }
  }

  // ── Redirect logged-in landlords away from auth pages ────────────────
  const landlordAuthPages = ["/landlord/login", "/landlord/register", "/landlord/forgot-password"];
  if (landlordToken && landlordAuthPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/landlord/dashboard", req.url));
  }

  // ── Redirect logged-in tenants away from auth pages ──────────────────
  const tenantAuthPages = ["/tenant/login", "/tenant/signup"];
  if (tenantToken && tenantAuthPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/listings", req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/landlord/dashboard/:path*",
    "/landlord/login",
    "/landlord/register",
    "/landlord/forgot-password",
    "/admin/:path*",
    "/tenant/login",
    "/tenant/signup",
    "/landlord/:path*"
  ],

}
