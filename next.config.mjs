/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'smilestoriesind.com' }],
        destination: 'https://www.smilestoriesind.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig