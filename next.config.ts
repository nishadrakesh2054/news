import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "http", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "echomanchnews.com", pathname: "/**" },
      { protocol: "https", hostname: "en.echomanchnews.com", pathname: "/**" },
      { protocol: "https", hostname: "echomanchs.com", pathname: "/**" },
      { protocol: "https", hostname: "en.echomanchs.com", pathname: "/**" },
      { protocol: "https", hostname: "*.vercel.app", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const sentryBuildOptions = {
  org: "echo-manch",
  project: "echomanch",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

// Sentry webpack/turbopack hooks slow local dev — only wrap in production builds.
export default process.env.NODE_ENV === "production"
  ? withSentryConfig(nextConfig, sentryBuildOptions)
  : nextConfig;
