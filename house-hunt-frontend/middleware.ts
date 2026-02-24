// middleware.ts  (root of project)
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("landlord_token")?.value;
  const { pathname } = req.nextUrl;

  // Protect all /landlord/dashboard routes
  if (pathname.startsWith("/landlord/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/landlord/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect already-logged-in landlords away from login/register
  if (
    token &&
    (pathname === "/landlord/login" || pathname === "/landlord/register")
  ) {
    return NextResponse.redirect(new URL("/landlord/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/landlord/:path*"],
};