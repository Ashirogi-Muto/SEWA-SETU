const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  sw: 'sw.js'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  images: {
    domains: ['localhost', 'unpkg.com', 'atzfufzrugulgclmnwdo.supabase.co'],
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

module.exports = withPWA(nextConfig)
