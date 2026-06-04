import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yutu.nv315.top',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
