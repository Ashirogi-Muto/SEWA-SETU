/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'unpkg.com'],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/static/:path*',
        destination: `${backendUrl}/static/:path*`,
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Leaflet SSR fix
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        zlib: false,
        util: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
