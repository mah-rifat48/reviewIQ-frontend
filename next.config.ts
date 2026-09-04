import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
  },
  async rewrites() {
    return [
      {
        source: '/api/ai/:path*',
        destination: `${process.env.AI_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
