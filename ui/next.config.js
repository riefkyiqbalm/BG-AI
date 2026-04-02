/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  experimental: {
    proxyTimeout: 300000, // 5 menit - cocok untuk jawaban AI besar/kompleks
  },

  async rewrites() {
    return [
      {
        source: '/api/chat/:path*',
        destination: 'http://127.0.0.1:5000/api/chat/:path*',
      },
      {
        source: '/api/status',
        destination: 'http://127.0.0.1:5000/api/status',
      },
      {
        source: '/api/models',
        destination: 'http://127.0.0.1:5000/api/models',
      },
      {
        source: '/api/config',
        destination: 'http://127.0.0.1:5000/api/config',
      },
    ];
  },
  
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000',
  },
};

module.exports = nextConfig;
