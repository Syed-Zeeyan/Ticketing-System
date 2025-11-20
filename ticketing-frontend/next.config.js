const nextConfig = {
  reactStrictMode: true,
  // Remove 'standalone' output for Vercel - it auto-detects Next.js
  images: {
    domains: [],
  },
  async headers() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              `connect-src 'self' ${backendUrl} http://localhost:8080 http://backend:8080 https://*.vercel.app wss://*.vercel.live`,
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

