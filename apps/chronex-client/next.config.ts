import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/db'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.backblazeb2.com',
      },

      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },

      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}

export default nextConfig
