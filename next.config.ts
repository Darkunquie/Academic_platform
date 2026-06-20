import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Slim, self-contained build for Docker/VPS deploys.
  output: "standalone",
  experimental: {
    // Allow PDF/image uploads via server actions (default is 1MB).
    serverActions: { bodySizeLimit: "20mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Baseline security headers. No CSP here on purpose — a real CSP needs
  // tuning against KaTeX, Monaco, and YouTube embeds; do that separately.
  // microphone=(self) is required for the voice mock-interview feature.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
