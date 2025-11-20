const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: [],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' http://localhost:8080 http://backend:8080",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

