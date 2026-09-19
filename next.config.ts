import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev-only badge; top-right would cover the theme toggle in the full-width nav
  devIndicators: { position: "bottom-left" },
};

export default nextConfig;
