
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("bgai_auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. SKIP: Aset statis dan API internal
  // Kita biarkan API tetap jalan karena handle proteksinya biasanya di dalam Route Handler itu sendiri
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('.') // Menangkap file seperti .png, .jpg, dll
  ) {
    return NextResponse.next();
  }

  // 2. DEFINISI JALUR PUBLIK (URL yang diketik user di browser)
  // Perhatikan: Tidak pakai "(auth)" karena itu Route Group
  const publicPaths = ["/login", "/register", "/terms", "/404"];
  const isPublicPath = publicPaths.includes(pathname);

  // 3. LOGIKA REDIRECT

  // Kasus A: User SUDAH Login tapi mau buka halaman Login/Register
  // Kita tendang ke "/" (Dashboard) atau bisa juga ke "/chat"
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Kasus B: User BELUM Login dan mencoba akses halaman terproteksi
  // Halaman terproteksi: "/", "/chat/[id]", "/profile", dll.
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    
    // Jangan redirect jika user memang sudah di halaman login (mencegah infinite loop)
    if (pathname !== "/login") {
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Kasus C: User sudah login dan akses halaman terproteksi, atau akses public path tanpa login
  return NextResponse.next();
}

// Konfigurasi Matcher
export const config = {
  matcher: [
      /*
     * Match semua request kecuali:
     * - api (sudah ditangani di dalam fungsi)
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (icon)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};