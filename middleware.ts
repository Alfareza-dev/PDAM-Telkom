import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];
const PROTECTED_PATHS = ["/dashboard"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ sudah login tapi akses login
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
