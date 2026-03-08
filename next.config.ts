import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enables strict mode for React
  // reactStrictMode: true,

  // // Example: Configure image optimization
  // images: {
  //   domains: ['example.com'],
  // },

  // // Example: Configure environment variables
  // env: {
  //   customKey: 'my-value',
  // },

  // Example: Setup redirects
  // async redirects() {
  //   return [
  //     {
  //       source: '/about',
  //       destination: '/',
  //       permanent: true,
  //     },
  //   ];
  // },

  // // Enable experimental features (e.g., Turbopack)
  // experimental: {
  //   // typedRoutes: true, // Example of enabling typed routes
  // },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

export default nextConfig;
