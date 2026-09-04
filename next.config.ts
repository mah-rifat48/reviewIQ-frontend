import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
  },
  async rewrites() {
    const rawUrl = process.env.AI_API_URL || process.env.NEXT_PUBLIC_AI_API_URL;
    const isValid = rawUrl && rawUrl !== 'undefined' && rawUrl !== 'null' && rawUrl.trim() !== '';
    const aiApiUrl = isValid ? rawUrl.replace(/\/$/, '') : 'http://localhost:8000';

    return [
      {
        source: '/api/ai/:path*',
        destination: `${aiApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
