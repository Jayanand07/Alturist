import type { NextConfig } from "next";
import path from "path";
import withBundleAnalyzer from "@next/bundle-analyzer";

const config: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
};

const wrap = process.env.ANALYZE === "true"
  ? withBundleAnalyzer({ enabled: true })
  : (cfg: NextConfig): NextConfig => cfg;

export default wrap(config);
