import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloud Run Docker deployment
  output: "standalone",

  // Security headers (supplemented by middleware.ts)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Image optimization config
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Firebase Auth profile pictures
      },
    ],
  },

  // Disable telemetry in production
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
  },

  // Experimental features
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
