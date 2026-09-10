import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Product images are admin-managed URLs (Phase 7); accept any HTTPS host
      // so the owner can use their own image hosting. Only the admin sets these.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
