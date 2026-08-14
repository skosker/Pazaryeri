import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["iyzipay"],
  experimental: {
    serverActions: {
      // Cover uploads are capped at 4MB; the rest is headroom for the other
      // form fields and multipart boundary overhead.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
