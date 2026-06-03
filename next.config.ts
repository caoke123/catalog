import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',

  allowedDevOrigins: ['192.168.31.225'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yutu.nv315.top',
        pathname: '/**',
      },
    ],
  },

  // Cache-Control for R2 JSON responses
  async headers() {
    return [
      {
        source: '/c/:id',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/distributions/:id',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig
