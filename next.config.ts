import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  turbopack: {},
};

let nextConfig: NextConfig = baseConfig;

if (process.env.NODE_ENV === "production") {
  // next-pwa uses webpack — only apply for production builds
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withPWAInit = require("next-pwa") as typeof import("next-pwa").default;
  const withPWA = withPWAInit({
    dest: "public",
    register: true,
    skipWaiting: true,
  });
  nextConfig = withPWA(baseConfig);
}

export default nextConfig;
