// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // AWS S3 bucket for property images/videos
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

  // Leaflet CSS requires this — prevents "can't resolve 'leaflet'" on SSR
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Leaflet is client-only, don't attempt to bundle it on the server
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("leaflet");
      }
    }
    return config;
  },
};

export default nextConfig;