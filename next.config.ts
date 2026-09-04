import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
  },
  async rewrites() {
    const aiApiUrl = (
      process.env.AI_API_URL ||
      process.env.NEXT_PUBLIC_AI_API_URL ||
      'http://localhost:8000'
    ).replace(/\/$/, '');

    return [
      {
        source: '/api/ai/:path*',
        destination: `${aiApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
