/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration for Vercel
  compress: true,
  poweredByHeader: false,
  
  // Disable experimental features that cause issues
  experimental: {
    // Disable all experimental features
  },
  
  // Basic webpack config
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
