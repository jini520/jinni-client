import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@jinni/ui', '@jinni/types'],
  eslint: {
    ignoreDuringBuilds: false,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, '../../packages/ui/src/styles')],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
