import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ambil token dari cookie (Nama harus sama dengan di AuthContext)
  const token = request.cookies.get("bgai_auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. IZINKAN: File statis, API, dan aset internal Next.js
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. DEFINISI JALUR PUBLIK: Halaman yang BISA diakses tanpa login
  // Jangan masukkan "/" di sini jika "/" adalah Dashboard utama kamu
  const publicPaths = ["/login", "/terms", "/404"];
  const isPublicPath = publicPaths.some((path) => pathname === path);

  // 3. LOGIKA REDIRECT:

  // KASUS A: User SUDAH Login tapi mencoba buka halaman /login
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // KASUS B: User BELUM Login dan mencoba akses halaman terproteksi (termasuk "/")
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    // Simpan lokasi asal agar user bisa balik lagi setelah login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // KASUS C: User sudah login dan akses halaman terproteksi, atau akses public path tanpa login
  return NextResponse.next();
}

// Konfigurasi Matcher agar middleware tidak berjalan di setiap request gambar/css
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