import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Basic configuration for Vercel compatibility
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Optimize images
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Faster builds in development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Optimize module resolution
      config.resolve.symlinks = false;
      config.resolve.cacheWithContext = false;
    }
    return config;
  },
};

export default nextConfig;