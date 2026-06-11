import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Slim, self-contained build for Docker/VPS deploys.
  output: "standalone",
  experimental: {
    // Allow PDF/image uploads via server actions (default is 1MB).
    serverActions: { bodySizeLimit: "20mb" },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
