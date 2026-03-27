/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production build settings
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  // SOLUSI TIMEOUT: Menambah waktu tunggu proxy (khusus Turbopack/Next.js terbaru)
  experimental: {
    proxyTimeout: 120000, // 120 detik (2 menit)
  },

  // API Rewrites: Forward /api/* ke Flask backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Menggunakan 127.0.0.1 lebih stabil daripada localhost di Windows
        destination: 'http://127.0.0.1:5000/api/:path*',
      },
    ];
  },
  
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000',
  },
};

module.exports = nextConfig;