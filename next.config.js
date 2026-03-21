/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Vercel deployment — skip type/lint errors blocking CI build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Expose Vercel's auto-injected URL as the app URL when NEXT_PUBLIC_APP_URL is not set
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  },
};

module.exports = nextConfig;
