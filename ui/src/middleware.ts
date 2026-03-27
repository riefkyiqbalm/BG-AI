import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("bgai_auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Abaikan pengecekan jika ini adalah request ke API
  // Biarkan next.config.ts yang melakukan rewrites/proxy ke Flask
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Definisi jalur publik
  const publicPaths = ["/login", "/terms", "/", "/404"];
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith("/_next"));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. Redirect ke login jika tidak ada token
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Konfigurasi Matcher agar tidak membebani file statis
export const config = {
  matcher: [
    /*
     * Match semua request kecuali:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (icon)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};