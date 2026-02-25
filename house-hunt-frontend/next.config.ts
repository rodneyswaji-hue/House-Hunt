// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // CloudFront CDN — primary image source
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      // Direct S3 fallback (used in local dev when CLOUDFRONT_DOMAIN is not set)
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      // Placeholder images during development
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },

  // Leaflet is client-only — don't attempt to bundle it on the server
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("leaflet");
      }
    }
    return config;
  },
};

export default nextConfig;