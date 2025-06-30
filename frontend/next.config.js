/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  swcMinify: false,
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
};

module.exports = nextConfig;
