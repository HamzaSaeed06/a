/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    process.env.REPLIT_DEV_DOMAIN,
    "*.replit.dev",
    "*.picard.replit.dev",
  ].filter(Boolean),
  async rewrites() {
    const apiUrl = process.env.API_URL || "http://localhost:8005";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
